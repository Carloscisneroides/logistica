# YCore Logistics Management Platform

## Overview

YCore is a comprehensive multi-tenant logistics management platform built for courier and shipping operations. The platform provides a full-stack solution for managing courier modules, client relationships, billing operations, customer support through an intelligent ticketing system, and now includes a complete eCommerce module for online sales management. The application features a modern React frontend with shadcn/ui components, Express.js backend, and PostgreSQL database with Drizzle ORM for type-safe database operations.

The system is designed to serve multiple user roles including merchants, sub-clients, and commercial representatives, with granular permission controls and tenant-specific customization capabilities. Key features include the integrated AI-powered customer support module and the comprehensive eCommerce module for managing products, orders, customers, and marketplace integrations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Session-based authentication with protected routes

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session management
- **File Uploads**: Multer for handling multipart form data
- **API Design**: RESTful endpoints with comprehensive error handling
- **Security**: CORS, session management, and input validation

### Database Design
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive multi-tenant schema with role-based access
- **Migrations**: Drizzle Kit for database migrations and schema management
- **Key Entities**: Users, Tenants, Clients, Courier Modules, Shipments, Invoices, Support Tickets

### Multi-Tenant Architecture
- **Tenant Isolation**: Database-level tenant separation with tenant-specific branding
- **User Roles**: Admin, Merchant, Sub-client, and Commercial roles with granular permissions
- **Customization**: Tenant-specific themes, logos, and color schemes
- **Session Management**: PostgreSQL-backed session store for scalability

### Support System
- **Ticket Types**: CSM (Customer Service Management) and TSM (Technical Support Management)
- **AI Integration**: Intelligent ticket routing and automated response suggestions
- **Categories**: Predefined categories for shipping issues, billing, and platform functionality
- **Priority Levels**: Low, Medium, High, and Urgent priority classification
- **Status Tracking**: Complete ticket lifecycle management with escalation workflows

## External Dependencies

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Session Storage**: PostgreSQL-backed session management via connect-pg-simple

### Payment Processing
- **Stripe**: Payment processing and billing management
- **Stripe Connect**: Multi-party payment processing for commercial users
- **Webhooks**: Stripe webhook handling for payment events

### Development Tools
- **shadcn/ui**: Component library with Radix UI primitives
- **Vite**: Development server and build tool with HMR support
- **Replit Integration**: Development environment plugins for cartographer and dev banner

### AI and Intelligence
- **OpenAI Integration**: Planned integration for AI-powered support assistance
- **Routing Intelligence**: Automated ticket classification and routing

### File Processing
- **CSV Processing**: CSV parsing for bulk corrections and data imports
- **File Upload**: Secure file handling for attachments and bulk operations

## Recent Changes

### September 27, 2025 - Task 12: eCommerce Module Implementation
- **✅ Completed**: Full eCommerce module with comprehensive product, order, and customer management
- **Data Model**: Added 5 new database tables (ecommerceCustomers, products, ecommerceOrders, orderItems, marketplaceIntegrations)
- **Backend**: Implemented 27 storage methods and 8 API endpoints for complete eCommerce functionality
- **Frontend**: Created comprehensive React page with tabbed interface (Overview, Products, Orders, Customers)  
- **Features**: Product catalog management, order tracking, customer analytics, marketplace integrations (Shopify, WooCommerce, Amazon)
- **Statistics**: Real-time dashboard with sales metrics, revenue tracking, and top products analysis
- **Integration**: Full routing, sidebar navigation, and AI Assistant context for eCommerce operations
- **Testing**: Successful end-to-end testing confirming all core functionality working correctly

### Previous Sessions
- **Task 8-9**: AI Assistant implementation with global header access and contextual support
- **Database**: PostgreSQL schema with multi-tenant architecture and comprehensive support ticketing system
- **Authentication**: Session-based authentication with protected routes and role-based access control

### Internationalization
- **Multi-language Support**: Italian, English, Spanish, French, German, Portuguese, Dutch, Polish, Russian, Chinese, and Japanese
- **Localization**: Complete UI translations with language switching capabilities