import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid, integer, decimal, boolean, pgEnum, index, json, unique } from "drizzle-orm/pg-core";
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

// Fidelity Card Enums
export const fidelityCardStatusEnum = pgEnum("fidelity_card_status", ["active", "suspended", "expired", "revoked"]);
export const fidelityOfferTypeEnum = pgEnum("fidelity_offer_type", ["discount", "cashback", "promo", "points"]);
export const fidelityOfferStatusEnum = pgEnum("fidelity_offer_status", ["draft", "active", "paused", "expired", "cancelled"]);
export const fidelityTransactionTypeEnum = pgEnum("fidelity_transaction_type", ["accrue", "redeem", "adjust", "bonus"]);
export const fidelityRedemptionStatusEnum = pgEnum("fidelity_redemption_status", ["pending", "confirmed", "cancelled", "failed"]);
export const fidelityChannelEnum = pgEnum("fidelity_channel", ["pos", "online", "mobile", "qr_scan"]);
export const sponsorFundingModelEnum = pgEnum("sponsor_funding_model", ["performance", "fixed", "hybrid", "revenue_share"]);

// Marketplace Professionisti Digitali Enums
export const professionalCategoryEnum = pgEnum("professional_category", [
  "developer", "web_designer", "social_media_manager", "accountant", 
  "seo_specialist", "copywriter", "graphic_designer", "consultant", "other"
]);
export const projectStatusEnum = pgEnum("project_status", [
  "draft", "published", "bidding", "awarded", "in_progress", 
  "milestone_review", "completed", "disputed", "cancelled"
]);
export const bidStatusEnum = pgEnum("bid_status", ["submitted", "accepted", "rejected", "withdrawn"]);
export const milestoneStatusEnum = pgEnum("milestone_status", ["pending", "submitted", "approved", "rejected", "paid"]);
export const contractStatusEnum = pgEnum("contract_status", ["draft", "active", "completed", "breached", "disputed"]);
export const disputeStatusEnum = pgEnum("dispute_status", ["open", "investigating", "mediated", "resolved", "escalated"]);
export const chatMessageTypeEnum = pgEnum("chat_message_type", ["text", "file", "milestone", "contract", "system"]);
export const commissionTierEnum = pgEnum("commission_tier", ["tier_30", "tier_20", "tier_15", "tier_10", "custom"]);

// Shipments & Logistics Enums
export const shipmentDeliveryStatusEnum = pgEnum("shipment_delivery_status", [
  "pending_pickup", "in_transit", "out_for_delivery", "delivered", "delivery_failed", "returned_to_sender"
]);
export const fraudSeverityEnum = pgEnum("fraud_severity", ["low", "medium", "high", "critical"]);
export const courierAssignmentStatusEnum = pgEnum("courier_assignment_status", [
  "assigned", "accepted", "in_progress", "completed", "cancelled", "reassigned"
]);

// Ecommerce & Subscriptions Enums
export const subscriptionPlanTypeEnum = pgEnum("subscription_plan_type", [
  "merchant_basic", "merchant_premium", "merchant_enterprise",
  "professional_basic", "professional_premium", "professional_verified"
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "expired", "suspended", "trial"]);
export const commissionTypeEnum = pgEnum("commission_type", ["fixed_order", "percentage_project", "subscription_fee", "sponsorship"]);
export const subscriptionFeatureEnum = pgEnum("subscription_feature", [
  "priority_visibility", "ai_tools", "verified_badge", "advanced_analytics", 
  "logistics_integration", "premium_support", "custom_branding", "api_access"
]);
export const orderTypeEnum = pgEnum("order_type", ["physical_product", "digital_service", "subscription_renewal"]);

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
  tenantId: uuid("tenant_id").references(() => tenants.id),
  courierModuleId: uuid("courier_module_id").references(() => courierModules.id),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  dimensions: text("dimensions"),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  status: trackingStatusEnum("status").notNull().default("created"),
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

// ======== MARKETPLACE MODULE TABLES ========

