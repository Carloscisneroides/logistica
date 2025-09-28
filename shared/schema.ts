import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid, integer, decimal, boolean, pgEnum, index, json, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["system_creator", "admin", "staff", "client", "commerciale", "merchant"]);
export const clientTypeEnum = pgEnum("client_type", ["marketplace", "logistica"]);
export const subRoleEnum = pgEnum("sub_role", ["agente", "responsabile"]);
export const livelloEnum = pgEnum("livello", ["base", "medium", "premium"]);
export const gradoEnum = pgEnum("grado", ["1", "2", "3"]);
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

// AI Antifraud Pattern Detection Enums - Milestone 2
export const riskPatternTypeEnum = pgEnum("risk_pattern_type", [
  "velocity_anomaly", "behavioral_deviation", "temporal_suspicious", "cross_module_correlation", 
  "location_inconsistency", "payment_anomaly", "communication_bypass", "bulk_operations"
]);
export const riskClusterStatusEnum = pgEnum("risk_cluster_status", ["active", "investigating", "resolved", "false_positive"]);
export const patternConfidenceEnum = pgEnum("pattern_confidence", ["low", "medium", "high", "critical"]);

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

// Global Logistics Enums  
export const assetTypeEnum = pgEnum("asset_type", ["vessel", "aircraft"]);
export const assetStatusEnum = pgEnum("asset_status", ["active", "maintenance", "retired", "available"]);
export const containerTypeEnum = pgEnum("container_type", ["dry", "reefer", "tank", "flat_rack", "open_top"]);
export const containerStatusEnum = pgEnum("container_status", ["available", "in_transit", "loading", "unloading", "maintenance"]);
export const customsStatusEnum = pgEnum("customs_status", ["pending", "processing", "approved", "rejected", "requires_review"]);
export const transportModeEnum = pgEnum("transport_mode", ["air", "sea", "rail", "road", "multimodal"]);
export const legStatusEnum = pgEnum("leg_status", ["planned", "in_progress", "completed", "delayed", "cancelled"]);
export const partnerTypeEnum = pgEnum("partner_type", ["carrier", "forwarder", "customs_broker", "warehouse", "technology"]);

// White-Label Multi-Tenant Enums
export const clientBrandingStatusEnum = pgEnum("client_branding_status", ["active", "pending", "suspended", "archived"]);
export const subClientStatusEnum = pgEnum("sub_client_status", ["pending_approval", "active", "suspended", "archived"]);
export const domainStatusEnum = pgEnum("domain_status", ["pending", "active", "ssl_pending", "ssl_active", "suspended"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["basic", "premium", "enterprise", "custom"]);
export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "quarterly", "annually"]);
export const paymentMethodEnum = pgEnum("payment_method", ["stripe", "bonifico", "credito_virtuale", "fidelity_card"]);

// Registration requests - Sistema approvazione manuale
export const registrationRequests = pgTable("registration_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(), // Hashed password
  role: userRoleEnum("role").notNull().default("merchant"),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  companyName: text("company_name"),
  phoneNumber: text("phone_number"),
  businessType: text("business_type"),
  message: text("message"), // Messaggio del richiedente
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("merchant"),
  clientType: clientTypeEnum("client_type"), // Solo per role='client'
  subRole: subRoleEnum("sub_role"), // Solo per role='commerciale'
  livello: livelloEnum("livello"), // Solo per agenti
  grado: gradoEnum("grado"), // Solo per agenti
  percentuale: integer("percentuale"), // Performance percentuale agenti
  aiSupport: boolean("ai_support").default(true), // Supporto AI abilitato
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

// Risk Clusters table - AI Antifraud Milestone 2: Pattern Detection
export const riskClusters = pgTable("risk_clusters", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  clusterName: text("cluster_name").notNull(),
  description: text("description"),
  patternType: riskPatternTypeEnum("pattern_type").notNull(),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }).notNull(), // 0-100
  confidence: patternConfidenceEnum("confidence").notNull(),
  status: riskClusterStatusEnum("status").notNull().default("active"),
  
  // Pattern detection rules and thresholds
  detectionRules: json("detection_rules").$type<{
    velocityThreshold?: number;
    timeWindow?: number; // minutes
    actionCount?: number;
    ipVariation?: boolean;
    crossModuleFlags?: string[];
    behavioralMetrics?: Record<string, any>;
  }>().default({}),
  
  // Cluster statistics
  affectedUsers: integer("affected_users").default(0),
  totalIncidents: integer("total_incidents").default(0),
  falsePositives: integer("false_positives").default(0),
  
  // Temporal analysis
  firstDetected: timestamp("first_detected").notNull().defaultNow(),
  lastOccurrence: timestamp("last_occurrence"),
  averageInterval: integer("average_interval"), // minutes between occurrences
  
  // AI Enhancement
  aiAnalysis: json("ai_analysis").$type<{
    patterns?: string[];
    correlations?: string[];
    predictions?: string[];
    recommendations?: string[];
  }>().default({}),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => ({
  tenantIdIdx: index("risk_clusters_tenant_id_idx").on(table.tenantId),
  patternTypeIdx: index("risk_clusters_pattern_type_idx").on(table.patternType),
  statusIdx: index("risk_clusters_status_idx").on(table.status),
  riskScoreIdx: index("risk_clusters_risk_score_idx").on(table.riskScore),
  firstDetectedIdx: index("risk_clusters_first_detected_idx").on(table.firstDetected),
}));

// Pattern Flags table - Individual pattern instances
export const patternFlags = pgTable("pattern_flags", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  clusterId: uuid("cluster_id").references(() => riskClusters.id),
  userId: uuid("user_id").references(() => users.id),
  
  // Pattern identification
  patternType: riskPatternTypeEnum("pattern_type").notNull(),
  severity: fraudSeverityEnum("severity").notNull(),
  confidence: patternConfidenceEnum("confidence").notNull(),
  
  // Context and evidence
  moduleSource: text("module_source").notNull(), // marketplace, fidelity, shipments, services
  eventType: text("event_type").notNull(), // order_created, cashback_claimed, shipment_flagged, etc.
  entityId: uuid("entity_id"), // ID of the related entity (order, shipment, etc.)
  
  // Detection details
  triggerData: json("trigger_data").$type<{
    ipAddress?: string;
    userAgent?: string;
    actionVelocity?: number;
    anomalyScore?: number;
    correlatedEvents?: string[];
    locationData?: Record<string, any>;
    timingData?: Record<string, any>;
  }>().notNull().default({}),
  
  // Pattern metrics
  deviationScore: decimal("deviation_score", { precision: 5, scale: 2 }), // How much this deviates from normal
  riskContribution: decimal("risk_contribution", { precision: 5, scale: 2 }), // Contribution to overall user risk
  
  // Investigation and resolution
  investigationStatus: text("investigation_status").notNull().default("pending"), // pending, investigating, resolved, false_positive
  investigatedBy: uuid("investigated_by").references(() => users.id),
  resolutionNotes: text("resolution_notes"),
  automatedAction: text("automated_action"), // action_taken by automated response
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
}, table => ({
  tenantIdIdx: index("pattern_flags_tenant_id_idx").on(table.tenantId),
  userIdIdx: index("pattern_flags_user_id_idx").on(table.userId),
  clusterIdIdx: index("pattern_flags_cluster_id_idx").on(table.clusterId),
  patternTypeIdx: index("pattern_flags_pattern_type_idx").on(table.patternType),
  moduleSourceIdx: index("pattern_flags_module_source_idx").on(table.moduleSource),
  statusIdx: index("pattern_flags_status_idx").on(table.investigationStatus),
  createdAtIdx: index("pattern_flags_created_at_idx").on(table.createdAt),
}));

// Risk Clusters & Pattern Flags Types and Insert Schemas - Milestone 2
export type RiskCluster = typeof riskClusters.$inferSelect;
export type InsertRiskCluster = typeof riskClusters.$inferInsert;

export type PatternFlag = typeof patternFlags.$inferSelect;
export type InsertPatternFlag = typeof patternFlags.$inferInsert;

export const insertRiskClusterSchema = createInsertSchema(riskClusters);
export const insertPatternFlagSchema = createInsertSchema(patternFlags);

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

// ======== GLOBAL LOGISTICS MODULE TABLES ========

// Assets - Flotte Marittime/Aeree (IMO, AIS, IATA integration)
export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  type: assetTypeEnum("type").notNull(),
  status: assetStatusEnum("status").notNull().default("available"),
  
  // Maritime identifiers (IMO, MMSI)
  imoNumber: text("imo_number"), // International Maritime Organization number
  mmsiNumber: text("mmsi_number"), // Maritime Mobile Service Identity
  
  // Aviation identifiers (ICAO, IATA)
  icaoCode: text("icao_code"), // International Civil Aviation Organization
  iataCode: text("iata_code"), // International Air Transport Association
  tailNumber: text("tail_number"), // Aircraft registration
  
  // Capacity and specifications
  maxCapacity: decimal("max_capacity", { precision: 10, scale: 2 }), // TEU for vessels, kg for aircraft
  currentLocation: text("current_location"),
  homePort: text("home_port"), // Port or airport of registry
  
  // Technical details
  yearBuilt: integer("year_built"),
  manufacturer: text("manufacturer"),
  model: text("model"),
  flagState: text("flag_state"), // Country of registration
  
  // Operating details
  operatorName: text("operator_name"),
  charterStatus: text("charter_status"), // owned, chartered, leased
  
  // AI and tracking integration
  aisEnabled: boolean("ais_enabled").default(false), // Automatic Identification System
  gpsTracking: boolean("gps_tracking").default(true),
  lastPosition: json("last_position"), // Latest GPS coordinates and timestamp
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => ({
  tenantIdIdx: index("assets_tenant_id_idx").on(table.tenantId),
  typeIdx: index("assets_type_idx").on(table.type),
  statusIdx: index("assets_status_idx").on(table.status),
  imoIdx: index("assets_imo_idx").on(table.imoNumber),
  icaoIdx: index("assets_icao_idx").on(table.icaoCode),
}));

