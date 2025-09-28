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
import { useDeviceInterface } from "@/hooks/use-device-interface";
import { useTranslation } from "@/lib/i18n";
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
  ArrowUpDown,
  Search,
  ChevronRight,
  Grid,
  List,
  Loader2
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
  const { isApp } = useDeviceInterface();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
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

  // Filter functions
  const productsList = products || [];
  const ordersList = orders || [];
  const customersList = customers || [];
  
  const filteredProducts = productsList.filter((product: Product) => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = ordersList.filter((order: EcommerceOrder) => 
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Loading state
  if (isLoadingStats && isLoadingProducts && isLoadingOrders) {
    return (
      <div className={isApp ? "content-app flex items-center justify-center h-64" : "space-y-6"}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // MOBILE ECOMMERCE
  if (isApp) {
    return (
      <div className="content-app space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('products') || 'eCommerce'}</h1>
          <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => setIsCreateProductOpen(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* eCommerce Stats - Mobile */}
        {stats && (
          <div className="stats-scroll">
            <div className="stat-card">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">Prodotti</span>
              </div>
              <p className="text-lg font-bold">{stats.totalProducts}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-green-600" />
                <span className="text-xs text-muted-foreground">Ordini</span>
              </div>
              <p className="text-lg font-bold">{stats.totalOrders}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-muted-foreground">Ricavi</span>
              </div>
              <p className="text-lg font-bold">€{stats.monthlyRevenue}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-muted-foreground">Clienti</span>
              </div>
              <p className="text-lg font-bold">{stats.totalCustomers}</p>
            </div>
          </div>
        )}
        
        {/* Search - Mobile */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Cerca prodotti, ordini..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 rounded-xl"
            data-testid="search-ecommerce"
          />
        </div>
        
        {/* Action Tabs - Mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button 
            variant={selectedTab === "products" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedTab("products")}
            className="min-w-fit"
          >
            <Package className="w-4 h-4 mr-2" />
            {t('products') || 'Prodotti'}
          </Button>
          <Button 
            variant={selectedTab === "orders" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedTab("orders")}
            className="min-w-fit"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t('orders') || 'Ordini'}
          </Button>
          <Button 
            variant={selectedTab === "customers" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedTab("customers")}
            className="min-w-fit"
          >
            <Users className="w-4 h-4 mr-2" />
            Clienti
          </Button>
        </div>
        
        {/* Products Tab - Mobile */}
        {selectedTab === "products" && (
          <div className="space-y-2">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: Product) => (
                <div key={product.id} className="list-item" data-testid={`product-card-${product.id}`}>
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{product.name}</h3>
                        {getStatusBadge(product.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.sku}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {product.category || 'N/A'}
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{product.basePrice || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="chevron" />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nessun prodotto trovato</p>
              </div>
            )}
          </div>
        )}
        
        {/* Orders Tab - Mobile */}
        {selectedTab === "orders" && (
          <div className="space-y-2">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order: EcommerceOrder) => (
                <div key={order.id} className="list-item" data-testid={`order-card-${order.id}`}>
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{order.orderNumber}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">Ordine #{order.id}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {order.status || 'Nuovo'}
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{order.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="chevron" />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nessun ordine trovato</p>
              </div>
            )}
          </div>
        )}
        
        {/* Customers Tab - Mobile */}
        {selectedTab === "customers" && (
          <div className="space-y-2">
            {customersList.length > 0 ? (
              customersList.map((customer: EcommerceCustomer) => (
                <div key={customer.id} className="list-item" data-testid={`customer-card-${customer.id}`}>
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{customer.email || 'Cliente'}</h3>
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          Cliente
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Cliente eCommerce</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Attivo
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="chevron" />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nessun cliente trovato</p>
              </div>
            )}
          </div>
        )}
        
        {/* Create Product Dialog - Mobile */}
        <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
          <DialogContent className="w-[95vw] max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>{t('addProduct') || 'Nuovo Prodotto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={t('productName') || 'Nome prodotto'}
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="h-12"
              />
              <Input
                placeholder="SKU"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                className="h-12"
              />
              <Input
                placeholder={t('productPrice') || 'Prezzo (€)'}
                type="number"
                value={newProduct.basePrice}
                onChange={(e) => setNewProduct({...newProduct, basePrice: e.target.value})}
                className="h-12"
              />
              <Select 
                value={newProduct.category} 
                onValueChange={(value) => setNewProduct({...newProduct, category: value})}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Elettronica</SelectItem>
                  <SelectItem value="clothing">Abbigliamento</SelectItem>
                  <SelectItem value="home">Casa</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateProductOpen(false)} className="flex-1 h-12">
                  Annulla
                </Button>
                <Button onClick={handleCreateProduct} disabled={createProduct.isPending} className="flex-1 h-12">
                  {createProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crea
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // DESKTOP ECOMMERCE
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
                      {stats?.topProducts?.map((product, index) => (
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