# NYVRA - NETWORK YIELD VERIFICATION RISK ANALYSIS

## Overview

NYVRA (Neural Yield Verification Risk Analysis) is an enterprise-grade AI-powered antifraud and risk analysis platform designed for logistics, e-commerce, and financial operations. It functions as a SaaS, modular, multi-tenant system providing real-time neural network analysis, predictive fraud detection, comprehensive risk management, and a shipment management platform with integrated courier and reseller capabilities. The platform aims to expand globally through integration with major international partners for comprehensive fraud detection coverage.

## User Preferences

- I prefer simple language and clear explanations.
- I like an iterative development approach.
- Please ask for my approval before implementing major architectural changes.
- I prefer detailed explanations for complex technical decisions.
- Do not make changes to the `Y` directory.
- Do not modify files in the `Z` folder.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, Vite, TypeScript, Tailwind CSS, and shadcn/ui for a modern, responsive design. Wouter is used for client-side routing, and Lucide Icons provide visual elements. The platform supports 10 languages and offers white-label customization for tenants, including logos, colors, and custom domains.

### Technical Implementations
The backend is built with Node.js and Express, written in TypeScript, with PostgreSQL as the database managed by Neon, utilizing Drizzle ORM for type-safe interactions. The system is designed for containerization with Docker and Kubernetes. Authentication is session-based with multi-tenant isolation, role-based access control, and manual approval for new registrations, adhering to OWASP standards. OpenAI API is integrated for AI assistance, intelligent routing, and advanced anti-fraud pattern detection. The multi-tenant architecture ensures strict isolation through `tenantId` filtering on all queries.

### Feature Specifications
NYVRA provides a comprehensive set of operational modules including core platform functionalities, a multi-tenant system (master/client/subclient hierarchy), logistics and shipment management (routing, tracking, rates, customs, returns), e-commerce features (storefront, anti-fraud checkout), and administrative tools (documents, contracts, invoices). It supports five role-based interfaces (merchant, operator, partner, sub-client, admin) and includes an AI system for contextual assistance and predictive anti-fraud. The platform is also available as a PWA Mobile application.

#### Subscription System (✅ COMPLETED)
The subscription module is fully operational with antifraud logic and automatic monthly limits control:
- **Middleware**: `checkSubscriptionLimits`, `incrementShipmentUsage` active on POST /api/shipments
- **Tiers**: basic, premium, enterprise, custom with monthly shipment limits and pricing
- **Storage Methods**: getActiveClientSubscription, incrementSubscriptionUsage, resetAllSubscriptionUsage
- **Admin API**: Full CRUD operations for subscription management
- **Cron Job**: Automatic monthly reset (1st of month, 00:00) with configurable scheduling
- **Stripe Integration**: Ready for payment processing and subscription billing

#### E-commerce & Marketplace Integration (🔄 IN DEVELOPMENT)
Platform is designed to integrate with major e-commerce systems and marketplaces:
- **Platforms**: Shopify, WooCommerce, Magento, PrestaShop, BigCommerce
- **Custom Integration**: REST API and dedicated plugins for private stores
- **Courier Reselling**: NYVRA can purchase from external couriers and resell to end clients
- **Access Control**: Regulated by client type (base, reseller, subclient) and subscription plan

#### External Courier Providers & Marketplace Connectors (✅ COMPLETED)
Framework modulare completo per integrazioni con corrieri esterni e piattaforme e-commerce:
- **Database Schema**: 4 tabelle (external_courier_providers, marketplace_connections, marketplace_webhooks_log, external_courier_shipments)
- **Courier Providers**: FedEx, UPS, DHL, USPS, Poste Italiane, Bartolini, GLS, TNT, SDA + custom
- **Marketplace Types**: Shopify, WooCommerce, Magento, PrestaShop, BigCommerce, Amazon, eBay, Etsy + custom
- **Storage Methods**: Full CRUD operations for providers, connections, webhooks, external shipments
- **REST API**: Admin endpoints with authentication, tenant isolation, and secret sanitization
- **Connectors Implemented**: Shopify (orders sync, webhooks, fulfillment), FedEx (rates, label purchase, tracking)
- **Security Implementations**:
  - Whitelist-based sanitization: Only safe fields exposed (id, name, status, business settings)
  - All credentials stripped: apiCredentials, webhookSecret, OAuth tokens never sent to frontend
  - Tenant ownership verification: PATCH/DELETE verify tenantId match before modification
  - Immutable field protection: tenantId cannot be changed via updates
  - IDOR prevention: Cross-tenant access blocked on all admin endpoints
- **Business Logic**: Automatic markup calculation (clientCost = baseCost * (1 + markup%)), reseller mode, commission tracking
- **UI Admin**: React page for managing integrations (/admin/integrations) with test, sync, and delete functions

**Architectural Notes for Future Enhancement**:
- Consider storage-layer tenant scoping (WHERE id AND tenantId) for defense-in-depth
- Standardize on req.user vs req.session.user across entire codebase for consistency

### System Design Choices
The architecture emphasizes modularity for independent development and deployment, scalability for thousands of concurrent tenants through rate limiting, caching, and auto-scaling, and robust security measures including strict tenant isolation, RBAC, secure session management, and API security. It is compliant with GDPR, OWASP, and PCI DSS standards, and is prepared for international customs compliance. The multi-tenant design enables dynamic tenant resolution, isolated branding, and subscription enforcement.

## External Dependencies

- **Stripe & Stripe Connect**: For payment processing, marketplace payouts, subscription billing, and monetization.
- **OpenAI API**: For AI Assistant features, intelligent routing, and anti-fraud pattern detection.
- **PostgreSQL (Neon-managed)**: Primary database for all application data.
- **Object Storage**: For storing files and digital assets.
- **Replit Auth**: Unified authentication system.
- **Translation APIs**: For multi-language support.
- **Customs APIs**: For HS code prediction and tariff data.
- **Vessel/Flight Tracking APIs**: For real-time tracking in logistics modules.
- **SendGrid**: For email notifications and registration approvals.
- **Marketplace APIs**: Shopify, WooCommerce, Magento, PrestaShop (in development).
- **Courier APIs**: Integration with national and international shipping carriers.