// Containers - Gestione Container (ISO 6346, RFID/IoT, cold chain monitoring)
export const containers = pgTable("containers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  containerNumber: text("container_number").notNull().unique(), // ISO 6346 format
  type: containerTypeEnum("type").notNull(),
  status: containerStatusEnum("status").notNull().default("available"),
  
  // ISO 6346 standard fields
  ownerCode: text("owner_code").notNull(), // 3-letter owner code
  sizeType: text("size_type").notNull(), // e.g., "20GP", "40HC"
  checkDigit: text("check_digit").notNull(), // ISO 6346 check digit
  
  // Physical specifications
  lengthFeet: integer("length_feet"), // 20, 40, 45, 53
  widthFeet: integer("width_feet"), // Standard 8
  heightFeet: integer("height_feet"), // 8.5, 9.5
  maxGrossWeight: decimal("max_gross_weight", { precision: 10, scale: 2 }), // kg
  tareWeight: decimal("tare_weight", { precision: 10, scale: 2 }), // kg
  
  // Current status and location
  currentLocation: text("current_location"),
  lastMovement: timestamp("last_movement"),
  
  // RFID/IoT integration
  rfidTag: text("rfid_tag"), // RFID tag identifier
  iotDeviceId: text("iot_device_id"), // IoT sensor device ID
  
  // Cold chain monitoring (for reefer containers)
  temperatureControlled: boolean("temperature_controlled").default(false),
  targetTemperature: decimal("target_temperature", { precision: 5, scale: 2 }), // Celsius
  humidityControlled: boolean("humidity_controlled").default(false),
  targetHumidity: decimal("target_humidity", { precision: 5, scale: 2 }), // Percentage
  
  // Maintenance and certification
  lastInspection: timestamp("last_inspection"),
  nextInspection: timestamp("next_inspection"),
  cscPlate: text("csc_plate"), // Container Safety Convention plate number
  cscExpiry: timestamp("csc_expiry"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => ({
  tenantIdIdx: index("containers_tenant_id_idx").on(table.tenantId),
  containerNumberIdx: index("containers_number_idx").on(table.containerNumber),
  statusIdx: index("containers_status_idx").on(table.status),
  typeIdx: index("containers_type_idx").on(table.type),
  locationIdx: index("containers_location_idx").on(table.currentLocation),
}));

// Container Sensor Readings - Real-time IoT data
export const containerSensorReadings = pgTable("container_sensor_readings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  containerId: uuid("container_id").references(() => containers.id).notNull(),
  
  // Sensor data
  temperature: decimal("temperature", { precision: 5, scale: 2 }), // Celsius
  humidity: decimal("humidity", { precision: 5, scale: 2 }), // Percentage
  pressure: decimal("pressure", { precision: 8, scale: 2 }), // Pascal
  
  // Location data
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  altitude: decimal("altitude", { precision: 8, scale: 2 }), // meters
  
  // Device and quality metrics
  deviceId: text("device_id").notNull(),
  batteryLevel: decimal("battery_level", { precision: 5, scale: 2 }), // Percentage
  signalStrength: integer("signal_strength"), // dBm
  
  // Timestamp
  recordedAt: timestamp("recorded_at").notNull(),
  receivedAt: timestamp("received_at").notNull().defaultNow(),
}, table => ({
  containerIdIdx: index("sensor_readings_container_id_idx").on(table.containerId),
  recordedAtIdx: index("sensor_readings_recorded_at_idx").on(table.recordedAt),
  deviceIdIdx: index("sensor_readings_device_id_idx").on(table.deviceId),
}));

// Customs Documents - Documentazione Doganale AI (OCR, HS code prediction, compliance)
export const customsDocuments = pgTable("customs_documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  
  // Document identification
  documentNumber: text("document_number").notNull(),
  documentType: text("document_type").notNull(), // invoice, packing_list, certificate, bill_of_lading
  
  // File storage
  originalFileName: text("original_file_name").notNull(),
  filePath: text("file_path").notNull(), // Object storage path
  fileSize: integer("file_size"), // bytes
  mimeType: text("mime_type"),
  
  // OCR processing results
  ocrText: text("ocr_text"), // Full text extracted by AI/OCR
  ocrConfidence: decimal("ocr_confidence", { precision: 5, scale: 2 }), // 0-100 confidence score
  
  // AI-powered HS code prediction
  predictedHsCode: text("predicted_hs_code"), // Harmonized System code
  hsCodeConfidence: decimal("hs_code_confidence", { precision: 5, scale: 2 }), // 0-100 AI confidence
  confirmedHsCode: text("confirmed_hs_code"), // Human-confirmed HS code
  
  // Extracted data (AI-powered)
  extractedData: json("extracted_data"), // Structured data extracted from document
  
  // Compliance checking
  status: customsStatusEnum("status").notNull().default("pending"),
  complianceFlags: text("compliance_flags").array().default([]), // Array of compliance issues
  reviewRequired: boolean("review_required").default(false),
  
  // Processing workflow
  processedAt: timestamp("processed_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  // Origin and destination
  originCountry: text("origin_country"),
  destinationCountry: text("destination_country"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => ({
  tenantIdIdx: index("customs_docs_tenant_id_idx").on(table.tenantId),
  shipmentIdIdx: index("customs_docs_shipment_id_idx").on(table.shipmentId),
  statusIdx: index("customs_docs_status_idx").on(table.status),
  documentTypeIdx: index("customs_docs_type_idx").on(table.documentType),
  hsCodeIdx: index("customs_docs_hs_code_idx").on(table.predictedHsCode),
}));

// Shipment Legs - Tracking Intercontinentale (tratte multiple per spedizioni globali)
export const shipmentLegs = pgTable("shipment_legs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  shipmentId: uuid("shipment_id").references(() => shipments.id).notNull(),
  legNumber: integer("leg_number").notNull(), // Sequential leg number (1, 2, 3...)
  
  // Transport mode and details
  mode: transportModeEnum("mode").notNull(),
  partnerId: uuid("partner_id").references(() => logisticsPartners.id),
  assetId: uuid("asset_id").references(() => assets.id), // Vessel or aircraft used
  
  // Origin and destination
  originPort: text("origin_port").notNull(), // Port/Airport code
  destinationPort: text("destination_port").notNull(),
  originTerminal: text("origin_terminal"),
  destinationTerminal: text("destination_terminal"),
  
  // Timing
  plannedDeparture: timestamp("planned_departure").notNull(),
  actualDeparture: timestamp("actual_departure"),
  plannedArrival: timestamp("planned_arrival").notNull(),
  actualArrival: timestamp("actual_arrival"),
  estimatedArrival: timestamp("estimated_arrival"), // AI-powered ETA
  
  // Status and tracking
  status: legStatusEnum("status").notNull().default("planned"),
  distance: decimal("distance", { precision: 10, scale: 2 }), // km
  
  // Container/cargo details for this leg
  containerIds: text("container_ids").array().default([]), // Array of container IDs
  weight: decimal("weight", { precision: 10, scale: 2 }), // kg
  volume: decimal("volume", { precision: 10, scale: 2 }), // m3
  
  // Cost tracking
  cost: decimal("cost", { precision: 10, scale: 2 }),
  currency: text("currency").default("EUR"),
  
  // Delays and exceptions
  delayReason: text("delay_reason"),
  delayMinutes: integer("delay_minutes").default(0),
  
  // AI-powered analytics
  weatherImpact: json("weather_impact"), // Weather conditions affecting this leg
  trafficConditions: json("traffic_conditions"), // Traffic/congestion data
  riskFactors: text("risk_factors").array().default([]), // Array of identified risks
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => ({
  tenantIdIdx: index("shipment_legs_tenant_id_idx").on(table.tenantId),
  shipmentIdIdx: index("shipment_legs_shipment_id_idx").on(table.shipmentId),
  statusIdx: index("shipment_legs_status_idx").on(table.status),
  modeIdx: index("shipment_legs_mode_idx").on(table.mode),
  partnerIdIdx: index("shipment_legs_partner_id_idx").on(table.partnerId),
  plannedDepartureIdx: index("shipment_legs_planned_departure_idx").on(table.plannedDeparture),
}));

// Global Tracking Events - Eventi di tracking dettagliati per shipment intercontinentali
export const globalTrackingEvents = pgTable("global_tracking_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  shipmentId: uuid("shipment_id").references(() => shipments.id).notNull(),
  legId: uuid("leg_id").references(() => shipmentLegs.id),
  
  // Event details
  eventType: text("event_type").notNull(), // departure, arrival, customs, delay, exception
  eventCode: text("event_code"), // Standard tracking codes (UN/LOCODE, etc.)
  description: text("description").notNull(),
  
  // Location data
  location: text("location").notNull(),
  locationCode: text("location_code"), // UN/LOCODE, IATA, etc.
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  
  // Timing
  eventTime: timestamp("event_time").notNull(),
  receivedTime: timestamp("received_time").notNull().defaultNow(),
  
  // Source and integration
  source: text("source").notNull(), // partner_api, ais, manual, ai_prediction
  partnerId: uuid("partner_id").references(() => logisticsPartners.id),
  externalEventId: text("external_event_id"), // Partner's event ID
  
  // Additional data
  eventData: json("event_data"), // Flexible data structure for partner-specific info
  
  // AI enhancements
  aiGenerated: boolean("ai_generated").default(false), // Event generated by AI prediction
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // AI confidence score
  
  // Anomaly detection
  anomalyFlags: text("anomaly_flags").array().default([]), // Array of detected anomalies
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }), // 0-100 risk assessment
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, table => ({
  tenantIdIdx: index("tracking_events_tenant_id_idx").on(table.tenantId),
  shipmentIdIdx: index("tracking_events_shipment_id_idx").on(table.shipmentId),
  legIdIdx: index("tracking_events_leg_id_idx").on(table.legId),
  eventTypeIdx: index("tracking_events_type_idx").on(table.eventType),
  eventTimeIdx: index("tracking_events_time_idx").on(table.eventTime),
  sourceIdx: index("tracking_events_source_idx").on(table.source),
}));

