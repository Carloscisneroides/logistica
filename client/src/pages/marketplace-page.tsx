import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Star, 
  Eye, 
  Plus, 
  ExternalLink, 
  Filter,
  Search,
  TrendingUp,
  Clock,
  AlertCircle,
  Globe,
  Shield
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const createListingSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  description: z.string().min(10, "Descrizione deve essere almeno 10 caratteri"),
  categoryId: z.string().min(1, "Categoria è obbligatoria"),
  basePrice: z.string().min(1, "Prezzo è obbligatorio"),
  currency: z.string().default("EUR"),
  minOrderQuantity: z.number().min(1).default(1),
  maxOrderQuantity: z.number().optional(),
  tags: z.array(z.string()).default([]),
  logoUrl: z.string().url().optional().or(z.literal("")),
  brandName: z.string().optional(),
  externalWebsiteUrl: z.string().url().optional().or(z.literal("")),
  visibility: z.enum(["private", "tenant", "public"]).default("private")
});

type CreateListingForm = z.infer<typeof createListingSchema>;

export function MarketplacePage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalListings: number;
    activeListings: number;
    totalOrders: number;
    pendingOrders: number;
    monthlyRevenue: number;
    topCategories: Array<{id: string; name: string; listingCount: number}>;
  }>({
    queryKey: ["/api/marketplace/stats"],
    refetchInterval: 30000
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/marketplace/categories"]
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery<any[]>({
    queryKey: ["/api/marketplace/listings", selectedCategory]
  });

  const { data: myListings = [], isLoading: myListingsLoading } = useQuery<any[]>({
    queryKey: ["/api/marketplace/my-listings"]
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/marketplace/orders"]
  });

  // Create listing form
  const form = useForm<CreateListingForm>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      basePrice: "",
      currency: "EUR",
      minOrderQuantity: 1,
      tags: [],
      logoUrl: "",
      brandName: "",
      externalWebsiteUrl: "",
      visibility: "private"
    }
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingForm) => {
      const response = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...data,
          basePrice: parseFloat(data.basePrice)
        })
      });
      if (!response.ok) {
        throw new Error("Failed to create listing");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Annuncio Creato",
        description: "Il tuo annuncio è stato creato e sarà attivo dopo l'approvazione."
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Errore",
        description: "Errore nella creazione dell'annuncio.",
        variant: "destructive"
      });
    }
  });

  const activateListingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/marketplace/listings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error("Failed to update listing");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Stato Aggiornato",
        description: "Lo stato dell'annuncio è stato aggiornato."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/stats"] });
    }
  });

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onCreateListing = (data: CreateListingForm) => {
    createListingMutation.mutate(data);
  };

  const handleActivateListing = (id: string, status: string) => {
    activateListingMutation.mutate({ id, status });
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="marketplace-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Store className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
              Marketplace B2B
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Piattaforma interna per la compravendita tra aziende partner
            </p>
          </div>
        </div>
        
        {/* Create Listing Button */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-listing">
              <Plus className="mr-2 h-4 w-4" />
              Crea Annuncio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crea Nuovo Annuncio</DialogTitle>
              <DialogDescription>
                Crea un nuovo annuncio sul marketplace interno. Sarà privato per default per sicurezza.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateListing)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titolo Annuncio *</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. Servizi di logistica..." {...field} data-testid="input-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Seleziona categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrivi dettagliatamente il tuo prodotto o servizio..." 
                          className="min-h-[100px]" 
                          {...field} 
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prezzo Base *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minOrderQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantità Minima</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            data-testid="input-min-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibilità</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-visibility">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="private">
                              <div className="flex items-center">
                                <Shield className="mr-2 h-4 w-4" />
                                Privato (Solo invitati)
                              </div>
                            </SelectItem>
                            <SelectItem value="tenant">Solo il mio network</SelectItem>
                            <SelectItem value="public">Pubblico</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Branding Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Branding Aziendale</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brandName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome del tuo brand..." {...field} data-testid="input-brand-name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Logo</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} data-testid="input-logo-url" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="externalWebsiteUrl"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Sito Web Aziendale</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} data-testid="input-website-url" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annulla
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createListingMutation.isPending}
                    data-testid="button-submit-listing"
                  >
                    {createListingMutation.isPending ? "Creazione..." : "Crea Annuncio"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">I Miei Annunci</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-listings">{stats.totalListings}</div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stats.activeListings} attivi
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordini Totali</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-orders">{stats.totalOrders}</div>
              <div className="flex items-center text-sm text-orange-600 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {stats.pendingOrders} in attesa
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fatturato Mensile</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-monthly-revenue">
                €{stats.monthlyRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Come venditore</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Categoria</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.topCategories[0]?.name || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.topCategories[0]?.listingCount || 0} annunci
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="catalog" data-testid="tab-catalog">
            <Store className="mr-2 h-4 w-4" />
            Catalogo
          </TabsTrigger>
          <TabsTrigger value="my-listings" data-testid="tab-my-listings">
            <Package className="mr-2 h-4 w-4" />
            Le Mie Offerte
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ordini
          </TabsTrigger>
          <TabsTrigger value="reviews" data-testid="tab-reviews">
            <Star className="mr-2 h-4 w-4" />
            Recensioni
          </TabsTrigger>
        </TabsList>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca prodotti o servizi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-listings"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-category">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtra per categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tutte le categorie</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Listings Grid */}
          {listingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing: any) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow" data-testid={`listing-card-${listing.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {listing.logoUrl && (
                            <img src={listing.logoUrl} alt={listing.brandName} className="h-6 w-6 rounded" />
                          )}
                          {listing.brandName && (
                            <span className="text-sm font-medium text-muted-foreground">{listing.brandName}</span>
                          )}
                        </div>
                        <CardTitle className="text-lg">{listing.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{listing.description}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={listing.visibility === 'public' ? 'default' : 'secondary'}>
                          {listing.visibility === 'public' ? 'Pubblico' : 'Privato'}
                        </Badge>
                        {listing.externalWebsiteUrl && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            asChild
                            data-testid={`link-external-${listing.id}`}
                          >
                            <a href={listing.externalWebsiteUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          €{parseFloat(listing.basePrice).toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Min. {listing.minOrderQuantity} unità
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {listing.viewCount}
                        </div>
                        {listing.rating && (
                          <div className="flex items-center">
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            {listing.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      data-testid={`button-view-listing-${listing.id}`}
                    >
                      Visualizza Dettagli
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!listingsLoading && filteredListings.length === 0 && (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Package className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">Nessun annuncio trovato</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Prova con termini di ricerca diversi.' : 'Non ci sono annunci disponibili.'}
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* My Listings Tab */}
        <TabsContent value="my-listings" className="space-y-6">
          {myListingsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {myListings.map((listing: any) => (
                <Card key={listing.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{listing.title}</h3>
                          <Badge 
                            variant={listing.status === 'active' ? 'default' : 
                                   listing.status === 'draft' ? 'secondary' : 'outline'}
                          >
                            {listing.status === 'active' ? 'Attivo' : 
                             listing.status === 'draft' ? 'Bozza' : listing.status}
                          </Badge>
                          <Badge 
                            variant={listing.visibility === 'public' ? 'default' : 'secondary'}
                          >
                            {listing.visibility === 'public' ? (
                              <div className="flex items-center">
                                <Globe className="mr-1 h-3 w-3" />
                                Pubblico
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Shield className="mr-1 h-3 w-3" />
                                Privato
                              </div>
                            )}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{listing.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>€{parseFloat(listing.basePrice).toFixed(2)}</span>
                          <span>{listing.viewCount} visualizzazioni</span>
                          <span>{listing.orderCount} ordini</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {listing.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleActivateListing(listing.id, 'active')}
                            disabled={activateListingMutation.isPending}
                            data-testid={`button-activate-${listing.id}`}
                          >
                            Attiva
                          </Button>
                        )}
                        {listing.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateListing(listing.id, 'paused')}
                            disabled={activateListingMutation.isPending}
                            data-testid={`button-pause-${listing.id}`}
                          >
                            Pausa
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" data-testid={`button-edit-${listing.id}`}>
                          Modifica
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!myListingsLoading && myListings.length === 0 && (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Package className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">Nessun annuncio creato</h3>
                <p className="text-muted-foreground mb-4">
                  Inizia creando il tuo primo annuncio nel marketplace.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-listing">
                  <Plus className="mr-2 h-4 w-4" />
                  Crea Primo Annuncio
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {ordersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Ordine #{order.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : 
                                 order.status === 'pending' ? 'secondary' : 'outline'}
                        >
                          {order.status === 'completed' ? 'Completato' : 
                           order.status === 'pending' ? 'In Attesa' : order.status}
                        </Badge>
                        <Badge 
                          variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}
                        >
                          {order.paymentStatus === 'paid' ? 'Pagato' : 'Non Pagato'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          €{parseFloat(order.totalAmount).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.buyerId === order.sellerId ? 'Venduto' : 'Acquistato'}
                        </p>
                      </div>
                      <Button variant="outline" data-testid={`button-view-order-${order.id}`}>
                        Visualizza Dettagli
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!ordersLoading && orders.length === 0 && (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-2">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">Nessun ordine</h3>
                <p className="text-muted-foreground">
                  Gli ordini effettuati e ricevuti appariranno qui.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Star className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">Recensioni in arrivo</h3>
              <p className="text-muted-foreground">
                Le recensioni sui tuoi prodotti e servizi appariranno qui.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}