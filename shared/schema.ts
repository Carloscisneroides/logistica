import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid, integer, decimal, boolean, pgEnum, index } from "drizzle-orm/pg-core";
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
export const platformTypeEnum = pgEnum("platform_type", ["ecommerce", "erp", "crm", "marketplace", "custom"]);
export const platformStatusEnum = pgEnum("platform_status", ["connected", "disconnected", "pending", "error"]);
export const trackingStatusEnum = pgEnum("tracking_status", ["created", "picked_up", "in_transit", "delivered", "failed", "returned"]);
export const returnStatusEnum = pgEnum("return_status", ["requested", "approved", "picked_up", "received", "processed", "refunded"]);
export const storageStatusEnum = pgEnum("storage_status", ["available", "reserved", "shipped", "damaged", "expired"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed", "escalated"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"]);
export const notificationTypeEnum = pgEnum("notification_type", ["email", "sms", "webhook", "push"]);
export const auditActionEnum = pgEnum("audit_action", ["create", "update", "delete", "login", "logout", "access"]);
export const escalationStatusEnum = pgEnum("escalation_status", ["pending", "assigned", "resolved", "cancelled"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "cancelled", "returned"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const productStatusEnum = pgEnum("product_status", ["active", "inactive", "discontinued", "out_of_stock"]);
export const integrationStatusEnum = pgEnum("integration_status", ["active", "inactive", "error", "syncing"]);

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
  parentClientId: uuid("parent_client_id"),
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

// Platform connections table - for client platform integrations
export const platformConnections = pgTable("platform_connections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: platformTypeEnum("type").notNull(),
  status: platformStatusEnum("status").notNull().default("pending"),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"), // TODO: Encrypt this field
  webhookUrl: text("webhook_url"),
  webhookSecret: text("webhook_secret"), // Secret for HMAC verification
  configuration: text("configuration"), // JSON configuration
  lastSync: timestamp("last_sync"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  clientIdIdx: index("platform_connections_client_id_idx").on(table.clientId),
  statusIdx: index("platform_connections_status_idx").on(table.status),
  typeIdx: index("platform_connections_type_idx").on(table.type),
  createdAtIdx: index("platform_connections_created_at_idx").on(table.createdAt),
}));

// Platform webhooks table - for webhook event management
export const platformWebhooks = pgTable("platform_webhooks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  platformConnectionId: uuid("platform_connection_id").references(() => platformConnections.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // tracking, return, storage, etc.
  payload: text("payload").notNull(), // JSON payload - TODO: Consider encryption
  status: text("status").notNull().default("pending"), // pending, sent, failed
  retryCount: integer("retry_count").notNull().default(0),
  lastAttempt: timestamp("last_attempt"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  connectionIdIdx: index("platform_webhooks_connection_id_idx").on(table.platformConnectionId),
  statusIdx: index("platform_webhooks_status_idx").on(table.status),
  createdAtIdx: index("platform_webhooks_created_at_idx").on(table.createdAt),
  eventTypeIdx: index("platform_webhooks_event_type_idx").on(table.eventType),
}));

// Shipment tracking table - for tracking events
export const shipmentTracking = pgTable("shipment_tracking", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  shipmentId: uuid("shipment_id").references(() => shipments.id, { onDelete: "cascade" }),
  status: trackingStatusEnum("status").notNull(),
  location: text("location"),
  description: text("description"),
  courierNote: text("courier_note"),
  timestamp: timestamp("timestamp").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  shipmentIdIdx: index("shipment_tracking_shipment_id_idx").on(table.shipmentId),
  statusIdx: index("shipment_tracking_status_idx").on(table.status),
  timestampIdx: index("shipment_tracking_timestamp_idx").on(table.timestamp),
}));

// Returns table - for return management
export const returns = pgTable("returns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  shipmentId: uuid("shipment_id").references(() => shipments.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  returnNumber: text("return_number").notNull().unique(),
  status: returnStatusEnum("status").notNull().default("requested"),
  reason: text("reason").notNull(),
  description: text("description"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  newShipmentId: uuid("new_shipment_id").references(() => shipments.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  clientIdIdx: index("returns_client_id_idx").on(table.clientId),
  shipmentIdIdx: index("returns_shipment_id_idx").on(table.shipmentId),
  statusIdx: index("returns_status_idx").on(table.status),
  returnNumberIdx: index("returns_return_number_idx").on(table.returnNumber),
}));