// Logistics Partners - Partner strategici (Maersk, DHL, Cainiao, ecc.)
export const logisticsPartners = pgTable("logistics_partners", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  
  // Partner identification
  name: text("name").notNull(),
  code: text("code").notNull(), // Standard partner code (SCAC, IATA, etc.)
  type: partnerTypeEnum("type").notNull(),
  
  // Contact information
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  website: text("website"),
  
  // Geographic coverage
  regions: text("regions").array().default([]), // Geographic regions covered
  countries: text("countries").array().default([]), // ISO country codes
  
  // Service capabilities
  services: text("services").array().default([]), // Services offered
  transportModes: text("transport_modes").array().default([]), // air, sea, rail, road
  
  // Integration details
  apiEndpoint: text("api_endpoint"),
  apiVersion: text("api_version"),
  webhookUrl: text("webhook_url"),
  webhookSecret: text("webhook_secret"), // For HMAC verification
  
  // Authentication
  apiKey: text("api_key"), // TODO: Encrypt this field
  clientId: text("client_id"),
  clientSecret: text("client_secret"), // TODO: Encrypt this field
  
  // Configuration
  settings: json("settings"), // Partner-specific configuration
  rateLimits: json("rate_limits"), // API rate limiting info
  
  // Status and monitoring
  isActive: boolean("is_active").default(true),
  lastHealthCheck: timestamp("last_health_check"),
  healthStatus: text("health_status").default("unknown"), // healthy, degraded, down, unknown
  
  // Performance metrics
  averageResponseTime: integer("average_response_time"), // milliseconds
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // percentage
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => ({
  tenantIdIdx: index("partners_tenant_id_idx").on(table.tenantId),
  codeIdx: index("partners_code_idx").on(table.code),
  typeIdx: index("partners_type_idx").on(table.type),
  isActiveIdx: index("partners_active_idx").on(table.isActive),
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
export const insertRegistrationRequestSchema = createInsertSchema(registrationRequests).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  rejectionReason: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  passwordConfirm: z.string().min(6)
}).refine(data => data.password === data.passwordConfirm, {
  message: "Passwords must match",
  path: ["passwordConfirm"]
});

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

// Global Logistics Insert Schemas
export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContainerSchema = createInsertSchema(containers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContainerSensorReadingSchema = createInsertSchema(containerSensorReadings).omit({
  id: true,
  receivedAt: true,
});

export const insertCustomsDocumentSchema = createInsertSchema(customsDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShipmentLegSchema = createInsertSchema(shipmentLegs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGlobalTrackingEventSchema = createInsertSchema(globalTrackingEvents).omit({
  id: true,
  createdAt: true,
});

export const insertLogisticsPartnerSchema = createInsertSchema(logisticsPartners).omit({
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

// Registration request types
export type RegistrationRequest = typeof registrationRequests.$inferSelect;
export type InsertRegistrationRequest = z.infer<typeof insertRegistrationRequestSchema>;

// Shipments module types
export type FraudFlag = typeof fraudFlags.$inferSelect;
export type InsertFraudFlag = z.infer<typeof insertFraudFlagSchema>;
export type CourierAssignment = typeof courierAssignments.$inferSelect;
export type InsertCourierAssignment = z.infer<typeof insertCourierAssignmentSchema>;
export type DeliveryStatus = typeof deliveryStatus.$inferSelect;
export type InsertDeliveryStatus = z.infer<typeof insertDeliveryStatusSchema>;

// Global Logistics Types
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Container = typeof containers.$inferSelect;
export type InsertContainer = z.infer<typeof insertContainerSchema>;
export type ContainerSensorReading = typeof containerSensorReadings.$inferSelect;
export type InsertContainerSensorReading = z.infer<typeof insertContainerSensorReadingSchema>;
export type CustomsDocument = typeof customsDocuments.$inferSelect;
export type InsertCustomsDocument = z.infer<typeof insertCustomsDocumentSchema>;
export type ShipmentLeg = typeof shipmentLegs.$inferSelect;
export type InsertShipmentLeg = z.infer<typeof insertShipmentLegSchema>;
export type GlobalTrackingEvent = typeof globalTrackingEvents.$inferSelect;
export type InsertGlobalTrackingEvent = z.infer<typeof insertGlobalTrackingEventSchema>;
export type LogisticsPartner = typeof logisticsPartners.$inferSelect;
export type InsertLogisticsPartner = z.infer<typeof insertLogisticsPartnerSchema>;

// ======== MODULO LISTINI & CORRIERI ========
// Sistema integrato per tariffe fasce peso 1-1000 KG + tonnellate
// Zone speciali (ZTL, isole, Livigno), corrieri strategici, quotazioni AI

// Enums per Listini & Corrieri
export const carrierTypeEnum = pgEnum("carrier_type", [
  "express", "standard", "economy", "maritime", "air_cargo", "rail", "road_freight"
]);

export const zoneTypeEnum = pgEnum("zone_type", [
  "national", "international", "urban", "suburban", "rural", "island", "special"
]);

export const specialZoneTypeEnum = pgEnum("special_zone_type", [
  "ztl", "island", "livigno", "campione", "remote", "mountain", "restricted", "customs_free"
]);

export const weightUnitEnum = pgEnum("weight_unit", ["kg", "tonne"]);

export const rateTypeEnum = pgEnum("rate_type", [
  "per_kg", "per_package", "flat_rate", "volumetric", "express_surcharge", "zone_surcharge"
]);

// Carriers - Corrieri strategici (DHL, UPS, FedEx, Cainiao, Maersk, etc.)
export const carriers = pgTable("carriers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  code: text("code").notNull(), // DHL, UPS, FEDEX, CAINIAO, MAERSK, etc.
  name: text("name").notNull(),
  type: carrierTypeEnum("type").notNull(),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"), // Encrypted
  isActive: boolean("is_active").default(true),
  supportsTracking: boolean("supports_tracking").default(true),
  supportsAPI: boolean("supports_api").default(false),
  maxWeight: decimal("max_weight", { precision: 10, scale: 2 }), // KG
  maxDimensions: json("max_dimensions").$type<{
    length: number; width: number; height: number; unit: string;
  }>(),
  coverage: json("coverage").$type<string[]>().default([]), // Countries/regions
  services: json("services").$type<string[]>().default([]), // express, standard, etc.
  reliability: decimal("reliability", { precision: 3, scale: 2 }).default("95.00"), // %
  averageDeliveryTime: integer("average_delivery_time"), // hours
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("carriers_tenant_idx").on(table.tenantId),
  codeIdx: index("carriers_code_idx").on(table.code),
  activeIdx: index("carriers_active_idx").on(table.isActive),
  typeIdx: index("carriers_type_idx").on(table.type),
}));

// Zones - Zone geografiche per calcolo tariffe
export const zones = pgTable("zones", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(), // IT1, EU1, WORLD1, etc.
  type: zoneTypeEnum("type").notNull(),
  countries: json("countries").$type<string[]>().default([]),
  regions: json("regions").$type<string[]>().default([]),
  postalCodes: json("postal_codes").$type<string[]>().default([]),
  coordinates: json("coordinates").$type<{
    lat: number; lng: number; radius?: number;
  }[]>(),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1), // Per overlap resolution
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("zones_tenant_idx").on(table.tenantId),
  codeIdx: index("zones_code_idx").on(table.code),
  typeIdx: index("zones_type_idx").on(table.type),
  activeIdx: index("zones_active_idx").on(table.isActive),
}));

// Zone Overlays - Sistema "One" per zone speciali (ZTL, isole, Livigno)
export const zoneOverlays = pgTable("zone_overlays", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  zoneId: uuid("zone_id").references(() => zones.id).notNull(),
  name: text("name").notNull(),
  specialType: specialZoneTypeEnum("special_type").notNull(),
  description: text("description"),
  identificationMethod: text("identification_method").notNull(), // postal_code, coordinates, api_lookup
  identificationData: json("identification_data").$type<{
    postalCodes?: string[];
    coordinates?: { lat: number; lng: number; radius: number }[];
    apiEndpoint?: string;
    keywords?: string[];
  }>(),
  surchargeType: rateTypeEnum("surcharge_type").default("flat_rate"),
  surchargeAmount: decimal("surcharge_amount", { precision: 10, scale: 2 }).notNull(),
  surchargePercentage: decimal("surcharge_percentage", { precision: 5, scale: 2 }),
  minSurcharge: decimal("min_surcharge", { precision: 10, scale: 2 }),
  maxSurcharge: decimal("max_surcharge", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantZoneIdx: index("zone_overlays_tenant_zone_idx").on(table.tenantId, table.zoneId),
  specialTypeIdx: index("zone_overlays_special_type_idx").on(table.specialType),
  activeIdx: index("zone_overlays_active_idx").on(table.isActive),
}));

// Weight Brackets - Fasce peso 1-1000 KG
export const weightBrackets = pgTable("weight_brackets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  minWeight: decimal("min_weight", { precision: 10, scale: 3 }).notNull(), // 1.000 KG
  maxWeight: decimal("max_weight", { precision: 10, scale: 3 }).notNull(), // 1000.000 KG
  unit: weightUnitEnum("unit").default("kg"),
  step: decimal("step", { precision: 10, scale: 3 }).default("1.000"), // Incremento kg
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("weight_brackets_tenant_idx").on(table.tenantId),
  weightRangeIdx: index("weight_brackets_range_idx").on(table.minWeight, table.maxWeight),
  activeIdx: index("weight_brackets_active_idx").on(table.isActive),
}));

// Tonne Brackets - Fasce tonnellate per carichi industriali >= 1000 KG
export const tonneBrackets = pgTable("tonne_brackets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  minWeight: decimal("min_weight", { precision: 10, scale: 3 }).notNull(), // 1.000 tonne
  maxWeight: decimal("max_weight", { precision: 10, scale: 3 }), // null = unlimited
  unit: weightUnitEnum("unit").default("tonne"),
  step: decimal("step", { precision: 10, scale: 3 }).default("0.500"), // Incremento tonnellate
  bulkDiscount: decimal("bulk_discount", { precision: 5, scale: 2 }).default("0.00"), // % sconto
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("tonne_brackets_tenant_idx").on(table.tenantId),
  weightRangeIdx: index("tonne_brackets_range_idx").on(table.minWeight, table.maxWeight),
  activeIdx: index("tonne_brackets_active_idx").on(table.isActive),
}));

// Carrier Rate Cards - Listini corrieri con fasce peso
export const carrierRateCards = pgTable("carrier_rate_cards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  carrierId: uuid("carrier_id").references(() => carriers.id).notNull(),
  zoneId: uuid("zone_id").references(() => zones.id).notNull(),
  weightBracketId: uuid("weight_bracket_id").references(() => weightBrackets.id),
  tonneBracketId: uuid("tonne_bracket_id").references(() => tonneBrackets.id),
  name: text("name").notNull(),
  rateType: rateTypeEnum("rate_type").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  pricePerKg: decimal("price_per_kg", { precision: 10, scale: 4 }),
  pricePerTonne: decimal("price_per_tonne", { precision: 10, scale: 2 }),
  volumetricFactor: decimal("volumetric_factor", { precision: 10, scale: 2 }).default("200.00"), // kg/m³
  fuelSurcharge: decimal("fuel_surcharge", { precision: 5, scale: 2 }).default("0.00"), // %
  securitySurcharge: decimal("security_surcharge", { precision: 5, scale: 2 }).default("0.00"), // %
  insuranceCoverage: decimal("insurance_coverage", { precision: 5, scale: 2 }).default("0.00"), // %
  transitTime: integer("transit_time"), // hours
  currency: text("currency").default("EUR"),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantCarrierZoneIdx: index("carrier_rates_tenant_carrier_zone_idx").on(table.tenantId, table.carrierId, table.zoneId),
  weightBracketIdx: index("carrier_rates_weight_bracket_idx").on(table.weightBracketId),
  tonneBracketIdx: index("carrier_rates_tonne_bracket_idx").on(table.tonneBracketId),
  validityIdx: index("carrier_rates_validity_idx").on(table.validFrom, table.validTo),
  activeIdx: index("carrier_rates_active_idx").on(table.isActive),
}));

// Client Rate Cards - Listini personalizzati per merchant e sottoclienti
export const clientRateCards = pgTable("client_rate_cards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  carrierRateCardId: uuid("carrier_rate_card_id").references(() => carrierRateCards.id).notNull(),
  name: text("name").notNull(),
  discountType: text("discount_type").default("percentage"), // percentage, flat_amount, custom_price
  discountValue: decimal("discount_value", { precision: 10, scale: 4 }).default("0.00"),
  minimumCharge: decimal("minimum_charge", { precision: 10, scale: 2 }),
  maximumCharge: decimal("maximum_charge", { precision: 10, scale: 2 }),
  freeThreshold: decimal("free_threshold", { precision: 10, scale: 2 }), // Spedizione gratuita sopra €X
  priorityLevel: integer("priority_level").default(1), // 1=highest for rate selection
  customTerms: text("custom_terms"),
  billingMode: text("billing_mode").default("postpaid"), // prepaid, postpaid
  paymentTerms: integer("payment_terms").default(30), // giorni
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to"),
  isActive: boolean("is_active").default(true),
  autoApply: boolean("auto_apply").default(true), // Applicazione automatica in fase di ordine
  requiresApproval: boolean("requires_approval").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantClientIdx: index("client_rates_tenant_client_idx").on(table.tenantId, table.clientId),
  carrierRateIdx: index("client_rates_carrier_rate_idx").on(table.carrierRateCardId),
  validityIdx: index("client_rates_validity_idx").on(table.validFrom, table.validTo),
  activeIdx: index("client_rates_active_idx").on(table.isActive),
  priorityIdx: index("client_rates_priority_idx").on(table.priorityLevel),
}));

