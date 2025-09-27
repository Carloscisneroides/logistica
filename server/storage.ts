import { 
  users, clients, tenants, courierModules, shipments, invoices, corrections, commissions, aiRoutingLogs,
  type User, type InsertUser, type Client, type InsertClient, type Tenant, type InsertTenant,
  type CourierModule, type InsertCourierModule, type Shipment, type InsertShipment,
  type Invoice, type InsertInvoice, type Correction, type InsertCorrection,
  type Commission, type InsertCommission, type AiRoutingLog, type InsertAiRoutingLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
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
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

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
    return await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(
        eq(clients.tenantId, tenantId),
        eq(invoices.status, "sent")
      ));
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
    return await db
      .select()
      .from(corrections)
      .leftJoin(clients, eq(corrections.clientId, clients.id))
      .where(and(
        eq(clients.tenantId, tenantId),
        eq(corrections.status, "pending")
      ));
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
    let query = db.select().from(commissions).where(eq(commissions.commercialId, commercialId));
    
    if (month && year) {
      query = query.where(and(
        eq(commissions.commercialId, commercialId),
        eq(commissions.month, month),
        eq(commissions.year, year)
      ));
    }
    
    return await query;
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
}

export const storage = new DatabaseStorage();
