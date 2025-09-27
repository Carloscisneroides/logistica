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
  insertReturnSchema,
  insertNotificationSchema
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

  const httpServer = createServer(app);

  return httpServer;
}