// Shipping Quotes - Quotazioni generate dal sistema AI
export const shippingQuotes = pgTable("shipping_quotes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  clientId: uuid("client_id").references(() => clients.id),
  quoteNumber: text("quote_number").notNull(),
  weight: decimal("weight", { precision: 10, scale: 3 }).notNull(),
  volume: decimal("volume", { precision: 10, scale: 6 }), // m³
  dimensions: json("dimensions").$type<{
    length: number; width: number; height: number; unit: string;
  }>(),
  originZone: uuid("origin_zone").references(() => zones.id).notNull(),
  destinationZone: uuid("destination_zone").references(() => zones.id).notNull(),
  specialZones: json("special_zones").$type<string[]>().default([]), // Zone overlays applicabili
  recommendedCarrier: uuid("recommended_carrier").references(() => carriers.id),
  quotedRates: json("quoted_rates").$type<Array<{
    carrierId: string;
    carrierName: string;
    totalPrice: number;
    basePrice: number;
    surcharges: number;
    transitTime: number;
    confidence: number; // 0-100
    reasons: string[];
  }>>().default([]),
  selectedRate: json("selected_rate").$type<{
    carrierId: string;
    totalPrice: number;
    transitTime: number;
  }>(),
  aiRecommendations: json("ai_recommendations").$type<{
    optimal: string; // carrierId
    fastest: string; // carrierId
    cheapest: string; // carrierId
    mostReliable: string; // carrierId
    reasoning: string[];
  }>(),
  expiresAt: timestamp("expires_at").notNull(),
  isAccepted: boolean("is_accepted").default(false),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("shipping_quotes_tenant_idx").on(table.tenantId),
  clientIdx: index("shipping_quotes_client_idx").on(table.clientId),
  quoteNumberIdx: index("shipping_quotes_number_idx").on(table.quoteNumber),
  expiryIdx: index("shipping_quotes_expiry_idx").on(table.expiresAt),
  acceptedIdx: index("shipping_quotes_accepted_idx").on(table.isAccepted),
}));

// Insert Schemas per Listini & Corrieri
export const insertCarrierSchema = createInsertSchema(carriers);
export const insertZoneSchema = createInsertSchema(zones);
export const insertZoneOverlaySchema = createInsertSchema(zoneOverlays);
export const insertWeightBracketSchema = createInsertSchema(weightBrackets);
export const insertTonneBracketSchema = createInsertSchema(tonneBrackets);
export const insertCarrierRateCardSchema = createInsertSchema(carrierRateCards);
export const insertClientRateCardSchema = createInsertSchema(clientRateCards);
export const insertShippingQuoteSchema = createInsertSchema(shippingQuotes);

// Types per Listini & Corrieri
export type Carrier = typeof carriers.$inferSelect;
export type InsertCarrier = z.infer<typeof insertCarrierSchema>;
export type Zone = typeof zones.$inferSelect;
export type InsertZone = z.infer<typeof insertZoneSchema>;
export type ZoneOverlay = typeof zoneOverlays.$inferSelect;
export type InsertZoneOverlay = z.infer<typeof insertZoneOverlaySchema>;
export type WeightBracket = typeof weightBrackets.$inferSelect;
export type InsertWeightBracket = z.infer<typeof insertWeightBracketSchema>;
export type TonneBracket = typeof tonneBrackets.$inferSelect;
export type InsertTonneBracket = z.infer<typeof insertTonneBracketSchema>;
export type CarrierRateCard = typeof carrierRateCards.$inferSelect;
export type InsertCarrierRateCard = z.infer<typeof insertCarrierRateCardSchema>;
export type ClientRateCard = typeof clientRateCards.$inferSelect;
export type InsertClientRateCard = z.infer<typeof insertClientRateCardSchema>;
export type ShippingQuote = typeof shippingQuotes.$inferSelect;
export type InsertShippingQuote = z.infer<typeof insertShippingQuoteSchema>;

// =====================================================
// WHITE-LABEL MULTI-TENANT SYSTEM
// Sistema registrazione subclienti personalizzata
// =====================================================

// Client Branding Configurations - Configurazioni branding per ogni cliente
export const clientBrandingConfigs = pgTable("client_branding_configs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  brandName: text("brand_name").notNull(),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color").default("#2563eb"), // Blue-600
  secondaryColor: text("secondary_color").default("#64748b"), // Slate-500
  accentColor: text("accent_color").default("#10b981"), // Emerald-500
  backgroundGradient: text("background_gradient"),
  customCss: text("custom_css"),
  customDomain: text("custom_domain"), // app.logisticaX.it
  subdomainPrefix: text("subdomain_prefix"), // logisticaX.ycore.app
  whitelabelEnabled: boolean("whitelabel_enabled").default(true),
  hideYcoreBranding: boolean("hide_ycore_branding").default(true),
  customTermsUrl: text("custom_terms_url"),
  customPrivacyUrl: text("custom_privacy_url"),
  customSupportEmail: text("custom_support_email"),
  customSupportPhone: text("custom_support_phone"),
  status: clientBrandingStatusEnum("status").default("pending"),
  metadata: json("metadata").$type<{
    theme: string;
    typography: string;
    layout: string;
    features: string[];
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantClientIdx: unique("branding_tenant_client_idx").on(table.tenantId, table.clientId),
  customDomainIdx: unique("branding_custom_domain_idx").on(table.customDomain),
  subdomainIdx: unique("branding_subdomain_idx").on(table.subdomainPrefix),
  statusIdx: index("branding_status_idx").on(table.status),
}));

// Sub-Client Registrations - Registrazioni subclienti attraverso link personalizzati
export const subClientRegistrations = pgTable("sub_client_registrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  parentClientId: uuid("parent_client_id").references(() => clients.id).notNull(), // Cliente che gestisce i subclienti
  registrationToken: text("registration_token").notNull().unique(), // Token unico per link registrazione
  brandingConfigId: uuid("branding_config_id").references(() => clientBrandingConfigs.id).notNull(),
  
  // Dati subcliente
  subClientEmail: text("sub_client_email").notNull(),
  subClientName: text("sub_client_name").notNull(),
  subClientCompany: text("sub_client_company"),
  subClientPhone: text("sub_client_phone"),
  subClientAddress: text("sub_client_address"),
  subClientVat: text("sub_client_vat"),
  
  // Metadata registrazione
  registrationData: json("registration_data").$type<{
    userAgent: string;
    ipAddress: string;
    referrer: string;
    language: string;
    timezone: string;
    customFields: Record<string, any>;
  }>(),
  
  // Status e approvazione
  status: subClientStatusEnum("status").default("pending_approval"),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  
  // Antifrode
  fraudScore: decimal("fraud_score", { precision: 5, scale: 2 }).default("0.00"), // 0-100
  fraudFlags: json("fraud_flags").$type<string[]>().default([]),
  ipAnalysis: json("ip_analysis").$type<{
    country: string;
    region: string;
    city: string;
    isp: string;
    isVpn: boolean;
    isTor: boolean;
    riskScore: number;
  }>(),
  
  expiresAt: timestamp("expires_at").notNull(), // Link scadenza
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantParentIdx: index("sub_registrations_tenant_parent_idx").on(table.tenantId, table.parentClientId),
  tokenIdx: unique("sub_registrations_token_idx").on(table.registrationToken),
  emailIdx: index("sub_registrations_email_idx").on(table.subClientEmail),
  statusIdx: index("sub_registrations_status_idx").on(table.status),
  expiryIdx: index("sub_registrations_expiry_idx").on(table.expiresAt),
  fraudScoreIdx: index("sub_registrations_fraud_score_idx").on(table.fraudScore),
}));

// Domain Configurations - Gestione domini personalizzati
export const domainConfigurations = pgTable("domain_configurations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  brandingConfigId: uuid("branding_config_id").references(() => clientBrandingConfigs.id).notNull(),
  
  domainName: text("domain_name").notNull(),
  domainType: text("domain_type").notNull(), // subdomain, custom_domain
  isActive: boolean("is_active").default(false),
  isPrimary: boolean("is_primary").default(false),
  
  // SSL Configuration
  sslCertificateId: text("ssl_certificate_id"),
  sslStatus: domainStatusEnum("ssl_status").default("pending"),
  sslExpiresAt: timestamp("ssl_expires_at"),
  autoRenewSsl: boolean("auto_renew_ssl").default(true),
  
  // DNS Configuration
  dnsRecords: json("dns_records").$type<Array<{
    type: string; // A, CNAME, TXT
    name: string;
    value: string;
    ttl: number;
    verified: boolean;
  }>>().default([]),
  dnsVerified: boolean("dns_verified").default(false),
  dnsVerifiedAt: timestamp("dns_verified_at"),
  
  // Redirect Configuration
  redirectUrls: json("redirect_urls").$type<{
    http: string;
    https: string;
    mobile: string;
  }>(),
  
  status: domainStatusEnum("status").default("pending"),
  lastCheckedAt: timestamp("last_checked_at"),
  errorLog: text("error_log"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  domainNameIdx: unique("domain_configs_domain_name_idx").on(table.domainName),
  brandingConfigIdx: index("domain_configs_branding_idx").on(table.brandingConfigId),
  statusIdx: index("domain_configs_status_idx").on(table.status),
  activeIdx: index("domain_configs_active_idx").on(table.isActive),
  sslExpiryIdx: index("domain_configs_ssl_expiry_idx").on(table.sslExpiresAt),
}));

// Client Subscriptions - Abbonamenti scalabili basati su volumi
export const clientSubscriptions = pgTable("client_subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  
  // Subscription Plan
  tier: subscriptionTierEnum("tier").notNull(),
  billingCycle: billingCycleEnum("billing_cycle").default("monthly"),
  monthlyShipmentLimit: integer("monthly_shipment_limit").notNull(),
  currentUsage: integer("current_usage").default(0),
  overage: integer("overage").default(0), // Spedizioni oltre il limite
  
  // Pricing
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  overagePrice: decimal("overage_price", { precision: 10, scale: 4 }).notNull(), // Prezzo per spedizione eccedente
  currency: text("currency").default("EUR"),
  
  // Stripe Integration
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  stripePriceId: text("stripe_price_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  
  // Payment Method
  paymentMethod: paymentMethodEnum("payment_method").default("stripe"),
  paymentMethodDetails: json("payment_method_details").$type<{
    last4: string;
    brand: string;
    expiresAt: string;
    country: string;
  }>(),
  
  // Subscription Status
  status: subscriptionStatusEnum("status").default("active"),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAt: timestamp("cancel_at"),
  canceledAt: timestamp("canceled_at"),
  cancelReason: text("cancel_reason"),
  
  // Auto-scaling
  autoUpgrade: boolean("auto_upgrade").default(true),
  nextTierThreshold: decimal("next_tier_threshold", { precision: 5, scale: 2 }).default("80.00"), // % utilizzo per upgrade
  upgradeNotificationSent: boolean("upgrade_notification_sent").default(false),
  
  // Usage Tracking
  usageHistory: json("usage_history").$type<Array<{
    period: string; // YYYY-MM
    shipments: number;
    overage: number;
    totalCost: number;
  }>>().default([]),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantClientIdx: unique("subscriptions_tenant_client_idx").on(table.tenantId, table.clientId),
  stripeSubIdx: unique("subscriptions_stripe_sub_idx").on(table.stripeSubscriptionId),
  statusIdx: index("subscriptions_status_idx").on(table.status),
  tierIdx: index("subscriptions_tier_idx").on(table.tier),
  currentPeriodIdx: index("subscriptions_current_period_idx").on(table.currentPeriodStart, table.currentPeriodEnd),
  usageIdx: index("subscriptions_usage_idx").on(table.currentUsage, table.monthlyShipmentLimit),
}));