// Marketplace Categories - Gestione categorie marketplace
export const marketplaceCategories = pgTable("marketplace_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  parentId: uuid("parent_id"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketplace Listings - Prodotti/servizi pubblicati nel marketplace
export const marketplaceListings = pgTable("marketplace_listings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 500 }),
  categoryId: uuid("category_id").notNull().references(() => marketplaceCategories.id),
  sellerId: uuid("seller_id").notNull().references(() => users.id),
  sellerTenantId: uuid("seller_tenant_id").notNull().references(() => tenants.id),
  
  // Pricing and availability
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  priceType: varchar("price_type").notNull().default("fixed"), // fixed, variable, quote_only
  minOrderQuantity: integer("min_order_quantity").default(1),
  maxOrderQuantity: integer("max_order_quantity"),
  isAvailable: boolean("is_available").default(true),
  
  // Logistics details
  deliveryTime: varchar("delivery_time", { length: 100 }),
  shippingIncluded: boolean("shipping_included").default(false),
  courierCompatibility: text("courier_compatibility").array(),
  serviceType: varchar("service_type").notNull(), // product, service, software, consultation, transport
  
  // Media and branding
  imageUrls: text("image_urls").array(),
  logoUrl: varchar("logo_url"),
  brandName: varchar("brand_name", { length: 100 }),
  externalWebsiteUrl: varchar("external_website_url"),
  
  // Visibility and protection rules
  visibility: varchar("visibility").notNull().default("private"), // private, tenant_only, category_limited, public
  allowedTenantIds: text("allowed_tenant_ids").array(),
  allowedRoles: text("allowed_roles").array(),
  blockedTenantIds: text("blocked_tenant_ids").array(),
  
  // Status and moderation
  status: varchar("status").notNull().default("draft"), // draft, active, paused, rejected, expired
  moderationNotes: text("moderation_notes"),
  isPromoted: boolean("is_promoted").default(false),
  
  // Metrics
  viewCount: integer("view_count").default(0),
  orderCount: integer("order_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  
  // Timestamps
  publishedAt: timestamp("published_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketplace Visibility Controls - Controllo granulare visibilità
export const marketplaceVisibility = pgTable("marketplace_visibility", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: uuid("listing_id").notNull().references(() => marketplaceListings.id, { onDelete: 'cascade' }),
  targetTenantId: uuid("target_tenant_id").references(() => tenants.id),
  targetUserId: uuid("target_user_id").references(() => users.id),
  targetRole: varchar("target_role"),
  accessType: varchar("access_type").notNull(), // view, purchase, quote_request
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }),
  conditions: json("conditions"), // Condizioni personalizzate come volume, SLA, ecc.
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketplace Orders - Ordini marketplace
export const marketplaceOrders = pgTable("marketplace_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  buyerId: uuid("buyer_id").notNull().references(() => users.id),
  buyerTenantId: uuid("buyer_tenant_id").notNull().references(() => tenants.id),
  sellerId: uuid("seller_id").notNull().references(() => users.id),
  sellerTenantId: uuid("seller_tenant_id").notNull().references(() => tenants.id),
  
  // Order details
  status: varchar("status").notNull().default("pending"), // pending, confirmed, in_progress, shipped, delivered, cancelled, dispute
  orderType: varchar("order_type").notNull(), // purchase, quote_request
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  
  // Fulfillment
  expectedDelivery: timestamp("expected_delivery"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  trackingNumber: varchar("tracking_number"),
  courierService: varchar("courier_service"),
  
  // Communication
  buyerNotes: text("buyer_notes"),
  sellerNotes: text("seller_notes"),
  internalNotes: text("internal_notes"),
  
  // Payment
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, refunded, disputed
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeTransferId: varchar("stripe_transfer_id"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketplace Order Items - Items degli ordini marketplace
export const marketplaceOrderItems = pgTable("marketplace_order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").notNull().references(() => marketplaceOrders.id, { onDelete: 'cascade' }),
  listingId: uuid("listing_id").notNull().references(() => marketplaceListings.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  customizations: json("customizations"), // Personalizzazioni specifiche dell'item
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketplace Reviews - Recensioni e rating
export const marketplaceReviews = pgTable("marketplace_reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").notNull().references(() => marketplaceOrders.id),
  listingId: uuid("listing_id").notNull().references(() => marketplaceListings.id),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id),
  reviewerTenantId: uuid("reviewer_tenant_id").notNull().references(() => tenants.id),
  sellerId: uuid("seller_id").notNull().references(() => users.id),
  
  // Rating and review
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 200 }),
  comment: text("comment"),
  pros: text("pros").array(),
  cons: text("cons").array(),
  
  // Review metadata
  isVerifiedPurchase: boolean("is_verified_purchase").default(true),
  isPublic: boolean("is_public").default(true),
  status: varchar("status").default("active"), // active, hidden, flagged
  helpfulCount: integer("helpful_count").default(0),
  
  // Response from seller
  sellerResponse: text("seller_response"),
  sellerRespondedAt: timestamp("seller_responded_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ======== MARKETPLACE PROFESSIONISTI DIGITALI MODULE ========

// Professional Profiles table
export const professionalProfiles = pgTable("professional_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  category: professionalCategoryEnum("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  fixedRateMin: decimal("fixed_rate_min", { precision: 10, scale: 2 }),
  fixedRateMax: decimal("fixed_rate_max", { precision: 10, scale: 2 }),
  skills: json("skills").$type<string[]>().default([]),
  portfolioItems: json("portfolio_items").$type<Array<{
    title: string;
    description: string;
    imageUrl?: string;
    projectUrl?: string;
    technologies?: string[];
  }>>().default([]),
  languages: json("languages").$type<Array<{language: string; level: string}>>().default([]),
  certifications: json("certifications").$type<Array<{
    name: string;
    issuer: string;
    year: number;
    url?: string;
  }>>().default([]),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  completedProjects: integer("completed_projects").default(0),
  commissionTier: commissionTierEnum("commission_tier").default("tier_30"),
  customCommissionRate: decimal("custom_commission_rate", { precision: 4, scale: 2 }),
  isAvailable: boolean("is_available").default(true),
  isVerified: boolean("is_verified").default(false),
  profileCompleteness: integer("profile_completeness").default(0),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantUserIdx: index("professional_profiles_tenant_user_idx").on(table.tenantId, table.userId),
  categoryIdx: index("professional_profiles_category_idx").on(table.category),
  availableIdx: index("professional_profiles_available_idx").on(table.isAvailable),
}));

// Client Projects table
export const clientProjects = pgTable("client_projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: professionalCategoryEnum("category").notNull(),
  requiredSkills: json("required_skills").$type<string[]>().default([]),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  budgetType: text("budget_type").notNull().default("fixed"), // "fixed", "hourly", "negotiable"
  estimatedHours: integer("estimated_hours"),
  deadline: timestamp("deadline"),
  status: projectStatusEnum("status").default("draft"),
  priority: text("priority").default("medium"), // "low", "medium", "high", "urgent"
  requirements: text("requirements"),
  deliverables: json("deliverables").$type<string[]>().default([]),
  attachments: json("attachments").$type<Array<{
    filename: string;
    url: string;
    size: number;
  }>>().default([]),
  bidsCount: integer("bids_count").default(0),
  viewsCount: integer("views_count").default(0),
  publishedAt: timestamp("published_at"),
  awardedAt: timestamp("awarded_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantClientIdx: index("client_projects_tenant_client_idx").on(table.tenantId, table.clientId),
  categoryIdx: index("client_projects_category_idx").on(table.category),
  statusIdx: index("client_projects_status_idx").on(table.status),
  publishedIdx: index("client_projects_published_idx").on(table.publishedAt),
}));

// Project Bids table
export const projectBids = pgTable("project_bids", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => clientProjects.id).notNull(),
  professionalId: uuid("professional_id").references(() => professionalProfiles.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  proposedAmount: decimal("proposed_amount", { precision: 10, scale: 2 }).notNull(),
  estimatedHours: integer("estimated_hours"),
  proposedDeadline: timestamp("proposed_deadline"),
  coverLetter: text("cover_letter").notNull(),
  milestones: json("milestones").$type<Array<{
    title: string;
    description: string;
    amount: number;
    estimatedDays: number;
  }>>().default([]),
  status: bidStatusEnum("status").default("submitted"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  projectProfessionalIdx: index("project_bids_project_professional_idx").on(table.projectId, table.professionalId),
  tenantIdx: index("project_bids_tenant_idx").on(table.tenantId),
  statusIdx: index("project_bids_status_idx").on(table.status),
  uniqueBid: unique("unique_project_professional_bid").on(table.projectId, table.professionalId),
}));

// Marketplace Contracts table
export const marketplaceContracts = pgTable("marketplace_contracts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => clientProjects.id).notNull(),
  bidId: uuid("bid_id").references(() => projectBids.id).notNull(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  professionalId: uuid("professional_id").references(() => professionalProfiles.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  contractNumber: text("contract_number").notNull().unique(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 4, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: contractStatusEnum("status").default("draft"),
  terms: text("terms").notNull(),
  deliverables: json("deliverables").$type<string[]>().default([]),
  antiDisintermediationClause: text("anti_disintermediation_clause").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeConnectAccountId: text("stripe_connect_account_id"),
  signedByClient: boolean("signed_by_client").default(false),
  signedByProfessional: boolean("signed_by_professional").default(false),
  clientSignedAt: timestamp("client_signed_at"),
  professionalSignedAt: timestamp("professional_signed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("marketplace_contracts_tenant_idx").on(table.tenantId),
  clientIdx: index("marketplace_contracts_client_idx").on(table.clientId),
  professionalIdx: index("marketplace_contracts_professional_idx").on(table.professionalId),
  statusIdx: index("marketplace_contracts_status_idx").on(table.status),
}));

// Project Milestones table
export const projectMilestones = pgTable("project_milestones", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id").references(() => marketplaceContracts.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: milestoneStatusEnum("status").default("pending"),
  deliverables: json("deliverables").$type<string[]>().default([]),
  attachments: json("attachments").$type<Array<{
    filename: string;
    url: string;
    size: number;
  }>>().default([]),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  paidAt: timestamp("paid_at"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  contractIdx: index("project_milestones_contract_idx").on(table.contractId),
  statusIdx: index("project_milestones_status_idx").on(table.status),
  dueDateIdx: index("project_milestones_due_date_idx").on(table.dueDate),
}));

// Marketplace Chat Messages table
export const marketplaceChatMessages = pgTable("marketplace_chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id").references(() => marketplaceContracts.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  messageType: chatMessageTypeEnum("message_type").default("text"),
  content: text("content").notNull(),
  attachments: json("attachments").$type<Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>>().default([]),
  isRead: boolean("is_read").default(false),
  isSystem: boolean("is_system").default(false),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  contractSenderIdx: index("marketplace_chat_contract_sender_idx").on(table.contractId, table.senderId),
  createdAtIdx: index("marketplace_chat_created_at_idx").on(table.createdAt),
  unreadIdx: index("marketplace_chat_unread_idx").on(table.isRead),
}));

