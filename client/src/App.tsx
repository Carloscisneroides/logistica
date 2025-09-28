/*
 * YCore SaaS Ecosystem - Proprietary Software
 * Copyright © 2025 YCore SRL Innovativa - All Rights Reserved
 * 
 * WATERMARK: ycore-app-f47ac10b-58cc-4372-a567-0e02b2c3d479
 * BUILD: 2025-09-27T22:08:15.000Z
 * MODULE: Frontend Core Application
 * 
 * UNAUTHORIZED COPYING, MODIFICATION, DISTRIBUTION, OR USE OF THIS SOFTWARE
 * IS STRICTLY PROHIBITED. THIS SOFTWARE CONTAINS PROPRIETARY AND CONFIDENTIAL
 * INFORMATION OWNED BY YCORE SRL INNOVATIVA.
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useState } from "react";

// Pages
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import CourierModules from "@/pages/courier-modules";
import Clients from "@/pages/clients";
import Billing from "@/pages/billing";
import Corrections from "@/pages/corrections";
import Commercial from "@/pages/commercial";
import SupportPage from "@/pages/support-page";
import { EcommercePage } from "@/pages/ecommerce-page";
import { MarketplacePage } from "@/pages/marketplace-page";
import FidelityPage from "@/pages/fidelity-page";
import ShipmentsPage from "@/pages/shipments";
import ShipmentTrackingPage from "@/pages/shipment-tracking-page";
import ShipmentsListPage from "@/pages/shipments-list-page";
import LogisticsWarehousesPage from "@/pages/logistics-warehouses-page";
import EcommerceWarehousesPage from "@/pages/ecommerce-warehouses-page";
import EcommerceSuppliersPage from "@/pages/ecommerce-suppliers-page";
import WalletPage from "@/pages/wallet-page";
import RatesCarriersPage from "@/pages/rates-carriers-page";
import GlobalLogisticsPage from "@/pages/global-logistics-page";
import NotFound from "@/pages/not-found";

function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar className={sidebarOpen ? "" : "hidden lg:block"} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={() => (
        <MainLayout>
          <Dashboard />
        </MainLayout>
      )} />
      <ProtectedRoute path="/shipments" component={() => (
        <MainLayout>
          <ShipmentsPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/courier-modules" component={() => (
        <MainLayout>
          <CourierModules />
        </MainLayout>
      )} />
      <ProtectedRoute path="/clients" component={() => (
        <MainLayout>
          <Clients />
        </MainLayout>
      )} />
      <ProtectedRoute path="/billing" component={() => (
        <MainLayout>
          <Billing />
        </MainLayout>
      )} />
      <ProtectedRoute path="/corrections" component={() => (
        <MainLayout>
          <Corrections />
        </MainLayout>
      )} />
      <ProtectedRoute path="/commercial" component={() => (
        <MainLayout>
          <Commercial />
        </MainLayout>
      )} />
      <ProtectedRoute path="/support" component={() => (
        <MainLayout>
          <SupportPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/ecommerce" component={() => (
        <MainLayout>
          <EcommercePage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/marketplace" component={() => (
        <MainLayout>
          <MarketplacePage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/fidelity" component={() => (
        <MainLayout>
          <FidelityPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/rates-carriers" component={() => (
        <MainLayout>
          <RatesCarriersPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/shipment-tracking" component={() => (
        <MainLayout>
          <ShipmentTrackingPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/shipments-list" component={() => (
        <MainLayout>
          <ShipmentsListPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/logistics-warehouses" component={() => (
        <MainLayout>
          <LogisticsWarehousesPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/ecommerce/warehouses" component={() => (
        <MainLayout>
          <EcommerceWarehousesPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/ecommerce/suppliers" component={() => (
        <MainLayout>
          <EcommerceSuppliersPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/wallet" component={() => (
        <MainLayout>
          <WalletPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/global-logistics" component={() => (
        <MainLayout>
          <GlobalLogisticsPage />
        </MainLayout>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