// Registration Links - Link personalizzati per registrazione subclienti
export const registrationLinks = pgTable("registration_links", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  brandingConfigId: uuid("branding_config_id").references(() => clientBrandingConfigs.id).notNull(),
  
  linkToken: text("link_token").notNull().unique(),
  linkUrl: text("link_url").notNull(), // Full URL with domain + token
  
  // Link Configuration
  customMessage: text("custom_message"),
  prefilledData: json("prefilled_data").$type<{
    companyName: string;
    industry: string;
    estimatedVolume: number;
    referenceCode: string;
  }>(),
  
  // Usage Tracking
  clickCount: integer("click_count").default(0),
  registrationCount: integer("registration_count").default(0),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0.00"),
  
  // Access Control
  maxRegistrations: integer("max_registrations"), // null = unlimited
  maxClicks: integer("max_clicks"), // null = unlimited
  allowedDomains: json("allowed_domains").$type<string[]>().default([]),
  restrictedCountries: json("restricted_countries").$type<string[]>().default([]),
  
  // Analytics
  analytics: json("analytics").$type<{
    sources: Record<string, number>; // referrer -> count
    countries: Record<string, number>; // country -> count
    devices: Record<string, number>; // device type -> count
    fraudAttempts: number;
  }>().default(sql`'{}'::json`),
  
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tokenIdx: unique("registration_links_token_idx").on(table.linkToken),
  clientBrandingIdx: index("registration_links_client_branding_idx").on(table.clientId, table.brandingConfigId),
  activeIdx: index("registration_links_active_idx").on(table.isActive),
  expiryIdx: index("registration_links_expiry_idx").on(table.expiresAt),
  conversionIdx: index("registration_links_conversion_idx").on(table.conversionRate),
}));

// Insert Schemas per White-Label Multi-Tenant
export const insertClientBrandingConfigSchema = createInsertSchema(clientBrandingConfigs);
export const insertSubClientRegistrationSchema = createInsertSchema(subClientRegistrations);
export const insertDomainConfigurationSchema = createInsertSchema(domainConfigurations);
export const insertClientSubscriptionSchema = createInsertSchema(clientSubscriptions);
export const insertRegistrationLinkSchema = createInsertSchema(registrationLinks);

// Types per White-Label Multi-Tenant
export type ClientBrandingConfig = typeof clientBrandingConfigs.$inferSelect;
export type InsertClientBrandingConfig = z.infer<typeof insertClientBrandingConfigSchema>;
export type SubClientRegistration = typeof subClientRegistrations.$inferSelect;
export type InsertSubClientRegistration = z.infer<typeof insertSubClientRegistrationSchema>;
export type DomainConfiguration = typeof domainConfigurations.$inferSelect;
export type InsertDomainConfiguration = z.infer<typeof insertDomainConfigurationSchema>;
export type ClientSubscription = typeof clientSubscriptions.$inferSelect;
export type InsertClientSubscription = z.infer<typeof insertClientSubscriptionSchema>;
export type RegistrationLink = typeof registrationLinks.$inferSelect;
export type InsertRegistrationLink = z.infer<typeof insertRegistrationLinkSchema>;

// ========================
// MODULO 2: MAGAZZINO & INVENTARIO
// ========================

// Enums per Magazzino
export const warehouseTypeEnum = pgEnum("warehouse_type", ["main", "partner", "temporary", "cold_storage", "hazmat"]);
export const inventoryStatusEnum = pgEnum("inventory_status", ["available", "reserved", "damaged", "expired", "quarantine"]);
export const movementTypeEnum = pgEnum("movement_type", ["inbound", "outbound", "transfer", "adjustment", "damaged", "returned"]);

// Magazzini
export const warehouses = pgTable("warehouses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: warehouseTypeEnum("type").notNull(),
  
  // Indirizzo e ubicazione
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  postalCode: text("postal_code"),
  coordinates: json("coordinates").$type<{lat: number; lng: number}>(),
  
  // Capacità e caratteristiche
  totalCapacity: decimal("total_capacity", { precision: 12, scale: 2 }), // m³
  usedCapacity: decimal("used_capacity", { precision: 12, scale: 2 }).default("0.00"),
  maxWeight: decimal("max_weight", { precision: 12, scale: 2 }), // kg
  
  // Tecnologie
  hasRFID: boolean("has_rfid").default(false),
  hasQR: boolean("has_qr").default(true),
  hasColdStorage: boolean("has_cold_storage").default(false),
  hasHazmatStorage: boolean("has_hazmat_storage").default(false),
  
  // Gestione
  managerId: uuid("manager_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  operatingHours: json("operating_hours").$type<{open: string; close: string; timezone: string}>(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("warehouses_tenant_idx").on(table.tenantId),
  typeIdx: index("warehouses_type_idx").on(table.type),
  activeIdx: index("warehouses_active_idx").on(table.isActive),
  codeIdx: unique("warehouses_code_idx").on(table.code),
}));

// Zone/Scaffali Magazzino
export const warehouseZones = pgTable("warehouse_zones", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id).notNull(),
  code: text("code").notNull(), // A1, B2, C3-SHELF-5
  name: text("name").notNull(),
  type: text("type").notNull(), // shelf, rack, floor, cold, hazmat
  
  // Posizione fisica
  level: integer("level").default(0), // Piano
  row: text("row"),
  column: text("column"),
  
  // Capacità zona
  maxWeight: decimal("max_weight", { precision: 10, scale: 2 }),
  maxVolume: decimal("max_volume", { precision: 10, scale: 2 }),
  currentWeight: decimal("current_weight", { precision: 10, scale: 2 }).default("0.00"),
  currentVolume: decimal("current_volume", { precision: 10, scale: 2 }).default("0.00"),
  
  // Tecnologie
  qrCode: text("qr_code").unique(),
  rfidTag: text("rfid_tag").unique(),
  
  // Caratteristiche ambientali
  temperature: decimal("temperature", { precision: 5, scale: 2 }), // °C
  humidity: decimal("humidity", { precision: 5, scale: 2 }), // %
  isClimateControlled: boolean("is_climate_controlled").default(false),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  warehouseIdx: index("warehouse_zones_warehouse_idx").on(table.warehouseId),
  codeIdx: index("warehouse_zones_code_idx").on(table.warehouseId, table.code),
  qrIdx: unique("warehouse_zones_qr_idx").on(table.qrCode),
  rfidIdx: unique("warehouse_zones_rfid_idx").on(table.rfidTag),
}));

// Inventario
export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id).notNull(),
  zoneId: uuid("zone_id").references(() => warehouseZones.id),
  
  // Prodotto
  sku: text("sku").notNull(),
  productName: text("product_name").notNull(),
  description: text("description"),
  category: text("category"),
  
  // Quantità e misure
  quantity: integer("quantity").notNull(),
  reservedQuantity: integer("reserved_quantity").default(0),
  availableQuantity: integer("available_quantity").notNull(),
  unitWeight: decimal("unit_weight", { precision: 8, scale: 2 }), // kg per unità
  unitVolume: decimal("unit_volume", { precision: 8, scale: 2 }), // m³ per unità
  
  // Status e qualità
  status: inventoryStatusEnum("status").notNull().default("available"),
  batchNumber: text("batch_number"),
  expiryDate: timestamp("expiry_date"),
  manufacturingDate: timestamp("manufacturing_date"),
  
  // Costi e prezzi
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }),
  
  // Tracking e identificazione
  barcodes: json("barcodes").$type<string[]>().default([]),
  rfidTags: json("rfid_tags").$type<string[]>().default([]),
  
  // Soglie automatiche
  minStockLevel: integer("min_stock_level").default(0),
  maxStockLevel: integer("max_stock_level"),
  reorderPoint: integer("reorder_point").default(0),
  reorderQuantity: integer("reorder_quantity").default(0),
  
  // Fornitori e gestione
  supplierId: uuid("supplier_id"), // Link al modulo fornitori
  lastStockUpdate: timestamp("last_stock_update").defaultNow(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("inventory_tenant_idx").on(table.tenantId),
  warehouseIdx: index("inventory_warehouse_idx").on(table.warehouseId),
  skuIdx: index("inventory_sku_idx").on(table.sku),
  statusIdx: index("inventory_status_idx").on(table.status),
  warehouseSkuIdx: unique("inventory_warehouse_sku_idx").on(table.warehouseId, table.sku),
  expiryIdx: index("inventory_expiry_idx").on(table.expiryDate),
  reorderIdx: index("inventory_reorder_idx").on(table.reorderPoint, table.availableQuantity),
}));

// Movimenti Inventario
export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  inventoryId: uuid("inventory_id").references(() => inventory.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  
  // Tipo movimento
  type: movementTypeEnum("type").notNull(),
  direction: text("direction").notNull(), // in, out
  
  // Quantità
  quantityBefore: integer("quantity_before").notNull(),
  quantityChanged: integer("quantity_changed").notNull(),
  quantityAfter: integer("quantity_after").notNull(),
  
  // Riferimenti
  referenceType: text("reference_type"), // shipment, order, transfer, adjustment
  referenceId: uuid("reference_id"), // ID del documento di riferimento
  
  // Ubicazione
  fromWarehouseId: uuid("from_warehouse_id").references(() => warehouses.id),
  fromZoneId: uuid("from_zone_id").references(() => warehouseZones.id),
  toWarehouseId: uuid("to_warehouse_id").references(() => warehouses.id),
  toZoneId: uuid("to_zone_id").references(() => warehouseZones.id),
  
  // Dettagli movimento
  reason: text("reason").notNull(),
  notes: text("notes"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  
  // Tracciabilità
  performedBy: uuid("performed_by").references(() => users.id).notNull(),
  documentNumber: text("document_number"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  inventoryIdx: index("movements_inventory_idx").on(table.inventoryId),
  tenantIdx: index("movements_tenant_idx").on(table.tenantId),
  typeIdx: index("movements_type_idx").on(table.type),
  dateIdx: index("movements_date_idx").on(table.createdAt),
  referenceIdx: index("movements_reference_idx").on(table.referenceType, table.referenceId),
  performedByIdx: index("movements_performed_by_idx").on(table.performedBy),
}));

// ========================
// MODULO 3: FORNITORI
// ========================

export const supplierCategoryEnum = pgEnum("supplier_category", ["manufacturer", "distributor", "carrier", "service", "raw_materials", "packaging"]);
export const supplierStatusEnum = pgEnum("supplier_status", ["active", "inactive", "suspended", "evaluation", "blacklisted"]);
export const supplierOrderStatusEnum = pgEnum("supplier_order_status", ["draft", "sent", "confirmed", "partial", "completed", "cancelled", "disputed"]);