// Marketplace Disputes table  
export const marketplaceDisputes = pgTable("marketplace_disputes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id").references(() => marketplaceContracts.id).notNull(),
  initiatorId: uuid("initiator_id").references(() => users.id).notNull(),
  respondentId: uuid("respondent_id").references(() => users.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "payment", "quality", "deadline", "communication", "breach_of_contract"
  status: disputeStatusEnum("status").default("open"),
  priority: text("priority").default("medium"),
  evidence: json("evidence").$type<Array<{
    type: string;
    description: string;
    url?: string;
    attachments?: Array<{filename: string; url: string}>;
  }>>().default([]),
  resolution: text("resolution"),
  mediatorId: uuid("mediator_id").references(() => users.id),
  resolutionAmount: decimal("resolution_amount", { precision: 10, scale: 2 }),
  resolvedAt: timestamp("resolved_at"),
  escalatedAt: timestamp("escalated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  contractIdx: index("marketplace_disputes_contract_idx").on(table.contractId),
  tenantIdx: index("marketplace_disputes_tenant_idx").on(table.tenantId),
  statusIdx: index("marketplace_disputes_status_idx").on(table.status),
}));

// Professional Ratings table
export const professionalRatings = pgTable("professional_ratings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id").references(() => marketplaceContracts.id).notNull(),
  professionalId: uuid("professional_id").references(() => professionalProfiles.id).notNull(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewTitle: text("review_title"),
  reviewText: text("review_text"),
  skillsRating: integer("skills_rating").notNull(),
  communicationRating: integer("communication_rating").notNull(),
  qualityRating: integer("quality_rating").notNull(),
  timelinessRating: integer("timeliness_rating").notNull(),
  isPublic: boolean("is_public").default(true),
  isVerified: boolean("is_verified").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  professionalIdx: index("professional_ratings_professional_idx").on(table.professionalId),
  tenantIdx: index("professional_ratings_tenant_idx").on(table.tenantId),
  ratingIdx: index("professional_ratings_rating_idx").on(table.rating),
  uniqueRating: unique("unique_contract_rating").on(table.contractId),
}));

