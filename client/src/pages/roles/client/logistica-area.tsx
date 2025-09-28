import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, MapPin, Clock, CheckCircle, AlertTriangle, User, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function LogisticaArea() {
  const { user } = useAuth();

  const { data: shipments } = useQuery({
    queryKey: ['/api/client/logistics-shipments'],
    enabled: user?.role === 'client' && user?.clientType === 'logistica'
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/client/logistics-stats'],
    enabled: user?.role === 'client' && user?.clientType === 'logistica'
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-8 w-8 text-blue-600" />
            Area Logistica
          </h1>
          <p className="text-muted-foreground mt-2">
            Benvenuto {user?.username}! Gestisci le tue spedizioni e servizi logistici
          </p>
        </div>
        <Badge variant="default" className="px-3 py-1">
          <Package className="h-4 w-4 mr-1" />
          LOGISTICS CLIENT
        </Badge>
      </div>

      {/* Logistics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spedizioni Attive</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeShipments || 8}</div>
            <p className="text-xs text-muted-foreground">
              In corso di consegna
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questo Mese</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthlyShipments || 45}</div>
            <p className="text-xs text-muted-foreground">
              +12% dal mese scorso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasso Consegna</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.deliveryRate || 98}%</div>
            <p className="text-xs text-muted-foreground">
              Consegne riuscite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Medio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgDeliveryTime || 2.3}h</div>
            <p className="text-xs text-muted-foreground">
              Tempo di consegna
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Nuova Spedizione
            </CardTitle>
            <CardDescription>
              Crea una nuova richiesta di spedizione
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-create-shipment">
              <Package className="h-4 w-4 mr-2" />
              Crea Spedizione
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-bulk-shipment">
              <BarChart3 className="h-4 w-4 mr-2" />
              Spedizione Multipla
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-shipment-template">
              <Package className="h-4 w-4 mr-2" />
              Usa Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Tracking & Monitor
            </CardTitle>
            <CardDescription>
              Monitora le tue spedizioni in tempo reale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-track-shipments">
              <MapPin className="h-4 w-4 mr-2" />
              Tracking Attivo
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-delivery-map">
              <MapPin className="h-4 w-4 mr-2" />
              Mappa Consegne
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-delivery-alerts">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alert & Notifiche
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reports & Analytics
            </CardTitle>
            <CardDescription>
              Analisi delle tue performance logistiche
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-monthly-report">
              <BarChart3 className="h-4 w-4 mr-2" />
              Report Mensile
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-cost-analysis">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analisi Costi
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-performance-metrics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Metriche Performance
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Shipments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Spedizioni in Corso
          </CardTitle>
          <CardDescription>
            Le tue spedizioni attualmente in viaggio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shipments?.active?.slice(0, 5).map((shipment: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`shipment-active-${index}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">#{shipment.trackingCode || `SP${Date.now() + index}`}</p>
                    <Badge variant={shipment.status === 'delivered' ? 'default' : 'secondary'}>
                      {shipment.status || 'in_transit'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Da: {shipment.origin || 'Milano'} → A: {shipment.destination || 'Roma'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Corriere: {shipment.courier || 'DHL Express'}</span>
                    <span>ETA: {shipment.eta || 'Domani 14:00'}</span>
                    <span>Peso: {shipment.weight || '2.5'} kg</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" data-testid={`button-track-shipment-${index}`}>
                    <MapPin className="h-4 w-4 mr-1" />
                    Track
                  </Button>
                  <Button size="sm" variant="default" data-testid={`button-shipment-details-${index}`}>
                    Dettagli
                  </Button>
                </div>
              </div>
            ))}
            {(!shipments?.active || shipments.active.length === 0) && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nessuna spedizione attiva al momento
                </p>
                <Button className="mt-4" data-testid="button-create-first-shipment">
                  Crea Prima Spedizione
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attività Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { action: 'Spedizione creata', code: 'SP789123', time: '2 ore fa' },
                { action: 'Consegna completata', code: 'SP789122', time: '5 ore fa' },
                { action: 'In transito', code: 'SP789121', time: '1 giorno fa' },
                { action: 'Ritirato dal corriere', code: 'SP789120', time: '2 giorni fa' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0" data-testid={`activity-${index}`}>
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">#{activity.code}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Servizi Aggiuntivi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-insurance-service">
              <Package className="h-4 w-4 mr-2" />
              Assicurazione Spedizioni
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-storage-service">
              <Package className="h-4 w-4 mr-2" />
              Deposito Temporaneo
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-express-service">
              <Truck className="h-4 w-4 mr-2" />
              Express Same-Day
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-support-contact">
              <User className="h-4 w-4 mr-2" />
              Supporto Dedicato
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}