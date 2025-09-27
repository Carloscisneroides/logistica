import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./auth";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertCourierModuleSchema, 
  insertShipmentSchema, 
  insertCorrectionSchema,
  insertPlatformConnectionSchema,
  insertPlatformWebhookSchema,
  insertShipmentTrackingSchema,
  insertReturnSchema,
  insertNotificationSchema,
  insertCsmTicketSchema,
  insertTsmTicketSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { parse } from "csv-parse";
import Stripe from "stripe";
import crypto from "node:crypto";
import OpenAI from "openai";

// Stripe setup - will be configured when API keys are provided
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
}) : null;

const upload = multer({ storage: multer.memoryStorage() });

// Helper function to sanitize platform connection for API response (remove secrets)
function sanitizePlatformConnection(connection: any) {
  return {
    ...connection,
    apiKey: undefined, // Never send API keys to frontend
    webhookSecret: undefined, // Never send webhook secrets to frontend
    configuration: connection.configuration ? "[CONFIGURED]" : null
  };
}

// Helper function to verify webhook HMAC signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  
  try {
    // Extract signature from header (format: "sha256=...")
    const parts = signature.split('=');
    if (parts.length !== 2 || parts[0] !== 'sha256') return false;
    
    const receivedSignature = parts[1];
    
    // Compute expected signature using hardcoded SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

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
      const user = req.user;
      
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }
      
      // Verify client belongs to user's tenant
      const client = await storage.getClient(id);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      const updatedClient = await storage.updateClient(id, updates);
      res.json(updatedClient);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Support Tickets API - CSM/TSM Management
  
  // CSM Tickets endpoints
  app.get("/api/support/csm-tickets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const tickets = await storage.getCsmTicketsByTenant(user.tenantId);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/support/csm-tickets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      // Validate clientId belongs to tenant if provided
      if (req.body.clientId) {
        const client = await storage.getClient(req.body.clientId);
        if (!client || client.tenantId !== user.tenantId) {
          return res.status(404).json({ error: "Client not found" });
        }
      }

      // Generate ticket number
      const ticketNumber = `CSM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const validatedData = insertCsmTicketSchema.parse({
        ...req.body,
        ticketNumber,
        // Auto-assign high priority tickets for demo
        dueDate: req.body.priority === "urgent" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : 
                  req.body.priority === "high" ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null
      });

      const ticket = await storage.createCsmTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // TSM Tickets endpoints
  app.get("/api/support/tsm-tickets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const tickets = await storage.getTsmTicketsByTenant(user.tenantId);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/support/tsm-tickets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      // Validate clientId belongs to tenant if provided
      if (req.body.clientId) {
        const client = await storage.getClient(req.body.clientId);
        if (!client || client.tenantId !== user.tenantId) {
          return res.status(404).json({ error: "Client not found" });
        }
      }

      // Generate ticket number
      const ticketNumber = `TSM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Set severity based on priority for TSM tickets
      let severity = "low";
      if (req.body.priority === "urgent") severity = "critical";
      else if (req.body.priority === "high") severity = "high";
      else if (req.body.priority === "medium") severity = "medium";

      const validatedData = insertTsmTicketSchema.parse({
        ...req.body,
        ticketNumber,
        severity,
        // Auto-escalation for critical issues
        escalationLevel: req.body.priority === "urgent" ? 1 : 0,
        dueDate: req.body.priority === "urgent" ? new Date(Date.now() + 4 * 60 * 60 * 1000) : 
                  req.body.priority === "high" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
      });

      const ticket = await storage.createTsmTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // AI Support Assistant endpoint
  app.post("/api/ai/support-assistant", isAuthenticated, async (req, res) => {
    try {
      const { question, context, module } = req.body;
      const user = req.user;
      
      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: "AI Assistant not configured", 
          response: "L'AI Assistant non è al momento disponibile. Puoi comunque aprire un ticket manualmente." 
        });
      }

      // Generate contextual system prompt based on current module
      const getContextualSystemPrompt = (moduleName: string, userRole: string) => {
        const contexts = {
          "dashboard": "Dashboard principale - statistiche, overview generale, KPI aziendali",
          "clients": "Gestione clienti - onboarding, fatturazione, supporto clienti, gestione crediti",  
          "courier-modules": "Moduli corrieri - configurazione, attivazione, integrazione API, tariffe",
          "billing": "Fatturazione - invoice, pagamenti, Stripe, crediti, saldi",
          "support": "Assistenza clienti - ticket, problemi spedizioni, supporto tecnico",
          "commercial": "Area commerciale - commissioni, performance, target, prospect"
        };

        const contextDescription = contexts[moduleName as keyof typeof contexts] || "Sistema generale YCore";

        return `Sei l'AI Assistant di YCore, piattaforma SaaS per gestione spedizioni multi-tenant.

CONTESTO CORRENTE: ${contextDescription}
RUOLO UTENTE: ${userRole}
MODULO ATTIVO: ${moduleName || "dashboard"}

Fornisci risposte brevi, specifiche al contesto attuale e sempre in italiano per:`;
      };
      
      // Use contextual system prompt
      const systemPrompt = getContextualSystemPrompt(module, user?.role || "merchant") + `
- Problemi con pacchi (ritardo, smarrito, danneggiato)
- Questioni di fatturazione 
- Problemi tecnici della piattaforma
- Suggerimenti per aprire ticket appropriati

Mantieni un tono professionale e propositivo. Suggerisci sempre azioni concrete.`;

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      const aiResponse = completion.choices[0]?.message?.content || "Mi dispiace, non sono riuscito a elaborare la tua richiesta. Prova a riformulare la domanda.";

      // Generate suggestions based on question content
      const suggestions = [];
      if (question.toLowerCase().includes("ritardo") || question.toLowerCase().includes("non arrivato")) {
        suggestions.push({
          type: "ticket",
          category: "pacco_ritardo",
          title: "Pacco in ritardo",
          priority: "medium"
        });
      }
      if (question.toLowerCase().includes("danneggiato") || question.toLowerCase().includes("rotto")) {
        suggestions.push({
          type: "ticket", 
          category: "pacco_danneggiato",
          title: "Pacco danneggiato",
          priority: "high"
        });
      }
      if (question.toLowerCase().includes("fattura") || question.toLowerCase().includes("pagamento")) {
        suggestions.push({
          type: "ticket",
          category: "fatturazione", 
          title: "Problema fatturazione",
          priority: "medium"
        });
      }

      res.json({
        response: aiResponse,
        suggestions: suggestions.length > 0 ? suggestions : null
      });

    } catch (error: any) {
      console.error("AI Assistant error:", error);
      
      // Handle OpenAI API errors gracefully
      if (error.status === 401 || error.message?.includes("invalid_api_key") || error.message?.includes("Incorrect API key")) {
        return res.json({
          response: "L'AI Assistant richiede una configurazione aggiuntiva. Nel frattempo, puoi aprire un ticket manualmente selezionando la categoria appropriata per il tuo problema.",
          suggestions: [{
            type: "ticket",
            category: "pacco_ritardo",
            title: "Pacco in ritardo",
            priority: "medium"
          }]
        });
      }
      
      // Generic fallback for other errors
      res.json({ 
        response: "L'AI Assistant non è al momento disponibile, ma sono qui per aiutarti! Seleziona la categoria più appropriata per il tuo problema e crea un ticket - il nostro team ti risponderà rapidamente.",
        suggestions: [
          {
            type: "ticket",
            category: "pacco_ritardo", 
            title: "Pacco in ritardo",
            priority: "medium"
          },
          {
            type: "ticket",
            category: "pacco_danneggiato",
            title: "Pacco danneggiato", 
            priority: "high"
          }
        ]
      });
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
      const user = req.user;
      
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }
      
      // Verify module belongs to user's tenant
      const module = await storage.getCourierModule(id);
      if (!module || module.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Courier module not found" });
      }
      
      const updatedModule = await storage.updateCourierModule(id, updates);
      res.json(updatedModule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/courier-modules/:id/activate", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { contractCode } = req.body;
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      if (!contractCode) {
        return res.status(400).json({ error: "Contract code is required" });
      }

      // Verify module belongs to user's tenant
      const module = await storage.getCourierModule(id);
      if (!module || module.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Courier module not found" });
      }

      // TODO: Implement contract validation logic
      // For now, just update the module status to active
      const updatedModule = await storage.updateCourierModule(id, {
        contractCode,
        status: "active"
      });

      res.json(updatedModule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Shipments API
  app.get("/api/shipments", isAuthenticated, async (req, res) => {
    try {
      const { clientId } = req.query;
      const user = req.user;
      
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }
      
      if (!clientId) {
        return res.status(400).json({ error: "Client ID is required" });
      }
      
      // Verify client belongs to user's tenant
      const client = await storage.getClient(clientId as string);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Client not found" });
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
      
      // Verify client belongs to user's tenant
      const client = await storage.getClient(validatedData.clientId);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Client not found" });
      }

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
      const user = req.user;
      
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }
      
      if (!clientId) {
        return res.status(400).json({ error: "Client ID is required" });
      }
      
      // Verify client belongs to user's tenant
      const client = await storage.getClient(clientId as string);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Client not found" });
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
          const user = req.user;
          if (!user?.tenantId) {
            return res.status(400).json({ error: "Tenant not found" });
          }
          
          const results = [];
          
          for (const record of records) {
            // Verify client belongs to user's tenant if clientId is provided
            if (record.clientId) {
              const client = await storage.getClient(record.clientId);
              if (!client || client.tenantId !== user.tenantId) {
                return res.status(400).json({ 
                  error: `Client ${record.clientId} not found or access denied` 
                });
              }
            }
            
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

  // Platform Connections API - Universal client platform integrations
  app.get("/api/platform-connections", isAuthenticated, async (req, res) => {
    try {
      const { clientId } = req.query;
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      let connections;
      if (clientId) {
        // Get connections for specific client (with tenant validation)
        const client = await storage.getClient(clientId as string);
        if (!client || client.tenantId !== user.tenantId) {
          return res.status(404).json({ error: "Client not found or access denied" });
        }
        connections = await storage.getPlatformConnectionsByClient(clientId as string);
      } else {
        // Get all connections for tenant
        const clients = await storage.getClientsByTenant(user.tenantId);
        const clientIds = clients.map(c => c.id);
        connections = [];
        for (const id of clientIds) {
          const clientConnections = await storage.getPlatformConnectionsByClient(id);
          connections.push(...clientConnections);
        }
      }

      // Sanitize connections before sending to frontend
      const safeConnections = connections.map(sanitizePlatformConnection);

      res.json(safeConnections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/platform-connections", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      // Validate client belongs to user's tenant
      const client = await storage.getClient(req.body.clientId);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Client not found or access denied" });
      }

      const validatedData = insertPlatformConnectionSchema.parse(req.body);
      const connection = await storage.createPlatformConnection(validatedData);

      // Log connection creation in audit trail (without sensitive data)
      await storage.createAuditLog({
        userId: user.id,
        entityType: "platform_connection",
        entityId: connection.id,
        action: "created",
        details: `Platform connection created for client ${client.name}`,
        ipAddress: req.ip
      });

      // Sanitize connection before sending response
      const safeConnection = sanitizePlatformConnection(connection);

      res.status(201).json(safeConnection);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/platform-connections/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      // Validate connection belongs to user's tenant
      const connection = await storage.getPlatformConnection(id);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }

      const client = await storage.getClient(connection.clientId);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Access denied" });
      }

      // Validate update data with Zod schema
      const updateSchema = insertPlatformConnectionSchema.partial().omit({ id: true });
      const validatedUpdates = updateSchema.parse(req.body);
      const updatedConnection = await storage.updatePlatformConnection(id, validatedUpdates);

      // Log connection update in audit trail
      await storage.createAuditLog({
        userId: user.id,
        entityType: "platform_connection",
        entityId: id,
        action: "updated",
        details: `Platform connection updated`,
        ipAddress: req.ip
      });

      // Sanitize connection before sending response
      const safeConnection = sanitizePlatformConnection(updatedConnection);

      res.json(safeConnection);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/platform-connections/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      // Validate connection belongs to user's tenant
      const connection = await storage.getPlatformConnection(id);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }

      const client = await storage.getClient(connection.clientId);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Access denied" });
      }

      await storage.deletePlatformConnection(id);

      // Log connection deletion in audit trail
      await storage.createAuditLog({
        userId: user.id,
        entityType: "platform_connection",
        entityId: id,
        action: "deleted",
        details: `Platform connection deleted`,
        ipAddress: req.ip
      });

      res.json({ message: "Connection deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/platform-connections/:id/test", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      // Validate connection belongs to user's tenant
      const connection = await storage.getPlatformConnection(id);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }

      const client = await storage.getClient(connection.clientId);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Access denied" });
      }

      // TODO: Implement actual platform testing logic based on connection type
      // For now, simulate a test
      const testResult = {
        success: true,
        message: "Connection test successful",
        timestamp: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 500) + 100 // Simulated response time
      };

      // Update last sync time
      const updatedConnection = await storage.updatePlatformConnection(id, {
        lastSync: new Date(),
        status: testResult.success ? "connected" : "error"
      });

      // Log test action in audit trail
      await storage.createAuditLog({
        userId: user.id,
        entityType: "platform_connection",
        entityId: id,
        action: "tested",
        details: `Connection test: ${testResult.success ? "successful" : "failed"}`,
        ipAddress: req.ip
      });

      res.json({
        ...testResult,
        connection: sanitizePlatformConnection(updatedConnection)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/platform-connections/:id/sync", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      // Validate connection belongs to user's tenant
      const connection = await storage.getPlatformConnection(id);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }

      const client = await storage.getClient(connection.clientId);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Access denied" });
      }

      // TODO: Implement actual platform sync logic
      // For now, simulate sync
      const syncResult = {
        success: true,
        syncedItems: Math.floor(Math.random() * 50) + 1,
        errors: 0,
        timestamp: new Date().toISOString()
      };

      // Update last sync time
      const updatedConnection = await storage.updatePlatformConnection(id, {
        lastSync: new Date()
      });

      // Log sync action in audit trail
      await storage.createAuditLog({
        userId: user.id,
        entityType: "platform_connection",
        entityId: id,
        action: "synced",
        details: `Platform sync completed: ${syncResult.syncedItems} items`,
        ipAddress: req.ip
      });

      res.json({
        ...syncResult,
        connection: sanitizePlatformConnection(updatedConnection)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Platform Webhooks API
  app.get("/api/platform-webhooks", isAuthenticated, async (req, res) => {
    try {
      const { platformConnectionId } = req.query;
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      if (!platformConnectionId) {
        return res.status(400).json({ error: "Platform connection ID is required" });
      }

      // Validate connection belongs to user's tenant
      const connection = await storage.getPlatformConnection(platformConnectionId as string);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }

      const client = await storage.getClient(connection.clientId);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Access denied" });
      }

      const webhooks = await storage.getPlatformWebhooksByConnection(platformConnectionId as string);
      res.json(webhooks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Public webhook endpoint (no authentication required for external systems)
  app.post("/api/webhooks/platform/:connectionId", async (req, res) => {
    try {
      const { connectionId } = req.params;
      const payload = req.body;
      const signature = req.headers['x-webhook-signature'] as string;
      const timestamp = req.headers['x-webhook-timestamp'] as string;

      // Validate connection exists and is active
      const connection = await storage.getPlatformConnection(connectionId);
      if (!connection || !connection.isActive) {
        return res.status(404).json({ error: "Connection not found or inactive" });
      }

      // Validate timestamp to prevent replay attacks (5 minute window)
      if (timestamp) {
        const webhookTime = parseInt(timestamp);
        const currentTime = Math.floor(Date.now() / 1000);
        if (Math.abs(currentTime - webhookTime) > 300) { // 5 minutes
          return res.status(400).json({ error: "Webhook timestamp too old" });
        }
      }

      // Verify HMAC signature for security - REQUIRED when secret configured
      if (connection.webhookSecret) {
        if (!signature) {
          console.warn(`Missing required webhook signature for connection ${connectionId}`);
          return res.status(401).json({ error: "Webhook signature required" });
        }
        
        const payloadString = JSON.stringify(payload);
        const isValidSignature = verifyWebhookSignature(payloadString, signature, connection.webhookSecret);
        
        if (!isValidSignature) {
          console.warn(`Invalid webhook signature for connection ${connectionId}`);
          return res.status(401).json({ error: "Invalid webhook signature" });
        }
      } else if (signature) {
        console.warn(`Unexpected webhook signature for connection ${connectionId} - no secret configured`);
        return res.status(401).json({ error: "Webhook signature provided but no secret configured" });
      }

      // Validate payload schema
      const webhookSchema = z.object({
        type: z.string(),
        data: z.record(z.any()).optional(),
        timestamp: z.string().optional()
      });

      let validatedPayload;
      try {
        validatedPayload = webhookSchema.parse(payload);
      } catch (validationError) {
        return res.status(400).json({ error: "Invalid webhook payload format" });
      }

      // Create webhook record with validation
      const webhook = await storage.createPlatformWebhook({
        platformConnectionId: connectionId,
        eventType: validatedPayload.type,
        payload: JSON.stringify(validatedPayload),
        status: "received"
      });

      // Process webhook based on event type
      let processResult = { success: true, message: "Processed successfully" };
      
      try {
        switch (validatedPayload.type) {
          case "shipment_update":
            // TODO: Create shipment tracking entry
            break;
          case "return_request":
            // TODO: Create return record
            break;
          case "inventory_update":
            // TODO: Update storage items
            break;
          default:
            processResult.message = `Unknown event type: ${validatedPayload.type}`;
        }

        await storage.updatePlatformWebhook(webhook.id, {
          status: "processed"
        });
      } catch (processingError: any) {
        await storage.updatePlatformWebhook(webhook.id, {
          status: "failed"
        });
        console.error("Webhook processing error:", processingError);
        processResult = { success: false, message: processingError.message };
      }

      res.status(200).json({ 
        message: "Webhook received and processed",
        webhookId: webhook.id,
        result: processResult
      });
    } catch (error: any) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Shipment Tracking API - with courier sync and notifications
  app.get("/api/shipments/:id/tracking", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      // Validate shipment belongs to user's tenant
      const shipment = await storage.getShipment(id);
      if (!shipment) {
        return res.status(404).json({ error: "Shipment not found" });
      }

      const client = await storage.getClient(shipment.clientId);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Access denied" });
      }

      const trackingHistory = await storage.getTrackingByShipment(id);
      res.json(trackingHistory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/shipments/:id/tracking", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      // Validate shipment belongs to user's tenant
      const shipment = await storage.getShipment(id);
      if (!shipment) {
        return res.status(404).json({ error: "Shipment not found" });
      }

      const client = await storage.getClient(shipment.clientId);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Access denied" });
      }

      const trackingData = {
        ...req.body,
        shipmentId: id,
        timestamp: req.body.timestamp || new Date()
      };

      const validatedData = insertShipmentTrackingSchema.parse(trackingData);
      const tracking = await storage.createShipmentTracking(validatedData);

      // Send notifications for significant status changes
      if (["picked_up", "delivered", "failed", "returned"].includes(validatedData.status)) {
        try {
          // Notify client via email/webhook
          await storage.createNotification({
            recipientId: client.userId || user.id,
            clientId: client.id,
            type: "email",
            title: `Shipment ${validatedData.status}`,
            message: `Your shipment ${shipment.trackingNumber} is now ${validatedData.status}`,
            category: "tracking",
            data: JSON.stringify({
              shipmentId: id,
              trackingNumber: shipment.trackingNumber,
              status: validatedData.status,
              location: validatedData.location
            })
          });

          // Send webhook to connected platforms
          const platformConnections = await storage.getPlatformConnectionsByClient(client.id);
          for (const connection of platformConnections.filter(c => c.isActive && c.webhookUrl)) {
            await storage.createPlatformWebhook({
              platformConnectionId: connection.id,
              eventType: "shipment_update",
              payload: JSON.stringify({
                type: "shipment_update",
                data: {
                  shipmentId: id,
                  trackingNumber: shipment.trackingNumber,
                  status: validatedData.status,
                  location: validatedData.location,
                  timestamp: validatedData.timestamp
                }
              }),
              status: "pending"
            });
          }
        } catch (notificationError) {
          console.error("Failed to send notifications:", notificationError);
          // Continue processing even if notifications fail
        }
      }

      // Log tracking creation in audit trail
      await storage.createAuditLog({
        userId: user.id,
        entityType: "shipment_tracking",
        entityId: tracking.id,
        action: "created",
        details: `Tracking event created: ${validatedData.status}`,
        ipAddress: req.ip
      });

      res.status(201).json(tracking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/shipments/:id/tracking/:trackingId", isAuthenticated, async (req, res) => {
    try {
      const { id, trackingId } = req.params;
      const user = req.user;

      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      // Validate tracking belongs to user's tenant
      const tracking = await storage.getShipmentTracking(trackingId);
      if (!tracking) {
        return res.status(404).json({ error: "Tracking not found" });
      }

      const shipment = await storage.getShipment(tracking.shipmentId);
      if (!shipment || shipment.id !== id) {
        return res.status(404).json({ error: "Tracking not found for this shipment" });
      }

      const client = await storage.getClient(shipment.clientId);
      if (!client || client.tenantId !== user.tenantId) {
        return res.status(404).json({ error: "Access denied" });
      }

      const updateSchema = insertShipmentTrackingSchema.partial().omit({ id: true, shipmentId: true });
      const validatedUpdates = updateSchema.parse(req.body);
      const updatedTracking = await storage.updateShipmentTracking(trackingId, validatedUpdates);

      // Log tracking update in audit trail
      await storage.createAuditLog({
        userId: user.id,
        entityType: "shipment_tracking",
        entityId: trackingId,
        action: "updated",
        details: `Tracking event updated`,
        ipAddress: req.ip
      });

      res.json(updatedTracking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Courier Sync API - for automatic updates from courier systems
  app.post("/api/tracking/sync/:courierCode", async (req, res) => {
    try {
      const { courierCode } = req.params;
      const updates = req.body;

      // Validate courier module exists and is active
      const courierModule = await storage.getCourierModuleByCode(courierCode);
      if (!courierModule || courierModule.status !== "active") {
        return res.status(404).json({ error: "Courier module not found or inactive" });
      }

      const processedUpdates = [];
      const errors = [];

      for (const update of updates) {
        try {
          const { trackingNumber, status, location, timestamp, description } = update;

          // Find shipment by tracking number
          const shipment = await storage.getShipmentByTrackingNumber(trackingNumber);
          if (!shipment) {
            errors.push({ trackingNumber, error: "Shipment not found" });
            continue;
          }

          // Create tracking entry
          const trackingData = {
            shipmentId: shipment.id,
            status: status,
            location: location || "",
            description: description || "",
            courierNote: `Auto-sync from ${courierCode}`,
            timestamp: new Date(timestamp || Date.now()),
            isPublic: true
          };

          const validatedData = insertShipmentTrackingSchema.parse(trackingData);
          const tracking = await storage.createShipmentTracking(validatedData);

          // Send notifications for major status changes
          if (["picked_up", "delivered", "failed", "returned"].includes(status)) {
            const client = await storage.getClient(shipment.clientId);
            if (client) {
              // Create notification
              await storage.createNotification({
                recipientId: client.userId || shipment.clientId,
                clientId: client.id,
                type: "email",
                title: `Shipment ${status}`,
                message: `Your shipment ${trackingNumber} is now ${status}`,
                category: "tracking",
                data: JSON.stringify({
                  shipmentId: shipment.id,
                  trackingNumber,
                  status,
                  location
                })
              });

              // Send webhook to platforms
              const platformConnections = await storage.getPlatformConnectionsByClient(client.id);
              for (const connection of platformConnections.filter(c => c.isActive && c.webhookUrl)) {
                await storage.createPlatformWebhook({
                  platformConnectionId: connection.id,
                  eventType: "shipment_update",
                  payload: JSON.stringify({
                    type: "shipment_update",
                    data: {
                      shipmentId: shipment.id,
                      trackingNumber,
                      status,
                      location,
                      timestamp: trackingData.timestamp
                    }
                  }),
                  status: "pending"
                });
              }
            }
          }

          processedUpdates.push({ trackingNumber, trackingId: tracking.id, status: "processed" });
        } catch (updateError: any) {
          errors.push({ trackingNumber: update.trackingNumber, error: updateError.message });
        }
      }

      res.json({
        message: "Tracking sync completed",
        processed: processedUpdates.length,
        errors: errors.length,
        processedUpdates,
        errors
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Real-time tracking notifications
  app.get("/api/tracking/notifications", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const { status = "unread", limit = "50" } = req.query;
      const notifications = await storage.getNotificationsByRecipient(
        user.id, 
        status === "unread" ? false : undefined,
        parseInt(limit as string)
      );

      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/tracking/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      // Validate notification belongs to user
      const notification = await storage.getNotification(id);
      if (!notification || notification.recipientId !== user.id) {
        return res.status(404).json({ error: "Notification not found" });
      }

      const updatedNotification = await storage.updateNotification(id, {
        isRead: true,
        deliveredAt: new Date()
      });

      res.json(updatedNotification);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Reportistica e Analisi Predittiva API
  
  // Report Operativi
  app.get("/api/reports/operational", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const { startDate, endDate, clientId } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 giorni fa
      const end = endDate ? new Date(endDate as string) : new Date();

      // Get clients for the tenant
      const clients = clientId ? 
        [await storage.getClient(clientId as string)] : 
        await storage.getClientsByTenant(user.tenantId);

      const validClients = clients.filter(c => c && c.tenantId === user.tenantId);
      const clientIds = validClients.map(c => c.id);

      if (clientIds.length === 0) {
        return res.json({ error: "No clients found" });
      }

      // Andamento spedizioni
      const shipmentsData = [];
      let totalShipments = 0;
      let deliveredShipments = 0;
      let failedShipments = 0;

      for (const id of clientIds) {
        const shipments = await storage.getShipmentsByClient(id);
        const filteredShipments = shipments.filter(s => 
          new Date(s.createdAt) >= start && new Date(s.createdAt) <= end
        );
        
        totalShipments += filteredShipments.length;
        
        for (const shipment of filteredShipments) {
          const tracking = await storage.getTrackingByShipment(shipment.id);
          const latestStatus = tracking[0]?.status;
          if (latestStatus === 'delivered') deliveredShipments++;
          if (latestStatus === 'failed') failedShipments++;
        }
        
        shipmentsData.push({
          clientId: id,
          clientName: validClients.find(c => c.id === id)?.name,
          shipments: filteredShipments.length,
          delivered: filteredShipments.filter(s => 
            tracking.some(t => t.shipmentId === s.id && t.status === 'delivered')
          ).length
        });
      }

      // Andamento resi
      const returnsData = [];
      let totalReturns = 0;
      
      for (const id of clientIds) {
        const returns = await storage.getReturnsByClient(id);
        const filteredReturns = returns.filter(r => 
          new Date(r.createdAt) >= start && new Date(r.createdAt) <= end
        );
        totalReturns += filteredReturns.length;
        
        returnsData.push({
          clientId: id,
          clientName: validClients.find(c => c.id === id)?.name,
          returns: filteredReturns.length,
          processed: filteredReturns.filter(r => r.status === 'processed').length
        });
      }

      // Giacenze
      const storageData = [];
      let totalItems = 0;
      
      for (const id of clientIds) {
        const items = await storage.getStorageItemsByClient(id);
        totalItems += items.length;
        
        storageData.push({
          clientId: id,
          clientName: validClients.find(c => c.id === id)?.name,
          totalItems: items.length,
          available: items.filter(i => i.status === 'available').length,
          reserved: items.filter(i => i.status === 'reserved').length,
          shipped: items.filter(i => i.status === 'shipped').length
        });
      }

      // Performance corrieri
      const courierModules = await storage.getCourierModulesByTenant(user.tenantId);
      const courierPerformance = [];
      
      for (const courier of courierModules) {
        let courierShipments = 0;
        let courierDelivered = 0;
        let avgDeliveryTime = 0;
        
        for (const id of clientIds) {
          const shipments = await storage.getShipmentsByClient(id);
          const courierShips = shipments.filter(s => 
            s.courierModuleId === courier.id &&
            new Date(s.createdAt) >= start && new Date(s.createdAt) <= end
          );
          courierShipments += courierShips.length;
          
          // Calcola delivery rate e tempi
          for (const shipment of courierShips) {
            const tracking = await storage.getTrackingByShipment(shipment.id);
            const delivered = tracking.find(t => t.status === 'delivered');
            if (delivered) {
              courierDelivered++;
              const deliveryTime = new Date(delivered.timestamp).getTime() - new Date(shipment.createdAt).getTime();
              avgDeliveryTime += deliveryTime / (1000 * 60 * 60 * 24); // giorni
            }
          }
        }
        
        courierPerformance.push({
          courierId: courier.id,
          courierName: courier.name,
          shipments: courierShipments,
          delivered: courierDelivered,
          deliveryRate: courierShipments > 0 ? (courierDelivered / courierShipments * 100).toFixed(1) : '0',
          avgDeliveryDays: courierDelivered > 0 ? (avgDeliveryTime / courierDelivered).toFixed(1) : '0'
        });
      }

      res.json({
        period: { startDate: start, endDate: end },
        summary: {
          totalShipments,
          deliveredShipments,
          failedShipments,
          deliveryRate: totalShipments > 0 ? (deliveredShipments / totalShipments * 100).toFixed(1) : '0',
          totalReturns,
          totalStorageItems: totalItems
        },
        shipments: shipmentsData,
        returns: returnsData,
        storage: storageData,
        courierPerformance
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // KPI e Statistiche
  app.get("/api/reports/kpi", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const { period = "month", clientId, commercialId } = req.query;
      
      // Calcola date periodo
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "quarter":
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default: // month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get data scope based on user role and filters
      let clients;
      if (user.role === "commercial" && !commercialId) {
        clients = await storage.getClientsByCommercial(user.id);
      } else if (commercialId && user.role === "admin") {
        clients = await storage.getClientsByCommercial(commercialId as string);
      } else if (clientId) {
        const client = await storage.getClient(clientId as string);
        clients = client && client.tenantId === user.tenantId ? [client] : [];
      } else {
        clients = await storage.getClientsByTenant(user.tenantId);
      }

      const clientIds = clients.map(c => c.id);

      // KPI Operativi
      let totalShipments = 0;
      let totalRevenue = 0;
      let totalCosts = 0;
      let onTimeDeliveries = 0;
      let avgDeliveryTime = 0;
      let customerSatisfaction = 0;
      
      for (const id of clientIds) {
        const shipments = await storage.getShipmentsByClient(id);
        const periodShipments = shipments.filter(s => 
          new Date(s.createdAt) >= startDate && new Date(s.createdAt) <= now
        );
        
        totalShipments += periodShipments.length;
        totalRevenue += periodShipments.reduce((sum, s) => sum + parseFloat(s.cost || '0'), 0);
        
        // Calcola performance delivery
        for (const shipment of periodShipments) {
          const tracking = await storage.getTrackingByShipment(shipment.id);
          const delivered = tracking.find(t => t.status === 'delivered');
          if (delivered) {
            const deliveryTime = new Date(delivered.timestamp).getTime() - new Date(shipment.createdAt).getTime();
            const days = deliveryTime / (1000 * 60 * 60 * 24);
            avgDeliveryTime += days;
            
            // Considera on-time se consegnato entro 3 giorni (configurabile)
            if (days <= 3) onTimeDeliveries++;
          }
        }
      }

      // KPI Commerciali
      const invoices = await storage.getPendingInvoices(user.tenantId);
      const periodInvoices = invoices.filter(i => 
        new Date(i.createdAt) >= startDate && new Date(i.createdAt) <= now
      );
      
      const paidInvoices = periodInvoices.filter(i => i.status === 'paid');
      const totalInvoiceValue = periodInvoices.reduce((sum, i) => sum + parseFloat(i.amount), 0);
      const paidValue = paidInvoices.reduce((sum, i) => sum + parseFloat(i.amount), 0);

      // Crescita rispetto periodo precedente
      const prevPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      const prevShipments = [];
      
      for (const id of clientIds) {
        const shipments = await storage.getShipmentsByClient(id);
        const prevPeriodShipments = shipments.filter(s => 
          new Date(s.createdAt) >= prevPeriodStart && new Date(s.createdAt) < startDate
        );
        prevShipments.push(...prevPeriodShipments);
      }

      const growthRate = prevShipments.length > 0 ? 
        ((totalShipments - prevShipments.length) / prevShipments.length * 100).toFixed(1) : '0';

      res.json({
        period: { startDate, endDate: now, type: period },
        scope: {
          clients: clients.length,
          commercial: commercialId || (user.role === "commercial" ? user.id : null)
        },
        operationalKPI: {
          totalShipments,
          deliveryRate: totalShipments > 0 ? (onTimeDeliveries / totalShipments * 100).toFixed(1) : '0',
          avgDeliveryDays: totalShipments > 0 ? (avgDeliveryTime / totalShipments).toFixed(1) : '0',
          customerSatisfaction: '0', // TODO: implementare sistema feedback
          growthRate: `${growthRate}%`
        },
        commercialKPI: {
          totalRevenue: totalRevenue.toFixed(2),
          totalInvoices: periodInvoices.length,
          paidInvoices: paidInvoices.length,
          paymentRate: periodInvoices.length > 0 ? (paidInvoices.length / periodInvoices.length * 100).toFixed(1) : '0',
          averageOrderValue: totalShipments > 0 ? (totalRevenue / totalShipments).toFixed(2) : '0',
          outstandingAmount: (totalInvoiceValue - paidValue).toFixed(2)
        },
        trends: {
          shipmentsGrowth: `${growthRate}%`,
          revenueGrowth: '0%', // TODO: calcolare crescita revenue
          efficiency: onTimeDeliveries > 0 ? ((onTimeDeliveries / totalShipments) * 100).toFixed(1) : '0'
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Previsioni Algoritmiche
  app.get("/api/reports/predictions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      const { type = "operational", horizon = "month", clientId } = req.query;

      // Get historical data per calcoli predittivi
      const clients = clientId ? 
        [await storage.getClient(clientId as string)] : 
        await storage.getClientsByTenant(user.tenantId);
      
      const validClients = clients.filter(c => c && c.tenantId === user.tenantId);
      const clientIds = validClients.map(c => c.id);

      // Analizza storico ultimi 6 mesi per trend
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      const historicalData = [];

      for (let month = 0; month < 6; month++) {
        const monthStart = new Date(sixMonthsAgo.getTime() + month * 30 * 24 * 60 * 60 * 1000);
        const monthEnd = new Date(monthStart.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        let monthShipments = 0;
        let monthRevenue = 0;
        let monthDelivered = 0;

        for (const id of clientIds) {
          const shipments = await storage.getShipmentsByClient(id);
          const monthShips = shipments.filter(s => 
            new Date(s.createdAt) >= monthStart && new Date(s.createdAt) < monthEnd
          );
          
          monthShipments += monthShips.length;
          monthRevenue += monthShips.reduce((sum, s) => sum + parseFloat(s.cost || '0'), 0);
          
          for (const shipment of monthShips) {
            const tracking = await storage.getTrackingByShipment(shipment.id);
            if (tracking.some(t => t.status === 'delivered')) {
              monthDelivered++;
            }
          }
        }

        historicalData.push({
          month: monthStart.toISOString().substring(0, 7),
          shipments: monthShipments,
          revenue: monthRevenue,
          deliveryRate: monthShipments > 0 ? monthDelivered / monthShipments : 0
        });
      }

      if (type === "operational") {
        // Previsione successo operativo
        const avgDeliveryRate = historicalData.reduce((sum, d) => sum + d.deliveryRate, 0) / historicalData.length;
        const deliveryTrend = historicalData.length > 1 ? 
          (historicalData[historicalData.length - 1].deliveryRate - historicalData[0].deliveryRate) / historicalData.length : 0;
        
        // Previsione delivery rate prossimo periodo
        const predictedDeliveryRate = Math.min(1, Math.max(0, avgDeliveryRate + deliveryTrend));
        
        // Calcola fattori di rischio
        const recentPerformance = historicalData.slice(-3).map(d => d.deliveryRate);
        const volatility = recentPerformance.length > 1 ? 
          Math.sqrt(recentPerformance.reduce((sum, rate) => sum + Math.pow(rate - avgDeliveryRate, 2), 0) / recentPerformance.length) : 0;
        
        // Identifica criticità potenziali
        const criticalFactors = [];
        if (avgDeliveryRate < 0.9) criticalFactors.push("Delivery rate sotto standard (90%)");
        if (volatility > 0.1) criticalFactors.push("Alta variabilità performance");
        if (deliveryTrend < -0.05) criticalFactors.push("Trend delivery in peggioramento");

        res.json({
          type: "operational",
          horizon,
          period: `${new Date().toISOString().substring(0, 7)} - ${horizon}`,
          predictions: {
            successRate: (predictedDeliveryRate * 100).toFixed(1),
            confidence: Math.max(60, 100 - (volatility * 400)).toFixed(0),
            expectedIssues: Math.round((1 - predictedDeliveryRate) * 100),
            trend: deliveryTrend > 0 ? "improving" : deliveryTrend < 0 ? "declining" : "stable"
          },
          riskFactors: criticalFactors,
          recommendations: [
            avgDeliveryRate < 0.9 ? "Analizzare cause principali ritardi" : null,
            volatility > 0.1 ? "Stabilizzare processi operativi" : null,
            "Monitorare performance corrieri settimanalmente",
            "Implementare alert automatici per anomalie"
          ].filter(Boolean),
          historicalTrend: historicalData.map(d => ({
            period: d.month,
            deliveryRate: (d.deliveryRate * 100).toFixed(1),
            volume: d.shipments
          }))
        });

      } else if (type === "revenue") {
        // Previsione fatturato
        const avgRevenue = historicalData.reduce((sum, d) => sum + d.revenue, 0) / historicalData.length;
        const revenueGrowth = historicalData.length > 1 ? 
          (historicalData[historicalData.length - 1].revenue - historicalData[0].revenue) / (historicalData.length - 1) : 0;
        
        // Applica stagionalità (semplificata - aumenta in Q4)
        const currentMonth = new Date().getMonth();
        const seasonalityFactor = currentMonth >= 9 ? 1.2 : currentMonth <= 2 ? 0.9 : 1.0;
        
        // Previsione fatturato prossimo periodo
        const baseRevenue = avgRevenue + revenueGrowth;
        const predictedRevenue = baseRevenue * seasonalityFactor;
        
        // Margini previsti (basati su costi medi)
        const avgMargin = 0.15; // 15% margine medio stimato
        const predictedMargin = predictedRevenue * avgMargin;

        res.json({
          type: "revenue",
          horizon,
          period: `${new Date().toISOString().substring(0, 7)} - ${horizon}`,
          predictions: {
            expectedRevenue: predictedRevenue.toFixed(2),
            expectedMargin: predictedMargin.toFixed(2),
            marginPercentage: (avgMargin * 100).toFixed(1),
            confidence: "75",
            growthRate: historicalData.length > 1 ? 
              ((revenueGrowth / avgRevenue) * 100).toFixed(1) : "0"
          },
          factors: {
            baseRevenue: baseRevenue.toFixed(2),
            seasonalityFactor: seasonalityFactor.toFixed(2),
            trendContribution: (revenueGrowth * seasonalityFactor).toFixed(2),
            volumeImpact: "Medium" // TODO: calcolare impatto volume
          },
          scenarios: {
            optimistic: (predictedRevenue * 1.2).toFixed(2),
            realistic: predictedRevenue.toFixed(2),
            pessimistic: (predictedRevenue * 0.8).toFixed(2)
          },
          historicalTrend: historicalData.map(d => ({
            period: d.month,
            revenue: d.revenue.toFixed(2),
            shipments: d.shipments
          }))
        });
      }

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dashboard Configurazione Report
  app.get("/api/reports/config", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(400).json({ error: "Tenant not found" });
      }

      // Opzioni configurabili per report
      const clients = await storage.getClientsByTenant(user.tenantId);
      const commercials = user.role === "admin" ? 
        await storage.getCommercialUsers(user.tenantId) : [];
      const courierModules = await storage.getCourierModulesByTenant(user.tenantId);

      res.json({
        availableFilters: {
          periods: [
            { value: "week", label: "Ultima settimana" },
            { value: "month", label: "Ultimo mese" },
            { value: "quarter", label: "Ultimo trimestre" },
            { value: "year", label: "Ultimo anno" },
            { value: "custom", label: "Periodo personalizzato" }
          ],
          clients: clients.map(c => ({
            id: c.id,
            name: c.name,
            hasConnectedPlatform: false // TODO: verificare connessioni platform
          })),
          commercials: commercials.map(c => ({
            id: c.id,
            name: c.username,
            email: c.email
          })),
          couriers: courierModules.map(c => ({
            id: c.id,
            name: c.name,
            code: c.code,
            status: c.status
          }))
        },
        reportTypes: [
          {
            type: "operational",
            name: "Report Operativo",
            description: "Andamento spedizioni, resi, giacenze e performance corrieri",
            metrics: ["shipments", "deliveries", "returns", "storage", "couriers"]
          },
          {
            type: "kpi",
            name: "KPI e Statistiche",
            description: "Indicatori chiave configurabili per merchant e commerciali",
            metrics: ["revenue", "growth", "efficiency", "satisfaction"]
          },
          {
            type: "predictions",
            name: "Analisi Predittiva",
            description: "Previsioni algoritmiche per successo operativo e fatturato",
            metrics: ["forecast", "risks", "opportunities", "trends"]
          }
        ],
        userAccess: {
          role: user.role,
          canViewAll: user.role === "admin",
          canViewCommercial: user.role === "commercial",
          canExport: true,
          canSchedule: user.role === "admin"
        }
      });
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

  // ======== ECOMMERCE MODULE API ENDPOINTS ========

  // eCommerce Products
  app.get("/api/ecommerce/products", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { category } = req.query;
      let products;
      
      if (category) {
        products = await storage.getProductsByCategory(category as string, user.tenantId);
      } else {
        products = await storage.getProductsByTenant(user.tenantId);
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/ecommerce/products", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const productData = { ...req.body, tenantId: user.tenantId };
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // eCommerce Orders  
  app.get("/api/ecommerce/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { status } = req.query;
      let orders;
      
      if (status) {
        orders = await storage.getEcommerceOrdersByStatus(status as string, user.tenantId);
      } else {
        orders = await storage.getEcommerceOrdersByTenant(user.tenantId);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching ecommerce orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/ecommerce/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const orderData = { ...req.body, tenantId: user.tenantId };
      const order = await storage.createEcommerceOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating ecommerce order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // eCommerce Customers
  app.get("/api/ecommerce/customers", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const customers = await storage.getEcommerceCustomersByTenant(user.tenantId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching ecommerce customers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // eCommerce Dashboard Stats
  app.get("/api/ecommerce/stats", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const stats = await storage.getEcommerceDashboardStats(user.tenantId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching ecommerce stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ======== MARKETPLACE MODULE API ENDPOINTS ========

  // Marketplace Categories
  app.get("/api/marketplace/categories", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const categories = await storage.getMarketplaceCategories(user.tenantId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching marketplace categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Marketplace Listings with Advanced Security Controls
  app.get("/api/marketplace/listings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      console.log("🔍 [MARKETPLACE LISTINGS] User:", user?.tenantId, "Role:", user?.role);
      
      if (!user?.tenantId) {
        console.log("❌ [MARKETPLACE LISTINGS] Access denied - no tenantId");
        return res.status(403).json({ error: "Access denied" });
      }

      const { category } = req.query;
      console.log("🔍 [MARKETPLACE LISTINGS] Category filter:", category);
      
      // Implement concurrency protection rules - only show listings that user can see
      const listings = await storage.getMarketplaceListings(
        user.tenantId, 
        user.role, 
        category as string
      );
      
      console.log("✅ [MARKETPLACE LISTINGS] Found", listings.length, "listings");
      res.json(listings);
    } catch (error) {
      console.error("❌ [MARKETPLACE LISTINGS] Error:", error);
      console.error("❌ [MARKETPLACE LISTINGS] Stack:", error.stack);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/marketplace/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;

      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const listing = await storage.getMarketplaceListing(id, user.tenantId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found or access denied" });
      }

      // Increment view count for analytics
      await storage.incrementListingViews(id);

      res.json(listing);
    } catch (error) {
      console.error("Error fetching marketplace listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // My Listings (Seller perspective)
  app.get("/api/marketplace/my-listings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId || !user?.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const listings = await storage.getMarketplaceListingsBySeller(user.id, user.tenantId);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching seller listings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/marketplace/listings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId || !user?.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Enforce security defaults: private visibility, draft status
      const listingData = {
        ...req.body,
        sellerId: user.id,
        sellerTenantId: user.tenantId,
        visibility: "private", // Default to private for security
        status: "draft" // Require explicit activation
      };

      const listing = await storage.createMarketplaceListing(listingData);
      res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating marketplace listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/marketplace/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;

      if (!user?.tenantId || !user?.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only seller can update their listing
      const listing = await storage.updateMarketplaceListing(id, user.id, req.body);
      res.json(listing);
    } catch (error) {
      console.error("Error updating marketplace listing:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Marketplace Orders with Role-Based Access
  app.get("/api/marketplace/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const orders = await storage.getMarketplaceOrders(user.tenantId, user.id, user.role);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching marketplace orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/marketplace/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId || !user?.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Verify buyer can see the listing
      const listing = await storage.getMarketplaceListing(req.body.listingId, user.tenantId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found or access denied" });
      }

      const orderData = {
        ...req.body,
        buyerId: user.id,
        buyerTenantId: user.tenantId,
        sellerId: listing.sellerId,
        sellerTenantId: listing.sellerTenantId
      };

      const order = await storage.createMarketplaceOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating marketplace order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/marketplace/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;

      if (!user?.tenantId || !user?.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only buyer or seller can update order
      const order = await storage.updateMarketplaceOrder(id, req.body, user.id);
      res.json(order);
    } catch (error) {
      console.error("Error updating marketplace order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Marketplace Reviews
  app.get("/api/marketplace/listings/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getMarketplaceReviewsByListing(id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching marketplace reviews:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/marketplace/reviews", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId || !user?.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const reviewData = {
        ...req.body,
        reviewerId: user.id,
        reviewerTenantId: user.tenantId,
        isVerifiedPurchase: true
      };

      const review = await storage.createMarketplaceReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating marketplace review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Marketplace Visibility Controls
  app.post("/api/marketplace/listings/:id/visibility", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;

      if (!user?.tenantId || !user?.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Verify user owns the listing
      const listing = await storage.getMarketplaceListing(id, user.tenantId);
      if (!listing || listing.sellerId !== user.id) {
        return res.status(404).json({ error: "Listing not found or access denied" });
      }

      const visibilityData = {
        ...req.body,
        listingId: id
      };

      const visibility = await storage.setMarketplaceVisibility(visibilityData);
      res.status(201).json(visibility);
    } catch (error) {
      console.error("Error setting marketplace visibility:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Marketplace Dashboard Stats
  app.get("/api/marketplace/stats", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const stats = await storage.getMarketplaceDashboardStats(user.tenantId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching marketplace stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ======== YSPEDIZIONI INTEGRATION API ENDPOINTS ========

  // Get YSpedizioni shipping services catalog  
  app.get("/api/yspedizioni/services", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get YSpedizioni listings from marketplace with tenant filtering
      const yspedizioniTenantId = "550e8400-e29b-41d4-a716-446655440099";
      const allServices = await storage.getMarketplaceListingsBySeller(
        "550e8400-e29b-41d4-a716-446655440198", 
        yspedizioniTenantId
      );

      // Apply tenant-based filtering for security
      const availableServices = allServices.filter(service => {
        // Check visibility
        if (service.visibility === 'private') return false;
        
        // Check if tenant is explicitly allowed
        if (service.allowedTenantIds && service.allowedTenantIds.length > 0) {
          return service.allowedTenantIds.includes(user.tenantId);
        }
        
        // Check if tenant is blocked
        if (service.blockedTenantIds && service.blockedTenantIds.includes(user.tenantId)) {
          return false;
        }
        
        return service.isAvailable;
      });

      // Transform for shipping API format (server-authoritative data)
      const shippingServices = availableServices.map(service => ({
        id: service.id,
        name: service.title,
        description: service.shortDescription || service.description,
        price: service.basePrice, // Server-authoritative pricing
        currency: service.currency,
        deliveryTime: service.deliveryTime,
        serviceType: service.serviceType,
        available: service.isAvailable,
        shippingIncluded: service.shippingIncluded
      }));

      res.json({
        services: shippingServices,
        provider: {
          name: "YSpedizioni",
          logo: "https://cdn.yspedizioni.com/logo.png",
          website: "https://yspedizioni.com"
        }
      });
    } catch (error) {
      console.error("Error fetching YSpedizioni services:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Purchase shipping service from YSpedizioni (Marketplace integration)
  app.post("/api/yspedizioni/purchase", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId || !user?.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Validate input with Zod
      const purchaseSchema = z.object({
        serviceId: z.string().uuid(),
        quantity: z.number().int().min(1).max(100).default(1),
        shipmentData: z.object({
          from: z.object({
            name: z.string(),
            address: z.string(),
            city: z.string(),
            postalCode: z.string(),
            country: z.string().length(2)
          }),
          to: z.object({
            name: z.string(),
            address: z.string(),
            city: z.string(),
            postalCode: z.string(),
            country: z.string().length(2)
          }),
          package: z.object({
            weight: z.number().min(0),
            dimensions: z.object({
              length: z.number().min(0),
              width: z.number().min(0),
              height: z.number().min(0)
            }).optional()
          }),
          cod: z.boolean().optional(),
          insurance: z.number().optional(),
          notes: z.string().optional()
        }),
        idempotencyKey: z.string().optional()
      });

      const { serviceId, quantity, shipmentData, idempotencyKey } = purchaseSchema.parse(req.body);

      // Verify service exists and is available (server-side authority)
      const service = await storage.getMarketplaceListing(serviceId, user.tenantId);
      if (!service || !service.isAvailable) {
        return res.status(404).json({ error: "Service not available" });
      }

      // Verify tenant access (security check)
      if (service.visibility === 'private') {
        return res.status(403).json({ error: "Service not accessible" });
      }
      if (service.allowedTenantIds?.length > 0 && !service.allowedTenantIds.includes(user.tenantId)) {
        return res.status(403).json({ error: "Service not available for your organization" });
      }
      if (service.blockedTenantIds?.includes(user.tenantId)) {
        return res.status(403).json({ error: "Access denied to this service" });
      }

      // Check for duplicate orders with idempotency key
      if (idempotencyKey) {
        const existingOrder = await storage.getMarketplaceOrderByIdempotency(idempotencyKey, user.tenantId);
        if (existingOrder) {
          return res.status(200).json({
            orderId: existingOrder.id,
            orderNumber: existingOrder.orderNumber,
            message: "Order already exists (idempotent)"
          });
        }
      }

      // Create marketplace order (server-authoritative pricing)
      const serverCalculatedTotal = service.basePrice * quantity;
      const orderData = {
        listingId: serviceId,
        buyerId: user.id,
        buyerTenantId: user.tenantId,
        sellerId: service.sellerId,
        sellerTenantId: service.sellerTenantId,
        totalAmount: serverCalculatedTotal, // Server-side calculation only
        shippingCost: 0, // Already included in service price
        taxAmount: 0,
        currency: service.currency || "EUR",
        status: "pending",
        paymentStatus: "pending",
        idempotencyKey: idempotencyKey,
        metadata: JSON.stringify({
          shipmentData,
          purchaseType: "yspedizioni_shipping",
          automatedPurchase: true,
          serverPriceVerified: true
        })
      };

      const order = await storage.createMarketplaceOrder(orderData);

      // Create order items
      const orderItem = {
        orderId: order.id,
        listingId: serviceId,
        quantity: quantity,
        unitPrice: service.basePrice,
        totalPrice: service.basePrice * quantity,
        metadata: JSON.stringify({ shipmentData })
      };

      await storage.createMarketplaceOrderItem(orderItem);

      // ======== STRIPE CONNECT MONETIZATION ========
      let paymentIntent = null;
      let stripeClientSecret = null;
      
      if (stripe) {
        try {
          // Get seller's Stripe account (YSpedizioni should have one)
          const sellerTenant = await storage.getTenant(service.sellerTenantId);
          
          if (!sellerTenant?.stripeAccountId) {
            throw new Error("Seller Stripe account not configured");
          }

          // Check seller account capabilities
          const account = await stripe.accounts.retrieve(sellerTenant.stripeAccountId);
          if (!account.charges_enabled || !account.payouts_enabled) {
            throw new Error("Seller Stripe account not fully onboarded");
          }

          // Calculate platform fee (5% commission following Ylenia Sacco strategy)
          const platformFeeAmount = Math.round(serverCalculatedTotal * 0.05 * 100); // Convert to cents
          const totalAmountCents = Math.round(serverCalculatedTotal * 100);

          // Create PaymentIntent with Stripe Connect
          paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmountCents,
            currency: (service.currency || "EUR").toLowerCase(),
            application_fee_amount: platformFeeAmount, // Platform commission
            transfer_data: {
              destination: sellerTenant.stripeAccountId, // Split to YSpedizioni
            },
            metadata: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              buyerTenantId: user.tenantId,
              sellerTenantId: service.sellerTenantId,
              serviceType: "yspedizioni_shipping",
              platformFee: (platformFeeAmount / 100).toString()
            },
            description: `YSpedizioni: ${service.title}`,
            receipt_email: user.email || undefined,
            automatic_payment_methods: { enabled: true }
          });

          stripeClientSecret = paymentIntent.client_secret;

          // Update order with payment info
          await storage.updateMarketplaceOrder(order.id, {
            paymentIntentId: paymentIntent.id,
            platformFeeAmount: platformFeeAmount / 100,
            paymentStatus: "requires_payment_method"
          });

        } catch (stripeError) {
          console.error("Stripe Connect error:", stripeError);
          
          // Update order status to failed
          await storage.updateMarketplaceOrder(order.id, {
            status: "failed",
            paymentStatus: "failed",
            metadata: JSON.stringify({
              ...JSON.parse(orderData.metadata || "{}"),
              stripeError: stripeError.message
            })
          });

          return res.status(400).json({
            error: "Payment processing failed",
            details: stripeError.message,
            orderId: order.id
          });
        }
      }

      // TODO: Create actual shipment in YCore system
      // TODO: Send confirmation emails/notifications

      res.status(201).json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        service: {
          name: service.title,
          price: service.basePrice,
          deliveryTime: service.deliveryTime
        },
        totalAmount: orderData.totalAmount,
        currency: orderData.currency,
        platformFee: paymentIntent ? (paymentIntent.application_fee_amount / 100) : 0,
        status: paymentIntent ? "requires_payment" : "confirmed",
        estimatedDelivery: service.deliveryTime,
        trackingAvailable: true,
        payment: paymentIntent ? {
          clientSecret: stripeClientSecret,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status
        } : null,
        message: "Shipping service ordered successfully via YSpedizioni marketplace"
      });

    } catch (error) {
      console.error("Error purchasing YSpedizioni service:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get YSpedizioni shipping quote (price calculation)
  app.post("/api/yspedizioni/quote", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Validate input with Zod
      const quoteSchema = z.object({
        serviceType: z.string().optional(),
        weight: z.number().min(0).max(1000),
        dimensions: z.object({
          length: z.number().min(0),
          width: z.number().min(0), 
          height: z.number().min(0)
        }).optional(),
        destination: z.object({
          country: z.string().length(2),
          postalCode: z.string(),
          city: z.string()
        }),
        origin: z.object({
          country: z.string().length(2),
          postalCode: z.string(),
          city: z.string()
        }).optional(),
        cod: z.boolean().optional()
      });

      const validatedData = quoteSchema.parse(req.body);
      const { serviceType, weight, dimensions, destination, origin, cod } = validatedData;

      // Get matching YSpedizioni service with tenant filtering
      const yspedizioniTenantId = "550e8400-e29b-41d4-a716-446655440099";
      const allServices = await storage.getMarketplaceListingsBySeller(
        "550e8400-e29b-41d4-a716-446655440198", 
        yspedizioniTenantId
      );

      // Apply tenant filtering for security
      const services = allServices.filter(service => {
        if (service.visibility === 'private') return false;
        if (service.allowedTenantIds?.length > 0 && !service.allowedTenantIds.includes(user.tenantId)) return false;
        if (service.blockedTenantIds?.includes(user.tenantId)) return false;
        return service.isAvailable;
      });

      let selectedService = null;
      let finalPrice = 0;

      // Simple service matching logic
      if (serviceType === "express" || (weight <= 2 && serviceType !== "standard")) {
        selectedService = services.find(s => s.title.includes("Express"));
        finalPrice = selectedService?.basePrice || 8.50;
      } else if (serviceType === "international" || destination?.country !== "IT") {
        selectedService = services.find(s => s.title.includes("Internazionali"));
        finalPrice = selectedService?.basePrice || 15.80;
      } else if (weight > 30 || serviceType === "pallet") {
        selectedService = services.find(s => s.title.includes("Pallet"));
        finalPrice = selectedService?.basePrice || 45.00;
      } else if (cod) {
        selectedService = services.find(s => s.title.includes("Contrassegno"));
        finalPrice = selectedService?.basePrice || 6.80;
      } else {
        selectedService = services.find(s => s.title.includes("Standard"));
        finalPrice = selectedService?.basePrice || 4.20;
      }

      // Apply weight surcharge for heavy packages
      if (weight > 5) {
        finalPrice += (weight - 5) * 0.50;
      }

      // Apply dimensional weight surcharge
      if (dimensions?.length > 100 || dimensions?.width > 60 || dimensions?.height > 60) {
        finalPrice += 5.00;
      }

      res.json({
        serviceId: selectedService?.id,
        serviceName: selectedService?.title || "Standard Service",
        basePrice: selectedService?.basePrice || 4.20,
        finalPrice: finalPrice,
        currency: "EUR",
        deliveryTime: selectedService?.deliveryTime || "2-3 giorni",
        surcharges: {
          weight: weight > 5 ? (weight - 5) * 0.50 : 0,
          dimensions: (dimensions?.length > 100 || dimensions?.width > 60 || dimensions?.height > 60) ? 5.00 : 0
        },
        included: {
          tracking: true,
          insurance: selectedService?.title.includes("Express") || false,
          pickup: selectedService?.title.includes("Pallet") || false
        }
      });

    } catch (error) {
      console.error("Error getting YSpedizioni quote:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // YSpedizioni webhook for tracking updates
  app.post("/api/yspedizioni/webhook", async (req, res) => {
    try {
      const signature = req.get('YSpedizioni-Signature');
      const payload = JSON.stringify(req.body);

      // Verify webhook signature for security
      if (signature) {
        const webhookSecret = process.env.YSPEDIZIONI_WEBHOOK_SECRET || "yspedizioni_webhook_secret_key";
        const isValid = verifyWebhookSignature(payload, signature, webhookSecret);
        if (!isValid) {
          console.error("Invalid YSpedizioni webhook signature");
          return res.status(401).json({ error: "Invalid signature" });
        }
      }

      const { orderId, trackingNumber, status, location, timestamp, carrierName } = req.body;

      // Update shipment tracking in YCore system
      if (orderId && trackingNumber && status) {
        try {
          await storage.createShipmentTracking({
            shipmentId: orderId, // Map to shipment ID  
            carrierId: carrierName || "YSpedizioni",
            trackingNumber: trackingNumber,
            status: status,
            location: location || "In transit",
            timestamp: new Date(timestamp || Date.now()),
            notes: `YSpedizioni tracking update: ${status}`,
            isDelivered: status.toLowerCase().includes("delivered"),
            metadata: JSON.stringify({ 
              webhookSource: "yspedizioni",
              originalPayload: req.body 
            })
          });

          // Update marketplace order status based on tracking
          if (status.toLowerCase().includes("delivered")) {
            // Find the marketplace order by tracking number or orderId
            // await storage.updateMarketplaceOrderByTrackingNumber(trackingNumber, {
            //   status: "completed",
            //   deliveredAt: new Date()
            // });
          }

        } catch (trackingError) {
          console.error("Error updating tracking:", trackingError);
        }
      }

      // TODO: Send notification to customer via messaging module
      console.log("YSpedizioni tracking update processed:", {
        orderId,
        trackingNumber, 
        status,
        location,
        timestamp
      });

      res.json({ 
        received: true, 
        processed: new Date().toISOString(),
        trackingUpdated: !!trackingNumber
      });

    } catch (error) {
      console.error("Error processing YSpedizioni webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Stripe webhook for payment processing (Connect payments)
  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      if (!stripe) {
        return res.status(400).json({ error: "Stripe not configured" });
      }

      const signature = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!signature || !endpointSecret) {
        console.error("Missing Stripe webhook signature or secret");
        return res.status(400).json({ error: "Missing webhook verification" });
      }

      // Verify Stripe webhook signature using constructEvent
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
      } catch (err) {
        console.error("Stripe webhook signature verification failed:", err.message);
        return res.status(400).json({ error: "Invalid signature" });
      }

      // Handle Stripe Connect events
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log("Payment succeeded:", paymentIntent.id);
          
          // Update marketplace order payment status
          if (paymentIntent.metadata?.orderId) {
            await storage.updateMarketplaceOrder(paymentIntent.metadata.orderId, {
              paymentStatus: "paid",
              paidAt: new Date(),
              stripePaymentIntentId: paymentIntent.id
            });
          }
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.log("Payment failed:", failedPayment.id);
          
          if (failedPayment.metadata?.orderId) {
            await storage.updateMarketplaceOrder(failedPayment.metadata.orderId, {
              paymentStatus: "failed",
              status: "cancelled"
            });
          }
          break;

        case 'transfer.created':
          const transfer = event.data.object;
          console.log("Transfer to seller created:", transfer.id);
          break;

        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }

      res.json({ received: true, eventType: event.type });

    } catch (error) {
      console.error("Error processing Stripe webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