// Storage items table - for warehouse/storage management
export const storageItems = pgTable("storage_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  returnId: uuid("return_id").references(() => returns.id),
  itemCode: text("item_code").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  status: storageStatusEnum("status").notNull().default("available"),
  location: text("location"),
  expiryDate: timestamp("expiry_date"),
  value: decimal("value", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  clientIdIdx: index("storage_items_client_id_idx").on(table.clientId),
  statusIdx: index("storage_items_status_idx").on(table.status),
  itemCodeIdx: index("storage_items_item_code_idx").on(table.itemCode),
  expiryDateIdx: index("storage_items_expiry_date_idx").on(table.expiryDate),
}));

// CSM tickets table - for customer success management
export const csmTickets = pgTable("csm_tickets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: text("ticket_number").notNull().unique(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  assignedTo: uuid("assigned_to").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // performance, retention, onboarding, etc.
  status: ticketStatusEnum("status").notNull().default("open"),
  priority: ticketPriorityEnum("priority").notNull().default("medium"),
  dueDate: timestamp("due_date"),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  clientIdIdx: index("csm_tickets_client_id_idx").on(table.clientId),
  assignedToIdx: index("csm_tickets_assigned_to_idx").on(table.assignedTo),
  statusIdx: index("csm_tickets_status_idx").on(table.status),
  priorityIdx: index("csm_tickets_priority_idx").on(table.priority),
  dueDateIdx: index("csm_tickets_due_date_idx").on(table.dueDate),
}));

// CSM KPI table - for customer success metrics
export const csmKpi = pgTable("csm_kpi", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  shipmentsCount: integer("shipments_count").notNull().default(0),
  averageCost: decimal("average_cost", { precision: 10, scale: 2 }).default("0.00"),
  satisfactionScore: decimal("satisfaction_score", { precision: 3, scale: 2 }), // 0-5 scale
  retentionScore: decimal("retention_score", { precision: 5, scale: 2 }), // percentage
  issuesCount: integer("issues_count").notNull().default(0),
  responseTime: integer("response_time"), // average in hours
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// TSM tickets table - for technical support management
export const tsmTickets = pgTable("tsm_tickets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: text("ticket_number").notNull().unique(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  assignedTo: uuid("assigned_to").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // platform, integration, api, etc.
  status: ticketStatusEnum("status").notNull().default("open"),
  priority: ticketPriorityEnum("priority").notNull().default("medium"),
  severity: text("severity").notNull().default("low"), // low, medium, high, critical
  dueDate: timestamp("due_date"),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  escalationLevel: integer("escalation_level").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  clientIdIdx: index("tsm_tickets_client_id_idx").on(table.clientId),
  assignedToIdx: index("tsm_tickets_assigned_to_idx").on(table.assignedTo),
  statusIdx: index("tsm_tickets_status_idx").on(table.status),
  priorityIdx: index("tsm_tickets_priority_idx").on(table.priority),
  severityIdx: index("tsm_tickets_severity_idx").on(table.severity),
  escalationLevelIdx: index("tsm_tickets_escalation_level_idx").on(table.escalationLevel),
}));

// Audit logs table - for system audit trail
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  clientId: uuid("client_id").references(() => clients.id),
  action: auditActionEnum("action").notNull(),
  entityType: text("entity_type").notNull(), // shipment, client, user, etc.
  entityId: uuid("entity_id").notNull(),
  changes: text("changes"), // JSON of changes made
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Escalations table - for automatic escalation management
export const escalations = pgTable("escalations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: uuid("ticket_id"), // Can reference csm or tsm tickets
  ticketType: text("ticket_type").notNull(), // csm, tsm
  currentLevel: integer("current_level").notNull().default(1),
  maxLevel: integer("max_level").notNull().default(3),
  status: escalationStatusEnum("status").notNull().default("pending"),
  rules: text("rules"), // JSON escalation rules
  nextEscalationAt: timestamp("next_escalation_at"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Notifications table - for system notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: uuid("recipient_id").references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  category: text("category").notNull(), // tracking, return, billing, system, etc.
  data: text("data"), // JSON additional data - TODO: Consider encryption for sensitive data
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  recipientIdIdx: index("notifications_recipient_id_idx").on(table.recipientId),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  categoryIdx: index("notifications_category_idx").on(table.category),
  typeIdx: index("notifications_type_idx").on(table.type),
}));

// ======== ECOMMERCE MODULE TABLES ========

