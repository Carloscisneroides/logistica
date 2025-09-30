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
NYVRA provides a comprehensive set of operational modules including core platform functionalities, a multi-tenant system (master/client/subclient hierarchy), logistics and shipment management (routing, tracking, rates, customs, returns), e-commerce features (storefront, anti-fraud checkout), and administrative tools (documents, contracts, invoices). It supports five role-based interfaces (merchant, operator, partner, sub-client, admin) and includes an AI system for contextual assistance and predictive anti-fraud. The platform is also available as a PWA Mobile application. Key features in consolidation include marketplace connectors (Shopify, WooCommerce, Magento), subscription plans (Free, Business, Enterprise), Stripe integration for billing, and further international expansion modules.

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