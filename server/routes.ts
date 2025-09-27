import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./auth";
import { storage } from "./storage";
import { insertClientSchema, insertCourierModuleSchema, insertShipmentSchema, insertCorrectionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { parse } from "csv-parse";
import Stripe from "stripe";

// Stripe setup - will be configured when API keys are provided
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
}) : null;

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  setupAuth(app);

  // Dashboard API
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const stats = await storage.getDashboardStats(user.tenantId);
      const aiStats = await storage.getAiRoutingStats(user.tenantId);
      
      res.json({
        ...stats,
        aiStats
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Clients API
  app.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      let clients;
      if (user.role === "commercial") {
        clients = await storage.getClientsByCommercial(user.id);
      } else {
        clients = await storage.getClientsByTenant(user.tenantId);
      }
      
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const validatedData = insertClientSchema.parse({
        ...req.body,
        tenantId: user.tenantId
      });

      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const client = await storage.updateClient(id, updates);
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Courier Modules API
  app.get("/api/courier-modules", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const modules = await storage.getCourierModulesByTenant(user.tenantId);
      res.json(modules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/courier-modules", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const validatedData = insertCourierModuleSchema.parse({
        ...req.body,
        tenantId: user.tenantId
      });

      const module = await storage.createCourierModule(validatedData);
      res.status(201).json(module);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/courier-modules/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const module = await storage.updateCourierModule(id, updates);
      res.json(module);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/courier-modules/:id/activate", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { contractCode } = req.body;

      if (!contractCode) {
        return res.status(400).json({ error: "Contract code is required" });
      }

      // TODO: Implement contract validation logic
      // For now, just update the module status to active
      const module = await storage.updateCourierModule(id, {
        contractCode,
        status: "active"
      });

      res.json(module);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Shipments API
  app.get("/api/shipments", isAuthenticated, async (req, res) => {
    try {
      const { clientId } = req.query;
      
      if (!clientId) {
        return res.status(400).json({ error: "Client ID is required" });
      }

      const shipments = await storage.getShipmentsByClient(clientId as string);
      res.json(shipments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/shipments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const validatedData = insertShipmentSchema.parse(req.body);

      // TODO: Implement AI routing logic here
      const activeModules = await storage.getActiveCourierModules(user.tenantId);
      
      if (activeModules.length === 0) {
        return res.status(400).json({ error: "No active courier modules available" });
      }

      // Simple routing: select first active module for now
      // TODO: Replace with actual AI routing algorithm
      const selectedModule = activeModules[0];

      const shipmentData = {
        ...validatedData,
        courierModuleId: selectedModule.id,
        aiSelected: true
      };

      const shipment = await storage.createShipment(shipmentData);

      // Log AI routing decision
      await storage.createAiRoutingLog({
        shipmentId: shipment.id,
        selectedCourierModuleId: selectedModule.id,
        alternativeCouriers: JSON.stringify(activeModules.slice(1).map(m => m.id)),
        savings: "0", // TODO: Calculate actual savings
        confidence: "0.95" // TODO: Calculate actual confidence
      });

      res.status(201).json(shipment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Invoices API
  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const { clientId } = req.query;
      
      if (!clientId) {
        return res.status(400).json({ error: "Client ID is required" });
      }

      const invoices = await storage.getInvoicesByClient(clientId as string);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invoices/pending", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const pendingInvoices = await storage.getPendingInvoices(user.tenantId);
      res.json(pendingInvoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Corrections API
  app.get("/api/corrections", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const corrections = await storage.getPendingCorrections(user.tenantId);
      res.json(corrections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/corrections/upload", isAuthenticated, upload.single("csvFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "CSV file is required" });
      }

      const csvData = req.file.buffer.toString("utf-8");
      const records: any[] = [];

      const parser = parse({
        columns: true,
        skip_empty_lines: true
      });

      parser.on("data", (data) => {
        records.push(data);
      });

      parser.on("error", (err) => {
        console.error("CSV parsing error:", err);
        return res.status(400).json({ error: "Invalid CSV format" });
      });

      parser.on("end", async () => {
        try {
          const results = [];
          
          for (const record of records) {
            const correctionData = {
              clientId: record.clientId || null,
              trackingNumber: record.trackingNumber,
              type: record.type,
              amount: record.amount,
              description: record.description || null,
              status: "pending" as const
            };

            const validatedData = insertCorrectionSchema.parse(correctionData);
            const correction = await storage.createCorrection(validatedData);
            results.push(correction);
          }

          res.json({
            message: `Successfully uploaded ${results.length} corrections`,
            corrections: results
          });
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      });

      parser.write(csvData);
      parser.end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Commissions API
  app.get("/api/commissions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (user?.role !== "commercial") {
        return res.status(403).json({ error: "Access denied" });
      }

      const { month, year } = req.query;
      const commissions = await storage.getCommissionsByCommercial(
        user.id,
        month ? parseInt(month as string) : undefined,
        year ? parseInt(year as string) : undefined
      );
      
      res.json(commissions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Connect API
  app.post("/api/stripe/connect/account", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe not configured. Please add API keys." });
      }

      const user = req.user;
      
      if (user?.stripeAccountId) {
        return res.json({ accountId: user.stripeAccountId });
      }

      const account = await stripe.accounts.create({
        type: "express",
        country: "IT",
        email: user?.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      await storage.updateUser(user!.id, {
        stripeAccountId: account.id
      });

      res.json({ accountId: account.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stripe/connect/onboarding", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe not configured. Please add API keys." });
      }

      const user = req.user;
      
      if (!user?.stripeAccountId) {
        return res.status(400).json({ error: "No Stripe account found" });
      }

      const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: `${process.env.FRONTEND_URL}/stripe/refresh`,
        return_url: `${process.env.FRONTEND_URL}/stripe/return`,
        type: "account_onboarding",
      });

      res.json({ url: accountLink.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Language API
  app.get("/api/languages", (req, res) => {
    const languages = [
      { code: "it", name: "Italiano", flag: "🇮🇹" },
      { code: "en", name: "English", flag: "🇬🇧" },
      { code: "es", name: "Español", flag: "🇪🇸" },
      { code: "fr", name: "Français", flag: "🇫🇷" },
      { code: "de", name: "Deutsch", flag: "🇩🇪" },
      { code: "pt", name: "Português", flag: "🇵🇹" },
      { code: "nl", name: "Nederlands", flag: "🇳🇱" },
      { code: "pl", name: "Polski", flag: "🇵🇱" },
      { code: "ru", name: "Русский", flag: "🇷🇺" },
      { code: "zh", name: "中文", flag: "🇨🇳" },
      { code: "ja", name: "日本語", flag: "🇯🇵" }
    ];
    
    res.json(languages);
  });

  const httpServer = createServer(app);

  return httpServer;
}