// eCommerce Customers (different from B2B clients)
export const ecommerceCustomers = pgTable("ecommerce_customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  birthday: text("birthday"),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  externalCustomerId: text("external_customer_id"), // From marketplace
  marketplaceType: text("marketplace_type"), // shopify, woocommerce, etc
  totalOrders: integer("total_orders").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Products catalog
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  category: text("category"),
  brand: text("brand"),
  weight: decimal("weight", { precision: 8, scale: 2 }), // in kg
  dimensions: text("dimensions"), // LxWxH in cm
  fragility: text("fragility").default("normal"), // normal, fragile, very_fragile
  status: productStatusEnum("status").notNull().default("active"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  externalProductId: text("external_product_id"), // From marketplace
  marketplaceType: text("marketplace_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// eCommerce Orders
export const ecommerceOrders = pgTable("ecommerce_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  customerId: uuid("customer_id").references(() => ecommerceCustomers.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0.00"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  shippingAddress: text("shipping_address").notNull(),
  billingAddress: text("billing_address"),
  courierModuleId: uuid("courier_module_id").references(() => courierModules.id),
  trackingNumber: text("tracking_number"),
  externalOrderId: text("external_order_id"), // From marketplace
  marketplaceType: text("marketplace_type"), // shopify, woocommerce, amazon, ebay
  notes: text("notes"),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => ecommerceOrders.id),
  productId: uuid("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  variantId: text("variant_id"), // For product variants
  variantName: text("variant_name"), // Size, Color, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Marketplace Integrations
export const marketplaceIntegrations = pgTable("marketplace_integrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  name: text("name").notNull(), // "Shopify Store", "Amazon Seller"
  type: text("type").notNull(), // shopify, woocommerce, amazon, ebay
  apiKey: text("api_key"), // Encrypted
  apiSecret: text("api_secret"), // Encrypted  
  storeUrl: text("store_url"),
  webhookUrl: text("webhook_url"),
  status: integrationStatusEnum("status").notNull().default("inactive"),
  lastSyncAt: timestamp("last_sync_at"),
  syncErrors: text("sync_errors"),
  settings: text("settings"), // JSON configuration
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
  platformConnections: many(platformConnections),
  returns: many(returns),
  storageItems: many(storageItems),
  csmTickets: many(csmTickets),
  csmKpi: many(csmKpi),
  tsmTickets: many(tsmTickets),
  auditLogs: many(auditLogs),
  notifications: many(notifications),
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
  tracking: many(shipmentTracking),
  returns: many(returns),
  storageItems: many(storageItems),
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

// New table relations
export const platformConnectionsRelations = relations(platformConnections, ({ one, many }) => ({
  client: one(clients, {
    fields: [platformConnections.clientId],
    references: [clients.id],
  }),
  webhooks: many(platformWebhooks),
}));

export const platformWebhooksRelations = relations(platformWebhooks, ({ one }) => ({
  platformConnection: one(platformConnections, {
    fields: [platformWebhooks.platformConnectionId],
    references: [platformConnections.id],
  }),
}));

export const shipmentTrackingRelations = relations(shipmentTracking, ({ one }) => ({
  shipment: one(shipments, {
    fields: [shipmentTracking.shipmentId],
    references: [shipments.id],
  }),
}));

export const returnsRelations = relations(returns, ({ one, many }) => ({
  client: one(clients, {
    fields: [returns.clientId],
    references: [clients.id],
  }),
  shipment: one(shipments, {
    fields: [returns.shipmentId],
    references: [shipments.id],
  }),
  newShipment: one(shipments, {
    fields: [returns.newShipmentId],
    references: [shipments.id],
  }),
  storageItems: many(storageItems),
}));

export const storageItemsRelations = relations(storageItems, ({ one }) => ({
  client: one(clients, {
    fields: [storageItems.clientId],
    references: [clients.id],
  }),
  shipment: one(shipments, {
    fields: [storageItems.shipmentId],
    references: [shipments.id],
  }),
  return: one(returns, {
    fields: [storageItems.returnId],
    references: [returns.id],
  }),
}));

export const csmTicketsRelations = relations(csmTickets, ({ one }) => ({
  client: one(clients, {
    fields: [csmTickets.clientId],
    references: [clients.id],
  }),
  assignedTo: one(users, {
    fields: [csmTickets.assignedTo],
    references: [users.id],
  }),
}));

export const csmKpiRelations = relations(csmKpi, ({ one }) => ({
  client: one(clients, {
    fields: [csmKpi.clientId],
    references: [clients.id],
  }),
}));

export const tsmTicketsRelations = relations(tsmTickets, ({ one }) => ({
  client: one(clients, {
    fields: [tsmTickets.clientId],
    references: [clients.id],
  }),
  assignedTo: one(users, {
    fields: [tsmTickets.assignedTo],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [auditLogs.clientId],
    references: [clients.id],
  }),
}));

export const escalationsRelations = relations(escalations, ({ one }) => ({
  assignedTo: one(users, {
    fields: [escalations.assignedTo],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [notifications.clientId],
    references: [clients.id],
  }),
}));

// eCommerce Relations
export const ecommerceCustomersRelations = relations(ecommerceCustomers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [ecommerceCustomers.tenantId],
    references: [tenants.id],
  }),
  orders: many(ecommerceOrders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  orderItems: many(orderItems),
}));

export const ecommerceOrdersRelations = relations(ecommerceOrders, ({ one, many }) => ({
  customer: one(ecommerceCustomers, {
    fields: [ecommerceOrders.customerId],
    references: [ecommerceCustomers.id],
  }),
  tenant: one(tenants, {
    fields: [ecommerceOrders.tenantId],
    references: [tenants.id],
  }),
  courierModule: one(courierModules, {
    fields: [ecommerceOrders.courierModuleId],
    references: [courierModules.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(ecommerceOrders, {
    fields: [orderItems.orderId],
    references: [ecommerceOrders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const marketplaceIntegrationsRelations = relations(marketplaceIntegrations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [marketplaceIntegrations.tenantId],
    references: [tenants.id],
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

// Insert schemas for new tables
export const insertPlatformConnectionSchema = createInsertSchema(platformConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformWebhookSchema = createInsertSchema(platformWebhooks).omit({
  id: true,
  createdAt: true,
});

export const insertShipmentTrackingSchema = createInsertSchema(shipmentTracking).omit({
  id: true,
  createdAt: true,
});

export const insertReturnSchema = createInsertSchema(returns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStorageItemSchema = createInsertSchema(storageItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCsmTicketSchema = createInsertSchema(csmTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCsmKpiSchema = createInsertSchema(csmKpi).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTsmTicketSchema = createInsertSchema(tsmTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertEscalationSchema = createInsertSchema(escalations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// eCommerce Insert Schemas
export const insertEcommerceCustomerSchema = createInsertSchema(ecommerceCustomers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEcommerceOrderSchema = createInsertSchema(ecommerceOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceIntegrationSchema = createInsertSchema(marketplaceIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

// Types for new tables
export type PlatformConnection = typeof platformConnections.$inferSelect;
export type InsertPlatformConnection = z.infer<typeof insertPlatformConnectionSchema>;
export type PlatformWebhook = typeof platformWebhooks.$inferSelect;
export type InsertPlatformWebhook = z.infer<typeof insertPlatformWebhookSchema>;
export type ShipmentTracking = typeof shipmentTracking.$inferSelect;
export type InsertShipmentTracking = z.infer<typeof insertShipmentTrackingSchema>;
export type Return = typeof returns.$inferSelect;
export type InsertReturn = z.infer<typeof insertReturnSchema>;
export type StorageItem = typeof storageItems.$inferSelect;
export type InsertStorageItem = z.infer<typeof insertStorageItemSchema>;
export type CsmTicket = typeof csmTickets.$inferSelect;
export type InsertCsmTicket = z.infer<typeof insertCsmTicketSchema>;
export type CsmKpi = typeof csmKpi.$inferSelect;
export type InsertCsmKpi = z.infer<typeof insertCsmKpiSchema>;
export type TsmTicket = typeof tsmTickets.$inferSelect;
export type InsertTsmTicket = z.infer<typeof insertTsmTicketSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type Escalation = typeof escalations.$inferSelect;
export type InsertEscalation = z.infer<typeof insertEscalationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// eCommerce Types
export type EcommerceCustomer = typeof ecommerceCustomers.$inferSelect;
export type InsertEcommerceCustomer = z.infer<typeof insertEcommerceCustomerSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type EcommerceOrder = typeof ecommerceOrders.$inferSelect;
export type InsertEcommerceOrder = z.infer<typeof insertEcommerceOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type MarketplaceIntegration = typeof marketplaceIntegrations.$inferSelect;
export type InsertMarketplaceIntegration = z.infer<typeof insertMarketplaceIntegrationSchema>;
