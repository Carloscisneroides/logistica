import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  CreditCard, 
  Gift, 
  Users, 
  Zap, 
  TrendingUp, 
  MapPin,
  Trophy,
  Sparkles,
  Plus,
  Eye
} from "lucide-react";

// Fidelity Dashboard Stats Component
function FidelityDashboard() {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["/api/fidelity/dashboard/stats"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fidelity Card Manager</h1>
          <p className="text-muted-foreground">Gestione completa carte fedeltà digitali per engagement territoriale</p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="button-issue-card">
            <Plus className="w-4 h-4 mr-2" />
            Emetti Carta
          </Button>
          <Button variant="outline" data-testid="button-create-offer">
            <Gift className="w-4 h-4 mr-2" />
            Nuova Offerta
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-cards">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carte Totali</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-cards">
              {stats?.totalCards?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats?.activeCards || 0}</span> attive questo mese
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-offers">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offerte Attive</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-offers">
              {stats?.activeOffers?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              di {stats?.totalOffers || 0} totali
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-redemptions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Riscatti Mensili</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-monthly-redemptions">
              {stats?.monthlyRedemptions?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalRedemptions?.toLocaleString() || '0'} totali
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-cashback">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cashback Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-cashback">
              €{stats?.totalCashback?.toLocaleString('it-IT', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeSponsors || 0} sponsor attivi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Panoramica</TabsTrigger>
          <TabsTrigger value="cards" data-testid="tab-cards">Carte</TabsTrigger>
          <TabsTrigger value="offers" data-testid="tab-offers">Offerte</TabsTrigger>
          <TabsTrigger value="promoters" data-testid="tab-promoters">Promoter</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Merchants */}
            <Card data-testid="card-top-merchants">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Top Merchant
                </CardTitle>
                <CardDescription>Attività commerciali con più riscatti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isError ? (
                    <div className="text-center py-4 text-destructive">
                      <p>Errore caricamento dati</p>
                      <Button size="sm" variant="outline" className="mt-2">Riprova</Button>
                    </div>
                  ) : stats?.topMerchants && stats.topMerchants.length > 0 ? (
                    stats.topMerchants.slice(0, 5).map((merchant, index) => (
                      <div key={merchant.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="font-medium" data-testid={`merchant-name-${merchant.id}`}>
                            {merchant.name}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground" data-testid={`merchant-redemptions-${merchant.id}`}>
                          {merchant.redemptions} riscatti
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Nessun dato disponibile
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Promoter Performance */}
            <Card data-testid="card-promoter-stats">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Performance Promoter
                </CardTitle>
                <CardDescription>Promoter territoriali più performanti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isError ? (
                    <div className="text-center py-4 text-destructive">
                      <p>Errore caricamento promoter</p>
                      <Button size="sm" variant="outline" className="mt-2">Riprova</Button>
                    </div>
                  ) : stats?.promoterStats && stats.promoterStats.length > 0 ? (
                    stats.promoterStats.slice(0, 5).map((promoter, index) => (
                      <div key={promoter.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="font-medium" data-testid={`promoter-name-${promoter.id}`}>
                            {promoter.name}
                          </span>
                        </div>
                        <div className="text-right text-sm">
                          <div data-testid={`promoter-cards-${promoter.id}`}>
                            {promoter.cardsDistributed} carte
                          </div>
                          <div className="text-muted-foreground" data-testid={`promoter-conversions-${promoter.id}`}>
                            {promoter.conversions} conversioni
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Nessun promoter attivo
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <FidelityCardsManager />
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <FidelityOffersManager />
        </TabsContent>

        <TabsContent value="promoters" className="space-y-4">
          <PromoterManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <FidelityAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Cards Management Component  
function FidelityCardsManager() {
  const { data: cards, isLoading } = useQuery({
    queryKey: ["/api/fidelity/cards"]
  });

  return (
    <Card data-testid="card-cards-manager">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Gestione Carte Fedeltà
        </CardTitle>
        <CardDescription>
          Visualizza e gestisci tutte le carte fedeltà emesse
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {cards?.length || 0} carte trovate
              </p>
              <Button size="sm" data-testid="button-view-all-cards">
                <Eye className="w-4 h-4 mr-2" />
                Visualizza Tutte
              </Button>
            </div>
            {cards?.slice(0, 3)?.map(card => (
              <div key={card.id} className="border rounded-lg p-4 space-y-2" data-testid={`card-item-${card.id}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium" data-testid={`card-code-${card.id}`}>#{card.code}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: <Badge variant={card.status === 'active' ? 'default' : 'secondary'}>
                        {card.status}
                      </Badge>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Livello {card.tier}</p>
                    <p className="text-xs text-muted-foreground">
                      Punti: {card.currentPoints || 0}
                    </p>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-center text-muted-foreground py-8">
                Nessuna carta emessa ancora
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Offers Management Component
function FidelityOffersManager() {
  const { data: offers, isLoading } = useQuery({
    queryKey: ["/api/fidelity/offers"],
    refetchInterval: 60000 // Refresh every minute for active offers
  });

  return (
    <Card data-testid="card-offers-manager">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Offerte Geolocalizzate
        </CardTitle>
        <CardDescription>
          Gestione offerte territoriali con geofencing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {offers?.length || 0} offerte disponibili
              </p>
              <Button size="sm" data-testid="button-manage-offers">
                <MapPin className="w-4 h-4 mr-2" />
                Gestisci Geofence
              </Button>
            </div>
            {offers?.slice(0, 3)?.map(offer => (
              <div key={offer.id} className="border rounded-lg p-4" data-testid={`offer-item-${offer.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium" data-testid={`offer-title-${offer.id}`}>
                      {offer.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {offer.description}
                    </p>
                  </div>
                  <Badge 
                    variant={offer.status === 'active' ? 'default' : 'secondary'}
                    data-testid={`offer-status-${offer.id}`}
                  >
                    {offer.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Sconto: {offer.discountPercentage}%</span>
                  <span>Punti: {offer.pointsCost}</span>
                  {offer.geofence && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Geolocalizzata
                    </span>
                  )}
                </div>
              </div>
            )) || (
              <p className="text-center text-muted-foreground py-8">
                Nessuna offerta attiva
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Promoter Management Component
function PromoterManager() {
  const { data: promoters, isLoading } = useQuery({
    queryKey: ["/api/fidelity/promoters"]
  });

  return (
    <Card data-testid="card-promoter-manager">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Promoter Territoriali
        </CardTitle>
        <CardDescription>
          Gestione promoter per engagement locale
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {promoters?.map(promoter => (
              <div key={promoter.id} className="border rounded-lg p-4" data-testid={`promoter-item-${promoter.id}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium" data-testid={`promoter-name-${promoter.id}`}>
                      {promoter.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {promoter.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={promoter.isActive ? 'default' : 'secondary'}>
                        {promoter.isActive ? 'Attivo' : 'Inattivo'}
                      </Badge>
                      {promoter.geofenceArea && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Area assegnata
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {promoter.cardsDistributed} carte distribuite
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {promoter.conversions} conversioni
                    </p>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-center text-muted-foreground py-8">
                Nessun promoter registrato
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Analytics Component  
function FidelityAnalytics() {
  return (
    <Card data-testid="card-analytics">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Analytics AI-Powered
        </CardTitle>
        <CardDescription>
          Analisi comportamentale e suggerimenti intelligenti
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Analytics Avanzati</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Analisi comportamentale con AI, predizioni territoriali, e ottimizzazione 
              automatica delle offerte basata su geolocalizzazione e preferenze utenti.
            </p>
          </div>
          <Button data-testid="button-enable-analytics">
            <Sparkles className="w-4 h-4 mr-2" />
            Abilita Analytics AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FidelityPage() {
  return <FidelityDashboard />;
}