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
import { insertWarehouseSchema, insertInventorySchema, insertWarehouseZoneSchema, type InsertWarehouse, type InsertInventory, type InsertWarehouseZone, type Warehouse, type Inventory, type WarehouseZone } from "@shared/schema";
import { Warehouse as WarehouseIcon, Package, Truck, QrCode, BarChart3, AlertTriangle, CheckCircle, Clock, MapPin, Zap, Search, Plus, Edit, Trash2, Eye, Download, Upload, Filter, SortAsc, Building, Users, Activity, TrendingUp, Archive, Globe, ShoppingCart, Boxes } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function LogisticsWarehousesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [selectedItemForZones, setSelectedItemForZones] = useState<Inventory | null>(null);
  const [isZonesDialogOpen, setIsZonesDialogOpen] = useState(false);

  // Form setup
  const warehouseForm = useForm<InsertWarehouse>({
    resolver: zodResolver(insertWarehouseSchema),
    defaultValues: {
      name: "",
      location: "",
      type: "logistics",
      capacity: 0,
      current_stock: 0,
      is_active: true,
    },
  });

  const itemForm = useForm<InsertInventory>({
    resolver: zodResolver(insertInventorySchema),
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

  const zoneForm = useForm<InsertWarehouseZone>({
    resolver: zodResolver(insertWarehouseZoneSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "storage",
      level: 1,
      row: "",
      column: "",
      capacity: 100,
      qr_code: "",
      rfid_tag: "",
      temperature_controlled: false,
      is_active: true,
    },
  });

  // Queries
  const { data: warehouses = [], isLoading: loadingWarehouses } = useQuery({
    queryKey: ['/api/warehouses', { type: 'logistics' }],
  });

  const { data: inventory = [], isLoading: loadingInventory } = useQuery({
    queryKey: ['/api/inventory', selectedWarehouse],
    enabled: !!selectedWarehouse,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/warehouses/stats', { type: 'logistics' }],
  });

  // Zone queries
  const { data: zones = [], isLoading: loadingZones } = useQuery({
    queryKey: ['/api/warehouses', selectedItemForZones?.warehouseId, 'zones'],
    enabled: !!selectedItemForZones?.warehouseId && isZonesDialogOpen
  });

  // Mutations
  const createWarehouseMutation = useMutation({
    mutationFn: (data: InsertWarehouse) => 
      apiRequest('/api/warehouses', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/warehouses'] });
      setIsWarehouseDialogOpen(false);
      warehouseForm.reset();
      toast({ title: "Magazzino logistico creato con successo" });
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
      toast({ title: "Magazzino logistico aggiornato con successo" });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: (data: InsertInventory) =>
      apiRequest('/api/inventory', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setIsItemDialogOpen(false);
      itemForm.reset();
      toast({ title: "Elemento inventario aggiunto con successo" });
    },
  });

  // Zone mutations
  const createZoneMutation = useMutation({
    mutationFn: (data: InsertWarehouseZone) => 
      apiRequest(`/api/warehouses/${selectedItemForZones?.warehouseId}/zones`, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/warehouses', selectedItemForZones?.warehouseId, 'zones'] });
      setIsZonesDialogOpen(false);
      zoneForm.reset();
      toast({ title: "Zona magazzino creata con successo" });
    },
  });

  // Filter functions
  const filteredWarehouses = warehouses.filter((warehouse: Warehouse) =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInventory = inventory.filter((item: Inventory) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleCreateWarehouse = (data: InsertWarehouse) => {
    createWarehouseMutation.mutate({ ...data, type: 'logistics' });
  };

  const handleUpdateWarehouse = (data: InsertWarehouse) => {
    if (editingWarehouse) {
      updateWarehouseMutation.mutate({ 
        id: editingWarehouse.id, 
        data: { ...data, type: 'logistics' } 
      });
    }
  };

  const handleCreateItem = (data: InsertInventory) => {
    if (!selectedWarehouse) {
      toast({ title: "Seleziona un magazzino logistico prima", variant: "destructive" });
      return;
    }
    createItemMutation.mutate({ ...data, warehouseId: selectedWarehouse });
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
      type: "logistics",
      capacity: 0,
      current_stock: 0,
      is_active: true,
    });
    setIsWarehouseDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="logistics-warehouses-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100" data-testid="page-title">
            Logistica Magazzini
          </h1>
          <p className="text-gray-600 dark:text-gray-400" data-testid="page-description">
            Gestione operativa magazzini per spedizioni e logistica
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
                Magazzini Logistici
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

          <Card data-testid="card-total-items">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Elementi Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold" data-testid="total-items">
                  {stats.totalItems || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-low-stock">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Scorte Basse
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

          <Card data-testid="card-capacity">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Capacità Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold" data-testid="average-capacity">
                  {Math.round(stats.averageCapacity || 0)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="warehouses" className="space-y-4">
        <TabsList data-testid="tabs-logistics" className="grid w-full grid-cols-5">
          <TabsTrigger value="warehouses" data-testid="tab-warehouses">
            <WarehouseIcon className="h-4 w-4 mr-2" />
            Magazzini
          </TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">
            <Package className="h-4 w-4 mr-2" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="suppliers" data-testid="tab-suppliers">
            <Truck className="h-4 w-4 mr-2" />
            Ricezione Fornitori
          </TabsTrigger>
          <TabsTrigger value="partners" data-testid="tab-partners">
            <Globe className="h-4 w-4 mr-2" />
            Partner Network
          </TabsTrigger>
          <TabsTrigger value="ai-tracking" data-testid="tab-ai-tracking">
            <Zap className="h-4 w-4 mr-2" />
            AI Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca magazzini..."
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
                Nessun magazzino logistico trovato
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
                        <CardTitle className="text-lg" data-testid={`warehouse-name-${warehouse.id}`}>
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
                        <span className="text-sm text-gray-600 dark:text-gray-400">Capacità:</span>
                        <span className="font-medium" data-testid={`warehouse-capacity-${warehouse.id}`}>
                          {warehouse.current_stock}/{warehouse.capacity}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
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
                          data-testid={`button-view-inventory-${warehouse.id}`}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Inventario
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

        <TabsContent value="inventory" className="space-y-4">
          {!selectedWarehouse ? (
            <Card data-testid="no-warehouse-selected">
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Seleziona un Magazzino</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Scegli un magazzino per visualizzare il suo inventario
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Inventario - {warehouses.find((w: Warehouse) => w.id === selectedWarehouse)?.name}
                </h3>
                <Button 
                  onClick={() => setIsItemDialogOpen(true)}
                  data-testid="button-add-item"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Elemento
                </Button>
              </div>

              {loadingInventory ? (
                <div className="text-center py-8" data-testid="loading-inventory">
                  Caricamento inventario...
                </div>
              ) : (
                <Card>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Quantità</TableHead>
                          <TableHead>Posizione</TableHead>
                          <TableHead>Stato</TableHead>
                          <TableHead>Azioni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.map((item: Inventory) => (
                          <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>
                              <Badge variant={item.quantity <= item.min_threshold ? "destructive" : "default"}>
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
                                  <QrCode className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedItemForZones(item);
                                    setIsZonesDialogOpen(true);
                                  }}
                                  data-testid={`button-zones-${item.id}`}
                                >
                                  <Building className="h-3 w-3 mr-1" />
                                  Zone
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


        {/* Suppliers Reception Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card data-testid="suppliers-reception-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Ricezione da Fornitori
              </CardTitle>
              <CardDescription>
                Gestione ricezione merci e movimentazione interna da fornitori
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ordini in Arrivo</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ricevute Oggi</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">In Verifica</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                  </div>
                </Card>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordine</TableHead>
                    <TableHead>Fornitore</TableHead>
                    <TableHead>Articoli</TableHead>
                    <TableHead>Data Prevista</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">#ORD-2024-001</TableCell>
                    <TableCell>Fornitore Italia SRL</TableCell>
                    <TableCell>24 articoli</TableCell>
                    <TableCell>Oggi 14:30</TableCell>
                    <TableCell><Badge>In Arrivo</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Ricevi</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partner Network Tab */}
        <TabsContent value="partners" className="space-y-4">
          <Card data-testid="partner-network-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Magazzini Partner & Rete Logistica
              </CardTitle>
              <CardDescription>
                Gestione magazzini partner Italia/estero e rete corrieri privati
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="warehouses-network" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="warehouses-network">Magazzini Partner</TabsTrigger>
                  <TabsTrigger value="courier-network">Rete Corrieri</TabsTrigger>
                </TabsList>
                
                <TabsContent value="warehouses-network" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="default">🇮🇹 Italia</Badge>
                        <Badge variant="outline">Attivo</Badge>
                      </div>
                      <h4 className="font-semibold">LogiCenter Milano</h4>
                      <p className="text-sm text-gray-600">Via Milano 123, Milano</p>
                      <p className="text-xs text-gray-500 mt-2">Capacità: 85%</p>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="default">🇩🇪 Germania</Badge>
                        <Badge variant="outline">Attivo</Badge>
                      </div>
                      <h4 className="font-semibold">EuroLogistics Berlin</h4>
                      <p className="text-sm text-gray-600">Berliner Str. 45, Berlin</p>
                      <p className="text-xs text-gray-500 mt-2">Capacità: 67%</p>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="default">🇨🇳 Cina</Badge>
                        <Badge variant="outline">Attivo</Badge>
                      </div>
                      <h4 className="font-semibold">China Hub Shenzhen</h4>
                      <p className="text-sm text-gray-600">Shenzhen Industrial Zone</p>
                      <p className="text-xs text-gray-500 mt-2">Capacità: 92%</p>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="courier-network" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Corrieri Privati Attivi</h4>
                        <Badge variant="default">12</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Express Logistics</span>
                          <Badge variant="outline">Rating 4.8</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>FastTrack Couriers</span>
                          <Badge variant="outline">Rating 4.6</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Speed Delivery</span>
                          <Badge variant="outline">Rating 4.9</Badge>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Performance Oggi</h4>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Consegne Completate</span>
                          <span className="font-semibold">147</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tempo Medio</span>
                          <span className="font-semibold">2.3h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Successo Rate</span>
                          <span className="font-semibold text-green-600">98.2%</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tracking Tab */}
        <TabsContent value="ai-tracking" className="space-y-4">
          <Card data-testid="ai-tracking-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                AI Shipment Tracking
              </CardTitle>
              <CardDescription>
                Tracking intelligente con AI predittiva e analisi real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Spedizioni Tracked</p>
                      <p className="text-2xl font-bold">342</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ETA Accuracy</p>
                      <p className="text-2xl font-bold">96.8%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Anomalie Detect</p>
                      <p className="text-2xl font-bold">7</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">AI Confidence</p>
                      <p className="text-2xl font-bold">94.2%</p>
                    </div>
                    <Zap className="h-8 w-8 text-purple-500" />
                  </div>
                </Card>
              </div>
              
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Tracking AI in Tempo Reale</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">#TRK-2024-003421</p>
                        <p className="text-sm text-gray-600">Milano → Roma • ETA: 14:30</p>
                      </div>
                    </div>
                    <Badge variant="default">In Transito</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium">#TRK-2024-003422</p>
                        <p className="text-sm text-gray-600">Napoli → Palermo • ETA: 16:45</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Ritardo Predetto</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">#TRK-2024-003423</p>
                        <p className="text-sm text-gray-600">Torino → Milano • ETA: 12:15</p>
                      </div>
                    </div>
                    <Badge variant="outline">Ottimizzato AI</Badge>
                  </div>
                </div>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Warehouse Dialog */}
      <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
        <DialogContent data-testid="dialog-warehouse">
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? "Modifica Magazzino Logistico" : "Nuovo Magazzino Logistico"}
            </DialogTitle>
            <DialogDescription>
              Gestisci le informazioni del magazzino per operazioni logistiche
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

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent data-testid="dialog-item">
          <DialogHeader>
            <DialogTitle>Nuovo Elemento Inventario</DialogTitle>
            <DialogDescription>
              Aggiungi un nuovo elemento all'inventario del magazzino selezionato
            </DialogDescription>
          </DialogHeader>
          
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(handleCreateItem)} className="space-y-4">
              <FormField
                control={itemForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Elemento</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-item-name" />
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
                        <Input {...field} data-testid="input-item-sku" />
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
                        <Input {...field} data-testid="input-item-category" />
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
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} data-testid="input-item-quantity" />
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
                          <SelectTrigger data-testid="select-item-unit">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="units">Unità</SelectItem>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="liters">Litri</SelectItem>
                          <SelectItem value="boxes">Scatole</SelectItem>
                          <SelectItem value="pallets">Pallet</SelectItem>
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
                        <Input {...field} placeholder="es. A-01-B" data-testid="input-item-location" />
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
                      <FormLabel>Soglia Minima</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} data-testid="input-item-min-threshold" />
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
                      <FormLabel>Soglia Massima</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} data-testid="input-item-max-threshold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createItemMutation.isPending} data-testid="button-save-item">
                  Aggiungi Elemento
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Zone Management Dialog */}
      <Dialog open={isZonesDialogOpen} onOpenChange={setIsZonesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="zone-dialog-title">
              Gestione Zone - {selectedItemForZones?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Create New Zone Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aggiungi Nuova Zona</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...zoneForm}>
                  <form onSubmit={zoneForm.handleSubmit(handleCreateZone)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={zoneForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Zona</FormLabel>
                            <FormControl>
                              <Input placeholder="es. Scaffale A1" {...field} data-testid="input-zone-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={zoneForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Codice Zona</FormLabel>
                            <FormControl>
                              <Input placeholder="es. A1-01" {...field} data-testid="input-zone-code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={zoneForm.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Livello</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} data-testid="input-zone-level" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={zoneForm.control}
                        name="row"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fila</FormLabel>
                            <FormControl>
                              <Input placeholder="es. A" {...field} data-testid="input-zone-row" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={zoneForm.control}
                        name="column"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Colonna</FormLabel>
                            <FormControl>
                              <Input placeholder="es. 01" {...field} data-testid="input-zone-column" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={zoneForm.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacità (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="100" {...field} data-testid="input-zone-capacity" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={zoneForm.control}
                        name="temperature_controlled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div>
                              <FormLabel>Temperatura Controllata</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-temperature-controlled"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsZonesDialogOpen(false)}
                        data-testid="button-cancel-zone"
                      >
                        Annulla
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createZoneMutation.isPending}
                        data-testid="button-create-zone"
                      >
                        {createZoneMutation.isPending ? "Creando..." : "Crea Zona"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Existing Zones List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zone Esistenti</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingZones ? (
                  <div className="text-center py-8" data-testid="loading-zones">
                    Caricamento zone...
                  </div>
                ) : zones.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="no-zones">
                    Nessuna zona configurata per questo magazzino
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {zones.map((zone: WarehouseZone) => (
                      <Card key={zone.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold" data-testid={`zone-name-${zone.id}`}>
                              {zone.name}
                            </h4>
                            <Badge variant={zone.is_active ? "default" : "secondary"}>
                              {zone.is_active ? "Attiva" : "Inattiva"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Codice: {zone.code}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Posizione: L{zone.level} - {zone.row}{zone.column}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-sm">Capacità: {zone.capacity}%</div>
                            {zone.temperature_controlled && (
                              <Badge variant="outline" className="text-xs">
                                🌡️ Temp. Controllata
                              </Badge>
                            )}
                          </div>
                          {zone.qr_code && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <QrCode className="h-3 w-3" />
                              QR Code disponibile
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}