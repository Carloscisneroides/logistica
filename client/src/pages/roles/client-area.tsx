import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Package, MessageCircle, CreditCard, Star, History, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function ClientArea() {
  const { user } = useAuth();

  const { data: orders } = useQuery({
    queryKey: ['/api/client/orders'],
    enabled: user?.role === 'client'
  });

  const { data: profile } = useQuery({
    queryKey: ['/api/client/profile'],
    enabled: user?.role === 'client'
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <User className="h-8 w-8 text-purple-600" />
            Area Cliente
          </h1>
          <p className="text-muted-foreground mt-2">
            Benvenuto {user?.username}! Gestisci il tuo profilo e i tuoi ordini
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Heart className="h-4 w-4 mr-1" />
          CLIENT
        </Badge>
      </div>

      {/* Cliente Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordini Totali</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordini Attivi</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              In lavorazione
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spesa Totale</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{profile?.totalSpent || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{profile?.loyaltyPoints || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available points
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Il Mio Profilo
            </CardTitle>
            <CardDescription>
              Gestisci le tue informazioni personali
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-edit-profile">
              <User className="h-4 w-4 mr-2" />
              Modifica Profilo
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-change-password">
              <User className="h-4 w-4 mr-2" />
              Cambia Password
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-preferences">
              <User className="h-4 w-4 mr-2" />
              Preferenze
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              I Miei Ordini
            </CardTitle>
            <CardDescription>
              Traccia e gestisci i tuoi ordini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-active-orders">
              <Package className="h-4 w-4 mr-2" />
              Ordini Attivi ({orders?.active || 0})
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-order-history">
              <History className="h-4 w-4 mr-2" />
              Storico Ordini
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-tracking">
              <Package className="h-4 w-4 mr-2" />
              Tracking Spedizioni
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Supporto
            </CardTitle>
            <CardDescription>
              Assistenza e comunicazione
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-contact-support">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contatta Supporto
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-my-tickets">
              <MessageCircle className="h-4 w-4 mr-2" />
              I Miei Ticket
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-faq">
              <MessageCircle className="h-4 w-4 mr-2" />
              FAQ & Guide
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ordini Recenti
          </CardTitle>
          <CardDescription>
            I tuoi ultimi ordini e il loro stato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders?.recent?.slice(0, 5).map((order: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`order-${index}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">#ORD-{order.id || `${Date.now()}-${index}`}</p>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                      {order.status || 'processing'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items || '2 items'} - €{order.total || '49.99'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ordinato: {order.date || '5 giorni fa'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" data-testid={`button-track-order-${index}`}>
                    Track
                  </Button>
                  <Button size="sm" variant="default" data-testid={`button-view-order-${index}`}>
                    View
                  </Button>
                </div>
              </div>
            ))}
            {(!orders?.recent || orders.recent.length === 0) && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Non hai ancora effettuato ordini
                </p>
                <Button className="mt-4" data-testid="button-start-shopping">
                  Inizia a fare shopping
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Loyalty Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Punti Disponibili</span>
              <span className="font-bold text-yellow-600">{profile?.loyaltyPoints || 0} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Prossimo Livello</span>
              <span className="font-bold">{profile?.nextTier || 'Gold'}</span>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-redeem-points">
              <Star className="h-4 w-4 mr-2" />
              Riscatta Punti
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pagamenti & Fatturazione
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-payment-methods">
              <CreditCard className="h-4 w-4 mr-2" />
              Metodi di Pagamento
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-billing-history">
              <History className="h-4 w-4 mr-2" />
              Storico Fatture
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-download-receipts">
              <CreditCard className="h-4 w-4 mr-2" />
              Scarica Ricevute
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}