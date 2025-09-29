# NUVRA - MODULAR SAAS ECOSYSTEM

**Sender**: Ylenia Sacco – Strategic Lead YS Logistics
**Recipient**: Reply Team / Technical AI Interlocutor

## Overview

Nuvra is a modular and scalable SaaS ecosystem designed for comprehensive logistics, commercial, and operational management. Launched from zero in 48 hours, Nuvra is now operativo, antifrode, multilingua, and modulare with 45+ database tables, PWA mobile architecture, and ready for SRL innovativa and international partners.

The platform provides a robust foundation with contextual AI, multi-tenant segmentation, competitive protection, and integrated monetization. Strategic expansion includes integration with international partners (Temu, Shein, Alibaba, Maersk, DHL, Cainiao) and the new Glovo-model integration for marketplace delivery services.

**Key Status (September 2025):**
- ✅ Core Platform: Operational with mobile navigation system
- ✅ 50+ Specialized Modules: Fully inventoried and categorized  
- ✅ PWA Mobile: Refactored with centralized hook architecture
- ✅ Multilingua: 10 languages ready for global distribution
- ✅ White-label: Complete customization for sub-clients
- ✅ Anti-fraud: Integrated system with AI prediction
- 🔧 Enterprise Modules: In consolidation phase
- 🔧 Marketplace: 90% complete with Glovo integration planned

## Stato Piattaforma
- ✅ Core Platform operativo con navigazione mobile centralizzata (useMobileNavigationState)
- ✅ 50+ moduli inventariati e categorizzati
- ✅ PWA Mobile rifattorizzato con hook centralizzato
- ✅ Sistema AI integrato (Assistant + Anti-fraud)
- ✅ Architettura modulare scalabile per migliaia di tenant

## Punti Chiave per Partner
- **Rapidità**: Lanciato da zero in 48h
- **Scalabilità**: 45+ tabelle, isolamento multi-tenant
- **Sicurezza**: Sistema antifrode integrato
- **Internazionalizzazione**: Traduzione in 10 lingue
- **White-label**: Personalizzazione completa per sottoclienti (logo, colori, app mobile)

## Stato Deployment
- **Codebase stabile e testato**
- **Documentazione tecnica completa**
- **Architettura enterprise-ready**
- **Roadmap chiara V1 → V5**
- **Foglio Tecnico Unificato**: Disponibile per presentazioni partner
- **Versione multilingua**: In preparazione per distribuzione globale

## User Preferences

- I prefer simple language and clear explanations.
- I like an iterative development approach.
- Please ask for my approval before implementing major architectural changes.
- I prefer detailed explanations for complex technical decisions.
- Do not make changes to the `Y` directory.
- Do not modify files in the `Z` folder.

## System Architecture

### UI/UX Decisions
The frontend utilizes React 18 with Vite and TypeScript, styled with shadcn/ui and Tailwind CSS for a modern, responsive interface. Wouter handles client-side routing, and Lucide Icons provide visual elements.

### Technical Implementations
- **Frontend**: React 18, Vite, TypeScript, shadcn/ui, Tailwind CSS, Wouter, TanStack Query for state management, React Hook Form with Zod for forms, Playwright for E2E testing, and 10-language internationalization.
- **Backend**: Node.js, Express, TypeScript, PostgreSQL with Drizzle ORM for type-safe database interactions.
- **Authentication**: Session-based with multi-tenant isolation, role-based access control, and OWASP compliant security.
- **AI Integration**: OpenAI API is used for contextual AI assistance, intelligent routing, and pattern detection within the anti-fraud system.
- **Database**: PostgreSQL with a multi-tenant optimized schema, over 45 tables across core modules, Drizzle ORM for type safety and auto-migrations, comprehensive audit logging, and automated backups. A dedicated anti-fraud database is implemented for pattern detection and risk scoring.

### Feature Specifications

**OPERATIONAL MODULES (✅ Ready):**
- **Core Platform**: Dashboard, authentication, security
- **Logistica & Spedizioni**: 7 active modules (routing, tracking, rates, customs, returns)
- **eCommerce**: Storefront, anti-fraud checkout, loyalty system
- **Sistema Amministrativo**: Documents, contracts, invoices, SRL registry
- **Role-based Interfaces**: 5 areas (merchant, operator, partner, sub-client, admin)
- **Sistema AI**: Contextual assistant, predictive anti-fraud
- **PWA Mobile**: Refactored UI, category access, unified registration

**IN CONSOLIDATION (🔧 Refinement Phase):**
- **Global Enterprise Module**: Maritime/Air fleet management perfection
- **Clienti & CRM**: Client management, anti-fraud profiling refinement
- **Finanziario**: Billing, payments, Stripe testing phase
- **Marketplace Digitale**: 90% complete + planned Glovo model integration
- **Commerciale**: AI offers, coupons, upselling refinement
- **Espansione Internazionale**: 4 modules in rollout (localization, compliance, partner APIs, distribution)

**MULTILINGUA & PERSONALIZATION:**
- **10 Languages**: IT, EN, ES, FR, DE, PT, AR, ZH, JA, TR with adaptive UI/UX
- **White-label Customization**: Complete branding for sub-clients (logo, colors, domain, mobile icons)
- **Competitive Defense**: Isolated environments, no cross-visibility, anti-fraud protection

### System Design Choices
- **Modularity**: Core design principle allowing independent development and deployment of features.
- **Scalability**: Optimized for thousands of concurrent tenants with rate limiting, caching, code splitting, lazy loading, and auto-scaling infrastructure.
- **Security**: Strict tenant isolation, role-based access control, secure session management, API security (validation, sanitization), audit logging, data encryption, and an enterprise-grade AI anti-fraud system.
- **Compliance**: GDPR ready, OWASP best practices, PCI DSS (via Stripe), and prepared for international customs compliance.

## External Dependencies

- **Stripe & Stripe Connect**: For payment processing, marketplace payouts, and automatic monetization.
- **OpenAI API**: Integrated for AI Assistant functionalities, intelligent routing, and advanced pattern detection in the anti-fraud system.
- **PostgreSQL**: The primary managed database for all application data.
- **Object Storage**: Utilized for storing files, media, and other digital assets.
- **Replit Auth**: The unified authentication system for user management.
- **Neon (for PostgreSQL)**: Managed PostgreSQL service.
- **Translation APIs**: For multi-language support.
- **Customs APIs**: For HS code prediction and tariff data in customs documentation.
- **Vessel/Flight Tracking APIs**: For real-time tracking in maritime and air fleet modules.
- **SendGrid**: For email notifications.