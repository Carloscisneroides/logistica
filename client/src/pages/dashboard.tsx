import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/ui/stats-card";
import { CourierModuleCard } from "@/components/courier/courier-module-card";
import { BillingOverview } from "@/components/billing/billing-overview";
import { CommercialCard } from "@/components/commercial/commercial-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeviceInterface } from "@/hooks/use-device-interface";
import { Truck, Users, Euro, Puzzle, Bot, Crown, Clock, ArrowUp, ChevronRight, Package, TrendingUp, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { isApp } = useDeviceInterface();
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: courierModules } = useQuery({
    queryKey: ["/api/courier-modules"],
  });

  const { data: pendingInvoices } = useQuery({
    queryKey: ["/api/invoices/pending"],
  });

  const { data: corrections } = useQuery({
    queryKey: ["/api/corrections"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboardData || {};
  const recentClients = Array.isArray(clients) ? clients.slice(0, 3) : [];
  const modules = Array.isArray(courierModules) ? courierModules : [];
  const activeModules = modules.filter((m: any) => m.status === "active");
  const pendingCorrections = Array.isArray(corrections) ? corrections.filter((c: any) => c.status === "pending").length : 0;

  if (isApp) {
    // MOBILE APP-NATIVE DASHBOARD
    return (
      <div className="px-4 py-6 space-y-6">
        {/* Quick Stats - Mobile Scroll uniforme */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <div className="min-w-[160px] card-uniform flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-xs text-green-600 font-medium">+12%</span>
            </div>
            <div className="heading-2">24</div>
            <p className="body-text text-muted-foreground">Spedizioni</p>
          </div>
          <div className="min-w-[160px] card-uniform flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-xs text-green-600 font-medium">+5</span>
            </div>
            <div className="heading-2">128</div>
            <p className="body-text text-muted-foreground">Clienti</p>
          </div>
          <div className="min-w-[160px] card-uniform flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">85%</span>
            </div>
            <div className="heading-2">€2.4k</div>
            <p className="body-text text-muted-foreground">Ricavi</p>
          </div>
        </div>
        
        {/* Quick Actions - Mobile List uniforme */}
        <div className="space-y-4">
          <h2 className="heading-2">Azioni Rapide</h2>
          <div className="space-y-3">
            <div className="list-item" data-testid="quick-action-shipment">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="body-text font-semibold">Nuova Spedizione</h3>
                  <p className="text-xs text-muted-foreground">Crea spedizione rapida</p>
                </div>
              </div>
              <ChevronRight className="chevron" />
            </div>
            <div className="list-item" data-testid="quick-action-client">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="body-text font-semibold">Aggiungi Cliente</h3>
                  <p className="text-xs text-muted-foreground">Registra nuovo cliente</p>
                </div>
              </div>
              <ChevronRight className="chevron" />
            </div>
            <div className="list-item" data-testid="quick-action-ecommerce">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Puzzle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="body-text font-semibold">eCommerce</h3>
                  <p className="text-xs text-muted-foreground">Gestisci marketplace</p>
                </div>
              </div>
              <ChevronRight className="chevron" />
            </div>
          </div>
        </div>
        
        {/* Recent Activity - Mobile uniforme */}
        <div className="space-y-4">
          <h2 className="heading-2">Attività Recente</h2>
          <div className="space-y-3">
            <div className="list-item">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="body-text font-medium">Spedizione SP001 consegnata</p>
                  <p className="text-xs text-muted-foreground">2 ore fa</p>
                </div>
              </div>
            </div>
            <div className="list-item">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="body-text font-medium">Nuovo cliente registrato</p>
                  <p className="text-xs text-muted-foreground">5 ore fa</p>
                </div>
              </div>
            </div>
            <div className="list-item">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="body-text font-medium">Modulo AI routing aggiornato</p>
                  <p className="text-xs text-muted-foreground">1 giorno fa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile bottom padding for nav */}
        <div className="pb-20"></div>
      </div>
    );
  }

  // DESKTOP DASHBOARD
  return (
    <div className="desktop-container py-6 space-y-6">
      {/* Stats Cards */}
      <div className="desktop-section">
        <h2 className="heading-2 mb-4">Panoramica Generale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Spedizioni Oggi"
            value={(stats as any).todayShipments?.toString() || "24"}
            change="+12% vs ieri"
            changeType="positive"
            icon={<Truck className="w-6 h-6 text-primary" />}
            data-testid="stats-today-shipments"
          />
          <StatsCard
            title="Clienti Attivi"
            value={(stats as any).activeClients?.toString() || "128"}
            change="+5 questo mese"
            changeType="positive"
            icon={<Users className="w-6 h-6 text-green-600" />}
            data-testid="stats-active-clients"
          />
          <StatsCard
            title="Ricavi Mensili"
            value={`€${(stats as any).monthlyRevenue?.toLocaleString() || "2,400"}`}
            change="Target: 85%"
            changeType="neutral"
            icon={<Euro className="w-6 h-6 text-accent" />}
            data-testid="stats-monthly-revenue"
          />
          <StatsCard
            title="Moduli Attivi"
            value={`${(stats as any).activeModules || 12}/${(stats as any).totalModules || 15}`}
            change="2 in attivazione"
            changeType="warning"
            icon={<Puzzle className="w-6 h-6 text-purple-600" />}
            data-testid="stats-active-modules"
          />
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="desktop-section">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courier Modules Panel */}
          <div className="lg:col-span-2 card-uniform">
            <div className="pb-4 border-b border-border mb-6">
              <div className="flex items-center justify-between">
                <h3 className="heading-2">Moduli Corrieri</h3>
                <Button variant="ghost" size="sm" data-testid="button-manage-modules" className="body-text">
                  Gestisci Moduli
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {modules.map((module: any) => (
                <CourierModuleCard key={module.id} module={module} />
              ))}
              {modules.length === 0 && (
                <div className="text-center py-8 body-text text-muted-foreground">
                  Nessun modulo configurato
                </div>
              )}
            </div>
          </div>

          {/* AI Routing Panel */}
          <div className="card-uniform">
            <div className="pb-4 border-b border-border mb-6">
              <h3 className="heading-2">AI Routing</h3>
              <p className="body-text text-muted-foreground mt-1">Ottimizzazione automatica corrieri</p>
            </div>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-green-600" />
                  <span className="body-text font-medium text-green-800 dark:text-green-200">AI Attiva</span>
                </div>
                <p className="body-text text-green-700 dark:text-green-300 mt-1">
                  Sistema di routing automatico operativo
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="body-text text-muted-foreground">Spedizioni oggi</span>
                  <span className="body-text font-medium text-foreground" data-testid="text-ai-today-routed">
                    {(stats as any).aiStats?.todayRouted || 18}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="body-text text-muted-foreground">Risparmio generato</span>
                  <span className="body-text font-medium text-accent" data-testid="text-ai-savings">
                    €{(stats as any).aiStats?.totalSavings?.toLocaleString() || "1,240"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="body-text text-muted-foreground">Accuratezza</span>
                  <span className="body-text font-medium text-green-600" data-testid="text-ai-accuracy">
                    {(((stats as any).aiStats?.accuracy || 0.94) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <h4 className="body-text font-semibold text-foreground mb-3">Servizi AI Disponibili</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="body-text text-muted-foreground">Routing Condizionato</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">ON</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="body-text text-muted-foreground">Onboarding Merchant</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">ON</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="body-text text-muted-foreground">Analisi Contratti</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">ON</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="body-text text-muted-foreground">Selezione Conveniente</span>
                    <Badge variant="secondary" className="text-xs">Opzionale</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="desktop-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Clients */}
          <div className="card-uniform">
            <div className="pb-4 border-b border-border mb-6">
              <div className="flex items-center justify-between">
                <h3 className="heading-2">Clienti Recenti</h3>
                <Button variant="ghost" size="sm" data-testid="button-view-all-clients" className="body-text">
                  Vedi Tutti
                </Button>
              </div>
            </div>
          <div className="divide-y divide-border">
            {recentClients.map((client: any) => (
              <div key={client.id} className="p-4 hover:bg-muted/50" data-testid={`client-card-${client.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">
                        {client.name?.slice(0, 2).toUpperCase() || "??"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {client.type} • {client.billingMode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={client.isActive ? "default" : "secondary"}
                      className={client.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {client.isActive ? "Attivo" : "Inattivo"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      €{client.currentBalance || "0"}/saldo
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {recentClients.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Nessun cliente recente
              </div>
            )}
          </div>
        </div>

        {/* Billing Overview */}
        <BillingOverview 
          pendingInvoicesCount={Array.isArray(pendingInvoices) ? pendingInvoices.length : 0}
          monthlyTotal={(stats as any).monthlyRevenue || 0}
          pendingCorrections={pendingCorrections}
        />
        </div>
      </div>

      {/* Commercial Section (only for admin/managers) */}
      <div className="desktop-section">
        <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Team Commerciali</h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Provvigioni Totali Mese:</span>
              <span className="text-lg font-bold text-accent" data-testid="text-total-commissions">
                €15,670
              </span>
              <Button variant="ghost" size="sm" data-testid="button-manage-commercial">
                Gestisci
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="desktop-grid-uniform grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CommercialCard
              name="Marco Rossi"
              role="Senior Account"
              clients={23}
              revenue={34200}
              commission={4890}
              initials="MR"
            />
            <CommercialCard
              name="Laura Verdi"
              role="Key Account"
              clients={18}
              revenue={28750}
              commission={4020}
              initials="LV"
            />
            <CommercialCard
              name="Andrea Bianchi"
              role="Account Manager"
              clients={31}
              revenue={41320}
              commission={5850}
              initials="AB"
            />
            <CommercialCard
              name="Sara Neri"
              role="Junior Account"
              clients={12}
              revenue={15680}
              commission={910}
              initials="SN"
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