// Marketplace Commissions table
export const marketplaceCommissions = pgTable("marketplace_commissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id").references(() => marketplaceContracts.id).notNull(),
  professionalId: uuid("professional_id").references(() => professionalProfiles.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  projectAmount: decimal("project_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 4, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  commissionTier: commissionTierEnum("commission_tier").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  paidAt: timestamp("paid_at"),
  stripeTransferId: text("stripe_transfer_id"),
  metadata: json("metadata").$type<{
    category: string;
    isRecurring?: boolean;
    originalRate?: number;
    discountApplied?: number;
  }>().default(sql`'{}'::json`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  professionalIdx: index("marketplace_commissions_professional_idx").on(table.professionalId),
  tenantIdx: index("marketplace_commissions_tenant_idx").on(table.tenantId),
  statusIdx: index("marketplace_commissions_status_idx").on(table.paymentStatus),
  tierIdx: index("marketplace_commissions_tier_idx").on(table.commissionTier),
}));

// Anti-Disintermediation Logs table
export const antiDisintermediationLogs = pgTable("anti_disintermediation_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: uuid("contract_id").references(() => marketplaceContracts.id),
  professionalId: uuid("professional_id").references(() => professionalProfiles.id),
  clientId: uuid("client_id").references(() => clients.id),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  eventType: text("event_type").notNull(), // "external_contact_attempt", "payment_bypass", "contract_breach", "suspicious_activity"
  severity: text("severity").notNull().default("medium"), // "low", "medium", "high", "critical"
  details: text("details").notNull(),
  evidence: json("evidence").$type<{
    ipAddress?: string;
    userAgent?: string;
    chatLogs?: string[];
    emailContent?: string;
    phoneNumbers?: string[];
    externalUrls?: string[];
  }>().default({}),
  actionTaken: text("action_taken"), // "warning_sent", "account_suspended", "contract_terminated", "legal_notice"
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("anti_disintermediation_logs_tenant_idx").on(table.tenantId),
  eventTypeIdx: index("anti_disintermediation_logs_event_type_idx").on(table.eventType),
  severityIdx: index("anti_disintermediation_logs_severity_idx").on(table.severity),
  createdAtIdx: index("anti_disintermediation_logs_created_at_idx").on(table.createdAt),
}));

// ======== MARKETPLACE MODULE TYPES & SCHEMAS ========

// Marketplace Types
export type MarketplaceCategory = typeof marketplaceCategories.$inferSelect;
export type InsertMarketplaceCategory = typeof marketplaceCategories.$inferInsert;

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = typeof marketplaceListings.$inferInsert;

export type MarketplaceVisibility = typeof marketplaceVisibility.$inferSelect;
export type InsertMarketplaceVisibility = typeof marketplaceVisibility.$inferInsert;

export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = typeof marketplaceOrders.$inferInsert;

export type MarketplaceOrderItem = typeof marketplaceOrderItems.$inferSelect;
export type InsertMarketplaceOrderItem = typeof marketplaceOrderItems.$inferInsert;

export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;
export type InsertMarketplaceReview = typeof marketplaceReviews.$inferInsert;

// Marketplace Insert Schemas for Validation (simplified for now)
export const insertMarketplaceCategorySchema = createInsertSchema(marketplaceCategories);
export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings);
export const insertMarketplaceVisibilitySchema = createInsertSchema(marketplaceVisibility);
export const insertMarketplaceOrderSchema = createInsertSchema(marketplaceOrders);
export const insertMarketplaceOrderItemSchema = createInsertSchema(marketplaceOrderItems);
export const insertMarketplaceReviewSchema = createInsertSchema(marketplaceReviews);

// ======== FIDELITY CARD MODULE TABLES ========

// Fidelity Settings - Configurazione per tenant
export const fidelitySettings = pgTable("fidelity_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  isActive: boolean("is_active").default(false),
  defaultSponsor: text("default_sponsor"),
  geoMode: boolean("geo_mode").default(false), // Geolocalizzazione attiva
  branding: json("branding"), // Logo, colori, personalizzazione
  maxCardsPerCustomer: integer("max_cards_per_customer").default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Fidelity Cards - Carte fedeltà digitali
export const fidelityCards = pgTable("fidelity_cards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  customerId: uuid("customer_id").notNull().references(() => ecommerceCustomers.id),
  code: varchar("code", { length: 50 }).notNull(), // Codice univoco carta per tenant
  qrHash: text("qr_hash").notNull().unique(), // Hash per QR code (globally unique)
  status: fidelityCardStatusEnum("status").default("active"),
  sponsorBranding: json("sponsor_branding"), // Branding sponsor specifico
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Tenant-scoped unique constraint for multi-tenant isolation
  uniqueCodePerTenant: unique().on(table.tenantId, table.code),
  // Performance indexes for common queries
  tenantIdIndex: index().on(table.tenantId),
  customerIdIndex: index().on(table.customerId),
  statusIndex: index().on(table.status),
}));