// Fornitori
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  
  // Informazioni base
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: supplierCategoryEnum("category").notNull(),
  status: supplierStatusEnum("status").notNull().default("evaluation"),
  
  // Contatti
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  
  // Indirizzo
  address: text("address"),
  city: text("city"),
  country: text("country"),
  postalCode: text("postal_code"),
  taxId: text("tax_id"),
  vatNumber: text("vat_number"),
  
  // Dettagli commerciali
  paymentTerms: text("payment_terms"), // NET30, NET60, COD
  currency: text("currency").default("EUR"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }),
  
  // KPI e Scoring
  reliabilityScore: decimal("reliability_score", { precision: 3, scale: 2 }).default("0.00"), // 0-100
  qualityScore: decimal("quality_score", { precision: 3, scale: 2 }).default("0.00"), // 0-100
  deliveryScore: decimal("delivery_score", { precision: 3, scale: 2 }).default("0.00"), // 0-100
  overallRating: decimal("overall_rating", { precision: 3, scale: 2 }).default("0.00"), // 0-100
  
  // Statistiche
  totalOrders: integer("total_orders").default(0),
  completedOrders: integer("completed_orders").default(0),
  onTimeDeliveries: integer("on_time_deliveries").default(0),
  qualityIssues: integer("quality_issues").default(0),
  
  // Capacità e servizi
  productCategories: json("product_categories").$type<string[]>().default([]),
  services: json("services").$type<string[]>().default([]),
  certifications: json("certifications").$type<string[]>().default([]),
  
  // Gestione account
  accountManagerId: uuid("account_manager_id").references(() => users.id),
  notes: text("notes"),
  
  // Antifrode
  fraudFlags: json("fraud_flags").$type<string[]>().default([]),
  lastAudit: timestamp("last_audit"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("suppliers_tenant_idx").on(table.tenantId),
  categoryIdx: index("suppliers_category_idx").on(table.category),
  statusIdx: index("suppliers_status_idx").on(table.status),
  codeIdx: unique("suppliers_code_idx").on(table.code),
  ratingIdx: index("suppliers_rating_idx").on(table.overallRating),
}));

// Ordini Fornitori
export const supplierOrders = pgTable("supplier_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  
  // Identificazione ordine
  orderNumber: text("order_number").notNull().unique(),
  externalOrderNumber: text("external_order_number"), // Numero ordine del fornitore
  
  // Status e date
  status: supplierOrderStatusEnum("status").notNull().default("draft"),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  requestedDeliveryDate: timestamp("requested_delivery_date"),
  confirmedDeliveryDate: timestamp("confirmed_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  
  // Importi
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
  shippingCost: decimal("shipping_cost", { precision: 12, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("EUR"),
  
  // Consegna
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  deliveryAddress: text("delivery_address"),
  shippingMethod: text("shipping_method"),
  trackingNumbers: json("tracking_numbers").$type<string[]>().default([]),
  
  // Gestione
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  approvedBy: uuid("approved_by").references(() => users.id),
  receivedBy: uuid("received_by").references(() => users.id),
  
  // Note e documenti
  notes: text("notes"),
  terms: text("terms"),
  attachments: json("attachments").$type<string[]>().default([]), // File paths
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("supplier_orders_tenant_idx").on(table.tenantId),
  supplierIdx: index("supplier_orders_supplier_idx").on(table.supplierId),
  statusIdx: index("supplier_orders_status_idx").on(table.status),
  orderNumberIdx: unique("supplier_orders_number_idx").on(table.orderNumber),
  dateIdx: index("supplier_orders_date_idx").on(table.orderDate),
  deliveryIdx: index("supplier_orders_delivery_idx").on(table.requestedDeliveryDate),
}));

// NOTA: Partner Logistici già definito sopra nel file

// Strutture Partner (Magazzini affiliati)
export const partnerFacilities = pgTable("partner_facilities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerId: uuid("partner_id").references(() => logisticsPartners.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  
  // Identificazione struttura
  code: text("code").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // warehouse, fulfillment_center, sorting_hub, cross_dock
  
  // Ubicazione
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  postalCode: text("postal_code"),
  coordinates: json("coordinates").$type<{lat: number; lng: number}>(),
  timezone: text("timezone"),
  
  // Capacità fisica
  totalArea: decimal("total_area", { precision: 10, scale: 2 }), // m²
  storageCapacity: decimal("storage_capacity", { precision: 12, scale: 2 }), // m³
  maxWeight: decimal("max_weight", { precision: 12, scale: 2 }), // kg
  loadingDocks: integer("loading_docks"),
  
  // Caratteristiche operative
  operatingHours: json("operating_hours").$type<{
    monday: {open: string; close: string};
    tuesday: {open: string; close: string};
    wednesday: {open: string; close: string};
    thursday: {open: string; close: string};
    friday: {open: string; close: string};
    saturday: {open: string; close: string};
    sunday: {open: string; close: string};
  }>(),
  
  // Tecnologie disponibili
  hasWMS: boolean("has_wms").default(false),
  hasRFID: boolean("has_rfid").default(false),
  hasQR: boolean("has_qr").default(true),
  hasColdStorage: boolean("has_cold_storage").default(false),
  hasHazmatStorage: boolean("has_hazmat_storage").default(false),
  hasCustomsClearance: boolean("has_customs_clearance").default(false),
  
  // Costi operativi
  storageCostPerM3: decimal("storage_cost_per_m3", { precision: 8, scale: 2 }),
  handlingCostPerUnit: decimal("handling_cost_per_unit", { precision: 8, scale: 2 }),
  
  // Performance
  utilizationRate: decimal("utilization_rate", { precision: 5, scale: 2 }).default("0.00"), // %
  throughputDaily: integer("throughput_daily"), // packages/day
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  partnerIdx: index("partner_facilities_partner_idx").on(table.partnerId),
  tenantIdx: index("partner_facilities_tenant_idx").on(table.tenantId),
  locationIdx: index("partner_facilities_location_idx").on(table.country, table.city),
  typeIdx: index("partner_facilities_type_idx").on(table.type),
  activeIdx: index("partner_facilities_active_idx").on(table.isActive),
  partnerCodeIdx: unique("partner_facilities_partner_code_idx").on(table.partnerId, table.code),
}));

// Marketplace Interno Logistica
export const logisticsMarketplace = pgTable("logistics_marketplace", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  
  // Richiesta logistica
  requestId: text("request_id").notNull().unique(),
  serviceType: text("service_type").notNull(), // transportation, warehousing, fulfillment, last_mile
  
  // Origine e destinazione
  originAddress: text("origin_address").notNull(),
  originCoordinates: json("origin_coordinates").$type<{lat: number; lng: number}>(),
  destinationAddress: text("destination_address").notNull(),
  destinationCoordinates: json("destination_coordinates").$type<{lat: number; lng: number}>(),
  
  // Dettagli spedizione
  packages: json("packages").$type<Array<{
    weight: number;
    dimensions: {length: number; width: number; height: number};
    value: number;
    fragile: boolean;
    hazmat: boolean;
    temperature_controlled: boolean;
  }>>(),
  
  totalWeight: decimal("total_weight", { precision: 10, scale: 2 }).notNull(),
  totalVolume: decimal("total_volume", { precision: 10, scale: 2 }).notNull(),
  declaredValue: decimal("declared_value", { precision: 12, scale: 2 }),
  
  // Requisiti temporali
  pickupDate: timestamp("pickup_date"),
  deliveryDate: timestamp("delivery_date"),
  isUrgent: boolean("is_urgent").default(false),
  
  // Offerte partner
  bids: json("bids").$type<Array<{
    partnerId: string;
    price: number;
    estimatedTime: number; // hours
    score: number;
    terms: string;
    validUntil: string;
  }>>().default([]),
  
  // Selezione
  selectedPartnerId: uuid("selected_partner_id").references(() => logisticsPartners.id),
  selectedBid: json("selected_bid").$type<{
    partnerId: string;
    price: number;
    estimatedTime: number;
    score: number;
    terms: string;
  }>(),
  
  // Status
  status: text("status").notNull().default("open"), // open, bidding, awarded, completed, cancelled
  
  // Creazione richiesta
  requestedBy: uuid("requested_by").references(() => users.id).notNull(),
  clientId: uuid("client_id").references(() => clients.id),
  
  // AI Scoring
  aiRecommendation: json("ai_recommendation").$type<{
    recommendedPartnerId: string;
    confidence: number;
    factors: string[];
    explanation: string;
  }>(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("logistics_marketplace_tenant_idx").on(table.tenantId),
  requestIdIdx: unique("logistics_marketplace_request_idx").on(table.requestId),
  statusIdx: index("logistics_marketplace_status_idx").on(table.status),
  serviceTypeIdx: index("logistics_marketplace_service_idx").on(table.serviceType),
  dateIdx: index("logistics_marketplace_date_idx").on(table.pickupDate, table.deliveryDate),
  partnerIdx: index("logistics_marketplace_partner_idx").on(table.selectedPartnerId),
}));

// ========================
// COMMERCIAL APPLICATIONS & PROFILES
// ========================

// Commercial Applications - Richieste di iscrizione commerciali
export const commercialApplications = pgTable("commercial_applications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Dati personali
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  geographicArea: text("geographic_area").notNull(),
  
  // Esperienza professionale
  experienceDescription: text("experience_description"),
  workSectors: text("work_sectors").array(), // ["ristorazione", "benessere", "retail", "logistica"]
  cvUrl: text("cv_url"),
  cvStorageKey: text("cv_storage_key"),
  
  // Specializzazione
  specializedClientTypes: text("specialized_client_types").array(), // ["ristorazione", "servizi", "logistica", "ecommerce"]
  
  // Portafoglio clienti esistente
  hasActiveClients: boolean("has_active_clients").default(false),
  estimatedClientsCount: integer("estimated_clients_count"),
  clientsSector: text("clients_sector"),
  clientsGeographicArea: text("clients_geographic_area"),
  clientsDocumentationUrl: text("clients_documentation_url"),
  clientsDocumentationStorageKey: text("clients_documentation_storage_key"),
  
  // Disponibilità
  preferredTimeSlots: text("preferred_time_slots").array(), // ["mattina", "pomeriggio", "sera", "weekend"]
  preferredContactMethod: text("preferred_contact_method"), // "telefono", "email", "video_call"
  
  // Status e gestione
  status: moduleStatusEnum("status").notNull().default("pending"), // pending, validation, active, rejected
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  
  // AI Analysis
  aiAnalysis: json("ai_analysis").$type<{
    cvScore: number;
    suggestedCategory: string;
    suggestedAssignment: string;
    confidenceLevel: number;
    notes: string[];
  }>(),
  
  // Audit
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: unique("commercial_applications_email_idx").on(table.email),
  statusIdx: index("commercial_applications_status_idx").on(table.status),
  tenantIdx: index("commercial_applications_tenant_idx").on(table.tenantId),
}));

// Commercial Profiles - Profili attivi commerciali 
export const commercialProfiles = pgTable("commercial_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: uuid("user_id").references(() => users.id),
  applicationId: uuid("application_id").references(() => commercialApplications.id),
  
  // Dati dal modulo di iscrizione
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  geographicArea: text("geographic_area").notNull(),
  specializedClientTypes: text("specialized_client_types").array(),
  
  // Sistema commerciale
  subRole: subRoleEnum("sub_role").notNull().default("agente"),
  livello: livelloEnum("livello").notNull().default("base"),
  grado: gradoEnum("grado").notNull().default("1"),
  percentuale: decimal("percentuale", { precision: 5, scale: 2 }).notNull().default("5.00"),
  aiSupport: boolean("ai_support").notNull().default(true),
  
  // Performance tracking
  totalClients: integer("total_clients").notNull().default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull().default("0.00"),
  monthsActive: integer("months_active").notNull().default(0),
  
  // Status
  status: moduleStatusEnum("status").notNull().default("active"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: unique("commercial_profiles_user_idx").on(table.userId),
  emailIdx: unique("commercial_profiles_email_idx").on(table.email),
  tenantIdx: index("commercial_profiles_tenant_idx").on(table.tenantId),
  subRoleIdx: index("commercial_profiles_subrole_idx").on(table.subRole),
  livelloIdx: index("commercial_profiles_livello_idx").on(table.livello),
}));

