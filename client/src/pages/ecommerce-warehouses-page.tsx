import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWarehouseSchema, insertInventoryItemSchema, type InsertWarehouse, type InsertInventoryItem, type Warehouse, type InventoryItem } from "@shared/schema";
import { Warehouse as WarehouseIcon, Package, ShoppingCart, BarChart3, AlertTriangle, CheckCircle, Clock, MapPin, Zap, Search, Plus, Edit, Trash2, Eye, Download, Upload, Filter, SortAsc, Building, Users, Activity, TrendingUp, Archive, Globe, DollarSign, Boxes, Tag, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function EcommerceWarehousesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form setup
  const warehouseForm = useForm<InsertWarehouse>({
    resolver: zodResolver(insertWarehouseSchema),
    defaultValues: {
      name: "",
      location: "",
      type: "ecommerce",
      capacity: 0,
      current_stock: 0,
      is_active: true,
    },
  });

  const itemForm = useForm<InsertInventoryItem>({
    resolver: zodResolver(insertInventoryItemSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      quantity: 0,
      unit: "units",
      location: "",
      min_threshold: 0,
      max_threshold: 0,
      is_active: true,
    },
  });

  // Queries
  const { data: warehouses = [], isLoading: loadingWarehouses } = useQuery({
    queryKey: ['/api/warehouses', { type: 'ecommerce' }],
  });

  const { data: inventory = [], isLoading: loadingInventory } = useQuery({
    queryKey: ['/api/inventory', selectedWarehouse],
    enabled: !!selectedWarehouse,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/warehouses/stats', { type: 'ecommerce' }],
  });

  // Mutations
  const createWarehouseMutation = useMutation({
    mutationFn: (data: InsertWarehouse) => 
      apiRequest('/api/warehouses', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/warehouses'] });
      setIsWarehouseDialogOpen(false);
      warehouseForm.reset();
      toast({ title: "Magazzino eCommerce creato con successo" });
    },
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertWarehouse> }) =>
      apiRequest(`/api/warehouses/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/warehouses'] });
      setIsWarehouseDialogOpen(false);
      setEditingWarehouse(null);
      warehouseForm.reset();
      toast({ title: "Magazzino eCommerce aggiornato con successo" });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: (data: InsertInventoryItem) =>
      apiRequest('/api/inventory', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setIsItemDialogOpen(false);
      itemForm.reset();
      toast({ title: "Prodotto aggiunto con successo" });
    },
  });

  // Filter functions
  const filteredWarehouses = warehouses.filter((warehouse: Warehouse) =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInventory = inventory.filter((item: InventoryItem) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleCreateWarehouse = (data: InsertWarehouse) => {
    createWarehouseMutation.mutate({ ...data, type: 'ecommerce' });
  };

  const handleUpdateWarehouse = (data: InsertWarehouse) => {
    if (editingWarehouse) {
      updateWarehouseMutation.mutate({ 
        id: editingWarehouse.id, 
        data: { ...data, type: 'ecommerce' } 
      });
    }
  };

  const handleCreateItem = (data: InsertInventoryItem) => {
    if (!selectedWarehouse) {
      toast({ title: "Seleziona un magazzino eCommerce prima", variant: "destructive" });
      return;
    }
    createItemMutation.mutate({ ...data, warehouse_id: selectedWarehouse });
  };

  const openEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    warehouseForm.reset(warehouse);
    setIsWarehouseDialogOpen(true);
  };

  const openNewWarehouse = () => {
    setEditingWarehouse(null);
    warehouseForm.reset({
      name: "",
      location: "",
      type: "ecommerce",
      capacity: 0,
      current_stock: 0,
      is_active: true,
    });
    setIsWarehouseDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="ecommerce-warehouses-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100" data-testid="page-title">
            Magazzini eCommerce
          </h1>
          <p className="text-gray-600 dark:text-gray-400" data-testid="page-description">
            Gestione magazzini e inventario per vendite online
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={openNewWarehouse}
            data-testid="button-add-warehouse"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Magazzino
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-total-warehouses">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Magazzini eCommerce
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold" data-testid="total-warehouses">
                  {stats.totalWarehouses || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-products">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Prodotti Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold" data-testid="total-products">
                  {stats.totalItems || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-low-stock">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Prodotti in Esaurimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold" data-testid="low-stock-count">
                  {stats.lowStockItems || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-value">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Valore Inventario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold" data-testid="inventory-value">
                  €{stats.inventoryValue || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="warehouses" className="space-y-4">
        <TabsList data-testid="tabs-ecommerce">
          <TabsTrigger value="warehouses" data-testid="tab-warehouses">
            <WarehouseIcon className="h-4 w-4 mr-2" />
            Magazzini
          </TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">
            <Package className="h-4 w-4 mr-2" />
            Prodotti
          </TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">
            <Tag className="h-4 w-4 mr-2" />
            Categorie
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca magazzini eCommerce..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-warehouses"
              />
            </div>
          </div>

          {/* Warehouses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingWarehouses ? (
              <div className="col-span-full text-center py-8" data-testid="loading-warehouses">
                Caricamento magazzini...
              </div>
            ) : filteredWarehouses.length === 0 ? (
              <div className="col-span-full text-center py-8" data-testid="no-warehouses">
                Nessun magazzino eCommerce trovato
              </div>
            ) : (
              filteredWarehouses.map((warehouse: Warehouse) => (
                <Card 
                  key={warehouse.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  data-testid={`card-warehouse-${warehouse.id}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2" data-testid={`warehouse-name-${warehouse.id}`}>
                          <ShoppingCart className="h-4 w-4 text-blue-600" />
                          {warehouse.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {warehouse.location}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={warehouse.is_active ? "default" : "secondary"}
                        data-testid={`warehouse-status-${warehouse.id}`}
                      >
                        {warehouse.is_active ? "Attivo" : "Inattivo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Stock:</span>
                        <span className="font-medium" data-testid={`warehouse-capacity-${warehouse.id}`}>
                          {warehouse.current_stock}/{warehouse.capacity}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((warehouse.current_stock / warehouse.capacity) * 100, 100)}%`
                          }}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedWarehouse(warehouse.id)}
                          data-testid={`button-view-products-${warehouse.id}`}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Prodotti
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditWarehouse(warehouse)}
                          data-testid={`button-edit-warehouse-${warehouse.id}`}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Modifica
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {!selectedWarehouse ? (
            <Card data-testid="no-warehouse-selected">
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Seleziona un Magazzino</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Scegli un magazzino per visualizzare i suoi prodotti
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Prodotti - {warehouses.find((w: Warehouse) => w.id === selectedWarehouse)?.name}
                </h3>
                <Button 
                  onClick={() => setIsItemDialogOpen(true)}
                  data-testid="button-add-product"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Prodotto
                </Button>
              </div>

              {loadingInventory ? (
                <div className="text-center py-8" data-testid="loading-products">
                  Caricamento prodotti...
                </div>
              ) : (
                <Card>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prodotto</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Disponibilità</TableHead>
                          <TableHead>Posizione</TableHead>
                          <TableHead>Stato</TableHead>
                          <TableHead>Azioni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.map((item: InventoryItem) => (
                          <TableRow key={item.id} data-testid={`row-product-${item.id}`}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={item.quantity <= item.min_threshold ? "destructive" : 
                                        item.quantity >= item.max_threshold ? "secondary" : "default"}
                              >
                                {item.quantity} {item.unit}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.location}</TableCell>
                            <TableCell>
                              <Badge variant={item.is_active ? "default" : "secondary"}>
                                {item.is_active ? "Attivo" : "Inattivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Star className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card data-testid="card-categories">
            <CardHeader>
              <CardTitle>Categorie Prodotti</CardTitle>
              <CardDescription>Gestisci le categorie dei tuoi prodotti eCommerce</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Gestione categorie in arrivo...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="card-sales-performance">
              <CardHeader>
                <CardTitle>Performance Vendite</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Grafici vendite in arrivo...
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-inventory-trends">
              <CardHeader>
                <CardTitle>Trend Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Analytics inventario in arrivo...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Warehouse Dialog */}
      <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
        <DialogContent data-testid="dialog-warehouse">
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? "Modifica Magazzino eCommerce" : "Nuovo Magazzino eCommerce"}
            </DialogTitle>
            <DialogDescription>
              Gestisci le informazioni del magazzino per vendite online
            </DialogDescription>
          </DialogHeader>
          
          <Form {...warehouseForm}>
            <form onSubmit={warehouseForm.handleSubmit(editingWarehouse ? handleUpdateWarehouse : handleCreateWarehouse)} className="space-y-4">
              <FormField
                control={warehouseForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Magazzino</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-warehouse-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={warehouseForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicazione</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-warehouse-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={warehouseForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacità</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} data-testid="input-warehouse-capacity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={warehouseForm.control}
                  name="current_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Attuale</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} data-testid="input-warehouse-stock" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={warehouseForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-warehouse-active" />
                    </FormControl>
                    <FormLabel>Magazzino Attivo</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={createWarehouseMutation.isPending || updateWarehouseMutation.isPending} data-testid="button-save-warehouse">
                  {editingWarehouse ? "Aggiorna" : "Crea"} Magazzino
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent data-testid="dialog-product">
          <DialogHeader>
            <DialogTitle>Nuovo Prodotto</DialogTitle>
            <DialogDescription>
              Aggiungi un nuovo prodotto al magazzino eCommerce selezionato
            </DialogDescription>
          </DialogHeader>
          
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(handleCreateItem)} className="space-y-4">
              <FormField
                control={itemForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Prodotto</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-product-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-sku" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={itemForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-category" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={itemForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantità</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} data-testid="input-product-quantity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={itemForm.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unità</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-product-unit">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="units">Pezzi</SelectItem>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="boxes">Scatole</SelectItem>
                          <SelectItem value="sets">Set</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={itemForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posizione</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="es. A-01-B" data-testid="input-product-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="min_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scorta Minima</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} data-testid="input-product-min-threshold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={itemForm.control}
                  name="max_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scorta Massima</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} data-testid="input-product-max-threshold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createItemMutation.isPending} data-testid="button-save-product">
                  Aggiungi Prodotto
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}