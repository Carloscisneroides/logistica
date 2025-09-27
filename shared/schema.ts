import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid, integer, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "merchant", "sub_client", "commercial"]);
export const tenantTypeEnum = pgEnum("tenant_type", ["enterprise", "standard", "basic"]);
export const moduleStatusEnum = pgEnum("module_status", ["active", "inactive", "pending", "validation"]);
export const billingModeEnum = pgEnum("billing_mode", ["prepaid", "postpaid"]);
export const billingFrequencyEnum = pgEnum("billing_frequency", ["daily", "weekly", "biweekly", "monthly"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "sent", "paid", "overdue", "cancelled"]);
export const correctionStatusEnum = pgEnum("correction_status", ["pending", "processed", "error"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("merchant"),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  stripeCustomerId: text("stripe_customer_id"),
  stripeAccountId: text("stripe_account_id"), // For Stripe Connect
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tenants table
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: tenantTypeEnum("type").notNull().default("standard"),
  domain: text("domain"),
  logo: text("logo"),
  primaryColor: text("primary_color").default("#003366"),
  secondaryColor: text("secondary_color").default("#2C2C2C"),
  accentColor: text("accent_color").default("#C8B560"),
  language: text("language").notNull().default("it"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Courier modules table
export const courierModules = pgTable("courier_modules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  apiEndpoint: text("api_endpoint"),
  contractCode: text("contract_code"),
  status: moduleStatusEnum("status").notNull().default("inactive"),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Clients table
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  type: text("type").notNull(), // merchant, platform, sub_client
  tenantId: uuid("tenant_id").references(() => tenants.id),
  parentClientId: uuid("parent_client_id").references(() => clients.id),
  commercialId: uuid("commercial_id").references(() => users.id),
  billingMode: billingModeEnum("billing_mode").notNull().default("postpaid"),
  billingFrequency: billingFrequencyEnum("billing_frequency").notNull().default("monthly"),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).default("0.00"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("1000.00"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Shipments table
export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingNumber: text("tracking_number").notNull().unique(),
  clientId: uuid("client_id").references(() => clients.id),
  courierModuleId: uuid("courier_module_id").references(() => courierModules.id),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  dimensions: text("dimensions"),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("created"),
  aiSelected: boolean("ai_selected").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  clientId: uuid("client_id").references(() => clients.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  stripeInvoiceId: text("stripe_invoice_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Corrections and supplements table
export const corrections = pgTable("corrections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  trackingNumber: text("tracking_number"),
  type: text("type").notNull(), // supplement, correction, penalty
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  status: correctionStatusEnum("status").notNull().default("pending"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Commercial commissions table
export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  commercialId: uuid("commercial_id").references(() => users.id),
  clientId: uuid("client_id").references(() => clients.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI routing logs table
export const aiRoutingLogs = pgTable("ai_routing_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  selectedCourierModuleId: uuid("selected_courier_module_id").references(() => courierModules.id),
  alternativeCouriers: text("alternative_couriers"), // JSON array
  savings: decimal("savings", { precision: 10, scale: 2 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  clients: many(clients),
  commissions: many(commissions),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  courierModules: many(courierModules),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [clients.tenantId],
    references: [tenants.id],
  }),
  commercial: one(users, {
    fields: [clients.commercialId],
    references: [users.id],
  }),
  parentClient: one(clients, {
    fields: [clients.parentClientId],
    references: [clients.id],
  }),
  subClients: many(clients),
  shipments: many(shipments),
  invoices: many(invoices),
  corrections: many(corrections),
  commissions: many(commissions),
}));

export const courierModulesRelations = relations(courierModules, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [courierModules.tenantId],
    references: [tenants.id],
  }),
  shipments: many(shipments),
  aiRoutingLogs: many(aiRoutingLogs),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
  client: one(clients, {
    fields: [shipments.clientId],
    references: [clients.id],
  }),
  courierModule: one(courierModules, {
    fields: [shipments.courierModuleId],
    references: [courierModules.id],
  }),
  corrections: many(corrections),
  aiRoutingLogs: many(aiRoutingLogs),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  commissions: many(commissions),
}));

export const correctionsRelations = relations(corrections, ({ one }) => ({
  client: one(clients, {
    fields: [corrections.clientId],
    references: [clients.id],
  }),
  shipment: one(shipments, {
    fields: [corrections.shipmentId],
    references: [shipments.id],
  }),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  commercial: one(users, {
    fields: [commissions.commercialId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [commissions.clientId],
    references: [clients.id],
  }),
  invoice: one(invoices, {
    fields: [commissions.invoiceId],
    references: [invoices.id],
  }),
}));

export const aiRoutingLogsRelations = relations(aiRoutingLogs, ({ one }) => ({
  shipment: one(shipments, {
    fields: [aiRoutingLogs.shipmentId],
    references: [shipments.id],
  }),
  selectedCourierModule: one(courierModules, {
    fields: [aiRoutingLogs.selectedCourierModuleId],
    references: [courierModules.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourierModuleSchema = createInsertSchema(courierModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCorrectionSchema = createInsertSchema(corrections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiRoutingLogSchema = createInsertSchema(aiRoutingLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type CourierModule = typeof courierModules.$inferSelect;
export type InsertCourierModule = z.infer<typeof insertCourierModuleSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Correction = typeof corrections.$inferSelect;
export type InsertCorrection = z.infer<typeof insertCorrectionSchema>;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type AiRoutingLog = typeof aiRoutingLogs.$inferSelect;
export type InsertAiRoutingLog = z.infer<typeof insertAiRoutingLogSchema>;