// Commercial Experiences - Esperienze lavorative dettagliate
export const commercialExperiences = pgTable("commercial_experiences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").references(() => commercialProfiles.id, { onDelete: "cascade" }),
  
  company: text("company").notNull(),
  role: text("role").notNull(),
  sector: text("sector"), // settore di riferimento
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  description: text("description"),
  achievements: text("achievements").array(), // risultati ottenuti
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  profileIdx: index("commercial_experiences_profile_idx").on(table.profileId),
}));

// ========================
// INSERT SCHEMAS & TYPES per tutti i 4 MODULI
// ========================

// MODULO 2: MAGAZZINO & INVENTARIO
export const insertWarehouseSchema = createInsertSchema(warehouses);
export const insertWarehouseZoneSchema = createInsertSchema(warehouseZones);
export const insertInventorySchema = createInsertSchema(inventory);
export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements);

export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type WarehouseZone = typeof warehouseZones.$inferSelect;
export type InsertWarehouseZone = z.infer<typeof insertWarehouseZoneSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;

// MODULO 3: FORNITORI  
export const insertSupplierSchema = createInsertSchema(suppliers);
export const insertSupplierOrderSchema = createInsertSchema(supplierOrders);

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type SupplierOrder = typeof supplierOrders.$inferSelect;
export type InsertSupplierOrder = z.infer<typeof insertSupplierOrderSchema>;

// MODULO 4: MAGAZZINI PARTNER & RETE LOGISTICA  
export const insertPartnerFacilitySchemaNew = createInsertSchema(partnerFacilities);
export const insertLogisticsMarketplaceSchemaNew = createInsertSchema(logisticsMarketplace);

export type PartnerFacility = typeof partnerFacilities.$inferSelect;
export type InsertPartnerFacility = z.infer<typeof insertPartnerFacilitySchemaNew>;
export type LogisticsMarketplace = typeof logisticsMarketplace.$inferSelect;
export type InsertLogisticsMarketplace = z.infer<typeof insertLogisticsMarketplaceSchemaNew>;

// ========================
// COMMERCIAL MODULE SCHEMAS & TYPES
// ========================

// Commercial Applications
export const insertCommercialApplicationSchema = createInsertSchema(commercialApplications).omit({
  id: true,
  status: true,
  reviewedBy: true, 
  reviewedAt: true,
  rejectionReason: true,
  aiAnalysis: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommercialProfileSchema = createInsertSchema(commercialProfiles).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommercialExperienceSchema = createInsertSchema(commercialExperiences).omit({
  id: true,
  createdAt: true,
});

// Commercial Application Management Schemas
export const commercialApprovalSchema = z.object({
  subRole: z.enum(['agente', 'responsabile'], {
    required_error: "Il ruolo è obbligatorio",
  }),
  livello: z.enum(['base', 'medium', 'premium']).default('base'),
  grado: z.enum(['1', '2', '3']).default('1'),
  percentuale: z.string().regex(/^\d+\.\d{2}$/, "Formato percentuale non valido (es: 5.00)"),
  notes: z.string().optional(),
});

export const commercialRejectionSchema = z.object({
  rejectionReason: z.string().min(10, "La motivazione deve essere di almeno 10 caratteri"),
});

export type CommercialApplication = typeof commercialApplications.$inferSelect;
export type InsertCommercialApplication = z.infer<typeof insertCommercialApplicationSchema>;
export type CommercialProfile = typeof commercialProfiles.$inferSelect;
export type InsertCommercialProfile = z.infer<typeof insertCommercialProfileSchema>;
export type CommercialExperience = typeof commercialExperiences.$inferSelect;
export type InsertCommercialExperience = z.infer<typeof insertCommercialExperienceSchema>;
export type CommercialApproval = z.infer<typeof commercialApprovalSchema>;
export type CommercialRejection = z.infer<typeof commercialRejectionSchema>;

// ========================
// YCORE WALLET SYSTEM - MODULO PAGAMENTI E CREDITO VIRTUALE
// ========================

// Enum per tipologie di pagamento (definito sopra per riuso)
export const transactionTypeEnum = pgEnum("transaction_type", ["ricarica", "pagamento", "rimborso", "commissione", "prelievo", "accredito_commerciale"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed", "cancelled", "requires_confirmation"]);
export const bonificoStatusEnum = pgEnum("bonifico_status", ["pending", "under_review", "confirmed", "rejected", "expired"]);

// Wallet principale - credito virtuale per tutti gli utenti
export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Saldi
  creditoVirtuale: decimal("credito_virtuale", { precision: 12, scale: 2 }).notNull().default("0.00"),
  creditoBlocco: decimal("credito_blocco", { precision: 12, scale: 2 }).notNull().default("0.00"), // Per bonifici in attesa
  fidelityPoints: decimal("fidelity_points", { precision: 12, scale: 2 }).notNull().default("0.00"),
  
  // Configurazioni
  isActive: boolean("is_active").notNull().default(true),
  isBonificoEnabled: boolean("is_bonifico_enabled").notNull().default(true),
  maxDailyLimit: decimal("max_daily_limit", { precision: 12, scale: 2 }).default("1000.00"),
  
  // Audit
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("wallets_user_id_idx").on(table.userId),
  tenantIdIdx: index("wallets_tenant_id_idx").on(table.tenantId),
}));

// Transazioni - tutte le operazioni di pagamento/credito
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: uuid("wallet_id").references(() => wallets.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Dettagli transazione
  type: transactionTypeEnum("type").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  
  // Importi
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 12, scale: 2 }).default("0.00"), // Commissioni YCORE
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(),
  
  // Riferimenti esterni
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  bonificoId: uuid("bonifico_id").references(() => bonifici.id),
  orderId: uuid("order_id"), // Riferimento a ordini marketplace/servizi
  
  // Metadati
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON per dati aggiuntivi
  
  // Gestione errori
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  
  // Audit
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  walletIdIdx: index("transactions_wallet_id_idx").on(table.walletId),
  statusIdx: index("transactions_status_idx").on(table.status),
  typeIdx: index("transactions_type_idx").on(table.type),
  createdAtIdx: index("transactions_created_at_idx").on(table.createdAt),
}));

// Bonifici - gestione pagamenti bancari con conferma amministrativa
export const bonifici = pgTable("bonifici", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: uuid("wallet_id").references(() => wallets.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Dettagli bonifico
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  bankReference: text("bank_reference"), // Riferimento bancario fornito dall'utente
  description: text("description").notNull(),
  
  // Status e scadenze
  status: bonificoStatusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(), // Scadenza per conferma
  
  // Gestione amministrativa
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // File allegati
  receiptUrl: text("receipt_url"), // URL ricevuta bonifico caricata dall'utente
  adminNotesUrl: text("admin_notes_url"), // URL eventuali note admin
  
  // Notifiche e automazione
  reminderSent: boolean("reminder_sent").default(false),
  autoBlockDate: timestamp("auto_block_date"), // Data blocco automatico se non confermato
  
  // Audit
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  walletIdIdx: index("bonifici_wallet_id_idx").on(table.walletId),
  statusIdx: index("bonifici_status_idx").on(table.status),
  expiresAtIdx: index("bonifici_expires_at_idx").on(table.expiresAt),
  createdAtIdx: index("bonifici_created_at_idx").on(table.createdAt),
}));

// Commissioni YCORE per Fidelity Card
export const ycoreCommissions = pgTable("ycore_commissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: uuid("transaction_id").references(() => transactions.id, { onDelete: "cascade" }).notNull(),
  walletId: uuid("wallet_id").references(() => wallets.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Calcolo commissioni (modello attuale: €0,10 su €10,00, €0,20 su €20,00)
  spentAmount: decimal("spent_amount", { precision: 12, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull(), // Percentuale applicata
  
  // Categoria spesa (per analisi AI)
  spendingCategory: text("spending_category"), // marketplace, logistica, servizi, etc.
  
  // Previsioni AI
  aiPredictedNext: decimal("ai_predicted_next", { precision: 12, scale: 2 }), // Previsione prossimo guadagno
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }), // Confidenza previsione
  
  // Audit
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  transactionIdIdx: index("ycore_commissions_transaction_id_idx").on(table.transactionId),
  walletIdIdx: index("ycore_commissions_wallet_id_idx").on(table.walletId),
  createdAtIdx: index("ycore_commissions_created_at_idx").on(table.createdAt),
}));

// Richieste bonifico commerciali - per prelievo guadagni su conto corrente
export const commercialBonificoRequests = pgTable("commercial_bonifico_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  commercialId: uuid("commercial_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  walletId: uuid("wallet_id").references(() => wallets.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Dettagli richiesta
  requestedAmount: decimal("requested_amount", { precision: 12, scale: 2 }).notNull(),
  availableAmount: decimal("available_amount", { precision: 12, scale: 2 }).notNull(), // Saldo disponibile al momento richiesta
  
  // Dati bancari
  iban: text("iban").notNull(),
  bankName: text("bank_name").notNull(),
  accountHolder: text("account_holder").notNull(),
  
  // Status e gestione
  status: bonificoStatusEnum("status").notNull().default("pending"),
  processedBy: uuid("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  
  // AI pre-valutazione
  aiRiskScore: decimal("ai_risk_score", { precision: 5, scale: 2 }), // Score rischio 0-100
  aiRecommendation: text("ai_recommendation"), // Raccomandazione AI
  
  // Note e comunicazioni
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  
  // Audit
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  commercialIdIdx: index("commercial_bonifico_requests_commercial_id_idx").on(table.commercialId),
  statusIdx: index("commercial_bonifico_requests_status_idx").on(table.status),
  createdAtIdx: index("commercial_bonifico_requests_created_at_idx").on(table.createdAt),
}));

// Audit log transazioni - logging completo per sicurezza
export const transactionAuditLogs = pgTable("transaction_audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: uuid("transaction_id").references(() => transactions.id, { onDelete: "cascade" }),
  walletId: uuid("wallet_id").references(() => wallets.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  
  // Evento
  action: text("action").notNull(), // created, updated, cancelled, confirmed, etc.
  previousState: text("previous_state"), // JSON stato precedente
  newState: text("new_state"), // JSON nuovo stato
  
  // Contesto sicurezza
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  
  // AI anomalie
  aiAnomalyDetected: boolean("ai_anomaly_detected").default(false),
  aiAnomalyReason: text("ai_anomaly_reason"),
  aiRiskLevel: text("ai_risk_level"), // low, medium, high, critical
  
  // Admin override
  adminOverride: boolean("admin_override").default(false),
  adminOverrideReason: text("admin_override_reason"),
  adminUserId: uuid("admin_user_id").references(() => users.id),
  
  // Audit
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  transactionIdIdx: index("transaction_audit_logs_transaction_id_idx").on(table.transactionId),
  walletIdIdx: index("transaction_audit_logs_wallet_id_idx").on(table.walletId),
  userIdIdx: index("transaction_audit_logs_user_id_idx").on(table.userId),
  createdAtIdx: index("transaction_audit_logs_created_at_idx").on(table.createdAt),
  aiAnomalyIdx: index("transaction_audit_logs_ai_anomaly_idx").on(table.aiAnomalyDetected),
}));

