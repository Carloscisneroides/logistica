import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Truck, Building, Phone, Mail, MapPin, Star, TrendingUp, AlertCircle, CheckCircle, Search, Plus, Edit, Eye, FileText, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

const supplierSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  company: z.string().min(2, "Azienda richiesta"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(10, "Telefono richiesto"),
  address: z.string().min(5, "Indirizzo richiesto"),
  category: z.string().min(2, "Categoria richiesta"),
  payment_terms: z.string().min(2, "Termini pagamento richiesti"),
  rating: z.number().min(1).max(5),
  is_active: z.boolean().default(true),
});

type SupplierForm = z.infer<typeof supplierSchema>;

export default function EcommerceSuppliersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  // Form setup
  const supplierForm = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      payment_terms: "",
      rating: 5,
      is_active: true,
    },
  });

  // Queries
  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  const { data: suppliersStats } = useQuery({
    queryKey: ['/api/suppliers/stats'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/suppliers/categories'],
  });

  // Mutations
  const createSupplierMutation = useMutation({
    mutationFn: (data: SupplierForm) => 
      apiRequest('/api/suppliers', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setIsSupplierDialogOpen(false);
      supplierForm.reset();
      toast({ title: "Fornitore aggiunto con successo" });
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupplierForm> }) =>
      apiRequest(`/api/suppliers/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setIsSupplierDialogOpen(false);
      setEditingSupplier(null);
      supplierForm.reset();
      toast({ title: "Fornitore aggiornato con successo" });
    },
  });

  // Filter functions
  const filteredSuppliers = suppliers.filter((supplier: any) => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Handlers
  const handleCreateSupplier = (data: SupplierForm) => {
    createSupplierMutation.mutate(data);
  };

  const handleUpdateSupplier = (data: SupplierForm) => {
    if (editingSupplier) {
      updateSupplierMutation.mutate({ id: editingSupplier.id, data });
    }
  };

  const openEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier);
    supplierForm.reset(supplier);
    setIsSupplierDialogOpen(true);
  };

  const openNewSupplier = () => {
    setEditingSupplier(null);
    supplierForm.reset({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      payment_terms: "",
      rating: 5,
      is_active: true,
    });
    setIsSupplierDialogOpen(true);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="ecommerce-suppliers-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100" data-testid="page-title">
            Fornitori eCommerce
          </h1>
          <p className="text-gray-600 dark:text-gray-400" data-testid="page-description">
            Gestione fornitori, KPI e tracciabilità per vendite online
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={openNewSupplier}
            data-testid="button-add-supplier"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Fornitore
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {suppliersStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-total-suppliers">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Fornitori Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold" data-testid="total-suppliers">
                  {suppliersStats.total || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-active-suppliers">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Fornitori Attivi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold" data-testid="active-suppliers">
                  {suppliersStats.active || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-avg-rating">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rating Medio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold" data-testid="avg-rating">
                  {suppliersStats.averageRating?.toFixed(1) || '0.0'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-pending-orders">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ordini Pendenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold" data-testid="pending-orders">
                  {suppliersStats.pendingOrders || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="suppliers" className="space-y-4">
        <TabsList data-testid="tabs-suppliers">
          <TabsTrigger value="suppliers" data-testid="tab-suppliers">
            <Building className="h-4 w-4 mr-2" />
            Fornitori
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">
            <Package className="h-4 w-4 mr-2" />
            Ordini Approvvigionamento
          </TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents">
            <FileText className="h-4 w-4 mr-2" />
            Documenti & Contratti
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            KPI & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          {/* Search and Filters */}
          <Card data-testid="card-supplier-filters">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca fornitori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-suppliers"
                  />
                </div>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                  data-testid="select-category-filter"
                >
                  <option value="all">Tutte le categorie</option>
                  {categories.map((category: string) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Suppliers Table */}
          <Card data-testid="card-suppliers-table">
            <CardHeader>
              <CardTitle>Lista Fornitori</CardTitle>
              <CardDescription>
                Gestione completa fornitori con KPI e tracciabilità
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSuppliers ? (
                <div className="text-center py-8" data-testid="loading-suppliers">
                  Caricamento fornitori...
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="text-center py-8" data-testid="no-suppliers">
                  Nessun fornitore trovato
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornitore</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Contatti</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Termini Pagamento</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier: any) => (
                      <TableRow key={supplier.id} data-testid={`row-supplier-${supplier.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-sm text-gray-500">{supplier.company}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{supplier.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" />
                              {supplier.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getRatingStars(supplier.rating)}
                            <span className="text-sm ml-1">({supplier.rating})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{supplier.payment_terms}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={supplier.is_active ? "default" : "secondary"}>
                            {supplier.is_active ? "Attivo" : "Inattivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openEditSupplier(supplier)}
                              data-testid={`button-edit-supplier-${supplier.id}`}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-view-supplier-${supplier.id}`}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card data-testid="card-supply-orders">
            <CardHeader>
              <CardTitle>Ordini di Approvvigionamento</CardTitle>
              <CardDescription>
                Gestione ordini ai fornitori e tracciamento consegne
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Modulo ordini approvvigionamento in arrivo...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card data-testid="card-supplier-documents">
            <CardHeader>
              <CardTitle>Documenti e Contratti</CardTitle>
              <CardDescription>
                Gestione documentazione fornitori e contratti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Gestione documenti fornitori in arrivo...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="card-supplier-performance">
              <CardHeader>
                <CardTitle>Performance Fornitori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  KPI performance fornitori in arrivo...
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-cost-analysis">
              <CardHeader>
                <CardTitle>Analisi Costi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Analytics costi approvvigionamento in arrivo...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Supplier Dialog */}
      <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-supplier">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Modifica Fornitore" : "Nuovo Fornitore"}
            </DialogTitle>
            <DialogDescription>
              Gestisci le informazioni del fornitore eCommerce
            </DialogDescription>
          </DialogHeader>
          
          <Form {...supplierForm}>
            <form onSubmit={supplierForm.handleSubmit(editingSupplier ? handleUpdateSupplier : handleCreateSupplier)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={supplierForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Contatto</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-supplier-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={supplierForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Azienda</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-supplier-company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={supplierForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-supplier-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={supplierForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-supplier-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={supplierForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indirizzo</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-supplier-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={supplierForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-supplier-category" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={supplierForm.control}
                  name="payment_terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Termini Pagamento</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="es. 30 giorni" data-testid="input-supplier-payment-terms" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={supplierForm.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (1-5)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="5" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))} 
                          data-testid="input-supplier-rating" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending} data-testid="button-save-supplier">
                  {editingSupplier ? "Aggiorna" : "Crea"} Fornitore
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}