// Fidelity Wallets - Portafogli virtuali per carte
export const fidelityWallets = pgTable("fidelity_wallets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: uuid("card_id").notNull().references(() => fidelityCards.id, { onDelete: 'cascade' }),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  totalAccrued: decimal("total_accrued", { precision: 10, scale: 2 }).default("0.00"),
  totalRedeemed: decimal("total_redeemed", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Fidelity Wallet Transactions - Movimenti portafoglio
export const fidelityWalletTransactions = pgTable("fidelity_wallet_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: uuid("card_id").notNull().references(() => fidelityCards.id),
  walletId: uuid("wallet_id").notNull().references(() => fidelityWallets.id),
  type: fidelityTransactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  referenceType: text("reference_type"), // redemption, campaign, adjustment
  referenceId: uuid("reference_id"), // ID dell'operazione di riferimento
  merchantId: uuid("merchant_id").references(() => clients.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Fidelity Offers - Offerte e promozioni merchant
export const fidelityOffers = pgTable("fidelity_offers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  merchantId: uuid("merchant_id").notNull().references(() => clients.id), // Merchant che offre
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: fidelityOfferTypeEnum("type").notNull(),
  rules: json("rules"), // Regole eligibilità, min spend, ecc.
  discountValue: decimal("discount_value", { precision: 5, scale: 2 }), // % o importo fisso
  cashbackPercent: decimal("cashback_percent", { precision: 5, scale: 2 }),
  pointsValue: integer("points_value"),
  geofence: json("geofence"), // Area geografica validità
  maxRedemptions: integer("max_redemptions"),
  usedRedemptions: integer("used_redemptions").default(0),
  status: fidelityOfferStatusEnum("status").default("draft"),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Fidelity Redemptions - Riscatti effettuati
export const fidelityRedemptions = pgTable("fidelity_redemptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  cardId: uuid("card_id").notNull().references(() => fidelityCards.id),
  offerId: uuid("offer_id").notNull().references(() => fidelityOffers.id),
  merchantClientId: uuid("merchant_client_id").notNull().references(() => clients.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Importo transazione
  discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }).default("0.00"),
  cashbackAmount: decimal("cashback_amount", { precision: 10, scale: 2 }).default("0.00"),
  pointsEarned: integer("points_earned").default(0),
  channel: fidelityChannelEnum("channel").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  status: fidelityRedemptionStatusEnum("status").default("pending"),
  idempotencyKey: varchar("idempotency_key", { length: 100 }).notNull(),
  redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  // Idempotency enforced per tenant for replay protection
  uniqueIdempotencyPerTenant: unique().on(table.tenantId, table.idempotencyKey),
  // Performance indexes for common queries
  tenantIdIndex: index().on(table.tenantId),
  cardIdIndex: index().on(table.cardId),
  offerIdIndex: index().on(table.offerId),
}));

// Sponsors - Sponsor brand per visibilità
export const sponsors = pgTable("sponsors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id), // null = sponsor globale
  brand: varchar("brand", { length: 100 }).notNull(),
  logo: text("logo"), // URL logo sponsor
  website: text("website"),
  assets: json("assets"), // Materiali marketing, colori brand
  fundingModel: sponsorFundingModelEnum("funding_model").default("performance"),
  contractValue: decimal("contract_value", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from").notNull().defaultNow(),
  validTo: timestamp("valid_to"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Promoter Profiles - Profili promoter territoriali
export const promoterProfiles = pgTable("promoter_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  email: text("email").notNull(),
  phone: varchar("phone", { length: 20 }),
  area: json("area"), // Zone geografiche assegnate
  performanceTarget: decimal("performance_target", { precision: 10, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"), // %
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Promoter KPIs - Metriche performance promoter
export const promoterKpis = pgTable("promoter_kpis", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  promoterId: uuid("promoter_id").notNull().references(() => promoterProfiles.id),
  period: varchar("period", { length: 10 }).notNull(), // YYYY-MM format
  onboardedMerchants: integer("onboarded_merchants").default(0),
  cardsDistributed: integer("cards_distributed").default(0),
  activeOffers: integer("active_offers").default(0),
  conversions: integer("conversions").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0.00"),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Fidelity AI Profiles - Profili comportamentali AI
export const fidelityAiProfiles = pgTable("fidelity_ai_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: uuid("card_id").notNull().references(() => fidelityCards.id, { onDelete: 'cascade' }),
  preferences: json("preferences"), // Preferenze dedotte AI
  lastSegments: json("last_segments"), // Ultimi segmenti calcolati
  behaviorScore: decimal("behavior_score", { precision: 5, scale: 2 }).default("0.00"),
  loyaltyScore: decimal("loyalty_score", { precision: 5, scale: 2 }).default("0.00"),
  lastAnalyzedAt: timestamp("last_analyzed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Fidelity AI Logs - Log analisi AI
export const fidelityAiLogs = pgTable("fidelity_ai_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  entity: varchar("entity", { length: 50 }).notNull(), // card, offer, merchant
  entityId: uuid("entity_id").notNull(),
  operation: varchar("operation", { length: 50 }).notNull(), // suggest, analyze, score
  input: json("input"), // Dati input per AI
  output: json("output"), // Risultato AI
  score: decimal("score", { precision: 5, scale: 2 }),
  processingTime: integer("processing_time"), // ms
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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

// Subscription Plans - Ecommerce & Professional Services
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  name: text("name").notNull(), // "Merchant Premium", "Professional Verified"
  type: subscriptionPlanTypeEnum("type").notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annual_price", { precision: 10, scale: 2 }), // Discounted annual rate
  features: json("features").$type<string[]>().default([]), // ["ai_tools", "verified_badge", "priority_visibility"]
  commissionDiscount: decimal("commission_discount", { precision: 5, scale: 2 }).default("0.00"), // % reduction on commissions
  maxListings: integer("max_listings"), // null = unlimited
  maxProjects: integer("max_projects"), // null = unlimited  
  supportLevel: text("support_level").default("standard"), // standard, priority, dedicated
  isActive: boolean("is_active").notNull().default(true),
  trialDays: integer("trial_days").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User Subscriptions - Track active subscriptions
export const userSubscriptions = pgTable("user_subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  planId: uuid("plan_id").references(() => subscriptionPlans.id),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  billingCycle: text("billing_cycle").default("monthly"), // monthly, annual
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  cancelledAt: timestamp("cancelled_at"),
  pausedAt: timestamp("paused_at"),
  resumedAt: timestamp("resumed_at"),
  stripeSubscriptionId: text("stripe_subscription_id"), // For Stripe integration
  autoRenew: boolean("auto_renew").notNull().default(true),
  paymentFailures: integer("payment_failures").default(0),
  lastPaymentDate: timestamp("last_payment_date"),
  nextPaymentDate: timestamp("next_payment_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Unique constraint: one active subscription per user per tenant
  uniqueActiveSubscription: unique().on(table.userId, table.tenantId, table.status),
}));

// Commission Tiers - Different rates for different categories
export const commissionTiers = pgTable("commission_tiers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  name: text("name").notNull(), // "E-commerce Orders", "Developer Projects", "Social Media Services"
  type: commissionTypeEnum("type").notNull(),
  category: text("category"), // "physical_product", "web_development", "social_media", etc.
  percentageRate: decimal("percentage_rate", { precision: 5, scale: 2 }), // For percentage commissions (15.00 = 15%)
  fixedAmount: decimal("fixed_amount", { precision: 10, scale: 2 }), // For fixed commissions (€0.15 per order)
  minimumAmount: decimal("minimum_amount", { precision: 10, scale: 2 }).default("0.00"),
  maximumAmount: decimal("maximum_amount", { precision: 10, scale: 2 }), // null = no cap
  recurringBonus: decimal("recurring_bonus", { precision: 5, scale: 2 }).default("0.00"), // Extra % for repeat customers
  subscriptionDiscount: boolean("subscription_discount").default(false), // Reduced rate for subscribers
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  effectiveFrom: timestamp("effective_from").notNull().defaultNow(),
  effectiveTo: timestamp("effective_to"), // null = no expiry
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Order Commissions - Track all commission calculations
export const orderCommissions = pgTable("order_commissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: uuid("user_id").references(() => users.id), // User who generated the commission
  orderId: uuid("order_id"), // Can reference ecommerceOrders OR marketplace contracts
  orderType: orderTypeEnum("order_type").notNull(),
  commissionTierId: uuid("commission_tier_id").references(() => commissionTiers.id),
  orderAmount: decimal("order_amount", { precision: 10, scale: 2 }).notNull(), // Original order/project value
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }), // Rate applied (can be discounted)
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(), // Final commission charged
  isRecurring: boolean("is_recurring").default(false), // For recurring customers/projects
  subscriptionDiscount: decimal("subscription_discount", { precision: 5, scale: 2 }).default("0.00"), // Discount applied
  payoutStatus: text("payout_status").default("pending"), // pending, processed, failed
  payoutDate: timestamp("payout_date"),
  payoutReference: text("payout_reference"), // Stripe transfer ID, etc.
  notes: text("notes"),
  metadata: json("metadata"), // Additional data for AI analysis
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Indexes for analytics queries
  orderTypeIdx: index().on(table.orderType),
  userIdIdx: index().on(table.userId),
  payoutStatusIdx: index().on(table.payoutStatus),
  createdAtIdx: index().on(table.createdAt),
}));

// Fraud Flags table - Antifraud integration for shipments
export const fraudFlags = pgTable("fraud_flags", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  flagType: text("flag_type").notNull(), // anomaly_detection, pattern_suspicious, ai_analysis, manual_review
  severity: fraudSeverityEnum("severity").notNull(),
  description: text("description").notNull(),
  evidence: json("evidence"), // GPS coordinates, timing anomalies, etc.
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }), // 0-100 AI confidence score
  flaggedBy: uuid("flagged_by").references(() => users.id), // User who flagged (if manual)
  investigationStatus: text("investigation_status").notNull().default("pending"), // pending, investigating, resolved, false_positive
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: uuid("resolved_by").references(() => users.id),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => ({
  tenantIdIdx: index("fraud_flags_tenant_id_idx").on(table.tenantId),
  shipmentIdIdx: index("fraud_flags_shipment_id_idx").on(table.shipmentId),
  severityIdx: index("fraud_flags_severity_idx").on(table.severity),
  statusIdx: index("fraud_flags_status_idx").on(table.investigationStatus),
}));

// Courier Assignments table - Enhanced courier management
export const courierAssignments = pgTable("courier_assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  shipmentId: uuid("shipment_id").references(() => shipments.id, { onDelete: "cascade" }),
  courierId: uuid("courier_id").references(() => users.id), // Reference to courier user
  courierModuleId: uuid("courier_module_id").references(() => courierModules.id),
  status: courierAssignmentStatusEnum("status").notNull().default("assigned"),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  gpsCoordinates: json("gps_coordinates"), // Real-time GPS tracking data
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  deliveryProof: text("delivery_proof"), // Photo, signature, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => ({
  tenantIdIdx: index("courier_assignments_tenant_id_idx").on(table.tenantId),
  shipmentIdIdx: index("courier_assignments_shipment_id_idx").on(table.shipmentId),
  courierIdIdx: index("courier_assignments_courier_id_idx").on(table.courierId),
  statusIdx: index("courier_assignments_status_idx").on(table.status),
}));

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
  tenant: one(tenants, {
    fields: [shipments.tenantId],
    references: [tenants.id],
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
  fraudFlags: many(fraudFlags),
  courierAssignments: many(courierAssignments),
  deliveryStatuses: many(deliveryStatus),
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

// Fidelity Card Relations
export const fidelitySettingsRelations = relations(fidelitySettings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [fidelitySettings.tenantId],
    references: [tenants.id],
  }),
}));

export const fidelityCardsRelations = relations(fidelityCards, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [fidelityCards.tenantId],
    references: [tenants.id],
  }),
  customer: one(ecommerceCustomers, {
    fields: [fidelityCards.customerId],
    references: [ecommerceCustomers.id],
  }),
  wallet: one(fidelityWallets),
  transactions: many(fidelityWalletTransactions),
  redemptions: many(fidelityRedemptions),
  aiProfile: one(fidelityAiProfiles),
}));

