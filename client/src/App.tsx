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
