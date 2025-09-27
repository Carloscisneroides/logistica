import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/ui/stats-card";
import { CourierModuleCard } from "@/components/courier/courier-module-card";
import { BillingOverview } from "@/components/billing/billing-overview";
import { CommercialCard } from "@/components/commercial/commercial-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Users, Euro, Puzzle, Bot, Crown, Clock, ArrowUp } from "lucide-react";

export default function Dashboard() {
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
  const recentClients = clients?.slice(0, 3) || [];
  const modules = courierModules || [];
  const activeModules = modules.filter((m: any) => m.status === "active");
  const pendingCorrections = corrections?.filter((c: any) => c.status === "pending").length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Spedizioni Oggi"
          value={stats.todayShipments?.toString() || "0"}
          change="+12% vs ieri"
          changeType="positive"
          icon={<Truck className="w-6 h-6 text-primary" />}
          data-testid="stats-today-shipments"
        />
        <StatsCard
          title="Clienti Attivi"
          value={stats.activeClients?.toString() || "0"}
          change="+5 questo mese"
          changeType="positive"
          icon={<Users className="w-6 h-6 text-green-600" />}
          data-testid="stats-active-clients"
        />
        <StatsCard
          title="Ricavi Mensili"
          value={`€${stats.monthlyRevenue?.toLocaleString() || "0"}`}
          change="Target: 85%"
          changeType="neutral"
          icon={<Euro className="w-6 h-6 text-accent" />}
          data-testid="stats-monthly-revenue"
        />
        <StatsCard
          title="Moduli Attivi"
          value={`${stats.activeModules || 0}/${stats.totalModules || 0}`}
          change="2 in attivazione"
          changeType="warning"
          icon={<Puzzle className="w-6 h-6 text-purple-600" />}
          data-testid="stats-active-modules"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courier Modules Panel */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Moduli Corrieri</h3>
              <Button variant="ghost" size="sm" data-testid="button-manage-modules">
                Gestisci Moduli
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {modules.map((module: any) => (
              <CourierModuleCard key={module.id} module={module} />
            ))}
            {modules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nessun modulo configurato
              </div>
            )}
          </div>
        </div>

        {/* AI Routing Panel */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">AI Routing</h3>
            <p className="text-sm text-muted-foreground mt-1">Ottimizzazione automatica corrieri</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">AI Attiva</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Sistema di routing automatico operativo
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Spedizioni oggi</span>
                <span className="text-sm font-medium text-foreground" data-testid="text-ai-today-routed">
                  {stats.aiStats?.todayRouted || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Risparmio generato</span>
                <span className="text-sm font-medium text-accent" data-testid="text-ai-savings">
                  €{stats.aiStats?.totalSavings?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Accuratezza</span>
                <span className="text-sm font-medium text-green-600" data-testid="text-ai-accuracy">
                  {((stats.aiStats?.accuracy || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Servizi AI Disponibili</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Routing Condizionato</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">ON</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Onboarding Merchant</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">ON</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Analisi Contratti</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">ON</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Selezione Conveniente</span>
                  <Badge variant="secondary">Opzionale</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Clienti Recenti</h3>
              <Button variant="ghost" size="sm" data-testid="button-view-all-clients">
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
          pendingInvoicesCount={pendingInvoices?.length || 0}
          monthlyTotal={stats.monthlyRevenue || 0}
          pendingCorrections={pendingCorrections}
        />
      </div>

      {/* Commercial Section (only for admin/managers) */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
  );
}
