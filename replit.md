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

#### E-commerce & Marketplace Integration (✅ COMPLETED)
Platform foundation for major e-commerce systems and marketplaces:
- **Platforms**: Shopify, WooCommerce, Magento, PrestaShop, BigCommerce, Custom
- **Schema Predisposto**: 6 piattaforme supportate con enums e validazione
- **API Touchpoints**: Webhook handling, order sync, product/inventory management
- **Security**: Protezione duplicati, validazione webhook, crittografia credenziali
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

### Multi-Tenant Architecture & Branding

#### Gerarchia Operativa
The platform implements a four-tier multi-tenant hierarchy:

1. **MASTER** → Gestisce provider esterni e logica AI
   - Controllo globale della piattaforma
   - Gestione provider di corrieri esterni
   - Configurazione moduli AI e antifrode
   
2. **CLIENTI** → Acquistano da NYVRA, attivano corrieri
   - Sottoscrizione ai servizi NYVRA
   - Attivazione corrieri tramite TenantCarrierContract
   - Gestione autonoma dei propri sottoclienti

3. **INTEGRATORI** → Personalizzano, collegano contratti propri, rivendono
   - White-label customization (logo, colori, dominio)
   - Contratti API propri con corrieri
   - Rivendita servizi a clienti finali

4. **SOTTOCLIENTI** → Accedono in white-label, vedono solo corrieri attivati
   - Visibilità limitata ai corrieri attivati dal cliente padre
   - Branding personalizzato del cliente padre
   - NYVRA e provider esterni invisibili

#### Ruoli Operativi Logistica

Ruoli concettuali specifici per il modulo logistica nazionale e globale:

- **SUPERADMIN**: Accesso completo, provisioning globale
- **ADMIN**: Gestione tenant, attivazione corrieri, branding
- **INTEGRATOR**: Personalizzazione, contratti API, rivendita
- **CLIENTE BASE**: Accesso limitato, solo NYVRA come provider
- **SOTTOCLIENTE**: Visibilità filtrata, branding cliente

#### Ruoli Piattaforma Completa

Sistema di ruoli tecnici implementato nel database (userRoleEnum):

- **system_creator**: Creatore del sistema, accesso root completo
- **admin**: Amministratore piattaforma, gestione globale
- **staff**: Personale interno, operazioni quotidiane
- **client**: Cliente della piattaforma (con client_type: marketplace/logistica)
- **commerciale**: Rete commerciale (con sub_role: agente/responsabile)
- **merchant**: Merchant e-commerce, gestione negozio

**Sub-Ruoli Commerciali**:
- **agente**: Agente commerciale (con livello: base/medium/premium e grado: 1/2/3)
- **responsabile**: Responsabile commerciale

**Tipi Cliente**:
- **marketplace**: Cliente marketplace/e-commerce
- **logistica**: Cliente logistica nazionale/globale

### Moduli AI Intelligenti

#### DASHBOARD AI
- Analisi antifrode in tempo reale
- Visualizzazione flussi operativi e alert
- Previsioni e trend analysis
- Performance monitoring corrieri e marketplace

#### ShipSync AI
- Aggregazione tariffe multi-carrier
- Ottimizzazione automatica per costo, tempo, affidabilità
- Auto-assegnazione corriere basata su regole business + AI
- Route optimization e carrier selection

#### ReturnFlow AI
- Rilevamento pattern fraudolenti nei resi
- Prevenzione automatica su clienti ad alto rischio
- Analisi comportamentale e scoring
- Alert proattivi per anomalie

#### AddiCalc AI
- Calcolo supplementi dinamici per peso, volume, destinazione
- Integrazione con pricing e subscription antifraud
- Ottimizzazione margini e commissioni
- Gestione automatica rate cards

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

## Roadmap

### Q4 2025 (✅ COMPLETED)
- ✅ Blindatura middleware tenant completata
- ✅ Refactor attivazione per-tenant completato
- ✅ Visibilità corrieri corretta implementata
- ✅ Subscription antifraud completato
- ✅ E-commerce foundation completata
- ✅ Modulo corrieri esterni completato
- 🔄 Rinomina OverviewF → DASHBOARD (in progress)
- 🔄 Deprecazione dashboard legacy (in progress)

### Q1 2026 (PLANNED)
- 📋 Implementazione connettori Shopify, WooCommerce
- 📋 UI Admin per gestione corrieri e integrazioni
- 📋 Attivazione moduli AI: ShipSync, ReturnFlow, AddiCalc
- 📋 Onboarding partner e licensing white-label
- 📋 Unificazione ambienti NYVRIA–SWIFT