/*
 * NYVRA - Neural Yield Verification Risk Analysis
 * Copyright © 2025 NYVRA Platform - All Rights Reserved
 * 
 * WATERMARK: nyvra-app-f47ac10b-58cc-4372-a567-0e02b2c3d479
 * BUILD: 2025-09-29T22:08:15.000Z
 * MODULE: Frontend Core Application
 * 
 * UNAUTHORIZED COPYING, MODIFICATION, DISTRIBUTION, OR USE OF THIS SOFTWARE
 * IS STRICTLY PROHIBITED. THIS SOFTWARE CONTAINS PROPRIETARY AND CONFIDENTIAL
 * INFORMATION OWNED BY NYVRA PLATFORM.
 */

import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNavigation } from "@/components/pwa/bottom-navigation";
import { SplashScreen } from "@/components/pwa/splash-screen";
//import { MobileNavigationDebug } from "@/components/debug/mobile-navigation-debug";
import { MobileHeaderMenu } from "@/components/pwa/mobile-header-menu";
import { MobileNavigationProvider, useMobileNavigationContext } from "@/contexts/mobile-navigation-context";
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

// Role-based pages
import SystemCreatorDashboard from "./pages/roles/system-creator-dashboard";
import AdminPanel from "./pages/roles/admin-panel";
import StaffConsole from "./pages/roles/staff-console";
import ClientArea from "./pages/roles/client-area";
import MarketplaceArea from "./pages/roles/client/marketplace-area";
import LogisticaArea from "./pages/roles/client/logistica-area";
import AgenteDashboard from "./pages/roles/commerciale/agente-dashboard";
import ResponsabileDashboard from "./pages/roles/commerciale/responsabile-dashboard";
import { RoleProtected } from "./components/role-protected";
import EcommerceSuppliersPage from "@/pages/ecommerce-suppliers-page";
import WalletPage from "@/pages/wallet-page";
import RatesCarriersPage from "@/pages/rates-carriers-page";
import GlobalLogisticsPage from "@/pages/global-logistics-page";
import NotFound from "@/pages/not-found";
import CommercialRegistration from "@/pages/commercial-registration";
import { useDeviceInterface } from "@/hooks/use-device-interface";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isApp, isPC } = useDeviceInterface();
  const [location] = useLocation();
  
  // Gestione sicura del Context
  let navigationState;
  try {
    navigationState = useMobileNavigationContext();
  } catch (error) {
    // Fallback se Context non disponibile
    navigationState = null;
  }

  // Mappa dinamica titoli pagine
  const getPageTitle = (path: string): string => {
    const titleMap: Record<string, string> = {
      '/': 'Dashboard',
      '/shipments': 'Spedizioni',
      '/shipment-tracking': 'Tracking Spedizioni',
      '/shipments-list': 'Elenco Spedizioni',
      '/logistics-warehouses': 'Magazzini Logistica',
      '/courier-modules': 'Moduli Corrieri',
      '/rates-carriers': 'Listini & Corrieri',
      '/global-logistics': 'Logistica Globale',
      '/clients': 'Clienti',
      '/billing': 'Fatturazione',
      '/corrections': 'Correzioni',
      '/commercial': 'Commerciale',
      '/commerciale/agente': 'Dashboard Agente',
      '/commerciale/responsabile': 'Dashboard Responsabile',
      '/support': 'Supporto',
      '/ecommerce': 'eCommerce',
      '/ecommerce-warehouses': 'Magazzini eCommerce',
      '/ecommerce-suppliers': 'Fornitori eCommerce',
      '/marketplace': 'Marketplace',
      '/fidelity': 'Programma Fedeltà',
      '/wallet': 'Wallet NYVRA',
      '/system-creator': 'System Creator',
      '/admin': 'Pannello Admin',
      '/staff': 'Console Staff',
      '/client-area': 'Area Cliente',
      '/client/marketplace': 'Marketplace Area',
      '/client/logistica': 'Logistica Area',
    };
    return titleMap[path] || 'NYVRA';
  };

  const pageTitle = getPageTitle(location);

  // ===== ARCHITETTURA UNIFICATA YLENIA SACCO =====
  if (isApp) {
    // MODALITÀ MOBILE - Gestione centralizzata menu
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            title={pageTitle} 
            mobileMode={true}
            navigationState={navigationState}
          />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        {/* Mobile Header Menu - Appare sopra tutto quando attivo */}
        {navigationState && (
          <MobileHeaderMenu 
            isOpen={navigationState.isHeaderMenuOpen}
            onClose={navigationState.closeAllMenus}
          />
        )}
      </div>
    );
  }

  // MODALITÀ DESKTOP - Logica tradizionale
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar className={sidebarOpen ? "" : "hidden lg:block"} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={pageTitle} 
          mobileMode={false}
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
      <Route path="/registrazione-commerciale" component={CommercialRegistration} />
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
      
      {/* Role-based dashboards */}
      <ProtectedRoute path="/system-creator" component={() => (
        <RoleProtected allowedRoles={['system_creator']}>
          <MainLayout>
            <SystemCreatorDashboard />
          </MainLayout>
        </RoleProtected>
      )} />
      <ProtectedRoute path="/admin-panel" component={() => (
        <RoleProtected allowedRoles={['system_creator', 'admin']}>
          <MainLayout>
            <AdminPanel />
          </MainLayout>
        </RoleProtected>
      )} />
      <ProtectedRoute path="/staff-console" component={() => (
        <RoleProtected allowedRoles={['system_creator', 'admin', 'staff']}>
          <MainLayout>
            <StaffConsole />
          </MainLayout>
        </RoleProtected>
      )} />
      <ProtectedRoute path="/client-area" component={() => (
        <RoleProtected allowedRoles={['system_creator', 'admin', 'staff', 'client']}>
          <MainLayout>
            <ClientArea />
          </MainLayout>
        </RoleProtected>
      )} />
      <ProtectedRoute path="/client/marketplace" component={() => (
        <RoleProtected allowedRoles={['client']} clientType="marketplace">
          <MainLayout>
            <MarketplaceArea />
          </MainLayout>
        </RoleProtected>
      )} />
      <ProtectedRoute path="/client/logistica" component={() => (
        <RoleProtected allowedRoles={['client']} clientType="logistica">
          <MainLayout>
            <LogisticaArea />
          </MainLayout>
        </RoleProtected>
      )} />
      <ProtectedRoute path="/commerciale/agente" component={() => (
        <RoleProtected allowedRoles={['commerciale']} subRole="agente">
          <MainLayout>
            <AgenteDashboard />
          </MainLayout>
        </RoleProtected>
      )} />
      <ProtectedRoute path="/commerciale/responsabile" component={() => (
        <RoleProtected allowedRoles={['commerciale']} subRole="responsabile">
          <MainLayout>
            <ResponsabileDashboard />
          </MainLayout>
        </RoleProtected>
      )} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { toast } = useToast();

  // PWA Install Feedback Listener
  useEffect(() => {
    const handleAppInstalled = () => {
      toast({
        title: "🎉 App Installata!",
        description: "NYVRA è stata installata con successo sul dispositivo",
        duration: 5000,
      });
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, [toast]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <MobileNavigationProvider>
            <SplashScreen />
            <Router />
            <Toaster />
          </MobileNavigationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