// ========================
// YCORE WALLET SCHEMAS & TYPES
// ========================

// Wallet schemas
export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBonificoSchema = createInsertSchema(bonifici).omit({
  id: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommercialBonificoRequestSchema = createInsertSchema(commercialBonificoRequests).omit({
  id: true,
  processedBy: true,
  processedAt: true,
  aiRiskScore: true,
  aiRecommendation: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true,
});

// Wallet operation schemas for API
export const walletRechargeSchema = z.object({
  amount: z.string().regex(/^\d+\.\d{2}$/, "Formato importo non valido (es: 100.00)"),
  paymentMethod: z.enum(['stripe', 'bonifico']),
  description: z.string().min(5, "Descrizione richiesta"),
  bankReference: z.string().optional(), // Per bonifici
});

export const walletPaymentSchema = z.object({
  amount: z.string().regex(/^\d+\.\d{2}$/, "Formato importo non valido"),
  orderId: z.string().uuid().optional(),
  description: z.string().min(5, "Descrizione richiesta"),
  useCredito: z.boolean().default(true),
  useFidelity: z.boolean().default(false),
});

export const bonificoConfirmationSchema = z.object({
  bonificoId: z.string().uuid(),
  action: z.enum(['confirm', 'reject']),
  reviewNotes: z.string().min(10, "Note di revisione richieste"),
  receiptUrl: z.string().url().optional(),
});

export const commercialBonificoRequestSchema = z.object({
  requestedAmount: z.string().regex(/^\d+\.\d{2}$/, "Formato importo non valido"),
  iban: z.string().min(15, "IBAN non valido").max(34, "IBAN troppo lungo"),
  bankName: z.string().min(2, "Nome banca richiesto"),
  accountHolder: z.string().min(2, "Intestatario richiesto"),
  notes: z.string().optional(),
});

// AI Analysis schemas
export const aiTransactionAnalysisSchema = z.object({
  anomalyDetected: z.boolean(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  confidenceScore: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  recommendation: z.string(),
});

// Wallet stats for dashboard
export const walletStatsSchema = z.object({
  totalBalance: z.string(),
  monthlySpent: z.string(),
  fidelityEarned: z.string(),
  pendingTransactions: z.number(),
  pendingBonifici: z.number(),
});

// Types export
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Bonifico = typeof bonifici.$inferSelect;
export type InsertBonifico = z.infer<typeof insertBonificoSchema>;
export type YcoreCommission = typeof ycoreCommissions.$inferSelect;
export type CommercialBonificoRequest = typeof commercialBonificoRequests.$inferSelect;
export type InsertCommercialBonificoRequest = z.infer<typeof insertCommercialBonificoRequestSchema>;
export type TransactionAuditLog = typeof transactionAuditLogs.$inferSelect;

// ========================
// ADVANCED ZOD SCHEMAS - STRATEGICI CON LOGICHE AI
// ========================

// Schema transazioni con AI validation
export const transactionValidationSchema = z.object({
  userId: z.string().uuid(),
  amount: z.string()
    .regex(/^\d+\.\d{2}$/, "Formato importo non valido")
    .refine((val) => parseFloat(val) >= 0.01, "Importo minimo €0.01")
    .refine((val) => parseFloat(val) <= 10000.00, "Importo massimo €10,000"),
  method: z.enum(['stripe', 'bonifico', 'credito_virtuale', 'fidelity_card']),
  timestamp: z.string().datetime(),
  ipAddress: z.string().ip().optional(),
  // AI anomaly detection
  velocityCheck: z.boolean().default(true),
  patternAnalysis: z.boolean().default(true),
}).refine((data) => {
  // Logica AI: se importo > €1000 e metodo bonifico, richiede pattern analysis
  if (parseFloat(data.amount) > 1000 && data.method === 'bonifico') {
    return data.patternAnalysis === true;
  }
  return true;
}, "Transazioni bonifico >€1000 richiedono analisi pattern AI");

// Schema bonifici con scadenze AI
export const bonificoValidationSchema = z.object({
  walletId: z.string().uuid(),
  amount: z.string()
    .regex(/^\d+\.\d{2}$/, "Formato importo non valido")
    .refine((val) => parseFloat(val) >= 10.00, "Importo minimo bonifico €10.00")
    .refine((val) => parseFloat(val) <= 50000.00, "Importo massimo bonifico €50,000"),
  iban: z.string()
    .min(15, "IBAN troppo corto")
    .max(34, "IBAN troppo lungo")
    .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, "Formato IBAN non valido"),
  description: z.string().min(5, "Descrizione richiesta").max(200),
  scadenza: z.string().datetime(),
  bankReference: z.string().min(3).max(50).optional(),
  // AI pre-validation
  aiPreCheck: z.boolean().default(true),
  riskScore: z.number().min(0).max(100).optional(),
}).refine((data) => {
  // Logica AI: bonifici >€5000 richiedono pre-validazione
  if (parseFloat(data.amount) > 5000) {
    return data.aiPreCheck === true;
  }
  return true;
}, "Bonifici >€5000 richiedono pre-validazione AI");

// Schema Fidelity Card con limiti AI
export const fidelityCardValidationSchema = z.object({
  userId: z.string().uuid(),
  cardNumber: z.string().length(16, "Numero carta deve essere 16 cifre"),
  saldo: z.string()
    .regex(/^\d+\.\d{2}$/, "Formato saldo non valido")
    .refine((val) => parseFloat(val) >= 0, "Saldo non può essere negativo"),
  limiteGiornaliero: z.string()
    .regex(/^\d+\.\d{2}$/, "Formato limite non valido")
    .refine((val) => parseFloat(val) >= 10.00 && parseFloat(val) <= 2000.00, "Limite giornaliero tra €10-€2000"),
  tipo: z.enum(['standard', 'premium', 'commercial']),
  // AI spending patterns
  aiSpendingAnalysis: z.boolean().default(true),
  lastUsage: z.string().datetime().optional(),
}).refine((data) => {
  // Logica AI: card premium hanno limiti più alti
  if (data.tipo === 'premium' || data.tipo === 'commercial') {
    return parseFloat(data.limiteGiornaliero) >= 100.00;
  }
  return true;
}, "Card premium/commercial richiedono limite minimo €100");

// Schema richieste bonifico commerciali con AI
export const commercialBonificoValidationSchema = z.object({
  commercialId: z.string().uuid(),
  requestedAmount: z.string()
    .regex(/^\d+\.\d{2}$/, "Formato importo non valido")
    .refine((val) => parseFloat(val) >= 50.00, "Importo minimo richiesta €50.00")
    .refine((val) => parseFloat(val) <= 20000.00, "Importo massimo richiesta €20,000"),
  iban: z.string()
    .min(15, "IBAN troppo corto")
    .max(34, "IBAN troppo lungo")
    .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, "Formato IBAN non valido"),
  bankName: z.string().min(2, "Nome banca richiesto").max(100),
  accountHolder: z.string().min(2, "Intestatario richiesto").max(100),
  // Performance commerciale per AI
  monthlyEarnings: z.string().regex(/^\d+\.\d{2}$/).optional(),
  performanceScore: z.number().min(0).max(100).optional(),
  // AI risk assessment
  aiRiskAssessment: z.boolean().default(true),
  previousRequests: z.number().min(0).optional(),
}).refine((data) => {
  // Logica AI: commerciali con performance >80% hanno priorità
  if (data.performanceScore && data.performanceScore > 80) {
    return parseFloat(data.requestedAmount) <= 10000.00; // Limite più alto
  }
  return parseFloat(data.requestedAmount) <= 5000.00; // Limite standard
}, "Limite richiesta basato su performance commerciale");

// Schema abbonamenti con Fidelity Card
export const abbonamentoPagamentoSchema = z.object({
  userId: z.string().uuid(),
  planType: z.enum(['basic', 'premium', 'enterprise']),
  amount: z.string().regex(/^\d+\.\d{2}$/),
  paymentMethod: z.enum(['stripe', 'fidelity_card', 'credito_virtuale']),
  useCredito: z.boolean().default(false),
  useFidelity: z.boolean().default(false),
  autoRenewal: z.boolean().default(true),
  // AI upgrade suggestions
  aiUpgradeSuggestion: z.boolean().default(true),
}).refine((data) => {
  // Logica AI: se usa fidelity, deve avere saldo sufficiente
  if (data.useFidelity) {
    return data.paymentMethod === 'fidelity_card';
  }
  return true;
}, "Uso Fidelity richiede metodo fidelity_card");

// Schema commissioni YCORE con AI predictions
export const ycoreCommissionSchema = z.object({
  spentAmount: z.string().regex(/^\d+\.\d{2}$/),
  category: z.enum(['marketplace', 'logistica', 'servizi', 'abbonamenti']),
  userId: z.string().uuid(),
  // AI commission calculation
  standardRate: z.number().min(0.001).max(0.05).default(0.01), // 1%
  dynamicRate: z.number().min(0.001).max(0.05).optional(),
  // AI predictions
  aiPredictedNext: z.string().regex(/^\d+\.\d{2}$/).optional(),
  aiConfidence: z.number().min(0).max(100).optional(),
}).refine((data) => {
  // Logica AI: commissioni più basse per volumi alti
  const spent = parseFloat(data.spentAmount);
  if (spent > 1000 && data.dynamicRate) {
    return data.dynamicRate <= 0.008; // 0.8% per volumi >€1000
  }
  return true;
}, "Commissioni dinamiche per volumi elevati");

// Schema audit logging con AI anomaly
export const auditLogSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['transaction', 'bonifico', 'fidelity_usage', 'commercial_request', 'admin_action']),
  details: z.object({
    amount: z.string().regex(/^\d+\.\d{2}$/).optional(),
    method: z.string().optional(),
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().optional(),
  }),
  // AI anomaly detection
  aiAnomalyDetected: z.boolean().default(false),
  aiRiskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  aiReasons: z.array(z.string()).optional(),
  timestamp: z.string().datetime(),
}).refine((data) => {
  // Logica AI: anomalie high/critical richiedono dettagli
  if (data.aiAnomalyDetected && (data.aiRiskLevel === 'high' || data.aiRiskLevel === 'critical')) {
    return data.aiReasons && data.aiReasons.length > 0;
  }
  return true;
}, "Anomalie critiche richiedono spiegazione AI");

// API schemas types STRATEGICI
export type TransactionValidation = z.infer<typeof transactionValidationSchema>;
export type BonificoValidation = z.infer<typeof bonificoValidationSchema>;
export type FidelityCardValidation = z.infer<typeof fidelityCardValidationSchema>;
export type CommercialBonificoValidation = z.infer<typeof commercialBonificoValidationSchema>;
export type AbbonamentoPagamento = z.infer<typeof abbonamentoPagamentoSchema>;
export type YcoreCommission = z.infer<typeof ycoreCommissionSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;

// Legacy API schemas types (mantenuti per compatibilità)
export type WalletRecharge = z.infer<typeof walletRechargeSchema>;
export type WalletPayment = z.infer<typeof walletPaymentSchema>;
export type BonificoConfirmation = z.infer<typeof bonificoConfirmationSchema>;
export type CommercialBonificoRequestData = z.infer<typeof commercialBonificoRequestSchema>;
export type AiTransactionAnalysis = z.infer<typeof aiTransactionAnalysisSchema>;
export type WalletStats = z.infer<typeof walletStatsSchema>;
