# YCORE - MODULAR SAAS ECOSYSTEM

**Sender**: Ylenia Sacco – Strategic Lead YS Logistics
**Recipient**: Reply Team / Technical AI Interlocutor

## Overview

YCORE is a modular and scalable SaaS ecosystem designed for comprehensive logistics, commercial, and operational management. Its core purpose is to provide a robust platform with contextual AI, multi-tenant segmentation, competitive protection, and integrated monetization. The project is strategically expanding to integrate with international partners such as Temu, Shein, Alibaba, and global logistics providers like Maersk, DHL, and Cainiao. Key capabilities include multi-language support (10 languages), role-specific environments, and specialized modules for maritime/air fleets, container management, customs documentation, and intercontinental tracking. The vision is to establish YCORE as a leading global logistics and e-commerce platform.

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
- **AI Assistant**: Global access from the header, dynamic context for all modules (dashboard, clients, shipments, eCommerce, marketplace).
- **eCommerce Module**: Manages products, orders, customers, and integrates with marketplaces.
- **Logistics/Shipment Module**: Comprehensive shipment management including QR/tracking labels, private courier GPS tracking, and dedicated interfaces for Merchant, Client, Courier, and Admin roles. Features advanced anti-fraud integration, mobile courier interface, undelivered shipment management, and reverse logistics.
- **AI Anti-fraud**: AI-powered pattern detection (velocity, cross-module, temporal analysis), dynamic risk clustering, automated response mechanisms (warnings, enhanced monitoring, account suspension), OpenAI integration for risk adjustment, and robust evidence collection.
- **Digital Professional Marketplace**: (90% complete) Features a bidding system, portfolio management, anti-disintermediation protection, modular commissions, AI-driven client-professional matching, and Stripe Connect for milestone payments.
- **Planned International Expansion Modules**: Maritime/Air Fleet Management (IMO, AIS, IATA integration), Container Management (ISO 6346, RFID/IoT, cold chain monitoring), AI-powered Customs Documentation (OCR, HS code prediction, compliance checks), and Intercontinental Tracking (global route dashboards, AI-powered ETA, anomaly detection).

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