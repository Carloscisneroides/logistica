import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Clock, Check, AlertCircle, Truck, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ShipmentsPage() {
  return (
    <div className="space-y-6" data-testid="shipments-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">📦 Gestione Spedizioni YCore</h1>
        <p className="text-muted-foreground">
          Centro di controllo per spedizioni territoria, Asia-Europa, logistiche globali
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spedizioni Attive</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-shipments">247</div>
            <p className="text-xs text-muted-foreground">
              +12 nelle ultime 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transito</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-in-transit">189</div>
            <div className="flex items-center text-sm text-blue-600 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              Asia-Europa: 67
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consegnate Oggi</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-delivered-today">43</div>
            <p className="text-xs text-green-600">
              98.2% successo consegne
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problemi Attivi</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-issues">8</div>
            <p className="text-xs text-red-600">
              3 ritardi, 5 in verifica
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button data-testid="button-new-shipment">
          <Package className="mr-2 h-4 w-4" />
          Nuova Spedizione
        </Button>
        <Button variant="outline" data-testid="button-track-shipment">
          <MapPin className="mr-2 h-4 w-4" />
          Traccia Spedizione
        </Button>
        <Button variant="outline" data-testid="button-bulk-import">
          <RotateCcw className="mr-2 h-4 w-4" />
          Import Massivo
        </Button>
      </div>

      {/* Recent Shipments */}
      <Card>
        <CardHeader>
          <CardTitle>🚛 Spedizioni Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "YC001247",
                from: "Milano, IT",
                to: "Shanghai, CN",
                status: "in_transit",
                partner: "Maersk",
                eta: "2 giorni",
              },
              {
                id: "YC001246", 
                from: "Berlino, DE",
                to: "Singapore, SG",
                status: "customs",
                partner: "DHL",
                eta: "1 giorno",
              },
              {
                id: "YC001244",
                from: "Shenzhen, CN",
                to: "Rotterdam, NL", 
                status: "in_transit",
                partner: "Cainiao",
                eta: "3 giorni",
              },
              {
                id: "YC001245",
                from: "Barcelona, ES",
                to: "Valencia, ES", 
                status: "delivered",
                partner: "Corriere Locale",
                eta: "Consegnato",
              },
            ].map((shipment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`shipment-${shipment.id}`}>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium" data-testid={`shipment-id-${shipment.id}`}>{shipment.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {shipment.from} → {shipment.to}
                    </p>
                    <p className="text-xs text-muted-foreground">Partner: {shipment.partner}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      shipment.status === "delivered"
                        ? "default"
                        : shipment.status === "in_transit"
                        ? "secondary"
                        : "outline"
                    }
                    data-testid={`status-${shipment.id}`}
                  >
                    {shipment.status === "delivered" 
                      ? "✅ Consegnato" 
                      : shipment.status === "in_transit"
                      ? "🚛 In transito"
                      : "📋 In dogana"
                    }
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {shipment.eta}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}