import { 
  users, clients, tenants, courierModules, shipments, invoices, corrections, commissions, aiRoutingLogs,
  platformConnections, platformWebhooks, shipmentTracking, returns, storageItems, 
  csmTickets, csmKpi, tsmTickets, auditLogs, escalations, notifications,
  fraudFlags, courierAssignments, deliveryStatus,
  ecommerceCustomers, products, ecommerceOrders, orderItems, marketplaceIntegrations,
  marketplaceCategories, marketplaceListings, marketplaceVisibility, marketplaceOrders, 
  marketplaceOrderItems, marketplaceReviews,
  fidelitySettings, fidelityCards, fidelityWallets, fidelityWalletTransactions, fidelityOffers,
  fidelityRedemptions, sponsors, promoterProfiles, promoterKpis, fidelityAiProfiles, fidelityAiLogs,
  riskClusters, patternFlags,
  type User, type InsertUser, type Client, type InsertClient, type Tenant, type InsertTenant,
  type CourierModule, type InsertCourierModule, type Shipment, type InsertShipment,
  type Invoice, type InsertInvoice, type Correction, type InsertCorrection,
  type Commission, type InsertCommission, type AiRoutingLog, type InsertAiRoutingLog,
  type PlatformConnection, type InsertPlatformConnection, type PlatformWebhook, type InsertPlatformWebhook,
  type ShipmentTracking, type InsertShipmentTracking, type Return, type InsertReturn,
  type StorageItem, type InsertStorageItem, type CsmTicket, type InsertCsmTicket,
  type CsmKpi, type InsertCsmKpi, type TsmTicket, type InsertTsmTicket,
  type AuditLog, type InsertAuditLog, type Escalation, type InsertEscalation,
  type Notification, type InsertNotification, type EcommerceCustomer, type InsertEcommerceCustomer,
  type Product, type InsertProduct, type EcommerceOrder, type InsertEcommerceOrder,
  type OrderItem, type InsertOrderItem, type MarketplaceIntegration, type InsertMarketplaceIntegration,
  type MarketplaceCategory, type InsertMarketplaceCategory, type MarketplaceListing, type InsertMarketplaceListing,
  type MarketplaceVisibility, type InsertMarketplaceVisibility, type MarketplaceOrder, type InsertMarketplaceOrder,
  type MarketplaceOrderItem, type InsertMarketplaceOrderItem, type MarketplaceReview, type InsertMarketplaceReview,
  type FidelitySettings, type InsertFidelitySettings, type FidelityCard, type InsertFidelityCard,
  type FidelityWallet, type InsertFidelityWallet, type FidelityWalletTransaction, type InsertFidelityWalletTransaction,
  type FidelityOffer, type InsertFidelityOffer, type FidelityRedemption, type InsertFidelityRedemption,
  type Sponsor, type InsertSponsor, type PromoterProfile, type InsertPromoterProfile,
  type PromoterKpi, type InsertPromoterKpi, type FidelityAiProfile, type InsertFidelityAiProfile,
  type FidelityAiLog, type InsertFidelityAiLog,
  // Marketplace Professionisti Digitali types
  professionalProfiles, clientProjects, projectBids, marketplaceContracts, projectMilestones,
  marketplaceChatMessages, marketplaceDisputes, professionalRatings, marketplaceCommissions, antiDisintermediationLogs,
  type ProfessionalProfile, type InsertProfessionalProfile, type ClientProject, type InsertClientProject,
  type ProjectBid, type InsertProjectBid, type MarketplaceContract, type InsertMarketplaceContract,
  type ProjectMilestone, type InsertProjectMilestone, type MarketplaceChatMessage, type InsertMarketplaceChatMessage,
  type MarketplaceDispute, type InsertMarketplaceDispute, type ProfessionalRating, type InsertProfessionalRating,
  type MarketplaceCommission, type InsertMarketplaceCommission, type AntiDisintermediationLog, type InsertAntiDisintermediationLog,
  // Shipments module types
  type FraudFlag, type InsertFraudFlag, type CourierAssignment, type InsertCourierAssignment,
  type DeliveryStatus, type InsertDeliveryStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, not, desc, sql, isNull } from "drizzle-orm";
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
  getShipmentsByTenant(tenantId: string): Promise<Shipment[]>;
  getTodayShipments(tenantId: string): Promise<number>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment>;
  
  // Shipments Module - Core logistics operations
  assignCourierToShipment(shipmentId: string, courierId: string, courierModuleId: string, tenantId: string): Promise<CourierAssignment>;
  updateShipmentStatus(shipmentId: string, status: string, tenantId: string): Promise<Shipment>;
  flagShipmentAnomaly(shipmentId: string, flagType: string, severity: string, description: string, evidence: any, tenantId: string): Promise<FraudFlag>;
  getShipmentTimeline(shipmentId: string): Promise<{
    shipment: Shipment;
    tracking: ShipmentTracking[];
    assignment?: CourierAssignment;
    fraudFlags: FraudFlag[];
  }>;
  updateDeliveryStatus(shipmentId: string, status: string, notes?: string, tenantId?: string): Promise<DeliveryStatus>;

  // AI Antifraud Pattern Detection - Milestone 2
  getRiskClustersByTenant(tenantId: string): Promise<RiskCluster[]>;
  createRiskCluster(cluster: InsertRiskCluster): Promise<RiskCluster>;
  updateRiskCluster(id: string, updates: Partial<InsertRiskCluster>): Promise<RiskCluster>;
  getPatternFlagsByTenant(tenantId: string, filters?: {
    userId?: string;
    moduleSource?: string;
    patternType?: string;
    severity?: string;
  }): Promise<PatternFlag[]>;
  createPatternFlag(flag: InsertPatternFlag): Promise<PatternFlag>;
  detectPatterns(userId: string, tenantId: string, eventData: {
    moduleSource: string;
    eventType: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    additionalData?: Record<string, any>;
  }): Promise<{
    patterns: PatternFlag[];
    riskScore: number;
    recommendations: string[];
  }>;
  
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

  // ======== ECOMMERCE MODULE METHODS ========
  
  // eCommerce Customers
  getEcommerceCustomer(id: string): Promise<EcommerceCustomer | undefined>;
  getEcommerceCustomerByEmail(email: string, tenantId: string): Promise<EcommerceCustomer | undefined>;
  getEcommerceCustomersByTenant(tenantId: string): Promise<EcommerceCustomer[]>;
  createEcommerceCustomer(customer: InsertEcommerceCustomer): Promise<EcommerceCustomer>;
  updateEcommerceCustomer(id: string, updates: Partial<EcommerceCustomer>): Promise<EcommerceCustomer>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string, tenantId: string): Promise<Product | undefined>;
  getProductsByTenant(tenantId: string): Promise<Product[]>;
  getProductsByCategory(category: string, tenantId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;

  // eCommerce Orders
  getEcommerceOrder(id: string): Promise<EcommerceOrder | undefined>;
  getEcommerceOrdersByTenant(tenantId: string): Promise<EcommerceOrder[]>;
  getEcommerceOrdersByCustomer(customerId: string): Promise<EcommerceOrder[]>;
  getEcommerceOrdersByStatus(status: string, tenantId: string): Promise<EcommerceOrder[]>;
  createEcommerceOrder(order: InsertEcommerceOrder): Promise<EcommerceOrder>;
  updateEcommerceOrder(id: string, updates: Partial<EcommerceOrder>): Promise<EcommerceOrder>;

  // Order Items
  getOrderItem(id: string): Promise<OrderItem | undefined>;
  getOrderItemsByOrder(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: string, updates: Partial<OrderItem>): Promise<OrderItem>;

  // Marketplace Integrations
  getMarketplaceIntegration(id: string): Promise<MarketplaceIntegration | undefined>;
  getMarketplaceIntegrationsByTenant(tenantId: string): Promise<MarketplaceIntegration[]>;
  getMarketplaceIntegrationsByType(type: string, tenantId: string): Promise<MarketplaceIntegration[]>;
  createMarketplaceIntegration(integration: InsertMarketplaceIntegration): Promise<MarketplaceIntegration>;
  updateMarketplaceIntegration(id: string, updates: Partial<MarketplaceIntegration>): Promise<MarketplaceIntegration>;

  // eCommerce Dashboard Stats
  getEcommerceDashboardStats(tenantId: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    totalCustomers: number;
    monthlyRevenue: number;
    topProducts: Array<{id: string; name: string; sales: number}>;
  }>;

  // ======== FIDELITY CARD MODULE METHODS ========

  // Fidelity Settings
  getFidelitySettings(tenantId: string): Promise<FidelitySettings | undefined>;
  createFidelitySettings(settings: InsertFidelitySettings): Promise<FidelitySettings>;
  updateFidelitySettings(tenantId: string, updates: Partial<FidelitySettings>): Promise<FidelitySettings>;

  // Fidelity Cards
  getFidelityCard(id: string): Promise<FidelityCard | undefined>;
  getFidelityCardByCode(code: string, tenantId: string): Promise<FidelityCard | undefined>;
  getFidelityCardByCustomer(customerId: string, tenantId: string): Promise<FidelityCard | undefined>;
  getFidelityCardsByTenant(tenantId: string): Promise<FidelityCard[]>;
  createFidelityCard(card: InsertFidelityCard): Promise<FidelityCard>;
  updateFidelityCard(id: string, updates: Partial<FidelityCard>): Promise<FidelityCard>;

  // Fidelity Wallets
  getFidelityWallet(id: string): Promise<FidelityWallet | undefined>;
  getFidelityWalletByCard(cardId: string): Promise<FidelityWallet | undefined>;
  createFidelityWallet(wallet: InsertFidelityWallet): Promise<FidelityWallet>;
  updateFidelityWallet(id: string, updates: Partial<FidelityWallet>): Promise<FidelityWallet>;

  // Fidelity Wallet Transactions
  getFidelityWalletTransaction(id: string): Promise<FidelityWalletTransaction | undefined>;
  getFidelityWalletTransactionsByCard(cardId: string): Promise<FidelityWalletTransaction[]>;
  getFidelityWalletTransactionsByWallet(walletId: string): Promise<FidelityWalletTransaction[]>;
  createFidelityWalletTransaction(transaction: InsertFidelityWalletTransaction): Promise<FidelityWalletTransaction>;

  // Fidelity Offers
  getFidelityOffer(id: string): Promise<FidelityOffer | undefined>;
  getFidelityOffersByTenant(tenantId: string): Promise<FidelityOffer[]>;
  getFidelityOffersByMerchant(merchantId: string, tenantId: string): Promise<FidelityOffer[]>;
  getFidelityActiveOffers(tenantId: string, geofence?: any): Promise<FidelityOffer[]>;
  createFidelityOffer(offer: InsertFidelityOffer): Promise<FidelityOffer>;
  updateFidelityOffer(id: string, updates: Partial<FidelityOffer>): Promise<FidelityOffer>;

  // Fidelity Redemptions
  getFidelityRedemption(id: string): Promise<FidelityRedemption | undefined>;
  getFidelityRedemptionsByCard(cardId: string): Promise<FidelityRedemption[]>;
  getFidelityRedemptionsByTenant(tenantId: string): Promise<FidelityRedemption[]>;
  getFidelityRedemptionsByMerchant(merchantId: string, tenantId: string): Promise<FidelityRedemption[]>;
  createFidelityRedemption(redemption: InsertFidelityRedemption): Promise<FidelityRedemption>;
  updateFidelityRedemption(id: string, updates: Partial<FidelityRedemption>): Promise<FidelityRedemption>;

  // Sponsors
  getSponsor(id: string): Promise<Sponsor | undefined>;
  getSponsorsByTenant(tenantId: string): Promise<Sponsor[]>;
  getActiveSponsor(tenantId?: string): Promise<Sponsor | undefined>;
  createSponsor(sponsor: InsertSponsor): Promise<Sponsor>;
  updateSponsor(id: string, updates: Partial<Sponsor>): Promise<Sponsor>;

  // Promoter Profiles
  getPromoterProfile(id: string): Promise<PromoterProfile | undefined>;
  getPromoterProfileByUser(userId: string, tenantId: string): Promise<PromoterProfile | undefined>;
  getPromoterProfilesByTenant(tenantId: string): Promise<PromoterProfile[]>;
  getPromoterProfilesByArea(area: any, tenantId: string): Promise<PromoterProfile[]>;
  createPromoterProfile(profile: InsertPromoterProfile): Promise<PromoterProfile>;
  updatePromoterProfile(id: string, updates: Partial<PromoterProfile>): Promise<PromoterProfile>;

  // Promoter KPIs
  getPromoterKpi(id: string): Promise<PromoterKpi | undefined>;
  getPromoterKpisByPromoter(promoterId: string): Promise<PromoterKpi[]>;
  getPromoterKpisByPeriod(promoterId: string, period: string): Promise<PromoterKpi | undefined>;
  createPromoterKpi(kpi: InsertPromoterKpi): Promise<PromoterKpi>;
  updatePromoterKpi(id: string, updates: Partial<PromoterKpi>): Promise<PromoterKpi>;

  // Fidelity AI Profiles
  getFidelityAiProfile(id: string): Promise<FidelityAiProfile | undefined>;
  getFidelityAiProfileByCard(cardId: string): Promise<FidelityAiProfile | undefined>;
  createFidelityAiProfile(profile: InsertFidelityAiProfile): Promise<FidelityAiProfile>;
  updateFidelityAiProfile(id: string, updates: Partial<FidelityAiProfile>): Promise<FidelityAiProfile>;

  // Fidelity AI Logs
  getFidelityAiLog(id: string): Promise<FidelityAiLog | undefined>;
  getFidelityAiLogsByTenant(tenantId: string): Promise<FidelityAiLog[]>;
  getFidelityAiLogsByEntity(entityId: string, entityType: string): Promise<FidelityAiLog[]>;
  createFidelityAiLog(log: InsertFidelityAiLog): Promise<FidelityAiLog>;

  // Fidelity Dashboard Stats
  getFidelityDashboardStats(tenantId: string): Promise<{
    totalCards: number;
    activeCards: number;
    totalOffers: number;
    activeOffers: number;
    totalRedemptions: number;
    monthlyRedemptions: number;
    totalCashback: number;
    activeSponsors: number;
    topMerchants: Array<{id: string; name: string; redemptions: number}>;
    promoterStats: Array<{id: string; name: string; cardsDistributed: number; conversions: number}>;
  }>;

  // Marketplace Professionisti Digitali
  // Professional Profiles
  getProfessionalProfile(id: string): Promise<ProfessionalProfile | undefined>;
  getProfessionalProfileByUser(userId: string, tenantId: string): Promise<ProfessionalProfile | undefined>;
  getProfessionalProfilesByTenant(tenantId: string): Promise<ProfessionalProfile[]>;
  getProfessionalProfilesByCategory(category: string, tenantId: string): Promise<ProfessionalProfile[]>;
  searchProfessionalProfiles(tenantId: string, filters: {
    category?: string;
    skills?: string[];
    rating?: number;
    isAvailable?: boolean;
    search?: string;
  }): Promise<ProfessionalProfile[]>;
  createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile>;
  updateProfessionalProfile(id: string, updates: Partial<ProfessionalProfile>): Promise<ProfessionalProfile>;
  deleteProfessionalProfile(id: string, tenantId: string): Promise<void>;

  // Client Projects
  getClientProject(id: string): Promise<ClientProject | undefined>;
  getClientProjectsByClient(clientId: string): Promise<ClientProject[]>;
  getClientProjectsByTenant(tenantId: string): Promise<ClientProject[]>;
  getPublishedProjects(tenantId: string, filters?: {
    category?: string;
    budget?: {min?: number; max?: number};
    deadline?: Date;
  }): Promise<ClientProject[]>;
  createClientProject(project: InsertClientProject): Promise<ClientProject>;
  updateClientProject(id: string, updates: Partial<ClientProject>): Promise<ClientProject>;
  deleteClientProject(id: string, tenantId: string): Promise<void>;

  // Project Bids
  getProjectBid(id: string): Promise<ProjectBid | undefined>;
  getProjectBidsByProject(projectId: string): Promise<ProjectBid[]>;
  getProjectBidsByProfessional(professionalId: string): Promise<ProjectBid[]>;
  createProjectBid(bid: InsertProjectBid): Promise<ProjectBid>;
  updateProjectBid(id: string, updates: Partial<ProjectBid>): Promise<ProjectBid>;
  deleteProjectBid(id: string, tenantId: string): Promise<void>;

  // Marketplace Contracts
  getMarketplaceContract(id: string): Promise<MarketplaceContract | undefined>;
  getMarketplaceContractsByClient(clientId: string): Promise<MarketplaceContract[]>;
  getMarketplaceContractsByProfessional(professionalId: string): Promise<MarketplaceContract[]>;
  getMarketplaceContractsByTenant(tenantId: string): Promise<MarketplaceContract[]>;
  createMarketplaceContract(contract: InsertMarketplaceContract): Promise<MarketplaceContract>;
  updateMarketplaceContract(id: string, updates: Partial<MarketplaceContract>): Promise<MarketplaceContract>;
  deleteMarketplaceContract(id: string, tenantId: string): Promise<void>;

  // Project Milestones
  getProjectMilestone(id: string): Promise<ProjectMilestone | undefined>;
  getProjectMilestonesByContract(contractId: string): Promise<ProjectMilestone[]>;
  getPendingMilestones(tenantId: string): Promise<ProjectMilestone[]>;
  createProjectMilestone(milestone: InsertProjectMilestone): Promise<ProjectMilestone>;
  updateProjectMilestone(id: string, updates: Partial<ProjectMilestone>): Promise<ProjectMilestone>;
  deleteProjectMilestone(id: string, tenantId: string): Promise<void>;

  // Marketplace Chat Messages
  getMarketplaceChatMessage(id: string): Promise<MarketplaceChatMessage | undefined>;
  getMarketplaceChatMessagesByContract(contractId: string): Promise<MarketplaceChatMessage[]>;
  createMarketplaceChatMessage(message: InsertMarketplaceChatMessage): Promise<MarketplaceChatMessage>;
  deleteMarketplaceChatMessage(id: string, tenantId: string): Promise<void>;
  markMessagesAsRead(contractId: string, userId: string): Promise<void>;

  // Marketplace Disputes
  getMarketplaceDispute(id: string): Promise<MarketplaceDispute | undefined>;
  getMarketplaceDisputesByTenant(tenantId: string): Promise<MarketplaceDispute[]>;
  getMarketplaceDisputesByContract(contractId: string): Promise<MarketplaceDispute[]>;
  createMarketplaceDispute(dispute: InsertMarketplaceDispute): Promise<MarketplaceDispute>;
  updateMarketplaceDispute(id: string, updates: Partial<MarketplaceDispute>): Promise<MarketplaceDispute>;
  deleteMarketplaceDispute(id: string, tenantId: string): Promise<void>;

  // Professional Ratings
  getProfessionalRating(id: string): Promise<ProfessionalRating | undefined>;
  getProfessionalRatingsByProfessional(professionalId: string): Promise<ProfessionalRating[]>;
  createProfessionalRating(rating: InsertProfessionalRating): Promise<ProfessionalRating>;
  deleteProfessionalRating(id: string, tenantId: string): Promise<void>;

  // Marketplace Commissions
  getMarketplaceCommission(id: string): Promise<MarketplaceCommission | undefined>;
  getMarketplaceCommissionsByProfessional(professionalId: string): Promise<MarketplaceCommission[]>;
  getMarketplaceCommissionsByTenant(tenantId: string): Promise<MarketplaceCommission[]>;
  createMarketplaceCommission(commission: InsertMarketplaceCommission): Promise<MarketplaceCommission>;
  updateMarketplaceCommission(id: string, updates: Partial<MarketplaceCommission>): Promise<MarketplaceCommission>;
  deleteMarketplaceCommission(id: string, tenantId: string): Promise<void>;

  // Anti-Disintermediation Logs
  getAntiDisintermediationLog(id: string): Promise<AntiDisintermediationLog | undefined>;
  getAntiDisintermediationLogsByTenant(tenantId: string): Promise<AntiDisintermediationLog[]>;
  createAntiDisintermediationLog(log: InsertAntiDisintermediationLog): Promise<AntiDisintermediationLog>;
  deleteAntiDisintermediationLog(id: string, tenantId: string): Promise<void>;

  // AI Antifrode Methods - Simplified
  calculateUserRiskScore(userId: string, tenantId: string): Promise<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    recommendations: string[];
  }>;
  executeAutomatedResponse(userId: string, tenantId: string, riskLevel: 'low' | 'medium' | 'high' | 'critical'): Promise<{
    action: string;
    applied: boolean;
    details: string;
  }>;

  // Marketplace Dashboard & Analytics
  getMarketplaceDashboardStats(tenantId: string): Promise<{
    totalProfessionals: number;
    activeProfessionals: number;
    totalProjects: number;
    activeProjects: number;
    totalContracts: number;
    completedContracts: number;
    totalCommissions: number;
    monthlyRevenue: number;
    topProfessionals: Array<{id: string; name: string; rating: number; completedProjects: number}>;
    categoryStats: Array<{category: string; professionals: number; projects: number; avgBudget: number}>;
  }>;

  // AI Matching & Suggestions
  getMatchingProfessionalsForProject(projectId: string): Promise<Array<{
    professional: ProfessionalProfile;
    matchScore: number;
    reasons: string[];
  }>>;
  getSuggestedProjectsForProfessional(professionalId: string): Promise<Array<{
    project: ClientProject;
    matchScore: number;
    reasons: string[];
  }>>;
  
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

  async getCourierModuleByCode(code: string): Promise<CourierModule | undefined> {
    const [module] = await db.select().from(courierModules).where(eq(courierModules.code, code));
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

  async getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.trackingNumber, trackingNumber));
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

  async getCsmTicketsByTenant(tenantId: string): Promise<CsmTicket[]> {
    // Get tickets that have clientId and belong to the tenant
    const ticketsWithClient = await db.select({ ticket: csmTickets })
      .from(csmTickets)
      .innerJoin(clients, eq(csmTickets.clientId, clients.id))
      .where(eq(clients.tenantId, tenantId))
      .then(rows => rows.map(row => row.ticket));
    
    // Get tickets without clientId (general support tickets for the tenant user)
    const ticketsWithoutClient = await db.select()
      .from(csmTickets)
      .where(and(
        isNull(csmTickets.clientId),
        // For now, return all clientId=null tickets - in production you'd filter by user
        eq(sql`1`, 1) 
      ));
    
    return [...ticketsWithClient, ...ticketsWithoutClient];
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

  async getTsmTicketsByTenant(tenantId: string): Promise<TsmTicket[]> {
    // Get tickets that have clientId and belong to the tenant
    const ticketsWithClient = await db.select({ ticket: tsmTickets })
      .from(tsmTickets)
      .innerJoin(clients, eq(tsmTickets.clientId, clients.id))
      .where(eq(clients.tenantId, tenantId))
      .then(rows => rows.map(row => row.ticket));
    
    // Get tickets without clientId (general support tickets for the tenant user)
    const ticketsWithoutClient = await db.select()
      .from(tsmTickets)
      .where(and(
        isNull(tsmTickets.clientId),
        // For now, return all clientId=null tickets - in production you'd filter by user
        eq(sql`1`, 1)
      ));
    
    return [...ticketsWithClient, ...ticketsWithoutClient];
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

  async getNotificationsByRecipient(recipientId: string, isRead?: boolean, limit?: number): Promise<Notification[]> {
    const query = db.select().from(notifications)
      .where(isRead !== undefined ? 
        and(eq(notifications.recipientId, recipientId), eq(notifications.isRead, isRead)) :
        eq(notifications.recipientId, recipientId)
      )
      .orderBy(desc(notifications.createdAt));
      
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
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

  // ======== ECOMMERCE MODULE IMPLEMENTATION ========

  // eCommerce Customers
  async getEcommerceCustomer(id: string): Promise<EcommerceCustomer | undefined> {
    const [customer] = await db.select().from(ecommerceCustomers).where(eq(ecommerceCustomers.id, id));
    return customer || undefined;
  }

  async getEcommerceCustomerByEmail(email: string, tenantId: string): Promise<EcommerceCustomer | undefined> {
    const [customer] = await db.select().from(ecommerceCustomers)
      .where(and(eq(ecommerceCustomers.email, email), eq(ecommerceCustomers.tenantId, tenantId)));
    return customer || undefined;
  }

  async getEcommerceCustomersByTenant(tenantId: string): Promise<EcommerceCustomer[]> {
    return db.select().from(ecommerceCustomers).where(eq(ecommerceCustomers.tenantId, tenantId));
  }

  async createEcommerceCustomer(customer: InsertEcommerceCustomer): Promise<EcommerceCustomer> {
    const [created] = await db.insert(ecommerceCustomers).values(customer).returning();
    return created;
  }

  async updateEcommerceCustomer(id: string, updates: Partial<EcommerceCustomer>): Promise<EcommerceCustomer> {
    const [updated] = await db.update(ecommerceCustomers).set(updates).where(eq(ecommerceCustomers.id, id)).returning();
    return updated;
  }

  // Products  
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductBySku(sku: string, tenantId: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products)
      .where(and(eq(products.sku, sku), eq(products.tenantId, tenantId)));
    return product || undefined;
  }

  async getProductsByTenant(tenantId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.tenantId, tenantId));
  }

  async getProductsByCategory(category: string, tenantId: string): Promise<Product[]> {
    return db.select().from(products)
      .where(and(eq(products.category, category), eq(products.tenantId, tenantId)));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const [updated] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return updated;
  }

  // eCommerce Orders
  async getEcommerceOrder(id: string): Promise<EcommerceOrder | undefined> {
    const [order] = await db.select().from(ecommerceOrders).where(eq(ecommerceOrders.id, id));
    return order || undefined;
  }

  async getEcommerceOrdersByTenant(tenantId: string): Promise<EcommerceOrder[]> {
    return db.select().from(ecommerceOrders).where(eq(ecommerceOrders.tenantId, tenantId));
  }

  async getEcommerceOrdersByCustomer(customerId: string): Promise<EcommerceOrder[]> {
    return db.select().from(ecommerceOrders).where(eq(ecommerceOrders.customerId, customerId));
  }

  async getEcommerceOrdersByStatus(status: string, tenantId: string): Promise<EcommerceOrder[]> {
    return db.select().from(ecommerceOrders)
      .where(and(eq(ecommerceOrders.status, status as any), eq(ecommerceOrders.tenantId, tenantId)));
  }

  async createEcommerceOrder(order: InsertEcommerceOrder): Promise<EcommerceOrder> {
    const [created] = await db.insert(ecommerceOrders).values(order).returning();
    return created;
  }

  async updateEcommerceOrder(id: string, updates: Partial<EcommerceOrder>): Promise<EcommerceOrder> {
    const [updated] = await db.update(ecommerceOrders).set(updates).where(eq(ecommerceOrders.id, id)).returning();
    return updated;
  }

  // Order Items
  async getOrderItem(id: string): Promise<OrderItem | undefined> {
    const [item] = await db.select().from(orderItems).where(eq(orderItems.id, id));
    return item || undefined;
  }

  async getOrderItemsByOrder(orderId: string): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(orderItems).values(item).returning();
    return created;
  }

  async updateOrderItem(id: string, updates: Partial<OrderItem>): Promise<OrderItem> {
    const [updated] = await db.update(orderItems).set(updates).where(eq(orderItems.id, id)).returning();
    return updated;
  }

  // Marketplace Integrations
  async getMarketplaceIntegration(id: string): Promise<MarketplaceIntegration | undefined> {
    const [integration] = await db.select().from(marketplaceIntegrations).where(eq(marketplaceIntegrations.id, id));
    return integration || undefined;
  }

  async getMarketplaceIntegrationsByTenant(tenantId: string): Promise<MarketplaceIntegration[]> {
    return db.select().from(marketplaceIntegrations).where(eq(marketplaceIntegrations.tenantId, tenantId));
  }

  async getMarketplaceIntegrationsByType(type: string, tenantId: string): Promise<MarketplaceIntegration[]> {
    return db.select().from(marketplaceIntegrations)
      .where(and(eq(marketplaceIntegrations.type, type), eq(marketplaceIntegrations.tenantId, tenantId)));
  }

  async createMarketplaceIntegration(integration: InsertMarketplaceIntegration): Promise<MarketplaceIntegration> {
    const [created] = await db.insert(marketplaceIntegrations).values(integration).returning();
    return created;
  }

  async updateMarketplaceIntegration(id: string, updates: Partial<MarketplaceIntegration>): Promise<MarketplaceIntegration> {
    const [updated] = await db.update(marketplaceIntegrations).set(updates).where(eq(marketplaceIntegrations.id, id)).returning();
    return updated;
  }

  // eCommerce Dashboard Stats
  async getEcommerceDashboardStats(tenantId: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    totalCustomers: number;
    monthlyRevenue: number;
    topProducts: Array<{id: string; name: string; sales: number}>;
  }> {
    // Total orders
    const [totalOrdersResult] = await db.select({ count: sql`count(*)` })
      .from(ecommerceOrders)
      .where(eq(ecommerceOrders.tenantId, tenantId));

    // Pending orders
    const [pendingOrdersResult] = await db.select({ count: sql`count(*)` })
      .from(ecommerceOrders)
      .where(and(eq(ecommerceOrders.tenantId, tenantId), eq(ecommerceOrders.status, "pending" as any)));

    // Total products
    const [totalProductsResult] = await db.select({ count: sql`count(*)` })
      .from(products)
      .where(eq(products.tenantId, tenantId));

    // Total customers
    const [totalCustomersResult] = await db.select({ count: sql`count(*)` })
      .from(ecommerceCustomers)
      .where(eq(ecommerceCustomers.tenantId, tenantId));

    // Monthly revenue (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [monthlyRevenueResult] = await db.select({ revenue: sql`COALESCE(sum(total_amount), 0)` })
      .from(ecommerceOrders)
      .where(and(
        eq(ecommerceOrders.tenantId, tenantId),
        sql`${ecommerceOrders.orderDate} >= ${startOfMonth}`
      ));

    // Top products by sales quantity
    const topProductsResults = await db.select({
      id: products.id,
      name: products.name,
      sales: sql`COALESCE(sum(${orderItems.quantity}), 0)`
    })
    .from(products)
    .leftJoin(orderItems, eq(products.id, orderItems.productId))
    .where(eq(products.tenantId, tenantId))
    .groupBy(products.id, products.name)
    .orderBy(desc(sql`COALESCE(sum(${orderItems.quantity}), 0)`))
    .limit(5);

    return {
      totalOrders: parseInt(String(totalOrdersResult?.count || 0)),
      pendingOrders: parseInt(String(pendingOrdersResult?.count || 0)),
      totalProducts: parseInt(String(totalProductsResult?.count || 0)),
      totalCustomers: parseInt(String(totalCustomersResult?.count || 0)),
      monthlyRevenue: parseFloat(String(monthlyRevenueResult?.revenue || 0)),
      topProducts: topProductsResults.map(p => ({
        id: p.id,
        name: p.name,
        sales: parseInt(String(p.sales))
      }))
    };
  }

  // ======== MARKETPLACE MODULE IMPLEMENTATION ========

  // Marketplace Categories
  async getMarketplaceCategories(tenantId?: string): Promise<MarketplaceCategory[]> {
    if (tenantId) {
      return db.select().from(marketplaceCategories).where(eq(marketplaceCategories.tenantId, tenantId));
    }
    return db.select().from(marketplaceCategories).where(eq(marketplaceCategories.isActive, true));
  }

  async getMarketplaceCategory(id: string): Promise<MarketplaceCategory | undefined> {
    const [category] = await db.select().from(marketplaceCategories).where(eq(marketplaceCategories.id, id));
    return category || undefined;
  }

  async createMarketplaceCategory(category: InsertMarketplaceCategory): Promise<MarketplaceCategory> {
    const [created] = await db.insert(marketplaceCategories).values(category).returning();
    return created;
  }

  async updateMarketplaceCategory(id: string, updates: Partial<MarketplaceCategory>): Promise<MarketplaceCategory> {
    const [updated] = await db.update(marketplaceCategories).set(updates).where(eq(marketplaceCategories.id, id)).returning();
    return updated;
  }

  // Marketplace Listings with Security Controls
  async getMarketplaceListings(viewerTenantId: string, viewerRole: string, categoryId?: string): Promise<MarketplaceListing[]> {
    const conditions = [
      eq(marketplaceListings.status, "active"),
      or(
        eq(marketplaceListings.visibility, "public"),
        eq(marketplaceListings.sellerTenantId, viewerTenantId), // Own tenant listings
        sql`${marketplaceListings.allowedTenantIds} @> ARRAY[${viewerTenantId}]`, // Explicitly allowed
        sql`${marketplaceListings.allowedRoles} @> ARRAY[${viewerRole}]` // Role-based access
      ),
      not(sql`${marketplaceListings.blockedTenantIds} @> ARRAY[${viewerTenantId}]`) // Not blocked
    ];

    if (categoryId) {
      conditions.push(eq(marketplaceListings.categoryId, categoryId));
    }

    const query = db.select().from(marketplaceListings).where(and(...conditions));

    return query.orderBy(desc(marketplaceListings.createdAt));
  }

  async getMarketplaceListing(id: string, viewerTenantId: string): Promise<MarketplaceListing | undefined> {
    const [listing] = await db.select().from(marketplaceListings)
      .where(and(
        eq(marketplaceListings.id, id),
        or(
          eq(marketplaceListings.sellerTenantId, viewerTenantId), // Owner can always see
          eq(marketplaceListings.visibility, "public"),
          sql`${marketplaceListings.allowedTenantIds} @> ARRAY[${viewerTenantId}]`
        )
      ));
    return listing || undefined;
  }

  async getMarketplaceListingsBySeller(sellerId: string, tenantId: string): Promise<MarketplaceListing[]> {
    return db.select().from(marketplaceListings)
      .where(and(
        eq(marketplaceListings.sellerId, sellerId),
        eq(marketplaceListings.sellerTenantId, tenantId)
      ))
      .orderBy(desc(marketplaceListings.createdAt));
  }

  async createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing> {
    // Enforce private by default for security
    const securedListing = { 
      ...listing, 
      visibility: listing.visibility || "private",
      status: "draft" // Require explicit activation
    };
    const [created] = await db.insert(marketplaceListings).values(securedListing).returning();
    return created;
  }

  async updateMarketplaceListing(id: string, sellerId: string, updates: Partial<MarketplaceListing>): Promise<MarketplaceListing> {
    const [updated] = await db.update(marketplaceListings)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(marketplaceListings.id, id),
        eq(marketplaceListings.sellerId, sellerId) // Only seller can update
      ))
      .returning();
    return updated;
  }

  async incrementListingViews(id: string): Promise<void> {
    await db.update(marketplaceListings)
      .set({ viewCount: sql`${marketplaceListings.viewCount} + 1` })
      .where(eq(marketplaceListings.id, id));
  }

  // Marketplace Visibility Controls
  async setMarketplaceVisibility(visibility: InsertMarketplaceVisibility): Promise<MarketplaceVisibility> {
    const [created] = await db.insert(marketplaceVisibility).values(visibility).returning();
    return created;
  }

  async getMarketplaceVisibilityRules(listingId: string): Promise<MarketplaceVisibility[]> {
    return db.select().from(marketplaceVisibility)
      .where(and(
        eq(marketplaceVisibility.listingId, listingId),
        eq(marketplaceVisibility.isActive, true)
      ));
  }

  // Marketplace Orders
  async getMarketplaceOrders(tenantId: string, userId?: string, role?: string): Promise<MarketplaceOrder[]> {
    if (role === "admin") {
      // Admin sees all orders for their tenant
      return db.select().from(marketplaceOrders)
        .where(or(
          eq(marketplaceOrders.buyerTenantId, tenantId),
          eq(marketplaceOrders.sellerTenantId, tenantId)
        ))
        .orderBy(desc(marketplaceOrders.createdAt));
    }
    
    // Users see only their orders
    return db.select().from(marketplaceOrders)
      .where(and(
        or(
          eq(marketplaceOrders.buyerId, userId!),
          eq(marketplaceOrders.sellerId, userId!)
        ),
        or(
          eq(marketplaceOrders.buyerTenantId, tenantId),
          eq(marketplaceOrders.sellerTenantId, tenantId)
        )
      ))
      .orderBy(desc(marketplaceOrders.createdAt));
  }

  async getMarketplaceOrder(id: string, tenantId: string, userId?: string): Promise<MarketplaceOrder | undefined> {
    const [order] = await db.select().from(marketplaceOrders)
      .where(
        userId
          ? and(
              eq(marketplaceOrders.id, id),
              or(
                eq(marketplaceOrders.buyerTenantId, tenantId),
                eq(marketplaceOrders.sellerTenantId, tenantId)
              ),
              or(
                eq(marketplaceOrders.buyerId, userId),
                eq(marketplaceOrders.sellerId, userId)
              )
            )
          : and(
              eq(marketplaceOrders.id, id),
              or(
                eq(marketplaceOrders.buyerTenantId, tenantId),
                eq(marketplaceOrders.sellerTenantId, tenantId)
              )
            )
      );
    return order || undefined;
  }

  async createMarketplaceOrder(order: InsertMarketplaceOrder): Promise<MarketplaceOrder> {
    const orderNumber = `MKT-${Date.now()}`;
    const [created] = await db.insert(marketplaceOrders)
      .values({ ...order, orderNumber })
      .returning();
    return created;
  }

  async updateMarketplaceOrder(id: string, updates: Partial<MarketplaceOrder>, userId?: string): Promise<MarketplaceOrder> {
    let whereCondition = eq(marketplaceOrders.id, id);
    
    if (userId) {
      whereCondition = and(
        whereCondition,
        or(
          eq(marketplaceOrders.buyerId, userId),
          eq(marketplaceOrders.sellerId, userId)
        )
      );
    }

    const [updated] = await db.update(marketplaceOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(whereCondition)
      .returning();
    return updated;
  }

  // Marketplace Order Items
  async getMarketplaceOrderItems(orderId: string): Promise<MarketplaceOrderItem[]> {
    return db.select().from(marketplaceOrderItems)
      .where(eq(marketplaceOrderItems.orderId, orderId));
  }

  async createMarketplaceOrderItem(item: InsertMarketplaceOrderItem): Promise<MarketplaceOrderItem> {
    const [created] = await db.insert(marketplaceOrderItems).values(item).returning();
    return created;
  }

  // Marketplace Reviews
  async getMarketplaceReviewsByListing(listingId: string): Promise<MarketplaceReview[]> {
    return db.select().from(marketplaceReviews)
      .where(and(
        eq(marketplaceReviews.listingId, listingId),
        eq(marketplaceReviews.isPublic, true),
        eq(marketplaceReviews.status, "active")
      ))
      .orderBy(desc(marketplaceReviews.createdAt));
  }

  async createMarketplaceReview(review: InsertMarketplaceReview): Promise<MarketplaceReview> {
    const [created] = await db.insert(marketplaceReviews).values(review).returning();
    
    // Update listing rating
    await this.updateListingRating(review.listingId);
    
    return created;
  }

  private async updateListingRating(listingId: string): Promise<void> {
    const [result] = await db.select({
      avgRating: sql<number>`AVG(${marketplaceReviews.rating})`,
      reviewCount: sql<number>`COUNT(*)`
    }).from(marketplaceReviews)
    .where(and(
      eq(marketplaceReviews.listingId, listingId),
      eq(marketplaceReviews.isPublic, true),
      eq(marketplaceReviews.status, "active")
    ));

    if (result) {
      await db.update(marketplaceListings)
        .set({
          rating: result.avgRating ? Number(result.avgRating.toFixed(2)) : null,
          reviewCount: Number(result.reviewCount)
        })
        .where(eq(marketplaceListings.id, listingId));
    }
  }

  // Marketplace Dashboard Stats
  async getMarketplaceDashboardStats(tenantId: string): Promise<{
    totalListings: number;
    activeListings: number;
    totalOrders: number;
    pendingOrders: number;
    monthlyRevenue: number;
    topCategories: Array<{id: string; name: string; listingCount: number}>;
  }> {
    // Total listings for tenant
    const [totalListingsResult] = await db.select({ count: sql`count(*)` })
      .from(marketplaceListings)
      .where(eq(marketplaceListings.sellerTenantId, tenantId));

    // Active listings
    const [activeListingsResult] = await db.select({ count: sql`count(*)` })
      .from(marketplaceListings)
      .where(and(
        eq(marketplaceListings.sellerTenantId, tenantId),
        eq(marketplaceListings.status, "active")
      ));

    // Total orders (as buyer or seller)
    const [totalOrdersResult] = await db.select({ count: sql`count(*)` })
      .from(marketplaceOrders)
      .where(or(
        eq(marketplaceOrders.buyerTenantId, tenantId),
        eq(marketplaceOrders.sellerTenantId, tenantId)
      ));

    // Pending orders
    const [pendingOrdersResult] = await db.select({ count: sql`count(*)` })
      .from(marketplaceOrders)
      .where(and(
        or(
          eq(marketplaceOrders.buyerTenantId, tenantId),
          eq(marketplaceOrders.sellerTenantId, tenantId)
        ),
        eq(marketplaceOrders.status, "pending")
      ));

    // Monthly revenue (as seller)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [monthlyRevenueResult] = await db.select({ revenue: sql`COALESCE(sum(total_amount), 0)` })
      .from(marketplaceOrders)
      .where(and(
        eq(marketplaceOrders.sellerTenantId, tenantId),
        sql`${marketplaceOrders.createdAt} >= ${startOfMonth}`,
        eq(marketplaceOrders.paymentStatus, "paid")
      ));

    // Top categories
    const topCategoriesResults = await db.select({
      id: marketplaceCategories.id,
      name: marketplaceCategories.name,
      listingCount: sql`count(${marketplaceListings.id})`
    })
    .from(marketplaceCategories)
    .leftJoin(marketplaceListings, eq(marketplaceCategories.id, marketplaceListings.categoryId))
    .where(eq(marketplaceListings.sellerTenantId, tenantId))
    .groupBy(marketplaceCategories.id, marketplaceCategories.name)
    .orderBy(desc(sql`count(${marketplaceListings.id})`))
    .limit(5);

    return {
      totalListings: parseInt(String(totalListingsResult?.count || 0)),
      activeListings: parseInt(String(activeListingsResult?.count || 0)),
      totalOrders: parseInt(String(totalOrdersResult?.count || 0)),
      pendingOrders: parseInt(String(pendingOrdersResult?.count || 0)),
      monthlyRevenue: parseFloat(String(monthlyRevenueResult?.revenue || 0)),
      topCategories: topCategoriesResults.map(c => ({
        id: c.id,
        name: c.name,
        listingCount: parseInt(String(c.listingCount))
      }))
    };
  }

  // ======== FIDELITY CARD MODULE IMPLEMENTATION ========

  // Fidelity Settings
  async getFidelitySettings(tenantId: string): Promise<FidelitySettings | undefined> {
    const [settings] = await db.select().from(fidelitySettings).where(eq(fidelitySettings.tenantId, tenantId));
    return settings || undefined;
  }

  async createFidelitySettings(settings: InsertFidelitySettings): Promise<FidelitySettings> {
    const [created] = await db.insert(fidelitySettings).values(settings).returning();
    return created;
  }

  async updateFidelitySettings(tenantId: string, updates: Partial<FidelitySettings>): Promise<FidelitySettings> {
    const [updated] = await db.update(fidelitySettings).set(updates).where(eq(fidelitySettings.tenantId, tenantId)).returning();
    return updated;
  }

  // Fidelity Cards
  async getFidelityCard(id: string): Promise<FidelityCard | undefined> {
    const [card] = await db.select().from(fidelityCards).where(eq(fidelityCards.id, id));
    return card || undefined;
  }

  async getFidelityCardByCode(code: string, tenantId: string): Promise<FidelityCard | undefined> {
    const [card] = await db.select().from(fidelityCards)
      .where(and(eq(fidelityCards.code, code), eq(fidelityCards.tenantId, tenantId)));
    return card || undefined;
  }

  async getFidelityCardByCustomer(customerId: string, tenantId: string): Promise<FidelityCard | undefined> {
    const [card] = await db.select().from(fidelityCards)
      .where(and(eq(fidelityCards.customerId, customerId), eq(fidelityCards.tenantId, tenantId)));
    return card || undefined;
  }

  async getFidelityCardsByTenant(tenantId: string): Promise<FidelityCard[]> {
    return db.select().from(fidelityCards).where(eq(fidelityCards.tenantId, tenantId));
  }

  async createFidelityCard(card: InsertFidelityCard): Promise<FidelityCard> {
    const [created] = await db.insert(fidelityCards).values(card).returning();
    return created;
  }

  async updateFidelityCard(id: string, updates: Partial<FidelityCard>): Promise<FidelityCard> {
    const [updated] = await db.update(fidelityCards).set(updates).where(eq(fidelityCards.id, id)).returning();
    return updated;
  }

  // Fidelity Wallets
  async getFidelityWallet(id: string): Promise<FidelityWallet | undefined> {
    const [wallet] = await db.select().from(fidelityWallets).where(eq(fidelityWallets.id, id));
    return wallet || undefined;
  }

  async getFidelityWalletByCard(cardId: string): Promise<FidelityWallet | undefined> {
    const [wallet] = await db.select().from(fidelityWallets).where(eq(fidelityWallets.cardId, cardId));
    return wallet || undefined;
  }

  async createFidelityWallet(wallet: InsertFidelityWallet): Promise<FidelityWallet> {
    const [created] = await db.insert(fidelityWallets).values(wallet).returning();
    return created;
  }

  async updateFidelityWallet(id: string, updates: Partial<FidelityWallet>): Promise<FidelityWallet> {
    const [updated] = await db.update(fidelityWallets).set(updates).where(eq(fidelityWallets.id, id)).returning();
    return updated;
  }

  // Fidelity Wallet Transactions
  async getFidelityWalletTransaction(id: string): Promise<FidelityWalletTransaction | undefined> {
    const [transaction] = await db.select().from(fidelityWalletTransactions).where(eq(fidelityWalletTransactions.id, id));
    return transaction || undefined;
  }

  async getFidelityWalletTransactionsByCard(cardId: string): Promise<FidelityWalletTransaction[]> {
    return db.select().from(fidelityWalletTransactions)
      .where(eq(fidelityWalletTransactions.cardId, cardId))
      .orderBy(desc(fidelityWalletTransactions.createdAt));
  }

  async getFidelityWalletTransactionsByWallet(walletId: string): Promise<FidelityWalletTransaction[]> {
    return db.select().from(fidelityWalletTransactions)
      .where(eq(fidelityWalletTransactions.walletId, walletId))
      .orderBy(desc(fidelityWalletTransactions.createdAt));
  }

  async createFidelityWalletTransaction(transaction: InsertFidelityWalletTransaction): Promise<FidelityWalletTransaction> {
    const [created] = await db.insert(fidelityWalletTransactions).values(transaction).returning();
    return created;
  }

  // Fidelity Offers
  async getFidelityOffer(id: string): Promise<FidelityOffer | undefined> {
    const [offer] = await db.select().from(fidelityOffers).where(eq(fidelityOffers.id, id));
    return offer || undefined;
  }

  async getFidelityOffersByTenant(tenantId: string): Promise<FidelityOffer[]> {
    return db.select().from(fidelityOffers)
      .where(eq(fidelityOffers.tenantId, tenantId))
      .orderBy(desc(fidelityOffers.createdAt));
  }

  async getFidelityOffersByMerchant(merchantId: string, tenantId: string): Promise<FidelityOffer[]> {
    return db.select().from(fidelityOffers)
      .where(and(eq(fidelityOffers.merchantId, merchantId), eq(fidelityOffers.tenantId, tenantId)))
      .orderBy(desc(fidelityOffers.createdAt));
  }

  async getFidelityActiveOffers(tenantId: string, geofence?: any): Promise<FidelityOffer[]> {
    const conditions = [
      eq(fidelityOffers.tenantId, tenantId),
      eq(fidelityOffers.status, "active"),
      sql`${fidelityOffers.startAt} <= NOW()`,
      or(isNull(fidelityOffers.endAt), sql`${fidelityOffers.endAt} > NOW()`)
    ];
    
    return db.select().from(fidelityOffers)
      .where(and(...conditions))
      .orderBy(desc(fidelityOffers.createdAt));
  }

  async createFidelityOffer(offer: InsertFidelityOffer): Promise<FidelityOffer> {
    const [created] = await db.insert(fidelityOffers).values(offer).returning();
    return created;
  }

  async updateFidelityOffer(id: string, updates: Partial<FidelityOffer>): Promise<FidelityOffer> {
    const [updated] = await db.update(fidelityOffers).set(updates).where(eq(fidelityOffers.id, id)).returning();
    return updated;
  }

  // Fidelity Redemptions
  async getFidelityRedemption(id: string): Promise<FidelityRedemption | undefined> {
    const [redemption] = await db.select().from(fidelityRedemptions).where(eq(fidelityRedemptions.id, id));
    return redemption || undefined;
  }

  async getFidelityRedemptionsByCard(cardId: string): Promise<FidelityRedemption[]> {
    return db.select().from(fidelityRedemptions)
      .where(eq(fidelityRedemptions.cardId, cardId))
      .orderBy(desc(fidelityRedemptions.redeemedAt));
  }

  async getFidelityRedemptionsByTenant(tenantId: string): Promise<FidelityRedemption[]> {
    return db.select().from(fidelityRedemptions)
      .where(eq(fidelityRedemptions.tenantId, tenantId))
      .orderBy(desc(fidelityRedemptions.redeemedAt));
  }

  async getFidelityRedemptionsByMerchant(merchantId: string, tenantId: string): Promise<FidelityRedemption[]> {
    return db.select().from(fidelityRedemptions)
      .where(and(eq(fidelityRedemptions.merchantClientId, merchantId), eq(fidelityRedemptions.tenantId, tenantId)))
      .orderBy(desc(fidelityRedemptions.redeemedAt));
  }

  async createFidelityRedemption(redemption: InsertFidelityRedemption): Promise<FidelityRedemption> {
    const [created] = await db.insert(fidelityRedemptions).values(redemption).returning();
    return created;
  }

  async updateFidelityRedemption(id: string, updates: Partial<FidelityRedemption>): Promise<FidelityRedemption> {
    const [updated] = await db.update(fidelityRedemptions).set(updates).where(eq(fidelityRedemptions.id, id)).returning();
    return updated;
  }

  // Sponsors
  async getSponsor(id: string): Promise<Sponsor | undefined> {
    const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.id, id));
    return sponsor || undefined;
  }

  async getSponsorsByTenant(tenantId: string): Promise<Sponsor[]> {
    return db.select().from(sponsors)
      .where(eq(sponsors.tenantId, tenantId))
      .orderBy(desc(sponsors.createdAt));
  }

  async getActiveSponsor(tenantId?: string): Promise<Sponsor | undefined> {
    const conditions = [
      eq(sponsors.isActive, true),
      sql`${sponsors.validFrom} <= NOW()`,
      or(isNull(sponsors.validTo), sql`${sponsors.validTo} > NOW()`)
    ];

    if (tenantId) {
      conditions.push(eq(sponsors.tenantId, tenantId));
    }

    const [sponsor] = await db.select().from(sponsors)
      .where(and(...conditions))
      .orderBy(desc(sponsors.createdAt));
    return sponsor || undefined;
  }

  async createSponsor(sponsor: InsertSponsor): Promise<Sponsor> {
    const [created] = await db.insert(sponsors).values(sponsor).returning();
    return created;
  }

  async updateSponsor(id: string, updates: Partial<Sponsor>): Promise<Sponsor> {
    const [updated] = await db.update(sponsors).set(updates).where(eq(sponsors.id, id)).returning();
    return updated;
  }

  // Promoter Profiles
  async getPromoterProfile(id: string): Promise<PromoterProfile | undefined> {
    const [profile] = await db.select().from(promoterProfiles).where(eq(promoterProfiles.id, id));
    return profile || undefined;
  }

  async getPromoterProfileByUser(userId: string, tenantId: string): Promise<PromoterProfile | undefined> {
    const [profile] = await db.select().from(promoterProfiles)
      .where(and(eq(promoterProfiles.userId, userId), eq(promoterProfiles.tenantId, tenantId)));
    return profile || undefined;
  }

  async getPromoterProfilesByTenant(tenantId: string): Promise<PromoterProfile[]> {
    return db.select().from(promoterProfiles)
      .where(eq(promoterProfiles.tenantId, tenantId))
      .orderBy(desc(promoterProfiles.createdAt));
  }

  async getPromoterProfilesByArea(area: any, tenantId: string): Promise<PromoterProfile[]> {
    return db.select().from(promoterProfiles)
      .where(and(eq(promoterProfiles.tenantId, tenantId), eq(promoterProfiles.isActive, true)))
      .orderBy(desc(promoterProfiles.createdAt));
  }

  async createPromoterProfile(profile: InsertPromoterProfile): Promise<PromoterProfile> {
    const [created] = await db.insert(promoterProfiles).values(profile).returning();
    return created;
  }

  async updatePromoterProfile(id: string, updates: Partial<PromoterProfile>): Promise<PromoterProfile> {
    const [updated] = await db.update(promoterProfiles).set(updates).where(eq(promoterProfiles.id, id)).returning();
    return updated;
  }

  // Promoter KPIs
  async getPromoterKpi(id: string): Promise<PromoterKpi | undefined> {
    const [kpi] = await db.select().from(promoterKpis).where(eq(promoterKpis.id, id));
    return kpi || undefined;
  }

  async getPromoterKpisByPromoter(promoterId: string): Promise<PromoterKpi[]> {
    return db.select().from(promoterKpis)
      .where(eq(promoterKpis.promoterId, promoterId))
      .orderBy(desc(promoterKpis.period));
  }

  async getPromoterKpisByPeriod(promoterId: string, period: string): Promise<PromoterKpi | undefined> {
    const [kpi] = await db.select().from(promoterKpis)
      .where(and(eq(promoterKpis.promoterId, promoterId), eq(promoterKpis.period, period)));
    return kpi || undefined;
  }

  async createPromoterKpi(kpi: InsertPromoterKpi): Promise<PromoterKpi> {
    const [created] = await db.insert(promoterKpis).values(kpi).returning();
    return created;
  }

  async updatePromoterKpi(id: string, updates: Partial<PromoterKpi>): Promise<PromoterKpi> {
    const [updated] = await db.update(promoterKpis).set(updates).where(eq(promoterKpis.id, id)).returning();
    return updated;
  }

  // Fidelity AI Profiles
  async getFidelityAiProfile(id: string): Promise<FidelityAiProfile | undefined> {
    const [profile] = await db.select().from(fidelityAiProfiles).where(eq(fidelityAiProfiles.id, id));
    return profile || undefined;
  }

  async getFidelityAiProfileByCard(cardId: string): Promise<FidelityAiProfile | undefined> {
    const [profile] = await db.select().from(fidelityAiProfiles)
      .where(eq(fidelityAiProfiles.cardId, cardId));
    return profile || undefined;
  }

  async createFidelityAiProfile(profile: InsertFidelityAiProfile): Promise<FidelityAiProfile> {
    const [created] = await db.insert(fidelityAiProfiles).values(profile).returning();
    return created;
  }

  async updateFidelityAiProfile(id: string, updates: Partial<FidelityAiProfile>): Promise<FidelityAiProfile> {
    const [updated] = await db.update(fidelityAiProfiles).set(updates).where(eq(fidelityAiProfiles.id, id)).returning();
    return updated;
  }

  // Fidelity AI Logs
  async getFidelityAiLog(id: string): Promise<FidelityAiLog | undefined> {
    const [log] = await db.select().from(fidelityAiLogs).where(eq(fidelityAiLogs.id, id));
    return log || undefined;
  }

  async getFidelityAiLogsByTenant(tenantId: string): Promise<FidelityAiLog[]> {
    return db.select().from(fidelityAiLogs)
      .where(eq(fidelityAiLogs.tenantId, tenantId))
      .orderBy(desc(fidelityAiLogs.createdAt));
  }

  async getFidelityAiLogsByEntity(entityId: string, entityType: string): Promise<FidelityAiLog[]> {
    return db.select().from(fidelityAiLogs)
      .where(and(eq(fidelityAiLogs.entityId, entityId), eq(fidelityAiLogs.entityType, entityType)))
      .orderBy(desc(fidelityAiLogs.createdAt));
  }

  async createFidelityAiLog(log: InsertFidelityAiLog): Promise<FidelityAiLog> {
    const [created] = await db.insert(fidelityAiLogs).values(log).returning();
    return created;
  }

  // Fidelity Dashboard Stats
  async getFidelityDashboardStats(tenantId: string): Promise<{
    totalCards: number;
    activeCards: number;
    totalOffers: number;
    activeOffers: number;
    totalRedemptions: number;
    monthlyRedemptions: number;
    totalCashback: number;
    activeSponsors: number;
    topMerchants: Array<{id: string; name: string; redemptions: number}>;
    promoterStats: Array<{id: string; name: string; cardsDistributed: number; conversions: number}>;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Total cards
    const [totalCardsResult] = await db.select({
      count: sql`count(*)`
    }).from(fidelityCards).where(eq(fidelityCards.tenantId, tenantId));

    // Active cards (with activity in last 30 days)
    const [activeCardsResult] = await db.select({
      count: sql`count(distinct ${fidelityCards.id})`
    })
    .from(fidelityCards)
    .leftJoin(fidelityWalletTransactions, eq(fidelityCards.id, fidelityWalletTransactions.cardId))
    .where(and(
      eq(fidelityCards.tenantId, tenantId),
      sql`${fidelityWalletTransactions.createdAt} >= ${startOfMonth}`
    ));

    // Total offers
    const [totalOffersResult] = await db.select({
      count: sql`count(*)`
    }).from(fidelityOffers).where(eq(fidelityOffers.tenantId, tenantId));

    // Active offers
    const [activeOffersResult] = await db.select({
      count: sql`count(*)`
    })
    .from(fidelityOffers)
    .where(and(
      eq(fidelityOffers.tenantId, tenantId),
      eq(fidelityOffers.status, "active"),
      sql`${fidelityOffers.startAt} <= NOW()`,
      or(isNull(fidelityOffers.endAt), sql`${fidelityOffers.endAt} > NOW()`)
    ));

    // Total redemptions
    const [totalRedemptionsResult] = await db.select({
      count: sql`count(*)`
    }).from(fidelityRedemptions).where(eq(fidelityRedemptions.tenantId, tenantId));

    // Monthly redemptions
    const [monthlyRedemptionsResult] = await db.select({
      count: sql`count(*)`
    })
    .from(fidelityRedemptions)
    .where(and(
      eq(fidelityRedemptions.tenantId, tenantId),
      sql`${fidelityRedemptions.redeemedAt} >= ${startOfMonth}`
    ));

    // Total cashback
    const [totalCashbackResult] = await db.select({
      sum: sql<number>`COALESCE(SUM(${fidelityWalletTransactions.points}), 0)`
    })
    .from(fidelityWalletTransactions)
    .leftJoin(fidelityCards, eq(fidelityWalletTransactions.cardId, fidelityCards.id))
    .where(and(
      eq(fidelityCards.tenantId, tenantId),
      eq(fidelityWalletTransactions.type, "earned")
    ));

    // Active sponsors
    const [activeSponsorsResult] = await db.select({
      count: sql`count(*)`
    })
    .from(sponsors)
    .where(and(
      or(isNull(sponsors.tenantId), eq(sponsors.tenantId, tenantId)),
      eq(sponsors.isActive, true),
      sql`${sponsors.validFrom} <= NOW()`,
      or(isNull(sponsors.validTo), sql`${sponsors.validTo} > NOW()`)
    ));

    // Top merchants by redemptions
    const topMerchantsResults = await db.select({
      id: fidelityRedemptions.merchantClientId,
      name: sql<string>`COALESCE(clients.name, 'Unknown Merchant')`,
      redemptions: sql`count(*)`
    })
    .from(fidelityRedemptions)
    .leftJoin(clients, eq(fidelityRedemptions.merchantClientId, clients.id))
    .where(eq(fidelityRedemptions.tenantId, tenantId))
    .groupBy(fidelityRedemptions.merchantClientId, sql`clients.name`)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

    // Promoter stats
    const promoterStatsResults = await db.select({
      id: promoterProfiles.id,
      name: promoterProfiles.name,
      cardsDistributed: promoterProfiles.cardsDistributed,
      conversions: promoterProfiles.conversions
    })
    .from(promoterProfiles)
    .where(and(
      eq(promoterProfiles.tenantId, tenantId),
      eq(promoterProfiles.isActive, true)
    ))
    .orderBy(desc(promoterProfiles.cardsDistributed))
    .limit(5);

    return {
      totalCards: parseInt(String(totalCardsResult?.count || 0)),
      activeCards: parseInt(String(activeCardsResult?.count || 0)),
      totalOffers: parseInt(String(totalOffersResult?.count || 0)),
      activeOffers: parseInt(String(activeOffersResult?.count || 0)),
      totalRedemptions: parseInt(String(totalRedemptionsResult?.count || 0)),
      monthlyRedemptions: parseInt(String(monthlyRedemptionsResult?.count || 0)),
      totalCashback: parseFloat(String(totalCashbackResult?.sum || 0)),
      activeSponsors: parseInt(String(activeSponsorsResult?.count || 0)),
      topMerchants: topMerchantsResults.map(m => ({
        id: m.id || 'unknown',
        name: m.name || 'Unknown Merchant',
        redemptions: parseInt(String(m.redemptions))
      })),
      promoterStats: promoterStatsResults.map(p => ({
        id: p.id,
        name: p.name,
        cardsDistributed: p.cardsDistributed,
        conversions: p.conversions
      }))
    };
  }

  // ======== MARKETPLACE PROFESSIONISTI DIGITALI IMPLEMENTATIONS ========

  // Professional Profiles
  async getProfessionalProfile(id: string): Promise<ProfessionalProfile | undefined> {
    const [profile] = await db.select().from(professionalProfiles).where(eq(professionalProfiles.id, id));
    return profile || undefined;
  }

  async getProfessionalProfileByUser(userId: string, tenantId: string): Promise<ProfessionalProfile | undefined> {
    const [profile] = await db.select().from(professionalProfiles)
      .where(and(eq(professionalProfiles.userId, userId), eq(professionalProfiles.tenantId, tenantId)));
    return profile || undefined;
  }

  async getProfessionalProfilesByTenant(tenantId: string): Promise<ProfessionalProfile[]> {
    return db.select().from(professionalProfiles)
      .where(eq(professionalProfiles.tenantId, tenantId))
      .orderBy(desc(professionalProfiles.rating));
  }

  async getProfessionalProfilesByCategory(category: string, tenantId: string): Promise<ProfessionalProfile[]> {
    return db.select().from(professionalProfiles)
      .where(and(eq(professionalProfiles.category, category), eq(professionalProfiles.tenantId, tenantId)))
      .orderBy(desc(professionalProfiles.rating));
  }

  async searchProfessionalProfiles(tenantId: string, filters: {
    category?: string;
    skills?: string[];
    rating?: number;
    isAvailable?: boolean;
    search?: string;
  }): Promise<ProfessionalProfile[]> {
    let query = db.select().from(professionalProfiles).$dynamic();
    
    const conditions = [eq(professionalProfiles.tenantId, tenantId)];
    
    if (filters.category) {
      conditions.push(eq(professionalProfiles.category, filters.category));
    }
    
    if (filters.rating) {
      conditions.push(sql`${professionalProfiles.rating} >= ${filters.rating}`);
    }
    
    if (filters.isAvailable !== undefined) {
      conditions.push(eq(professionalProfiles.isAvailable, filters.isAvailable));
    }
    
    if (filters.search) {
      conditions.push(or(
        sql`${professionalProfiles.title} ILIKE ${'%' + filters.search + '%'}`,
        sql`${professionalProfiles.description} ILIKE ${'%' + filters.search + '%'}`
      ));
    }
    
    query = query.where(and(...conditions));
    return query.orderBy(desc(professionalProfiles.rating));
  }

  async createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile> {
    const [created] = await db.insert(professionalProfiles).values(profile).returning();
    return created;
  }

  async updateProfessionalProfile(id: string, updates: Partial<ProfessionalProfile>): Promise<ProfessionalProfile> {
    const [updated] = await db.update(professionalProfiles)
      .set({...updates, updatedAt: new Date()})
      .where(eq(professionalProfiles.id, id))
      .returning();
    return updated;
  }

  // Client Projects
  async getClientProject(id: string): Promise<ClientProject | undefined> {
    const [project] = await db.select().from(clientProjects).where(eq(clientProjects.id, id));
    return project || undefined;
  }

  async getClientProjectsByClient(clientId: string): Promise<ClientProject[]> {
    return db.select().from(clientProjects)
      .where(eq(clientProjects.clientId, clientId))
      .orderBy(desc(clientProjects.createdAt));
  }

  async getClientProjectsByTenant(tenantId: string): Promise<ClientProject[]> {
    return db.select().from(clientProjects)
      .where(eq(clientProjects.tenantId, tenantId))
      .orderBy(desc(clientProjects.createdAt));
  }

  async getPublishedProjects(tenantId: string, filters?: {
    category?: string;
    budget?: {min?: number; max?: number};
    deadline?: Date;
  }): Promise<ClientProject[]> {
    let query = db.select().from(clientProjects).$dynamic();
    
    const conditions = [
      eq(clientProjects.tenantId, tenantId),
      eq(clientProjects.status, "published")
    ];
    
    if (filters?.category) {
      conditions.push(eq(clientProjects.category, filters.category));
    }
    
    if (filters?.budget?.min) {
      conditions.push(sql`${clientProjects.budget} >= ${filters.budget.min}`);
    }
    
    if (filters?.budget?.max) {
      conditions.push(sql`${clientProjects.budget} <= ${filters.budget.max}`);
    }
    
    if (filters?.deadline) {
      conditions.push(sql`${clientProjects.deadline} >= ${filters.deadline}`);
    }
    
    query = query.where(and(...conditions));
    return query.orderBy(desc(clientProjects.publishedAt));
  }

  async createClientProject(project: InsertClientProject): Promise<ClientProject> {
    const [created] = await db.insert(clientProjects).values(project).returning();
    return created;
  }

  async updateClientProject(id: string, updates: Partial<ClientProject>): Promise<ClientProject> {
    const [updated] = await db.update(clientProjects)
      .set({...updates, updatedAt: new Date()})
      .where(eq(clientProjects.id, id))
      .returning();
    return updated;
  }

  // Project Bids  
  async getProjectBid(id: string): Promise<ProjectBid | undefined> {
    const [bid] = await db.select().from(projectBids).where(eq(projectBids.id, id));
    return bid || undefined;
  }

  async getProjectBidsByProject(projectId: string): Promise<ProjectBid[]> {
    return db.select().from(projectBids)
      .where(eq(projectBids.projectId, projectId))
      .orderBy(projectBids.submittedAt);
  }

  async getProjectBidsByProfessional(professionalId: string): Promise<ProjectBid[]> {
    return db.select().from(projectBids)
      .where(eq(projectBids.professionalId, professionalId))
      .orderBy(desc(projectBids.submittedAt));
  }

  async createProjectBid(bid: InsertProjectBid): Promise<ProjectBid> {
    const [created] = await db.insert(projectBids).values(bid).returning();
    
    // Update project bids count
    await db.update(clientProjects)
      .set({bidsCount: sql`${clientProjects.bidsCount} + 1`})
      .where(eq(clientProjects.id, created.projectId));
    
    return created;
  }

  async updateProjectBid(id: string, updates: Partial<ProjectBid>): Promise<ProjectBid> {
    const [updated] = await db.update(projectBids)
      .set(updates)
      .where(eq(projectBids.id, id))
      .returning();
    return updated;
  }

  // Marketplace Contracts
  async getMarketplaceContract(id: string): Promise<MarketplaceContract | undefined> {
    const [contract] = await db.select().from(marketplaceContracts).where(eq(marketplaceContracts.id, id));
    return contract || undefined;
  }

  async getMarketplaceContractsByClient(clientId: string): Promise<MarketplaceContract[]> {
    return db.select().from(marketplaceContracts)
      .where(eq(marketplaceContracts.clientId, clientId))
      .orderBy(desc(marketplaceContracts.createdAt));
  }

  async getMarketplaceContractsByProfessional(professionalId: string): Promise<MarketplaceContract[]> {
    return db.select().from(marketplaceContracts)
      .where(eq(marketplaceContracts.professionalId, professionalId))
      .orderBy(desc(marketplaceContracts.createdAt));
  }

  async getMarketplaceContractsByTenant(tenantId: string): Promise<MarketplaceContract[]> {
    return db.select().from(marketplaceContracts)
      .where(eq(marketplaceContracts.tenantId, tenantId))
      .orderBy(desc(marketplaceContracts.createdAt));
  }

  async createMarketplaceContract(contract: InsertMarketplaceContract): Promise<MarketplaceContract> {
    // Generate contract number
    const contractData = {
      ...contract,
      contractNumber: `MP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };
    
    const [created] = await db.insert(marketplaceContracts).values(contractData).returning();
    
    // Update project status to awarded
    await db.update(clientProjects)
      .set({status: "awarded", awardedAt: new Date()})
      .where(eq(clientProjects.id, created.projectId));
    
    return created;
  }

  async updateMarketplaceContract(id: string, updates: Partial<MarketplaceContract>): Promise<MarketplaceContract> {
    const [updated] = await db.update(marketplaceContracts)
      .set({...updates, updatedAt: new Date()})
      .where(eq(marketplaceContracts.id, id))
      .returning();
    return updated;
  }

  // Project Milestones
  async getProjectMilestone(id: string): Promise<ProjectMilestone | undefined> {
    const [milestone] = await db.select().from(projectMilestones).where(eq(projectMilestones.id, id));
    return milestone || undefined;
  }

  async getProjectMilestonesByContract(contractId: string): Promise<ProjectMilestone[]> {
    return db.select().from(projectMilestones)
      .where(eq(projectMilestones.contractId, contractId))
      .orderBy(projectMilestones.dueDate);
  }

  async getPendingMilestones(tenantId: string): Promise<ProjectMilestone[]> {
    return db.select().from(projectMilestones)
      .innerJoin(marketplaceContracts, eq(projectMilestones.contractId, marketplaceContracts.id))
      .where(and(
        eq(marketplaceContracts.tenantId, tenantId),
        eq(projectMilestones.status, "pending")
      ))
      .orderBy(projectMilestones.dueDate)
      .then(results => results.map(r => r.project_milestones));
  }

  async createProjectMilestone(milestone: InsertProjectMilestone): Promise<ProjectMilestone> {
    const [created] = await db.insert(projectMilestones).values(milestone).returning();
    return created;
  }

  async updateProjectMilestone(id: string, updates: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    const [updated] = await db.update(projectMilestones)
      .set({...updates, updatedAt: new Date()})
      .where(eq(projectMilestones.id, id))
      .returning();
    return updated;
  }

  // Marketplace Chat Messages
  async getMarketplaceChatMessage(id: string): Promise<MarketplaceChatMessage | undefined> {
    const [message] = await db.select().from(marketplaceChatMessages).where(eq(marketplaceChatMessages.id, id));
    return message || undefined;
  }

  async getMarketplaceChatMessagesByContract(contractId: string): Promise<MarketplaceChatMessage[]> {
    return db.select().from(marketplaceChatMessages)
      .where(eq(marketplaceChatMessages.contractId, contractId))
      .orderBy(marketplaceChatMessages.createdAt);
  }

  async createMarketplaceChatMessage(message: InsertMarketplaceChatMessage): Promise<MarketplaceChatMessage> {
    const [created] = await db.insert(marketplaceChatMessages).values(message).returning();
    return created;
  }

  async markMessagesAsRead(contractId: string, userId: string): Promise<void> {
    await db.update(marketplaceChatMessages)
      .set({isRead: true})
      .where(and(
        eq(marketplaceChatMessages.contractId, contractId),
        not(eq(marketplaceChatMessages.senderId, userId)),
        eq(marketplaceChatMessages.isRead, false)
      ));
  }

  // Marketplace Disputes
  async getMarketplaceDispute(id: string): Promise<MarketplaceDispute | undefined> {
    const [dispute] = await db.select().from(marketplaceDisputes).where(eq(marketplaceDisputes.id, id));
    return dispute || undefined;
  }

  async getMarketplaceDisputesByTenant(tenantId: string): Promise<MarketplaceDispute[]> {
    return db.select().from(marketplaceDisputes)
      .where(eq(marketplaceDisputes.tenantId, tenantId))
      .orderBy(desc(marketplaceDisputes.createdAt));
  }

  async getMarketplaceDisputesByContract(contractId: string): Promise<MarketplaceDispute[]> {
    return db.select().from(marketplaceDisputes)
      .where(eq(marketplaceDisputes.contractId, contractId))
      .orderBy(desc(marketplaceDisputes.createdAt));
  }

  async createMarketplaceDispute(dispute: InsertMarketplaceDispute): Promise<MarketplaceDispute> {
    const [created] = await db.insert(marketplaceDisputes).values(dispute).returning();
    return created;
  }

  async updateMarketplaceDispute(id: string, updates: Partial<MarketplaceDispute>): Promise<MarketplaceDispute> {
    const [updated] = await db.update(marketplaceDisputes)
      .set({...updates, updatedAt: new Date()})
      .where(eq(marketplaceDisputes.id, id))
      .returning();
    return updated;
  }

  // Professional Ratings
  async getProfessionalRating(id: string): Promise<ProfessionalRating | undefined> {
    const [rating] = await db.select().from(professionalRatings).where(eq(professionalRatings.id, id));
    return rating || undefined;
  }

  async getProfessionalRatingsByProfessional(professionalId: string): Promise<ProfessionalRating[]> {
    return db.select().from(professionalRatings)
      .where(eq(professionalRatings.professionalId, professionalId))
      .orderBy(desc(professionalRatings.createdAt));
  }

  async createProfessionalRating(rating: InsertProfessionalRating): Promise<ProfessionalRating> {
    const [created] = await db.insert(professionalRatings).values(rating).returning();
    
    // Update professional profile rating and review count
    const ratings = await db.select().from(professionalRatings)
      .where(eq(professionalRatings.professionalId, created.professionalId));
    
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    await db.update(professionalProfiles)
      .set({
        rating: avgRating.toFixed(2),
        reviewCount: ratings.length
      })
      .where(eq(professionalProfiles.id, created.professionalId));
    
    return created;
  }

  // Marketplace Commissions
  async getMarketplaceCommission(id: string): Promise<MarketplaceCommission | undefined> {
    const [commission] = await db.select().from(marketplaceCommissions).where(eq(marketplaceCommissions.id, id));
    return commission || undefined;
  }

  async getMarketplaceCommissionsByProfessional(professionalId: string): Promise<MarketplaceCommission[]> {
    return db.select().from(marketplaceCommissions)
      .where(eq(marketplaceCommissions.professionalId, professionalId))
      .orderBy(desc(marketplaceCommissions.createdAt));
  }

  async getMarketplaceCommissionsByTenant(tenantId: string): Promise<MarketplaceCommission[]> {
    return db.select().from(marketplaceCommissions)
      .where(eq(marketplaceCommissions.tenantId, tenantId))
      .orderBy(desc(marketplaceCommissions.createdAt));
  }

  async createMarketplaceCommission(commission: InsertMarketplaceCommission): Promise<MarketplaceCommission> {
    const [created] = await db.insert(marketplaceCommissions).values(commission).returning();
    return created;
  }

  async updateMarketplaceCommission(id: string, updates: Partial<MarketplaceCommission>): Promise<MarketplaceCommission> {
    const [updated] = await db.update(marketplaceCommissions)
      .set(updates)
      .where(eq(marketplaceCommissions.id, id))
      .returning();
    return updated;
  }

  // Anti-Disintermediation Logs
  async getAntiDisintermediationLog(id: string): Promise<AntiDisintermediationLog | undefined> {
    const [log] = await db.select().from(antiDisintermediationLogs).where(eq(antiDisintermediationLogs.id, id));
    return log || undefined;
  }

  async getAntiDisintermediationLogsByTenant(tenantId: string): Promise<AntiDisintermediationLog[]> {
    return db.select().from(antiDisintermediationLogs)
      .where(eq(antiDisintermediationLogs.tenantId, tenantId))
      .orderBy(desc(antiDisintermediationLogs.createdAt));
  }

  async createAntiDisintermediationLog(log: InsertAntiDisintermediationLog): Promise<AntiDisintermediationLog> {
    const [created] = await db.insert(antiDisintermediationLogs).values(log).returning();
    return created;
  }

  // Marketplace Dashboard & Analytics
  async getMarketplaceDashboardStats(tenantId: string): Promise<{
    totalProfessionals: number;
    activeProfessionals: number;
    totalProjects: number;
    activeProjects: number;
    totalContracts: number;
    completedContracts: number;
    totalCommissions: number;
    monthlyRevenue: number;
    topProfessionals: Array<{id: string; name: string; rating: number; completedProjects: number}>;
    categoryStats: Array<{category: string; professionals: number; projects: number; avgBudget: number}>;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Total professionals
    const [totalProfessionalsResult] = await db.select({
      count: sql`count(*)`
    }).from(professionalProfiles).where(eq(professionalProfiles.tenantId, tenantId));

    // Active professionals (with activity in last 30 days)
    const [activeProfessionalsResult] = await db.select({
      count: sql`count(distinct ${professionalProfiles.id})`
    })
    .from(professionalProfiles)
    .leftJoin(marketplaceContracts, eq(professionalProfiles.id, marketplaceContracts.professionalId))
    .where(and(
      eq(professionalProfiles.tenantId, tenantId),
      sql`${marketplaceContracts.createdAt} >= ${startOfMonth}`
    ));

    // Total projects
    const [totalProjectsResult] = await db.select({
      count: sql`count(*)`
    }).from(clientProjects).where(eq(clientProjects.tenantId, tenantId));

    // Active projects
    const [activeProjectsResult] = await db.select({
      count: sql`count(*)`
    })
    .from(clientProjects)
    .where(and(
      eq(clientProjects.tenantId, tenantId),
      or(
        eq(clientProjects.status, "published"),
        eq(clientProjects.status, "bidding"),
        eq(clientProjects.status, "in_progress")
      )
    ));

    // Total contracts
    const [totalContractsResult] = await db.select({
      count: sql`count(*)`
    }).from(marketplaceContracts).where(eq(marketplaceContracts.tenantId, tenantId));

    // Completed contracts
    const [completedContractsResult] = await db.select({
      count: sql`count(*)`
    })
    .from(marketplaceContracts)
    .where(and(
      eq(marketplaceContracts.tenantId, tenantId),
      eq(marketplaceContracts.status, "completed")
    ));

    // Total commissions
    const [totalCommissionsResult] = await db.select({
      sum: sql`sum(${marketplaceCommissions.commissionAmount})`
    })
    .from(marketplaceCommissions)
    .where(eq(marketplaceCommissions.tenantId, tenantId));

    // Monthly revenue
    const [monthlyRevenueResult] = await db.select({
      sum: sql`sum(${marketplaceCommissions.commissionAmount})`
    })
    .from(marketplaceCommissions)
    .where(and(
      eq(marketplaceCommissions.tenantId, tenantId),
      sql`${marketplaceCommissions.createdAt} >= ${startOfMonth}`
    ));

    // Top professionals
    const topProfessionalsResults = await db.select({
      id: professionalProfiles.id,
      title: professionalProfiles.title,
      rating: professionalProfiles.rating,
      completedProjects: professionalProfiles.completedProjects
    })
    .from(professionalProfiles)
    .where(eq(professionalProfiles.tenantId, tenantId))
    .orderBy(desc(professionalProfiles.rating))
    .limit(5);

    // Category stats
    const categoryStatsResults = await db.select({
      category: clientProjects.category,
      professionals: sql`count(distinct ${professionalProfiles.id})`,
      projects: sql`count(distinct ${clientProjects.id})`,
      avgBudget: sql`avg(${clientProjects.budget})`
    })
    .from(clientProjects)
    .leftJoin(projectBids, eq(clientProjects.id, projectBids.projectId))
    .leftJoin(professionalProfiles, eq(projectBids.professionalId, professionalProfiles.id))
    .where(eq(clientProjects.tenantId, tenantId))
    .groupBy(clientProjects.category);

    return {
      totalProfessionals: parseInt(String(totalProfessionalsResult?.count || 0)),
      activeProfessionals: parseInt(String(activeProfessionalsResult?.count || 0)),
      totalProjects: parseInt(String(totalProjectsResult?.count || 0)),
      activeProjects: parseInt(String(activeProjectsResult?.count || 0)),
      totalContracts: parseInt(String(totalContractsResult?.count || 0)),
      completedContracts: parseInt(String(completedContractsResult?.count || 0)),
      totalCommissions: parseFloat(String(totalCommissionsResult?.sum || 0)),
      monthlyRevenue: parseFloat(String(monthlyRevenueResult?.sum || 0)),
      topProfessionals: topProfessionalsResults.map(p => ({
        id: p.id,
        name: p.title || 'Unknown Professional',
        rating: parseFloat(String(p.rating || 0)),
        completedProjects: p.completedProjects || 0
      })),
      categoryStats: categoryStatsResults.map(c => ({
        category: String(c.category),
        professionals: parseInt(String(c.professionals || 0)),
        projects: parseInt(String(c.projects || 0)),
        avgBudget: parseFloat(String(c.avgBudget || 0))
      }))
    };
  }

  // AI Matching & Suggestions
  async getMatchingProfessionalsForProject(projectId: string): Promise<Array<{
    professional: ProfessionalProfile;
    matchScore: number;
    reasons: string[];
  }>> {
    const [project] = await db.select().from(clientProjects).where(eq(clientProjects.id, projectId));
    if (!project) return [];

    const professionals = await db.select().from(professionalProfiles)
      .where(and(
        eq(professionalProfiles.tenantId, project.tenantId),
        eq(professionalProfiles.category, project.category),
        eq(professionalProfiles.isAvailable, true)
      ))
      .orderBy(desc(professionalProfiles.rating));

    return professionals.map(prof => {
      const reasons: string[] = [];
      let matchScore = 50; // Base score

      // Category match
      if (prof.category === project.category) {
        matchScore += 20;
        reasons.push(`Specializes in ${project.category}`);
      }

      // Rating bonus
      const rating = parseFloat(String(prof.rating || 0));
      if (rating >= 4.5) {
        matchScore += 15;
        reasons.push(`Excellent rating (${rating}/5)`);
      } else if (rating >= 4.0) {
        matchScore += 10;
        reasons.push(`Good rating (${rating}/5)`);
      }

      // Experience bonus
      if (prof.completedProjects && prof.completedProjects >= 10) {
        matchScore += 10;
        reasons.push(`Experienced (${prof.completedProjects} projects)`);
      }

      // Budget compatibility
      const projectBudget = parseFloat(String(project.budget || 0));
      const profMinRate = parseFloat(String(prof.fixedRateMin || 0));
      const profMaxRate = parseFloat(String(prof.fixedRateMax || 0));
      
      if (profMinRate && profMaxRate && projectBudget >= profMinRate && projectBudget <= profMaxRate) {
        matchScore += 15;
        reasons.push('Budget compatible');
      }

      // Verification bonus
      if (prof.isVerified) {
        matchScore += 5;
        reasons.push('Verified professional');
      }

      return {
        professional: prof,
        matchScore: Math.min(matchScore, 100),
        reasons
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  async getSuggestedProjectsForProfessional(professionalId: string): Promise<Array<{
    project: ClientProject;
    matchScore: number;
    reasons: string[];
  }>> {
    const [professional] = await db.select().from(professionalProfiles).where(eq(professionalProfiles.id, professionalId));
    if (!professional) return [];

    const projects = await db.select().from(clientProjects)
      .where(and(
        eq(clientProjects.tenantId, professional.tenantId),
        eq(clientProjects.status, "published"),
        eq(clientProjects.category, professional.category)
      ))
      .orderBy(desc(clientProjects.publishedAt));

    return projects.map(project => {
      const reasons: string[] = [];
      let matchScore = 50; // Base score

      // Category match
      if (project.category === professional.category) {
        matchScore += 20;
        reasons.push(`Matches your specialty: ${project.category}`);
      }

      // Budget compatibility
      const projectBudget = parseFloat(String(project.budget || 0));
      const profMinRate = parseFloat(String(professional.fixedRateMin || 0));
      const profMaxRate = parseFloat(String(professional.fixedRateMax || 0));
      
      if (profMinRate && profMaxRate) {
        if (projectBudget >= profMinRate && projectBudget <= profMaxRate) {
          matchScore += 20;
          reasons.push('Perfect budget match');
        } else if (projectBudget >= profMinRate * 0.8) {
          matchScore += 10;
          reasons.push('Good budget range');
        }
      }

      // Deadline feasibility
      if (project.deadline) {
        const daysUntilDeadline = Math.ceil((project.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilDeadline >= 7) {
          matchScore += 10;
          reasons.push('Reasonable deadline');
        }
      }

      // Competition level (fewer bids = better opportunity)
      const bidsCount = project.bidsCount || 0;
      if (bidsCount === 0) {
        matchScore += 15;
        reasons.push('No competition yet');
      } else if (bidsCount <= 3) {
        matchScore += 10;
        reasons.push('Low competition');
      }

      return {
        project,
        matchScore: Math.min(matchScore, 100),
        reasons
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  // Delete Methods with Tenant Scoping for Security
  async deleteProfessionalProfile(id: string, tenantId: string): Promise<void> {
    await db.delete(professionalProfiles)
      .where(and(eq(professionalProfiles.id, id), eq(professionalProfiles.tenantId, tenantId)));
  }

  async deleteClientProject(id: string, tenantId: string): Promise<void> {
    await db.delete(clientProjects)
      .where(and(eq(clientProjects.id, id), eq(clientProjects.tenantId, tenantId)));
  }

  async deleteProjectBid(id: string, tenantId: string): Promise<void> {
    await db.delete(projectBids)
      .where(and(eq(projectBids.id, id), eq(projectBids.tenantId, tenantId)));
  }

  async deleteMarketplaceContract(id: string, tenantId: string): Promise<void> {
    await db.delete(marketplaceContracts)
      .where(and(eq(marketplaceContracts.id, id), eq(marketplaceContracts.tenantId, tenantId)));
  }

  async deleteProjectMilestone(id: string, tenantId: string): Promise<void> {
    // Delete via contract tenant scoping for security
    const milestone = await db.select().from(projectMilestones)
      .innerJoin(marketplaceContracts, eq(projectMilestones.contractId, marketplaceContracts.id))
      .where(and(eq(projectMilestones.id, id), eq(marketplaceContracts.tenantId, tenantId)))
      .limit(1);
    
    if (milestone.length > 0) {
      await db.delete(projectMilestones).where(eq(projectMilestones.id, id));
    }
  }

  async deleteMarketplaceChatMessage(id: string, tenantId: string): Promise<void> {
    // Delete via contract tenant scoping for security
    const message = await db.select().from(marketplaceChatMessages)
      .innerJoin(marketplaceContracts, eq(marketplaceChatMessages.contractId, marketplaceContracts.id))
      .where(and(eq(marketplaceChatMessages.id, id), eq(marketplaceContracts.tenantId, tenantId)))
      .limit(1);
    
    if (message.length > 0) {
      await db.delete(marketplaceChatMessages).where(eq(marketplaceChatMessages.id, id));
    }
  }

  async deleteMarketplaceDispute(id: string, tenantId: string): Promise<void> {
    await db.delete(marketplaceDisputes)
      .where(and(eq(marketplaceDisputes.id, id), eq(marketplaceDisputes.tenantId, tenantId)));
  }

  async deleteProfessionalRating(id: string, tenantId: string): Promise<void> {
    await db.delete(professionalRatings)
      .where(and(eq(professionalRatings.id, id), eq(professionalRatings.tenantId, tenantId)));
  }

  async deleteMarketplaceCommission(id: string, tenantId: string): Promise<void> {
    await db.delete(marketplaceCommissions)
      .where(and(eq(marketplaceCommissions.id, id), eq(marketplaceCommissions.tenantId, tenantId)));
  }

  async deleteAntiDisintermediationLog(id: string, tenantId: string): Promise<void> {
    await db.delete(antiDisintermediationLogs)
      .where(and(eq(antiDisintermediationLogs.id, id), eq(antiDisintermediationLogs.tenantId, tenantId)));
  }

  // ========== AI ANTIFRODE MODULE ==========
  
  // AI Risk Assessment Methods - Enhanced with OpenAI
  async calculateUserRiskScore(userId: string, tenantId: string): Promise<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    recommendations: string[];
  }> {
    const user = await this.getUser(userId);
    if (!user || user.tenantId !== tenantId) {
      throw new Error('User not found or access denied');
    }

    // Collect behavioral data using existing methods
    const [userAuditLogs, antiDisintermediationLogs] = await Promise.all([
      db.select().from(auditLogs)
        .where(and(eq(auditLogs.userId, userId), eq(auditLogs.tenantId, tenantId)))
        .orderBy(desc(auditLogs.createdAt))
        .limit(100),
      this.getAntiDisintermediationLogsByTenant(tenantId)
    ]);

    // Calculate heuristic risk factors
    const riskFactors: string[] = [];
    let baseRiskScore = 0;

    // Account age factor (newer accounts = higher risk)
    const accountAgeHours = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60);
    if (accountAgeHours < 24) {
      baseRiskScore += 30;
      riskFactors.push('Very new account (< 24h)');
    } else if (accountAgeHours < 168) {
      baseRiskScore += 15;
      riskFactors.push('New account (< 1 week)');
    }

    // Anti-disintermediation history
    const userDisintermediationLogs = antiDisintermediationLogs.filter(log => 
      log.professionalId === userId || log.clientId === userId
    );
    if (userDisintermediationLogs.length > 0) {
      baseRiskScore += Math.min(userDisintermediationLogs.length * 25, 75); // Cap at 75
      riskFactors.push(`${userDisintermediationLogs.length} anti-disintermediation incidents`);
    }

    // Suspicious activity patterns
    const recentLogins = userAuditLogs.filter(log => log.action === 'login');
    const uniqueIPs = new Set(recentLogins.map(log => log.ipAddress).filter(Boolean));
    if (uniqueIPs.size > 5 && recentLogins.length > 0) {
      baseRiskScore += Math.min(uniqueIPs.size * 3, 20); // Scale with IPs, cap at 20
      riskFactors.push(`Multiple IP addresses (${uniqueIPs.size} IPs)`);
    }

    // Failed action attempts with velocity analysis
    const failedActions = userAuditLogs.filter(log => 
      log.details?.includes('failed') || log.details?.includes('error')
    );
    const recentFailures = failedActions.filter(log => 
      log.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24h
    );
    if (failedActions.length > 10) {
      baseRiskScore += Math.min(failedActions.length, 15);
      riskFactors.push(`High failure rate: ${failedActions.length} total, ${recentFailures.length} recent`);
    }

    // User Agent diversity (potential bot activity)
    const uniqueUserAgents = new Set(userAuditLogs.map(log => log.userAgent).filter(Boolean));
    if (uniqueUserAgents.size > 3 && userAuditLogs.length > 10) {
      baseRiskScore += 10;
      riskFactors.push(`Multiple user agents (${uniqueUserAgents.size})`);
    }

    // Account status check
    if (!user.isActive) {
      baseRiskScore += 50;
      riskFactors.push('Account already suspended');
    }

    // Action velocity check (rapid successive actions)
    const rapidActions = userAuditLogs.filter(log => 
      log.createdAt > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );
    if (rapidActions.length > 50) {
      baseRiskScore += 20;
      riskFactors.push(`High action velocity: ${rapidActions.length} actions in last hour`);
    }

    // ENFORCE: Cap base score at 95 to allow OpenAI adjustment
    baseRiskScore = Math.min(baseRiskScore, 95);

    // OpenAI-powered risk analysis for final scoring
    let finalRiskScore = baseRiskScore;
    try {
      if (process.env.OPENAI_API_KEY) {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const behaviorSummary = {
          userId,
          accountAgeHours: Math.round(accountAgeHours),
          totalAuditLogs: userAuditLogs.length,
          uniqueIPs: uniqueIPs.size,
          uniqueUserAgents: uniqueUserAgents.size,
          failedActions: failedActions.length,
          recentFailures: recentFailures.length,
          antiDisintermediationIncidents: userDisintermediationLogs.length,
          isActive: user.isActive,
          baseRiskScore,
          riskFactors: riskFactors.slice(0, 5) // Limit for token efficiency
        };

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a fraud detection AI. Analyze user behavior and return a JSON with riskScore (0-100) and riskAdjustment (-10 to +10) based on patterns."
            },
            {
              role: "user", 
              content: `Analyze this user behavior for fraud risk: ${JSON.stringify(behaviorSummary)}`
            }
          ],
          max_tokens: 150,
          temperature: 0.1
        });

        const aiResponse = completion.choices[0].message.content;
        const aiAnalysis = JSON.parse(aiResponse || '{}');
        
        if (aiAnalysis.riskAdjustment && typeof aiAnalysis.riskAdjustment === 'number') {
          finalRiskScore += Math.max(-10, Math.min(10, aiAnalysis.riskAdjustment));
          riskFactors.push(`AI adjustment: ${aiAnalysis.riskAdjustment > 0 ? '+' : ''}${aiAnalysis.riskAdjustment}`);
        }
      }
    } catch (error) {
      console.warn('OpenAI risk analysis failed, using heuristic score:', error);
      // Fallback to heuristic scoring
    }

    // CRITICAL: Enforce hard cap at 100
    finalRiskScore = Math.max(0, Math.min(100, finalRiskScore));

    // Determine risk level and recommendations based on final score
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    const recommendations: string[] = [];

    if (finalRiskScore >= 80) {
      riskLevel = 'critical';
      recommendations.push('Immediate account suspension required');
      recommendations.push('Manual investigation needed');
      recommendations.push('Block all financial transactions');
    } else if (finalRiskScore >= 60) {
      riskLevel = 'high';
      recommendations.push('Enhanced monitoring required');
      recommendations.push('Restrict high-value transactions');
      recommendations.push('Additional verification needed');
    } else if (finalRiskScore >= 30) {
      riskLevel = 'medium';
      recommendations.push('Increased monitoring frequency');
      recommendations.push('Flag for review if activity increases');
    } else {
      riskLevel = 'low';
      recommendations.push('Normal monitoring sufficient');
    }

    return {
      riskScore: finalRiskScore,
      riskLevel,
      factors: riskFactors,
      recommendations
    };
  }

  async executeAutomatedResponse(userId: string, tenantId: string, riskLevel: 'low' | 'medium' | 'high' | 'critical'): Promise<{
    action: string;
    applied: boolean;
    details: string;
  }> {
    const user = await this.getUser(userId);
    if (!user || user.tenantId !== tenantId) {
      throw new Error('User not found or access denied');
    }

    // Check if user already has recent escalation to prevent duplicate actions
    const recentActions = await db.select().from(auditLogs)
      .where(and(
        eq(auditLogs.userId, userId),
        eq(auditLogs.tenantId, tenantId),
        eq(auditLogs.userAgent, 'YCore-AI-Antifraud'),
        sql`${auditLogs.createdAt} >= NOW() - INTERVAL '1 hour'`
      ))
      .limit(5);

    let action = '';
    let applied = false;
    let details = '';

    switch (riskLevel) {
      case 'critical':
        // Check if already suspended to avoid duplicate suspension
        if (!user.isActive) {
          action = 'already_suspended';
          applied = false;
          details = 'User account already suspended';
          break;
        }

        // Suspend account immediately - COMPLETE IMPLEMENTATION
        await this.updateUser(userId, { isActive: false });
        
        // Create anti-disintermediation log for critical case
        await this.createAntiDisintermediationLog({
          tenantId,
          professionalId: user.role === 'professional' ? userId : undefined,
          clientId: user.role === 'client' ? userId : undefined,
          eventType: 'suspicious_activity',
          severity: 'critical',
          details: 'Account suspended automatically by AI antifraud system due to critical risk assessment',
          evidence: {
            ipAddress: '127.0.0.1',
            userAgent: 'YCore-AI-Antifraud'
          },
          actionTaken: 'account_suspended'
        });

        // Log comprehensive audit trail
        await this.createAuditLog({
          userId,
          tenantId,
          action: 'update',
          entityType: 'user',
          entityId: userId,
          ipAddress: '127.0.0.1',
          userAgent: 'YCore-AI-Antifraud',
          details: `CRITICAL: Account suspended automatically. Risk level: ${riskLevel}. Immediate manual review required.`
        });

        action = 'account_suspended';
        applied = true;
        details = 'Account suspended due to critical risk assessment. Manual review required.';
        break;

      case 'high':
        // Check for duplicate high-risk flagging in last hour
        const recentHighRisk = recentActions.find(log => log.details?.includes('High-risk user flagged'));
        if (recentHighRisk) {
          action = 'already_flagged_high';
          applied = false;
          details = 'User already flagged as high-risk recently';
          break;
        }

        // Enhanced monitoring with restrictions
        await this.createAntiDisintermediationLog({
          tenantId,
          professionalId: user.role === 'professional' ? userId : undefined,
          clientId: user.role === 'client' ? userId : undefined,
          eventType: 'suspicious_activity',
          severity: 'high',
          details: 'User flagged for enhanced monitoring due to high risk patterns',
          evidence: {
            ipAddress: '127.0.0.1',
            userAgent: 'YCore-AI-Antifraud'
          },
          actionTaken: 'warning_sent'
        });

        await this.createAuditLog({
          userId,
          tenantId,
          action: 'access',
          entityType: 'user',
          entityId: userId,
          ipAddress: '127.0.0.1',
          userAgent: 'YCore-AI-Antifraud',
          details: `HIGH RISK: Enhanced monitoring activated. Risk level: ${riskLevel}. Transaction restrictions may apply.`
        });

        action = 'enhanced_monitoring';
        applied = true;
        details = 'Enhanced monitoring activated with transaction restrictions';
        break;

      case 'medium':
        // Check for duplicate medium-risk flagging in last hour  
        const recentMediumRisk = recentActions.find(log => log.details?.includes('Medium-risk user flagged'));
        if (recentMediumRisk) {
          action = 'already_flagged_medium';
          applied = false;
          details = 'User already flagged as medium-risk recently';
          break;
        }

        // Periodic review flagging
        await this.createAuditLog({
          userId,
          tenantId,
          action: 'access',
          entityType: 'user',
          entityId: userId,
          ipAddress: '127.0.0.1',
          userAgent: 'YCore-AI-Antifraud',
          details: `MEDIUM RISK: User flagged for periodic review. Risk level: ${riskLevel}. Increased monitoring frequency.`
        });

        action = 'flagged_for_review';
        applied = true;
        details = 'User flagged for periodic review and increased monitoring';
        break;

      case 'low':
        action = 'no_action';
        applied = false;
        details = 'Risk level acceptable, no automated action required';
        break;
    }

    return { action, applied, details };
  }

  // ========== SHIPMENTS MODULE - NEW LOGISTICS METHODS ==========

  async getShipmentsByTenant(tenantId: string): Promise<Shipment[]> {
    return db.select().from(shipments)
      .where(eq(shipments.tenantId, tenantId))
      .orderBy(desc(shipments.createdAt));
  }

  async assignCourierToShipment(shipmentId: string, courierId: string, courierModuleId: string, tenantId: string): Promise<CourierAssignment> {
    const [assignment] = await db.insert(courierAssignments).values({
      tenantId,
      shipmentId,
      courierId,
      courierModuleId,
      status: 'assigned',
    }).returning();
    return assignment;
  }

  async updateShipmentStatus(shipmentId: string, status: string, tenantId: string): Promise<Shipment> {
    const [updated] = await db.update(shipments)
      .set({ status, updatedAt: sql`now()` })
      .where(and(eq(shipments.id, shipmentId), eq(shipments.tenantId, tenantId)))
      .returning();
    return updated;
  }

  async flagShipmentAnomaly(shipmentId: string, flagType: string, severity: string, description: string, evidence: any, tenantId: string): Promise<FraudFlag> {
    const [flag] = await db.insert(fraudFlags).values({
      tenantId,
      shipmentId,
      flagType,
      severity: severity as 'low' | 'medium' | 'high' | 'critical',
      description,
      evidence,
    }).returning();
    return flag;
  }

  async getShipmentTimeline(shipmentId: string): Promise<{
    shipment: Shipment;
    tracking: ShipmentTracking[];
    assignment?: CourierAssignment;
    fraudFlags: FraudFlag[];
  }> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, shipmentId));
    if (!shipment) throw new Error('Shipment not found');

    const [tracking, assignments, flags] = await Promise.all([
      db.select().from(shipmentTracking).where(eq(shipmentTracking.shipmentId, shipmentId)).orderBy(desc(shipmentTracking.timestamp)),
      db.select().from(courierAssignments).where(eq(courierAssignments.shipmentId, shipmentId)).orderBy(desc(courierAssignments.assignedAt)),
      db.select().from(fraudFlags).where(eq(fraudFlags.shipmentId, shipmentId)).orderBy(desc(fraudFlags.createdAt)),
    ]);

    return {
      shipment,
      tracking,
      assignment: assignments[0],
      fraudFlags: flags,
    };
  }

  async updateDeliveryStatus(shipmentId: string, status: string, notes?: string, tenantId?: string): Promise<DeliveryStatus> {
    const [deliveryStatusResult] = await db.insert(deliveryStatus).values({
      tenantId,
      shipmentId,
      status: status as any, // Cast to proper enum
      deliveryNotes: notes,
      attemptedAt: sql`now()`,
    }).returning();
    return deliveryStatusResult;
  }

  // ========== AI ANTIFRAUD PATTERN DETECTION - MILESTONE 2 ==========

  // Risk Clusters Management
  async getRiskClustersByTenant(tenantId: string): Promise<RiskCluster[]> {
    return db.select().from(riskClusters)
      .where(eq(riskClusters.tenantId, tenantId))
      .orderBy(desc(riskClusters.riskScore), desc(riskClusters.createdAt));
  }

  async createRiskCluster(cluster: InsertRiskCluster): Promise<RiskCluster> {
    const [created] = await db.insert(riskClusters).values(cluster).returning();
    return created;
  }

  async updateRiskCluster(id: string, updates: Partial<InsertRiskCluster>): Promise<RiskCluster> {
    const [updated] = await db.update(riskClusters)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(riskClusters.id, id))
      .returning();
    return updated;
  }

  // Pattern Flags Management  
  async getPatternFlagsByTenant(tenantId: string, filters?: {
    userId?: string;
    moduleSource?: string;
    patternType?: string;
    severity?: string;
  }): Promise<PatternFlag[]> {
    const conditions = [eq(patternFlags.tenantId, tenantId)];
    
    if (filters?.userId) conditions.push(eq(patternFlags.userId, filters.userId));
    if (filters?.moduleSource) conditions.push(eq(patternFlags.moduleSource, filters.moduleSource));
    if (filters?.patternType) conditions.push(eq(patternFlags.patternType, filters.patternType as any));
    if (filters?.severity) conditions.push(eq(patternFlags.severity, filters.severity as any));
    
    return db.select().from(patternFlags)
      .where(and(...conditions))
      .orderBy(desc(patternFlags.createdAt));
  }

  async createPatternFlag(flag: InsertPatternFlag): Promise<PatternFlag> {
    const [created] = await db.insert(patternFlags).values(flag).returning();
    
    // Update related risk cluster statistics
    if (flag.clusterId) {
      await db.update(riskClusters)
        .set({ 
          totalIncidents: sql`${riskClusters.totalIncidents} + 1`,
          lastOccurrence: sql`now()`,
          updatedAt: sql`now()`
        })
        .where(eq(riskClusters.id, flag.clusterId));
    }
    
    return created;
  }

  // Advanced Pattern Detection Engine
  async detectPatterns(userId: string, tenantId: string, eventData: {
    moduleSource: string;
    eventType: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    additionalData?: Record<string, any>;
  }): Promise<{
    patterns: PatternFlag[];
    riskScore: number;
    recommendations: string[];
  }> {
    const detectedPatterns: PatternFlag[] = [];
    let aggregatedRiskScore = 0;
    const recommendations: string[] = [];

    // 1. Velocity Anomaly Detection
    const recentActions = await db.select().from(auditLogs)
      .where(and(
        eq(auditLogs.userId, userId),
        eq(auditLogs.tenantId, tenantId),
        sql`${auditLogs.createdAt} >= NOW() - INTERVAL '1 hour'`
      ));

    if (recentActions.length >= 20) { // High velocity threshold
      const velocityPattern = await this.createPatternFlag({
        tenantId,
        userId,
        patternType: 'velocity_anomaly',
        severity: 'high',
        confidence: 'high',
        moduleSource: eventData.moduleSource,
        eventType: eventData.eventType,
        entityId: eventData.entityId,
        triggerData: {
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
          actionVelocity: recentActions.length,
          anomalyScore: Math.min(100, recentActions.length * 2)
        },
        deviationScore: 85.0,
        riskContribution: 25.0
      });
      detectedPatterns.push(velocityPattern);
      aggregatedRiskScore += 25;
      recommendations.push('High velocity activity detected - consider rate limiting');
    }

    // 2. Cross-Module Correlation Analysis
    const crossModuleEvents = await db.select().from(patternFlags)
      .where(and(
        eq(patternFlags.userId, userId),
        eq(patternFlags.tenantId, tenantId),
        sql`${patternFlags.createdAt} >= NOW() - INTERVAL '24 hours'`
      ));

    const modulesSources = new Set(crossModuleEvents.map(e => e.moduleSource));
    if (modulesSources.size >= 3) { // Activity across multiple modules
      const correlationPattern = await this.createPatternFlag({
        tenantId,
        userId,
        patternType: 'cross_module_correlation',
        severity: 'medium',
        confidence: 'medium',
        moduleSource: eventData.moduleSource,
        eventType: eventData.eventType,
        entityId: eventData.entityId,
        triggerData: {
          correlatedEvents: Array.from(modulesSources),
          anomalyScore: modulesSources.size * 15
        },
        deviationScore: 60.0,
        riskContribution: 15.0
      });
      detectedPatterns.push(correlationPattern);
      aggregatedRiskScore += 15;
      recommendations.push('Multi-module activity pattern - monitor for coordinated attacks');
    }

    // 3. Temporal Suspicious Patterns
    const hourOfDay = new Date().getHours();
    if (hourOfDay >= 2 && hourOfDay <= 5) { // Unusual hours activity
      const temporalPattern = await this.createPatternFlag({
        tenantId,
        userId,
        patternType: 'temporal_suspicious',
        severity: 'low',
        confidence: 'medium',
        moduleSource: eventData.moduleSource,
        eventType: eventData.eventType,
        entityId: eventData.entityId,
        triggerData: {
          timingData: { hourOfDay, timezone: 'UTC' },
          anomalyScore: 30
        },
        deviationScore: 40.0,
        riskContribution: 10.0
      });
      detectedPatterns.push(temporalPattern);
      aggregatedRiskScore += 10;
      recommendations.push('Unusual time activity - verify user timezone and behavior');
    }

    return {
      patterns: detectedPatterns,
      riskScore: Math.min(100, aggregatedRiskScore),
      recommendations
    };
  }
}

export const storage = new DatabaseStorage();
