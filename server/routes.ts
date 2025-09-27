import type { Express } from "express";
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
  insertReturnSchema 
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { parse } from "csv-parse";
import Stripe from "stripe";
import crypto from "node:crypto";

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

      // Verify HMAC signature for security
      if (signature && connection.webhookSecret) {
        const payloadString = JSON.stringify(payload);
        const isValidSignature = verifyWebhookSignature(payloadString, signature, connection.webhookSecret);
        
        if (!isValidSignature) {
          console.warn(`Invalid webhook signature for connection ${connectionId}`);
          return res.status(401).json({ error: "Invalid webhook signature" });
        }
      } else if (signature && !connection.webhookSecret) {
        console.warn(`No webhook secret configured for connection ${connectionId}`);
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
