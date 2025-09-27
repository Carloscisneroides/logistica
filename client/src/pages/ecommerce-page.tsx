import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Package,
  ShoppingCart,
  Users,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Globe,
  Store as Shopify,
  Store,
  Edit,
  Eye,
  ArrowUpDown
} from "lucide-react";

interface EcommerceStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCustomers: number;
  monthlyRevenue: number;
  topProducts: Array<{id: string; name: string; sales: number}>;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  category: string | null;
  brand: string | null;
  weight: string | null;
  dimensions: string | null;
  fragility: string;
  status: string;
  basePrice: string | null;
  imageUrl: string | null;
  createdAt: string;
}

interface EcommerceOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  shippingCost: string;
  marketplaceType: string | null;
  orderDate: string;
  shippedAt: string | null;
  deliveredAt: string | null;
}

interface EcommerceCustomer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  totalOrders: number;
  totalSpent: string;
  marketplaceType: string | null;
  createdAt: string;
}

export function EcommercePage() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    sku: "",
    category: "",
    brand: "",
    weight: "",
    dimensions: "",
    fragility: "normal",
    status: "active",
    basePrice: ""
  });
  const [newOrder, setNewOrder] = useState({
    orderNumber: "",
    customerId: "",
    totalAmount: "",
    shippingCost: "0",
    shippingAddress: "",
    marketplaceType: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch eCommerce stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<EcommerceStats>({
    queryKey: ["/api/ecommerce/stats"],
  });

  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/ecommerce/products"],
  });

  // Fetch orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery<EcommerceOrder[]>({
    queryKey: ["/api/ecommerce/orders"],
  });

  // Fetch customers
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<EcommerceCustomer[]>({
    queryKey: ["/api/ecommerce/customers"],
  });

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/ecommerce/products", productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ecommerce/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ecommerce/stats"] });
      setIsCreateProductOpen(false);
      setNewProduct({
        name: "",
        description: "",
        sku: "",
        category: "",
        brand: "",
        weight: "",
        dimensions: "",
        fragility: "normal",
        status: "active",
        basePrice: ""
      });
      toast({
        title: "Prodotto creato",
        description: "Il prodotto è stato aggiunto al catalogo con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: "Errore durante la creazione del prodotto",
        variant: "destructive",
      });
    }
  });

  // Create order mutation
  const createOrder = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/ecommerce/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ecommerce/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ecommerce/stats"] });
      setIsCreateOrderOpen(false);
      setNewOrder({
        orderNumber: "",
        customerId: "",
        totalAmount: "",
        shippingCost: "0",
        shippingAddress: "",
        marketplaceType: ""
      });
      toast({
        title: "Ordine creato",
        description: "L'ordine è stato creato con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: "Errore durante la creazione dell'ordine",
        variant: "destructive",
      });
    }
  });

  const handleCreateProduct = () => {
    createProduct.mutate(newProduct);
  };

  const handleCreateOrder = () => {
    createOrder.mutate({
      ...newOrder,
      orderNumber: `ORD-${Date.now()}`, // Generate order number
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      processing: "default", 
      shipped: "outline",
      delivered: "default",
      cancelled: "destructive",
      active: "default",
      inactive: "secondary",
      discontinued: "destructive"
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getMarketplaceIcon = (type: string | null) => {
    switch (type) {
      case "shopify": return <Shopify className="h-4 w-4" />;
      case "woocommerce": return <Store className="h-4 w-4" />;
      case "amazon": return <Globe className="h-4 w-4" />;
      default: return <Store className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
            Modulo eCommerce
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestione completa ordini, prodotti, clienti e integrazioni marketplace
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-product">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Prodotto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Nuovo Prodotto</DialogTitle>
                <DialogDescription>
                  Aggiungi un nuovo prodotto al catalogo eCommerce
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Nome prodotto"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    data-testid="input-product-name"
                  />
                  <Input
                    placeholder="SKU"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    data-testid="input-product-sku"
                  />
                </div>
                <Textarea
                  placeholder="Descrizione prodotto"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  data-testid="textarea-product-description"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Categoria"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    data-testid="input-product-category"
                  />
                  <Input
                    placeholder="Brand"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                    data-testid="input-product-brand"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Peso (kg)"
                    value={newProduct.weight}
                    onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                    data-testid="input-product-weight"
                  />
                  <Input
                    placeholder="Dimensioni"
                    value={newProduct.dimensions}
                    onChange={(e) => setNewProduct({...newProduct, dimensions: e.target.value})}
                    data-testid="input-product-dimensions"
                  />
                  <Input
                    placeholder="Prezzo €"
                    type="number"
                    step="0.01"
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct({...newProduct, basePrice: e.target.value})}
                    data-testid="input-product-price"
                  />
                </div>
                <Select value={newProduct.fragility} onValueChange={(value) => setNewProduct({...newProduct, fragility: value})}>
                  <SelectTrigger data-testid="select-product-fragility">
                    <SelectValue placeholder="Fragilità" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="fragile">Fragile</SelectItem>
                    <SelectItem value="very_fragile">Molto Fragile</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleCreateProduct} disabled={createProduct.isPending} data-testid="button-submit-product">
                  {createProduct.isPending ? "Creazione..." : "Crea Prodotto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
            <BarChart3 className="h-4 w-4" />
            Panoramica
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2" data-testid="tab-products">
            <Package className="h-4 w-4" />
            Prodotti
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2" data-testid="tab-orders">
            <ShoppingCart className="h-4 w-4" />
            Ordini
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2" data-testid="tab-customers">
            <Users className="h-4 w-4" />
            Clienti
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {isLoadingStats ? (
            <div className="text-center py-8">Caricamento statistiche...</div>
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ordini Totali</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-orders">{stats?.totalOrders || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ordini in Attesa</CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-500" data-testid="text-pending-orders">{stats?.pendingOrders || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Prodotti</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-products">{stats?.totalProducts || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fatturato Mensile</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-monthly-revenue">
                      €{parseFloat(stats?.monthlyRevenue || "0").toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {stats?.topProducts?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Prodotti</CardTitle>
                    <CardDescription>I prodotti più venduti questo mese</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.sales} vendite</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          {isLoadingProducts ? (
            <div className="text-center py-8">Caricamento prodotti...</div>
          ) : products?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Nessun prodotto presente</p>
                <p className="text-sm text-muted-foreground">I prodotti del catalogo eCommerce appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {products?.map((product: Product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {product.name}
                        </CardTitle>
                        <CardDescription>{product.description || "Nessuna descrizione"}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(product.status)}
                        {product.basePrice && (
                          <Badge variant="outline">€{parseFloat(product.basePrice).toFixed(2)}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">SKU</p>
                        <p className="font-medium">{product.sku}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Categoria</p>
                        <p className="font-medium">{product.category || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Brand</p>
                        <p className="font-medium">{product.brand || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fragilità</p>
                        <p className="font-medium capitalize">{product.fragility}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          {isLoadingOrders ? (
            <div className="text-center py-8">Caricamento ordini...</div>
          ) : orders?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Nessun ordine presente</p>
                <p className="text-sm text-muted-foreground">Gli ordini eCommerce appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders?.map((order: EcommerceOrder) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Ordine #{order.orderNumber}
                        </CardTitle>
                        <CardDescription>
                          {new Date(order.orderDate).toLocaleDateString('it-IT')}
                          {order.marketplaceType && (
                            <span className="ml-2 inline-flex items-center gap-1">
                              {getMarketplaceIcon(order.marketplaceType)}
                              {order.marketplaceType}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        <Badge variant="outline">€{parseFloat(order.totalAmount).toFixed(2)}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Stato Pagamento</p>
                        <p className="font-medium capitalize">{order.paymentStatus}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Spedizione</p>
                        <p className="font-medium">€{parseFloat(order.shippingCost).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Spedito</p>
                        <p className="font-medium">{order.shippedAt ? new Date(order.shippedAt).toLocaleDateString('it-IT') : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Consegnato</p>
                        <p className="font-medium">{order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('it-IT') : "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          {isLoadingCustomers ? (
            <div className="text-center py-8">Caricamento clienti...</div>
          ) : customers?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Nessun cliente presente</p>
                <p className="text-sm text-muted-foreground">I clienti eCommerce appariranno qui</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {customers?.map((customer: EcommerceCustomer) => (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {customer.firstName && customer.lastName 
                            ? `${customer.firstName} ${customer.lastName}` 
                            : customer.email}
                        </CardTitle>
                        <CardDescription>
                          {customer.email}
                          {customer.marketplaceType && (
                            <span className="ml-2 inline-flex items-center gap-1">
                              {getMarketplaceIcon(customer.marketplaceType)}
                              {customer.marketplaceType}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">€{parseFloat(customer.totalSpent).toFixed(2)} spesi</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Telefono</p>
                        <p className="font-medium">{customer.phone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ordini Totali</p>
                        <p className="font-medium">{customer.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cliente da</p>
                        <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString('it-IT')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valore Medio</p>
                        <p className="font-medium">
                          {customer.totalOrders > 0 
                            ? `€${(parseFloat(customer.totalSpent) / customer.totalOrders).toFixed(2)}` 
                            : "€0.00"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}