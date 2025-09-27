import { 
  users, clients, tenants, courierModules, shipments, invoices, corrections, commissions, aiRoutingLogs,
  platformConnections, platformWebhooks, shipmentTracking, returns, storageItems, 
  csmTickets, csmKpi, tsmTickets, auditLogs, escalations, notifications,
  type User, type InsertUser, type Client, type InsertClient, type Tenant, type InsertTenant,
  type CourierModule, type InsertCourierModule, type Shipment, type InsertShipment,
  type Invoice, type InsertInvoice, type Correction, type InsertCorrection,
  type Commission, type InsertCommission, type AiRoutingLog, type InsertAiRoutingLog,
  type PlatformConnection, type InsertPlatformConnection, type PlatformWebhook, type InsertPlatformWebhook,
  type ShipmentTracking, type InsertShipmentTracking, type Return, type InsertReturn,
  type StorageItem, type InsertStorageItem, type CsmTicket, type InsertCsmTicket,
  type CsmKpi, type InsertCsmKpi, type TsmTicket, type InsertTsmTicket,
  type AuditLog, type InsertAuditLog, type Escalation, type InsertEscalation,
  type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session, { SessionOptions } from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Tenants
  getTenant(id: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant>;
  
  // Clients
  getClient(id: string): Promise<Client | undefined>;
  getClientsByTenant(tenantId: string): Promise<Client[]>;
  getClientsByCommercial(commercialId: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<Client>): Promise<Client>;
  
  // Courier Modules
  getCourierModule(id: string): Promise<CourierModule | undefined>;
  getCourierModulesByTenant(tenantId: string): Promise<CourierModule[]>;
  getActiveCourierModules(tenantId: string): Promise<CourierModule[]>;
  createCourierModule(module: InsertCourierModule): Promise<CourierModule>;
  updateCourierModule(id: string, updates: Partial<CourierModule>): Promise<CourierModule>;
  
  // Shipments
  getShipment(id: string): Promise<Shipment | undefined>;
  getShipmentsByClient(clientId: string): Promise<Shipment[]>;
  getTodayShipments(tenantId: string): Promise<number>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment>;
  
  // Invoices
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoicesByClient(clientId: string): Promise<Invoice[]>;
  getPendingInvoices(tenantId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice>;
  
  // Corrections
  getCorrection(id: string): Promise<Correction | undefined>;
  getCorrectionsByClient(clientId: string): Promise<Correction[]>;
  getPendingCorrections(tenantId: string): Promise<Correction[]>;
  createCorrection(correction: InsertCorrection): Promise<Correction>;
  updateCorrection(id: string, updates: Partial<Correction>): Promise<Correction>;
  
  // Commissions
  getCommission(id: string): Promise<Commission | undefined>;
  getCommissionsByCommercial(commercialId: string, month?: number, year?: number): Promise<Commission[]>;
  createCommission(commission: InsertCommission): Promise<Commission>;
  updateCommission(id: string, updates: Partial<Commission>): Promise<Commission>;
  
  // AI Routing Logs
  createAiRoutingLog(log: InsertAiRoutingLog): Promise<AiRoutingLog>;
  getAiRoutingStats(tenantId: string): Promise<{ todayRouted: number; totalSavings: number; accuracy: number }>;
  
  // Dashboard stats
  getDashboardStats(tenantId: string): Promise<{
    todayShipments: number;
    activeClients: number;
    monthlyRevenue: number;
    activeModules: number;
    totalModules: number;
  }>;

  // Platform Connections
  getPlatformConnection(id: string): Promise<PlatformConnection | undefined>;
  getPlatformConnectionsByClient(clientId: string): Promise<PlatformConnection[]>;
  createPlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection>;
  updatePlatformConnection(id: string, updates: Partial<PlatformConnection>): Promise<PlatformConnection>;

  // Platform Webhooks
  getPlatformWebhook(id: string): Promise<PlatformWebhook | undefined>;
  getPlatformWebhooksByConnection(connectionId: string): Promise<PlatformWebhook[]>;
  getPendingWebhooks(): Promise<PlatformWebhook[]>;
  createPlatformWebhook(webhook: InsertPlatformWebhook): Promise<PlatformWebhook>;
  updatePlatformWebhook(id: string, updates: Partial<PlatformWebhook>): Promise<PlatformWebhook>;

  // Shipment Tracking
  getShipmentTracking(id: string): Promise<ShipmentTracking | undefined>;
  getTrackingByShipment(shipmentId: string): Promise<ShipmentTracking[]>;
  createShipmentTracking(tracking: InsertShipmentTracking): Promise<ShipmentTracking>;
  updateShipmentTracking(id: string, updates: Partial<ShipmentTracking>): Promise<ShipmentTracking>;

  // Returns
  getReturn(id: string): Promise<Return | undefined>;
  getReturnsByClient(clientId: string): Promise<Return[]>;
  getReturnsByShipment(shipmentId: string): Promise<Return[]>;
  createReturn(returnItem: InsertReturn): Promise<Return>;
  updateReturn(id: string, updates: Partial<Return>): Promise<Return>;

  // Storage Items
  getStorageItem(id: string): Promise<StorageItem | undefined>;
  getStorageItemsByClient(clientId: string): Promise<StorageItem[]>;
  getStorageItemsByStatus(status: string): Promise<StorageItem[]>;
  createStorageItem(item: InsertStorageItem): Promise<StorageItem>;
  updateStorageItem(id: string, updates: Partial<StorageItem>): Promise<StorageItem>;

  // CSM Tickets
  getCsmTicket(id: string): Promise<CsmTicket | undefined>;
  getCsmTicketsByClient(clientId: string): Promise<CsmTicket[]>;
  getCsmTicketsByAssigned(assignedTo: string): Promise<CsmTicket[]>;
  createCsmTicket(ticket: InsertCsmTicket): Promise<CsmTicket>;
  updateCsmTicket(id: string, updates: Partial<CsmTicket>): Promise<CsmTicket>;

  // CSM KPI
  getCsmKpi(id: string): Promise<CsmKpi | undefined>;
  getCsmKpiByClient(clientId: string, month?: number, year?: number): Promise<CsmKpi[]>;
  createCsmKpi(kpi: InsertCsmKpi): Promise<CsmKpi>;
  updateCsmKpi(id: string, updates: Partial<CsmKpi>): Promise<CsmKpi>;

  // TSM Tickets
  getTsmTicket(id: string): Promise<TsmTicket | undefined>;
  getTsmTicketsByClient(clientId: string): Promise<TsmTicket[]>;
  getTsmTicketsByAssigned(assignedTo: string): Promise<TsmTicket[]>;
  createTsmTicket(ticket: InsertTsmTicket): Promise<TsmTicket>;
  updateTsmTicket(id: string, updates: Partial<TsmTicket>): Promise<TsmTicket>;

  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  getAuditLogsByUser(userId: string): Promise<AuditLog[]>;

  // Escalations
  getEscalation(id: string): Promise<Escalation | undefined>;
  getEscalationsByTicket(ticketId: string, ticketType: string): Promise<Escalation[]>;
  getPendingEscalations(): Promise<Escalation[]>;
  createEscalation(escalation: InsertEscalation): Promise<Escalation>;
  updateEscalation(id: string, updates: Partial<Escalation>): Promise<Escalation>;

  // Notifications
  getNotification(id: string): Promise<Notification | undefined>;
  getNotificationsByRecipient(recipientId: string): Promise<Notification[]>;
  getUnreadNotifications(recipientId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: string, updates: Partial<Notification>): Promise<Notification>;
  markNotificationsAsRead(recipientId: string, notificationIds: string[]): Promise<void>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Tenants
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(insertTenant).returning();
    return tenant;
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const [tenant] = await db.update(tenants).set(updates).where(eq(tenants.id, id)).returning();
    return tenant;
  }

  // Clients
  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientsByTenant(tenantId: string): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.tenantId, tenantId));
  }

  async getClientsByCommercial(commercialId: string): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.commercialId, commercialId));
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const [client] = await db.update(clients).set(updates).where(eq(clients.id, id)).returning();
    return client;
  }

  // Courier Modules
  async getCourierModule(id: string): Promise<CourierModule | undefined> {
    const [module] = await db.select().from(courierModules).where(eq(courierModules.id, id));
    return module || undefined;
  }

  async getCourierModulesByTenant(tenantId: string): Promise<CourierModule[]> {
    return await db.select().from(courierModules).where(eq(courierModules.tenantId, tenantId));
  }

  async getActiveCourierModules(tenantId: string): Promise<CourierModule[]> {
    return await db.select().from(courierModules)
      .where(and(eq(courierModules.tenantId, tenantId), eq(courierModules.status, "active")));
  }

  async createCourierModule(insertModule: InsertCourierModule): Promise<CourierModule> {
    const [module] = await db.insert(courierModules).values(insertModule).returning();
    return module;
  }

  async updateCourierModule(id: string, updates: Partial<CourierModule>): Promise<CourierModule> {
    const [module] = await db.update(courierModules).set(updates).where(eq(courierModules.id, id)).returning();
    return module;
  }

  // Shipments
  async getShipment(id: string): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
    return shipment || undefined;
  }

  async getShipmentsByClient(clientId: string): Promise<Shipment[]> {
    return await db.select().from(shipments).where(eq(shipments.clientId, clientId));
  }

  async getTodayShipments(tenantId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(shipments)
      .leftJoin(clients, eq(shipments.clientId, clients.id))
      .where(and(
        eq(clients.tenantId, tenantId),
        sql`${shipments.createdAt} >= ${today}`
      ));
    
    return result?.count || 0;
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const [shipment] = await db.insert(shipments).values(insertShipment).returning();
    return shipment;
  }

  async updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment> {
    const [shipment] = await db.update(shipments).set(updates).where(eq(shipments.id, id)).returning();
    return shipment;
  }

  // Invoices
  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoicesByClient(clientId: string): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.clientId, clientId));
  }

  async getPendingInvoices(tenantId: string): Promise<Invoice[]> {
    const result = await db
      .select({ invoice: invoices })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(
        eq(clients.tenantId, tenantId),
        eq(invoices.status, "sent")
      ));
    return result.map(r => r.invoice);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(insertInvoice).returning();
    return invoice;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const [invoice] = await db.update(invoices).set(updates).where(eq(invoices.id, id)).returning();
    return invoice;
  }

  // Corrections
  async getCorrection(id: string): Promise<Correction | undefined> {
    const [correction] = await db.select().from(corrections).where(eq(corrections.id, id));
    return correction || undefined;
  }

  async getCorrectionsByClient(clientId: string): Promise<Correction[]> {
    return await db.select().from(corrections).where(eq(corrections.clientId, clientId));
  }

  async getPendingCorrections(tenantId: string): Promise<Correction[]> {
    const result = await db
      .select({ correction: corrections })
      .from(corrections)
      .leftJoin(clients, eq(corrections.clientId, clients.id))
      .where(and(
        eq(clients.tenantId, tenantId),
        eq(corrections.status, "pending")
      ));
    return result.map(r => r.correction);
  }

  async createCorrection(insertCorrection: InsertCorrection): Promise<Correction> {
    const [correction] = await db.insert(corrections).values(insertCorrection).returning();
    return correction;
  }

  async updateCorrection(id: string, updates: Partial<Correction>): Promise<Correction> {
    const [correction] = await db.update(corrections).set(updates).where(eq(corrections.id, id)).returning();
    return correction;
  }

  // Commissions
  async getCommission(id: string): Promise<Commission | undefined> {
    const [commission] = await db.select().from(commissions).where(eq(commissions.id, id));
    return commission || undefined;
  }

  async getCommissionsByCommercial(commercialId: string, month?: number, year?: number): Promise<Commission[]> {
    if (month && year) {
      return await db.select().from(commissions).where(and(
        eq(commissions.commercialId, commercialId),
        eq(commissions.month, month),
        eq(commissions.year, year)
      ));
    } else {
      return await db.select().from(commissions).where(eq(commissions.commercialId, commercialId));
    }
  }

  async createCommission(insertCommission: InsertCommission): Promise<Commission> {
    const [commission] = await db.insert(commissions).values(insertCommission).returning();
    return commission;
  }

  async updateCommission(id: string, updates: Partial<Commission>): Promise<Commission> {
    const [commission] = await db.update(commissions).set(updates).where(eq(commissions.id, id)).returning();
    return commission;
  }

  // AI Routing Logs
  async createAiRoutingLog(insertLog: InsertAiRoutingLog): Promise<AiRoutingLog> {
    const [log] = await db.insert(aiRoutingLogs).values(insertLog).returning();
    return log;
  }

  async getAiRoutingStats(tenantId: string): Promise<{ todayRouted: number; totalSavings: number; accuracy: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [todayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiRoutingLogs)
      .leftJoin(shipments, eq(aiRoutingLogs.shipmentId, shipments.id))
      .leftJoin(clients, eq(shipments.clientId, clients.id))
      .where(and(
        eq(clients.tenantId, tenantId),
        sql`${aiRoutingLogs.createdAt} >= ${today}`
      ));

    const [savingsResult] = await db
      .select({ 
        totalSavings: sql<number>`COALESCE(SUM(${aiRoutingLogs.savings}), 0)`,
        avgConfidence: sql<number>`COALESCE(AVG(${aiRoutingLogs.confidence}), 0)`
      })
      .from(aiRoutingLogs)
      .leftJoin(shipments, eq(aiRoutingLogs.shipmentId, shipments.id))
      .leftJoin(clients, eq(shipments.clientId, clients.id))
      .where(eq(clients.tenantId, tenantId));

    return {
      todayRouted: todayResult?.count || 0,
      totalSavings: savingsResult?.totalSavings || 0,
      accuracy: savingsResult?.avgConfidence || 0
    };
  }

  // Dashboard stats
  async getDashboardStats(tenantId: string): Promise<{
    todayShipments: number;
    activeClients: number;
    monthlyRevenue: number;
    activeModules: number;
    totalModules: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Today's shipments
    const [todayShipmentsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(shipments)
      .leftJoin(clients, eq(shipments.clientId, clients.id))
      .where(and(
        eq(clients.tenantId, tenantId),
        sql`${shipments.createdAt} >= ${today}`
      ));

    // Active clients
    const [activeClientsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(and(
        eq(clients.tenantId, tenantId),
        eq(clients.isActive, true)
      ));

    // Monthly revenue
    const [monthlyRevenueResult] = await db
      .select({ revenue: sql<number>`COALESCE(SUM(${invoices.amount}), 0)` })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(
        eq(clients.tenantId, tenantId),
        sql`${invoices.createdAt} >= ${thisMonth}`
      ));

    // Modules stats
    const [activeModulesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courierModules)
      .where(and(
        eq(courierModules.tenantId, tenantId),
        eq(courierModules.status, "active")
      ));

    const [totalModulesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courierModules)
      .where(eq(courierModules.tenantId, tenantId));

    return {
      todayShipments: todayShipmentsResult?.count || 0,
      activeClients: activeClientsResult?.count || 0,
      monthlyRevenue: monthlyRevenueResult?.revenue || 0,
      activeModules: activeModulesResult?.count || 0,
      totalModules: totalModulesResult?.count || 0
    };
  }

  // Platform Connections
  async getPlatformConnection(id: string): Promise<PlatformConnection | undefined> {
    const [connection] = await db.select().from(platformConnections).where(eq(platformConnections.id, id));
    return connection || undefined;
  }

  async getPlatformConnectionsByClient(clientId: string): Promise<PlatformConnection[]> {
    return await db.select().from(platformConnections).where(eq(platformConnections.clientId, clientId));
  }

  async createPlatformConnection(insertConnection: InsertPlatformConnection): Promise<PlatformConnection> {
    const [connection] = await db.insert(platformConnections).values(insertConnection).returning();
    return connection;
  }

  async updatePlatformConnection(id: string, updates: Partial<PlatformConnection>): Promise<PlatformConnection> {
    const [connection] = await db.update(platformConnections).set(updates).where(eq(platformConnections.id, id)).returning();
    return connection;
  }

  // Platform Webhooks
  async getPlatformWebhook(id: string): Promise<PlatformWebhook | undefined> {
    const [webhook] = await db.select().from(platformWebhooks).where(eq(platformWebhooks.id, id));
    return webhook || undefined;
  }

  async getPlatformWebhooksByConnection(connectionId: string): Promise<PlatformWebhook[]> {
    return await db.select().from(platformWebhooks).where(eq(platformWebhooks.platformConnectionId, connectionId));
  }

  async getPendingWebhooks(): Promise<PlatformWebhook[]> {
    return await db.select().from(platformWebhooks).where(eq(platformWebhooks.status, "pending"));
  }

  async createPlatformWebhook(insertWebhook: InsertPlatformWebhook): Promise<PlatformWebhook> {
    const [webhook] = await db.insert(platformWebhooks).values(insertWebhook).returning();
    return webhook;
  }

  async updatePlatformWebhook(id: string, updates: Partial<PlatformWebhook>): Promise<PlatformWebhook> {
    const [webhook] = await db.update(platformWebhooks).set(updates).where(eq(platformWebhooks.id, id)).returning();
    return webhook;
  }

  // Shipment Tracking
  async getShipmentTracking(id: string): Promise<ShipmentTracking | undefined> {
    const [tracking] = await db.select().from(shipmentTracking).where(eq(shipmentTracking.id, id));
    return tracking || undefined;
  }

  async getTrackingByShipment(shipmentId: string): Promise<ShipmentTracking[]> {
    return await db.select().from(shipmentTracking)
      .where(eq(shipmentTracking.shipmentId, shipmentId))
      .orderBy(desc(shipmentTracking.timestamp));
  }

  async createShipmentTracking(insertTracking: InsertShipmentTracking): Promise<ShipmentTracking> {
    const [tracking] = await db.insert(shipmentTracking).values(insertTracking).returning();
    return tracking;
  }

  async updateShipmentTracking(id: string, updates: Partial<ShipmentTracking>): Promise<ShipmentTracking> {
    const [tracking] = await db.update(shipmentTracking).set(updates).where(eq(shipmentTracking.id, id)).returning();
    return tracking;
  }

  // Returns
  async getReturn(id: string): Promise<Return | undefined> {
    const [returnItem] = await db.select().from(returns).where(eq(returns.id, id));
    return returnItem || undefined;
  }

  async getReturnsByClient(clientId: string): Promise<Return[]> {
    return await db.select().from(returns).where(eq(returns.clientId, clientId));
  }

  async getReturnsByShipment(shipmentId: string): Promise<Return[]> {
    return await db.select().from(returns).where(eq(returns.shipmentId, shipmentId));
  }

  async createReturn(insertReturn: InsertReturn): Promise<Return> {
    const [returnItem] = await db.insert(returns).values(insertReturn).returning();
    return returnItem;
  }

  async updateReturn(id: string, updates: Partial<Return>): Promise<Return> {
    const [returnItem] = await db.update(returns).set(updates).where(eq(returns.id, id)).returning();
    return returnItem;
  }

  // Storage Items
  async getStorageItem(id: string): Promise<StorageItem | undefined> {
    const [item] = await db.select().from(storageItems).where(eq(storageItems.id, id));
    return item || undefined;
  }

  async getStorageItemsByClient(clientId: string): Promise<StorageItem[]> {
    return await db.select().from(storageItems).where(eq(storageItems.clientId, clientId));
  }

  async getStorageItemsByStatus(status: string): Promise<StorageItem[]> {
    return await db.select().from(storageItems).where(eq(storageItems.status, status as any));
  }

  async createStorageItem(insertItem: InsertStorageItem): Promise<StorageItem> {
    const [item] = await db.insert(storageItems).values(insertItem).returning();
    return item;
  }

  async updateStorageItem(id: string, updates: Partial<StorageItem>): Promise<StorageItem> {
    const [item] = await db.update(storageItems).set(updates).where(eq(storageItems.id, id)).returning();
    return item;
  }

  // CSM Tickets
  async getCsmTicket(id: string): Promise<CsmTicket | undefined> {
    const [ticket] = await db.select().from(csmTickets).where(eq(csmTickets.id, id));
    return ticket || undefined;
  }

  async getCsmTicketsByClient(clientId: string): Promise<CsmTicket[]> {
    return await db.select().from(csmTickets).where(eq(csmTickets.clientId, clientId));
  }

  async getCsmTicketsByAssigned(assignedTo: string): Promise<CsmTicket[]> {
    return await db.select().from(csmTickets).where(eq(csmTickets.assignedTo, assignedTo));
  }

  async createCsmTicket(insertTicket: InsertCsmTicket): Promise<CsmTicket> {
    const [ticket] = await db.insert(csmTickets).values(insertTicket).returning();
    return ticket;
  }

  async updateCsmTicket(id: string, updates: Partial<CsmTicket>): Promise<CsmTicket> {
    const [ticket] = await db.update(csmTickets).set(updates).where(eq(csmTickets.id, id)).returning();
    return ticket;
  }

  // CSM KPI
  async getCsmKpi(id: string): Promise<CsmKpi | undefined> {
    const [kpi] = await db.select().from(csmKpi).where(eq(csmKpi.id, id));
    return kpi || undefined;
  }

  async getCsmKpiByClient(clientId: string, month?: number, year?: number): Promise<CsmKpi[]> {
    if (month && year) {
      return await db.select().from(csmKpi).where(and(
        eq(csmKpi.clientId, clientId),
        eq(csmKpi.month, month),
        eq(csmKpi.year, year)
      ));
    } else {
      return await db.select().from(csmKpi).where(eq(csmKpi.clientId, clientId));
    }
  }

  async createCsmKpi(insertKpi: InsertCsmKpi): Promise<CsmKpi> {
    const [kpi] = await db.insert(csmKpi).values(insertKpi).returning();
    return kpi;
  }

  async updateCsmKpi(id: string, updates: Partial<CsmKpi>): Promise<CsmKpi> {
    const [kpi] = await db.update(csmKpi).set(updates).where(eq(csmKpi.id, id)).returning();
    return kpi;
  }

  // TSM Tickets
  async getTsmTicket(id: string): Promise<TsmTicket | undefined> {
    const [ticket] = await db.select().from(tsmTickets).where(eq(tsmTickets.id, id));
    return ticket || undefined;
  }

  async getTsmTicketsByClient(clientId: string): Promise<TsmTicket[]> {
    return await db.select().from(tsmTickets).where(eq(tsmTickets.clientId, clientId));
  }

  async getTsmTicketsByAssigned(assignedTo: string): Promise<TsmTicket[]> {
    return await db.select().from(tsmTickets).where(eq(tsmTickets.assignedTo, assignedTo));
  }

  async createTsmTicket(insertTicket: InsertTsmTicket): Promise<TsmTicket> {
    const [ticket] = await db.insert(tsmTickets).values(insertTicket).returning();
    return ticket;
  }

  async updateTsmTicket(id: string, updates: Partial<TsmTicket>): Promise<TsmTicket> {
    const [ticket] = await db.update(tsmTickets).set(updates).where(eq(tsmTickets.id, id)).returning();
    return ticket;
  }

  // Audit Logs
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(insertLog).returning();
    return log;
  }

  async getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return await db.select().from(auditLogs)
      .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
      .orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    return await db.select().from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt));
  }

  // Escalations
  async getEscalation(id: string): Promise<Escalation | undefined> {
    const [escalation] = await db.select().from(escalations).where(eq(escalations.id, id));
    return escalation || undefined;
  }

  async getEscalationsByTicket(ticketId: string, ticketType: string): Promise<Escalation[]> {
    return await db.select().from(escalations)
      .where(and(eq(escalations.ticketId, ticketId), eq(escalations.ticketType, ticketType)));
  }

  async getPendingEscalations(): Promise<Escalation[]> {
    return await db.select().from(escalations).where(eq(escalations.status, "pending"));
  }

  async createEscalation(insertEscalation: InsertEscalation): Promise<Escalation> {
    const [escalation] = await db.insert(escalations).values(insertEscalation).returning();
    return escalation;
  }

  async updateEscalation(id: string, updates: Partial<Escalation>): Promise<Escalation> {
    const [escalation] = await db.update(escalations).set(updates).where(eq(escalations.id, id)).returning();
    return escalation;
  }

  // Notifications
  async getNotification(id: string): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || undefined;
  }

  async getNotificationsByRecipient(recipientId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.recipientId, recipientId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(recipientId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(and(eq(notifications.recipientId, recipientId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification> {
    const [notification] = await db.update(notifications).set(updates).where(eq(notifications.id, id)).returning();
    return notification;
  }

  async markNotificationsAsRead(recipientId: string, notificationIds: string[]): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.recipientId, recipientId),
        sql`${notifications.id} = ANY(${notificationIds})`
      ));
  }
}

export const storage = new DatabaseStorage();