export const fidelityWalletsRelations = relations(fidelityWallets, ({ one, many }) => ({
  card: one(fidelityCards, {
    fields: [fidelityWallets.cardId],
    references: [fidelityCards.id],
  }),
  transactions: many(fidelityWalletTransactions),
}));

export const fidelityWalletTransactionsRelations = relations(fidelityWalletTransactions, ({ one }) => ({
  card: one(fidelityCards, {
    fields: [fidelityWalletTransactions.cardId],
    references: [fidelityCards.id],
  }),
  wallet: one(fidelityWallets, {
    fields: [fidelityWalletTransactions.walletId],
    references: [fidelityWallets.id],
  }),
  merchant: one(clients, {
    fields: [fidelityWalletTransactions.merchantId],
    references: [clients.id],
  }),
}));

export const fidelityOffersRelations = relations(fidelityOffers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [fidelityOffers.tenantId],
    references: [tenants.id],
  }),
  merchant: one(clients, {
    fields: [fidelityOffers.merchantId],
    references: [clients.id],
  }),
  redemptions: many(fidelityRedemptions),
}));

export const fidelityRedemptionsRelations = relations(fidelityRedemptions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [fidelityRedemptions.tenantId],
    references: [tenants.id],
  }),
  card: one(fidelityCards, {
    fields: [fidelityRedemptions.cardId],
    references: [fidelityCards.id],
  }),
  offer: one(fidelityOffers, {
    fields: [fidelityRedemptions.offerId],
    references: [fidelityOffers.id],
  }),
  merchant: one(clients, {
    fields: [fidelityRedemptions.merchantClientId],
    references: [clients.id],
  }),
}));

