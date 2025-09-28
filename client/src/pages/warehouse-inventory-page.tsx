import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Package, Warehouse, QrCode, Activity, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  insertWarehouseSchema, 
  insertWarehouseZoneSchema, 
  insertInventorySchema, 
  insertInventoryMovementSchema,
  type Warehouse,
  type WarehouseZone,
  type Inventory,
  type InventoryMovement
} from "@shared/schema";
import { z } from "zod";

// Form schemas
const warehouseFormSchema = insertWarehouseSchema.omit({ id: true, createdAt: true, updatedAt: true });
const zoneFormSchema = insertWarehouseZoneSchema.omit({ id: true, createdAt: true, updatedAt: true });
const inventoryFormSchema = insertInventorySchema.omit({ id: true, createdAt: true, updatedAt: true });
const movementFormSchema = insertInventoryMovementSchema.omit({ id: true, createdAt: true, updatedAt: true });

export default function WarehouseInventoryPage() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const { toast } = useToast();

  // Queries
  const { data: warehouses = [], isLoading: loadingWarehouses } = useQuery({
    queryKey: ['/api/warehouses'],
  });

  const { data: zones = [], isLoading: loadingZones } = useQuery({
    queryKey: ['/api/warehouse-zones'],
  });

  const { data: inventory = [], isLoading: loadingInventory } = useQuery({
    queryKey: ['/api/inventory'],
  });

  const { data: movements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ['/api/inventory-movements'],
  });

  // Mutations
  const createWarehouseMutation = useMutation({
    mutationFn: (data: z.infer<typeof warehouseFormSchema>) => 
      apiRequest('/api/warehouses', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/warehouses'] });
      toast({ title: "Magazzino creato con successo!" });
      setOpenDialog(null);
    }
  });

  const createZoneMutation = useMutation({
    mutationFn: (data: z.infer<typeof zoneFormSchema>) => 
      apiRequest('/api/warehouse-zones', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/warehouse-zones'] });
      toast({ title: "Zona creata con successo!" });
      setOpenDialog(null);
    }
  });

  const createInventoryMutation = useMutation({
    mutationFn: (data: z.infer<typeof inventoryFormSchema>) => 
      apiRequest('/api/inventory', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({ title: "Articolo aggiunto all'inventario!" });
      setOpenDialog(null);
    }
  });

  const createMovementMutation = useMutation({
    mutationFn: (data: z.infer<typeof movementFormSchema>) => 
      apiRequest('/api/inventory-movements', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({ title: "Movimento registrato!" });
      setOpenDialog(null);
    }
  });

  // Forms
  const warehouseForm = useForm<z.infer<typeof warehouseFormSchema>>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "distribution",
      status: "active",
      address: "",
      city: "",
      country: "IT",
      capacity: { storage: 0, throughput: 0, zones: 0 },
      features: [],
      hasRfid: false,
      hasWms: false,
      hasApi: false,
    }
  });

  const zoneForm = useForm<z.infer<typeof zoneFormSchema>>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "storage",
      status: "active",
      capacity: { maxItems: 0, currentItems: 0, volume: 0 },
      features: [],
      hasRfid: false,
    }
  });

  const inventoryForm = useForm<z.infer<typeof inventoryFormSchema>>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      sku: "",
      name: "",
      category: "",
      quantityAvailable: 0,
      quantityReserved: 0,
      quantityMinimum: 0,
      quantityMaximum: 0,
      unitCost: "0.00",
      unitPrice: "0.00",
      status: "available",
      hasRfid: false,
      hasQr: false,
    }
  });

  const movementForm = useForm<z.infer<typeof movementFormSchema>>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      type: "in",
      quantity: 0,
      unitCost: "0.00",
      reason: "",
      notes: "",
    }
  });

  // Stats calculations
  const totalCapacity = warehouses.reduce((sum: number, w: Warehouse) => sum + (w.capacity?.storage || 0), 0);
  const totalItems = inventory.reduce((sum: number, i: Inventory) => sum + i.quantityAvailable, 0);
  const lowStockItems = inventory.filter((i: Inventory) => i.quantityAvailable <= i.quantityMinimum).length;
  const recentMovements = movements.slice(0, 5);

  if (loadingWarehouses || loadingZones || loadingInventory || loadingMovements) {
    return <div className="p-6">Caricamento dati magazzino...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-blue-600" />
            Magazzino & Inventario
          </h1>
          <p className="text-muted-foreground">Gestione completa di magazzini, zone e inventario con QR/RFID</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Magazzini</p>
                <p className="text-2xl font-bold" data-testid="stat-warehouses">{warehouses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Articoli</p>
                <p className="text-2xl font-bold" data-testid="stat-items">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Capacità (m³)</p>
                <p className="text-2xl font-bold" data-testid="stat-capacity">{totalCapacity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Scorte Basse</p>
                <p className="text-2xl font-bold text-orange-600" data-testid="stat-low-stock">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="warehouses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="warehouses">Magazzini</TabsTrigger>
          <TabsTrigger value="zones">Zone</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="movements">Movimenti</TabsTrigger>
        </TabsList>

        {/* Warehouses Tab */}
        <TabsContent value="warehouses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Gestione Magazzini</h2>
            <Dialog open={openDialog === 'warehouse'} onOpenChange={(open) => setOpenDialog(open ? 'warehouse' : null)}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-warehouse">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Magazzino
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crea Nuovo Magazzino</DialogTitle>
                </DialogHeader>
                <Form {...warehouseForm}>
                  <form onSubmit={warehouseForm.handleSubmit((data) => createWarehouseMutation.mutate(data))} className="space-y-4">
                    <FormField control={warehouseForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Magazzino</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-warehouse-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={warehouseForm.control} name="code" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codice</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-warehouse-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={warehouseForm.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Indirizzo</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-warehouse-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={warehouseForm.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Città</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-warehouse-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="flex gap-2">
                      <Button type="submit" disabled={createWarehouseMutation.isPending} data-testid="button-save-warehouse">
                        {createWarehouseMutation.isPending ? "Creazione..." : "Crea Magazzino"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setOpenDialog(null)}>
                        Annulla
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Codice</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Città</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>RFID</TableHead>
                    <TableHead>Zone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.map((warehouse: Warehouse) => (
                    <TableRow key={warehouse.id} data-testid={`row-warehouse-${warehouse.id}`}>
                      <TableCell className="font-medium" data-testid={`text-warehouse-name-${warehouse.id}`}>
                        {warehouse.name}
                      </TableCell>
                      <TableCell data-testid={`text-warehouse-code-${warehouse.id}`}>
                        {warehouse.code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{warehouse.type}</Badge>
                      </TableCell>
                      <TableCell>{warehouse.city}</TableCell>
                      <TableCell>
                        <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'}>
                          {warehouse.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {warehouse.hasRfid && <QrCode className="w-4 h-4 text-green-600" />}
                      </TableCell>
                      <TableCell>
                        {zones.filter((z: WarehouseZone) => z.warehouseId === warehouse.id).length}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zones Tab */}
        <TabsContent value="zones" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Zone Magazzino</h2>
            <Dialog open={openDialog === 'zone'} onOpenChange={(open) => setOpenDialog(open ? 'zone' : null)}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-zone">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Zona
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crea Nuova Zona</DialogTitle>
                </DialogHeader>
                <Form {...zoneForm}>
                  <form onSubmit={zoneForm.handleSubmit((data) => createZoneMutation.mutate(data))} className="space-y-4">
                    <FormField control={zoneForm.control} name="warehouseId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Magazzino</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-zone-warehouse">
                              <SelectValue placeholder="Seleziona magazzino" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {warehouses.map((warehouse: Warehouse) => (
                              <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={zoneForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Zona</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-zone-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={zoneForm.control} name="code" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codice</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-zone-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="flex gap-2">
                      <Button type="submit" disabled={createZoneMutation.isPending} data-testid="button-save-zone">
                        {createZoneMutation.isPending ? "Creazione..." : "Crea Zona"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setOpenDialog(null)}>
                        Annulla
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Codice</TableHead>
                    <TableHead>Magazzino</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>RFID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.map((zone: WarehouseZone) => {
                    const warehouse = warehouses.find((w: Warehouse) => w.id === zone.warehouseId);
                    return (
                      <TableRow key={zone.id} data-testid={`row-zone-${zone.id}`}>
                        <TableCell className="font-medium" data-testid={`text-zone-name-${zone.id}`}>
                          {zone.name}
                        </TableCell>
                        <TableCell>{zone.code}</TableCell>
                        <TableCell>{warehouse?.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{zone.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={zone.status === 'active' ? 'default' : 'secondary'}>
                            {zone.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {zone.hasRfid && <QrCode className="w-4 h-4 text-green-600" />}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Inventario</h2>
            <Dialog open={openDialog === 'inventory'} onOpenChange={(open) => setOpenDialog(open ? 'inventory' : null)}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-inventory">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Articolo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Aggiungi Articolo</DialogTitle>
                </DialogHeader>
                <Form {...inventoryForm}>
                  <form onSubmit={inventoryForm.handleSubmit((data) => createInventoryMutation.mutate(data))} className="space-y-4">
                    <FormField control={inventoryForm.control} name="warehouseId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Magazzino</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-inventory-warehouse">
                              <SelectValue placeholder="Seleziona magazzino" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {warehouses.map((warehouse: Warehouse) => (
                              <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={inventoryForm.control} name="sku" render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-inventory-sku" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={inventoryForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Prodotto</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-inventory-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={inventoryForm.control} name="quantityAvailable" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantità</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-inventory-quantity" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="flex gap-2">
                      <Button type="submit" disabled={createInventoryMutation.isPending} data-testid="button-save-inventory">
                        {createInventoryMutation.isPending ? "Aggiunta..." : "Aggiungi Articolo"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setOpenDialog(null)}>
                        Annulla
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Magazzino</TableHead>
                    <TableHead>Disponibile</TableHead>
                    <TableHead>Riservato</TableHead>
                    <TableHead>Minimo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>QR/RFID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item: Inventory) => {
                    const warehouse = warehouses.find((w: Warehouse) => w.id === item.warehouseId);
                    const isLowStock = item.quantityAvailable <= item.quantityMinimum;
                    return (
                      <TableRow key={item.id} data-testid={`row-inventory-${item.id}`}>
                        <TableCell className="font-medium" data-testid={`text-inventory-sku-${item.id}`}>
                          {item.sku}
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{warehouse?.name}</TableCell>
                        <TableCell className={isLowStock ? "text-orange-600 font-medium" : ""}>
                          {item.quantityAvailable}
                        </TableCell>
                        <TableCell>{item.quantityReserved}</TableCell>
                        <TableCell>{item.quantityMinimum}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {item.hasQr && <QrCode className="w-4 h-4 text-blue-600" />}
                            {item.hasRfid && <QrCode className="w-4 h-4 text-green-600" />}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Movimenti Inventario</h2>
            <Dialog open={openDialog === 'movement'} onOpenChange={(open) => setOpenDialog(open ? 'movement' : null)}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-movement">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Movimento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Registra Movimento</DialogTitle>
                </DialogHeader>
                <Form {...movementForm}>
                  <form onSubmit={movementForm.handleSubmit((data) => createMovementMutation.mutate(data))} className="space-y-4">
                    <FormField control={movementForm.control} name="inventoryId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Articolo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-movement-inventory">
                              <SelectValue placeholder="Seleziona articolo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {inventory.map((item: Inventory) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.sku} - {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={movementForm.control} name="type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Movimento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-movement-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in">Carico</SelectItem>
                            <SelectItem value="out">Scarico</SelectItem>
                            <SelectItem value="transfer">Trasferimento</SelectItem>
                            <SelectItem value="adjustment">Rettifica</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={movementForm.control} name="quantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantità</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-movement-quantity" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={movementForm.control} name="reason" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-movement-reason" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="flex gap-2">
                      <Button type="submit" disabled={createMovementMutation.isPending} data-testid="button-save-movement">
                        {createMovementMutation.isPending ? "Registrazione..." : "Registra Movimento"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setOpenDialog(null)}>
                        Annulla
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Articolo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantità</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Operatore</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((movement: InventoryMovement) => {
                    const item = inventory.find((i: Inventory) => i.id === movement.inventoryId);
                    return (
                      <TableRow key={movement.id} data-testid={`row-movement-${movement.id}`}>
                        <TableCell>
                          {new Date(movement.createdAt).toLocaleDateString('it-IT')}
                        </TableCell>
                        <TableCell>{item?.sku} - {item?.name}</TableCell>
                        <TableCell>
                          <Badge variant={movement.type === 'in' ? 'default' : 'destructive'}>
                            {movement.type === 'in' ? 'Carico' : movement.type === 'out' ? 'Scarico' : movement.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{movement.quantity}</TableCell>
                        <TableCell>{movement.reason}</TableCell>
                        <TableCell>{movement.operatorId}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}