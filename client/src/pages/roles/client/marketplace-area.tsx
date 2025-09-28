import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Gift, CreditCard, MapPin, Calendar, Heart, Store } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function MarketplaceArea() {
  const { user } = useAuth();

  const { data: loyaltyData } = useQuery({
    queryKey: ['/api/client/loyalty'],
    enabled: user?.role === 'client' && user?.clientType === 'marketplace'
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/client/marketplace-orders'],
    enabled: user?.role === 'client' && user?.clientType === 'marketplace'
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Store className="h-8 w-8 text-purple-600" />
            Marketplace Area
          </h1>
          <p className="text-muted-foreground mt-2">
            Benvenuto {user?.username}! Scopri servizi locali e accumula punti fedeltà
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Heart className="h-4 w-4 mr-1" />
          MARKETPLACE CLIENT
        </Badge>
      </div>

      {/* Fidelity Card Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Punti Fedeltà</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{loyaltyData?.points || 250}</div>
            <p className="text-xs text-muted-foreground">
              +15 punti questa settimana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livello Card</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loyaltyData?.tier || 'Silver'}</div>
            <p className="text-xs text-muted-foreground">
              50 punti al prossimo livello
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sconti Attivi</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyData?.activeDiscounts || 3}</div>
            <p className="text-xs text-muted-foreground">
              Validi fino al 31/12
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risparmi Totali</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{loyaltyData?.totalSavings || 89}</div>
            <p className="text-xs text-muted-foreground">
              Con la fidelity card
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Marketplace Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Negozi Online
            </CardTitle>
            <CardDescription>
              Scopri i migliori negozi online partner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-electronics">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Elettronica
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-fashion">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Moda & Accessori
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-home">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Casa & Giardino
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Servizi Locali
            </CardTitle>
            <CardDescription>
              Prenotazioni per servizi nel tuo territorio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-restaurants">
              <Calendar className="h-4 w-4 mr-2" />
              Ristoranti ({loyaltyData?.nearbyRestaurants || 12})
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-wellness">
              <Calendar className="h-4 w-4 mr-2" />
              Benessere & SPA ({loyaltyData?.nearbySpa || 8})
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-services">
              <Calendar className="h-4 w-4 mr-2" />
              Altri Servizi ({loyaltyData?.otherServices || 25})
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Offerte Esclusive
            </CardTitle>
            <CardDescription>
              Vantaggi dedicati ai clienti fedeli
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-daily-deals">
              <Star className="h-4 w-4 mr-2" />
              Offerte del Giorno
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-member-discounts">
              <Gift className="h-4 w-4 mr-2" />
              Sconti Membri
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-cashback">
              <CreditCard className="h-4 w-4 mr-2" />
              Cashback Attivo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            I Tuoi Ultimi Acquisti
          </CardTitle>
          <CardDescription>
            Ordini recenti dal marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders?.recent?.slice(0, 3).map((order: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`order-marketplace-${index}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.merchant || 'Elettronica Store'}</p>
                    <Badge variant="outline">
                      {order.category || 'Elettronica'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.description || 'Smartphone + Accessori'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>€{order.total || '299.99'}</span>
                    <span>Punti: +{order.loyaltyPoints || 30}</span>
                    <span>{order.date || '3 giorni fa'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" data-testid={`button-view-marketplace-order-${index}`}>
                    Dettagli
                  </Button>
                  <Button size="sm" variant="default" data-testid={`button-reorder-${index}`}>
                    Riordina
                  </Button>
                </div>
              </div>
            ))}
            {(!orders?.recent || orders.recent.length === 0) && (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Non hai ancora effettuato acquisti
                </p>
                <Button className="mt-4" data-testid="button-browse-marketplace">
                  Esplora il Marketplace
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fidelity Card Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              La Tua Fidelity Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm opacity-80">YCore Fidelity</p>
                  <p className="font-bold">{user?.username?.toUpperCase()}</p>
                </div>
                <Badge className="bg-yellow-500 text-black">
                  {loyaltyData?.tier || 'SILVER'}
                </Badge>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm opacity-80">Punti disponibili</p>
                  <p className="text-2xl font-bold">{loyaltyData?.points || 250}</p>
                </div>
                <Star className="h-6 w-6" />
              </div>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-card-details">
              <CreditCard className="h-4 w-4 mr-2" />
              Gestisci Card
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Premi & Cashback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Cashback disponibile</span>
                <span className="font-bold text-green-600">€{loyaltyData?.cashback || 15.50}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Prossimo premio</span>
                <span className="font-bold">Cena per 2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Progressi premio</span>
                <span className="text-xs text-muted-foreground">320/500 punti</span>
              </div>
            </div>
            <Button variant="default" className="w-full" data-testid="button-redeem-rewards">
              <Gift className="h-4 w-4 mr-2" />
              Riscatta Premi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}