export const sponsorsRelations = relations(sponsors, ({ one }) => ({
  tenant: one(tenants, {
    fields: [sponsors.tenantId],
    references: [tenants.id],
  }),
}));

export const promoterProfilesRelations = relations(promoterProfiles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [promoterProfiles.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [promoterProfiles.userId],
    references: [users.id],
  }),
  kpis: many(promoterKpis),
}));

export const promoterKpisRelations = relations(promoterKpis, ({ one }) => ({
  promoter: one(promoterProfiles, {
    fields: [promoterKpis.promoterId],
    references: [promoterProfiles.id],
  }),
}));

export const fidelityAiProfilesRelations = relations(fidelityAiProfiles, ({ one }) => ({
  card: one(fidelityCards, {
    fields: [fidelityAiProfiles.cardId],
    references: [fidelityCards.id],
  }),
}));

export const fidelityAiLogsRelations = relations(fidelityAiLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [fidelityAiLogs.tenantId],
    references: [tenants.id],
  }),
}));

// Delivery Status table - Track delivery outcomes and statuses
export const deliveryStatus = pgTable("delivery_status", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  shipmentId: uuid("shipment_id").references(() => shipments.id, { onDelete: "cascade" }),
  courierAssignmentId: uuid("courier_assignment_id").references(() => courierAssignments.id),
  status: shipmentDeliveryStatusEnum("status").notNull().default("pending_pickup"),
  attemptNumber: integer("attempt_number").notNull().default(1),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  failureReason: text("failure_reason"), // customer_not_home, address_incorrect, refused, etc.
  deliveryNotes: text("delivery_notes"),
  recipientName: text("recipient_name"),
  signatureData: text("signature_data"), // Base64 encoded signature
  photoEvidence: text("photo_evidence"), // Photo URL/path
  gpsLocation: json("gps_location"), // Delivery GPS coordinates
  nextAttemptScheduled: timestamp("next_attempt_scheduled"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => ({
  tenantIdIdx: index("delivery_status_tenant_id_idx").on(table.tenantId),
  shipmentIdIdx: index("delivery_status_shipment_id_idx").on(table.shipmentId),
  statusIdx: index("delivery_status_status_idx").on(table.status),
  attemptedAtIdx: index("delivery_status_attempted_at_idx").on(table.attemptedAt),
}));

// Relations for new Shipments module tables
export const fraudFlagsRelations = relations(fraudFlags, ({ one }) => ({
  tenant: one(tenants, {
    fields: [fraudFlags.tenantId],
    references: [tenants.id],
  }),
  shipment: one(shipments, {
    fields: [fraudFlags.shipmentId],
    references: [shipments.id],
  }),
  flaggedByUser: one(users, {
    fields: [fraudFlags.flaggedBy],
    references: [users.id],
  }),
  resolvedByUser: one(users, {
    fields: [fraudFlags.resolvedBy],
    references: [users.id],
  }),
}));

export const courierAssignmentsRelations = relations(courierAssignments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [courierAssignments.tenantId],
    references: [tenants.id],
  }),
  shipment: one(shipments, {
    fields: [courierAssignments.shipmentId],
    references: [shipments.id],
  }),
  courier: one(users, {
    fields: [courierAssignments.courierId],
    references: [users.id],
  }),
  courierModule: one(courierModules, {
    fields: [courierAssignments.courierModuleId],
    references: [courierModules.id],
  }),
}));

export const deliveryStatusRelations = relations(deliveryStatus, ({ one }) => ({
  tenant: one(tenants, {
    fields: [deliveryStatus.tenantId],
    references: [tenants.id],
  }),
  shipment: one(shipments, {
    fields: [deliveryStatus.shipmentId],
    references: [shipments.id],
  }),
  courierAssignment: one(courierAssignments, {
    fields: [deliveryStatus.courierAssignmentId],
    references: [courierAssignments.id],
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

// Marketplace Professionisti Digitali Insert Schemas
export const insertProfessionalProfileSchema = createInsertSchema(professionalProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientProjectSchema = createInsertSchema(clientProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectBidSchema = createInsertSchema(projectBids).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceContractSchema = createInsertSchema(marketplaceContracts).omit({
  id: true,
  contractNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectMilestoneSchema = createInsertSchema(projectMilestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceChatMessageSchema = createInsertSchema(marketplaceChatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceDisputeSchema = createInsertSchema(marketplaceDisputes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfessionalRatingSchema = createInsertSchema(professionalRatings).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceCommissionSchema = createInsertSchema(marketplaceCommissions).omit({
  id: true,
  createdAt: true,
});

export const insertAntiDisintermediationLogSchema = createInsertSchema(antiDisintermediationLogs).omit({
  id: true,
  createdAt: true,
});

// Ecommerce & Subscriptions Insert Schemas
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommissionTierSchema = createInsertSchema(commissionTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderCommissionSchema = createInsertSchema(orderCommissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Fidelity Card Insert Schemas
export const insertFidelitySettingsSchema = createInsertSchema(fidelitySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFidelityCardSchema = createInsertSchema(fidelityCards).omit({
  id: true,
  issuedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFidelityWalletSchema = createInsertSchema(fidelityWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFidelityWalletTransactionSchema = createInsertSchema(fidelityWalletTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertFidelityOfferSchema = createInsertSchema(fidelityOffers).omit({
  id: true,
  usedRedemptions: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFidelityRedemptionSchema = createInsertSchema(fidelityRedemptions).omit({
  id: true,
  redeemedAt: true,
  createdAt: true,
});

export const insertSponsorSchema = createInsertSchema(sponsors).omit({
  id: true,
  validFrom: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromoterProfileSchema = createInsertSchema(promoterProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromoterKpiSchema = createInsertSchema(promoterKpis).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFidelityAiProfileSchema = createInsertSchema(fidelityAiProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFidelityAiLogSchema = createInsertSchema(fidelityAiLogs).omit({
  id: true,
  createdAt: true,
});

// Insert schemas for Shipments module tables
export const insertFraudFlagSchema = createInsertSchema(fraudFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourierAssignmentSchema = createInsertSchema(courierAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeliveryStatusSchema = createInsertSchema(deliveryStatus).omit({
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

// Fidelity Card Types
export type FidelitySettings = typeof fidelitySettings.$inferSelect;
export type InsertFidelitySettings = z.infer<typeof insertFidelitySettingsSchema>;
export type FidelityCard = typeof fidelityCards.$inferSelect;
export type InsertFidelityCard = z.infer<typeof insertFidelityCardSchema>;
export type FidelityWallet = typeof fidelityWallets.$inferSelect;
export type InsertFidelityWallet = z.infer<typeof insertFidelityWalletSchema>;
export type FidelityWalletTransaction = typeof fidelityWalletTransactions.$inferSelect;
export type InsertFidelityWalletTransaction = z.infer<typeof insertFidelityWalletTransactionSchema>;
export type FidelityOffer = typeof fidelityOffers.$inferSelect;
export type InsertFidelityOffer = z.infer<typeof insertFidelityOfferSchema>;
export type FidelityRedemption = typeof fidelityRedemptions.$inferSelect;
export type InsertFidelityRedemption = z.infer<typeof insertFidelityRedemptionSchema>;
export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type PromoterProfile = typeof promoterProfiles.$inferSelect;
export type InsertPromoterProfile = z.infer<typeof insertPromoterProfileSchema>;
export type PromoterKpi = typeof promoterKpis.$inferSelect;
export type InsertPromoterKpi = z.infer<typeof insertPromoterKpiSchema>;
export type FidelityAiProfile = typeof fidelityAiProfiles.$inferSelect;
export type InsertFidelityAiProfile = z.infer<typeof insertFidelityAiProfileSchema>;
export type FidelityAiLog = typeof fidelityAiLogs.$inferSelect;
export type InsertFidelityAiLog = z.infer<typeof insertFidelityAiLogSchema>;

// Marketplace Professionisti Digitali Types
export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type InsertProfessionalProfile = z.infer<typeof insertProfessionalProfileSchema>;
export type ClientProject = typeof clientProjects.$inferSelect;
export type InsertClientProject = z.infer<typeof insertClientProjectSchema>;
export type ProjectBid = typeof projectBids.$inferSelect;
export type InsertProjectBid = z.infer<typeof insertProjectBidSchema>;
export type MarketplaceContract = typeof marketplaceContracts.$inferSelect;
export type InsertMarketplaceContract = z.infer<typeof insertMarketplaceContractSchema>;
export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;
export type MarketplaceChatMessage = typeof marketplaceChatMessages.$inferSelect;
export type InsertMarketplaceChatMessage = z.infer<typeof insertMarketplaceChatMessageSchema>;
export type MarketplaceDispute = typeof marketplaceDisputes.$inferSelect;
export type InsertMarketplaceDispute = z.infer<typeof insertMarketplaceDisputeSchema>;
export type ProfessionalRating = typeof professionalRatings.$inferSelect;
export type InsertProfessionalRating = z.infer<typeof insertProfessionalRatingSchema>;
export type MarketplaceCommission = typeof marketplaceCommissions.$inferSelect;
export type InsertMarketplaceCommission = z.infer<typeof insertMarketplaceCommissionSchema>;
export type AntiDisintermediationLog = typeof antiDisintermediationLogs.$inferSelect;
export type InsertAntiDisintermediationLog = z.infer<typeof insertAntiDisintermediationLogSchema>;

// Ecommerce & Subscriptions Types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type CommissionTier = typeof commissionTiers.$inferSelect;
export type InsertCommissionTier = z.infer<typeof insertCommissionTierSchema>;
export type OrderCommission = typeof orderCommissions.$inferSelect;
export type InsertOrderCommission = z.infer<typeof insertOrderCommissionSchema>;

// Shipments module types
export type FraudFlag = typeof fraudFlags.$inferSelect;
export type InsertFraudFlag = z.infer<typeof insertFraudFlagSchema>;
export type CourierAssignment = typeof courierAssignments.$inferSelect;
export type InsertCourierAssignment = z.infer<typeof insertCourierAssignmentSchema>;
export type DeliveryStatus = typeof deliveryStatus.$inferSelect;
export type InsertDeliveryStatus = z.infer<typeof insertDeliveryStatusSchema>;
