/*
 * YCore Rates & Carriers Page - Proprietary Frontend Module
 * Copyright © 2025 YCore SRL Innovativa - All Rights Reserved
 * 
 * WATERMARK: ycore-rates-a1b2c3d4-e5f6-7890-abcd-ef1234567890
 * BUILD: 2025-09-27T23:15:00.000Z
 * 
 * CONFIDENTIAL AND PROPRIETARY - NOT FOR DISTRIBUTION
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Truck, Package, Globe, Weight, Calculator, 
  Plus, Search, Filter, TrendingUp, Activity, AlertTriangle,
  Ship, Plane, MapPin, Clock, Zap
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCarrierSchema, type InsertCarrier } from "@shared/schema";
import { z } from "zod";

interface Carrier {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: 'courier' | 'maritime' | 'air' | 'rail' | 'multimodal';
  isActive: boolean;
  reliability: number;
  avgDeliveryTime: number;
  coverage: string[];
  specialCapabilities: string[];
  integration: {
    apiEndpoint?: string;
    trackingUrl?: string;
    webhookSupport: boolean;
  };
  created: string;
  updated: string;
}

interface Zone {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: 'domestic' | 'international' | 'special';
  postalCodes: string[];
  coordinates?: { lat: number; lng: number };
  surcharge: number;
  isActive: boolean;
  created: string;
}

interface WeightBracket {
  id: string;
  tenantId: string;
  name: string;
  minWeight: number;
  maxWeight: number;
  unit: 'kg' | 'tonne';
  basePrice: number;
  pricePerKg: number;
  isActive: boolean;
  created: string;
}

interface ShippingQuote {
  id: string;
  tenantId: string;
  quoteNumber: string;
  clientId?: string;
  carrierId: string;
  carrierName: string;
  originZone: string;
  destinationZone: string;
  weight: number;
  totalPrice: number;
  basePrice: number;
  surcharges: number;
  transitTime: number;
  status: 'pending' | 'accepted' | 'expired';
  aiConfidence: number;
  created: string;
}

interface DashboardStats {
  totalCarriers: number;
  activeCarriers: number;
  totalZones: number;
  specialZones: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  avgQuoteValue: number;
  topCarriers: Array<{id: string; name: string; quotes: number; avgPrice: number; reliability: number}>;
}

export default function RatesCarriersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newCarrierOpen, setNewCarrierOpen] = useState(false);
  const { toast } = useToast();

  // Form schema for new carrier  
  const carrierFormSchema = insertCarrierSchema.omit({ tenantId: true }).extend({
    reliability: z.number().min(0).max(100).default(95),
    avgDeliveryTime: z.number().min(1).default(24)
  });

  // Fetch data
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/rates/dashboard/stats"],
  });

  const { data: carriers, isLoading: carriersLoading } = useQuery<Carrier[]>({
    queryKey: ["/api/rates/carriers"],
  });

  const { data: zones, isLoading: zonesLoading } = useQuery<Zone[]>({
    queryKey: ["/api/rates/zones"],
  });

  const { data: weightBrackets, isLoading: weightsLoading } = useQuery<WeightBracket[]>({
    queryKey: ["/api/rates/weight-brackets"],
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery<ShippingQuote[]>({
    queryKey: ["/api/rates/quotes"],
  });

  const { data: carrierRates, isLoading: carrierRatesLoading } = useQuery({
    queryKey: ["/api/rates/carrier-rates"],
  });

  const { data: clientRates, isLoading: clientRatesLoading } = useQuery({
    queryKey: ["/api/rates/client-rates"],
  });

  // New carrier form
  const carrierForm = useForm<z.infer<typeof carrierFormSchema>>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "express",
      isActive: true,
      reliability: 95,
      averageDeliveryTime: 24,
      coverage: [],
      specialCapabilities: [],
      integration: {
        webhookSupport: false
      }
    },
  });

  // Mutations
  const createCarrierMutation = useMutation({
    mutationFn: (data: InsertCarrier) => apiRequest("POST", "/api/rates/carriers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rates/carriers"] });
      toast({ title: "Corriere creato con successo" });
      setNewCarrierOpen(false);
      carrierForm.reset();
    },
  });

  const onCreateCarrier = (data: z.infer<typeof carrierFormSchema>) => {
    createCarrierMutation.mutate(data as InsertCarrier);
  };

  const calculateRatesMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/rates/calculate", data),
    onSuccess: (result: any) => {
      toast({ 
        title: "Quotazione calcolata", 
        description: `Corriere raccomandato: ${result.recommendedCarrier || 'N/A'}` 
      });
    },
  });

  const getCarrierIcon = (type: string) => {
    switch (type) {
      case 'maritime': return Ship;
      case 'air': return Plane;
      case 'courier': return Truck;
      case 'rail': return Truck;
      default: return Package;
    }
  };

  const filteredCarriers = carriers?.filter(carrier =>
    carrier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    carrier.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100" data-testid="page-title">
              Listini & Corrieri
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1" data-testid="page-description">
              Sistema integrato fasce peso 1-1000 KG + tonnellate, zone speciali, quotazioni AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={newCarrierOpen} onOpenChange={setNewCarrierOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="button-new-carrier"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Corriere
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nuovo Corriere Strategico</DialogTitle>
                  <DialogDescription>
                    Aggiungi un nuovo corriere per il sistema di quotazioni.
                  </DialogDescription>
                </DialogHeader>
                <Form {...carrierForm}>
                  <form onSubmit={carrierForm.handleSubmit(onCreateCarrier)} className="space-y-4">
                    <FormField
                      control={carrierForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Corriere</FormLabel>
                          <FormControl>
                            <Input placeholder="DHL Express" {...field} data-testid="input-carrier-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={carrierForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Codice</FormLabel>
                          <FormControl>
                            <Input placeholder="DHL" {...field} data-testid="input-carrier-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={carrierForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-carrier-type">
                                <SelectValue placeholder="Seleziona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="express">Express</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="economy">Economy</SelectItem>
                              <SelectItem value="maritime">Marittimo</SelectItem>
                              <SelectItem value="air_cargo">Air Cargo</SelectItem>
                              <SelectItem value="road_freight">Road Freight</SelectItem>
                              <SelectItem value="rail">Rail</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={carrierForm.control}
                        name="reliability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Affidabilità (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                max="100" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-carrier-reliability"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={carrierForm.control}
                        name="avgDeliveryTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tempo Medio (ore)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-carrier-delivery-time"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={carrierForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Stato Attivo</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-carrier-active"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setNewCarrierOpen(false)}
                        data-testid="button-cancel-carrier"
                      >
                        Annulla
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createCarrierMutation.isPending}
                        data-testid="button-save-carrier"
                      >
                        {createCarrierMutation.isPending ? "Salvataggio..." : "Salva Corriere"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button 
              size="sm" 
              variant="outline"
              data-testid="button-calculate-rates"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calcola Tariffe AI
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Corrieri Attivi</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid="stat-active-carriers">
                      {stats.activeCarriers}
                    </p>
                  </div>
                  <Truck className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Zone Speciali</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid="stat-special-zones">
                      {stats.specialZones}
                    </p>
                  </div>
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Quotazioni Pendenti</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid="stat-pending-quotes">
                      {stats.pendingQuotes}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Valore Medio</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid="stat-avg-quote-value">
                      €{stats.avgQuoteValue?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Cerca corrieri, zone, tariffe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-carriers"
                />
              </div>
              <Button variant="outline" size="sm" data-testid="button-filter">
                <Filter className="w-4 h-4 mr-2" />
                Filtri
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="carriers" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="carriers" data-testid="tab-carriers">
              <Truck className="w-4 h-4 mr-2" />
              Corrieri Attivi
            </TabsTrigger>
            <TabsTrigger value="zones" data-testid="tab-zones">
              <Globe className="w-4 h-4 mr-2" />
              Zone & Fasce
            </TabsTrigger>
            <TabsTrigger value="carrier-rates" data-testid="tab-carrier-rates">
              <Package className="w-4 h-4 mr-2" />
              Listini Corrieri
            </TabsTrigger>
            <TabsTrigger value="client-rates" data-testid="tab-client-rates">
              <Weight className="w-4 h-4 mr-2" />
              Listini Clienti
            </TabsTrigger>
            <TabsTrigger value="quotes" data-testid="tab-quotes">
              <Calculator className="w-4 h-4 mr-2" />
              Quotazioni AI
            </TabsTrigger>
          </TabsList>

          {/* Carriers Tab */}
          <TabsContent value="carriers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Corrieri Strategici
                </CardTitle>
                <CardDescription>
                  Gestione corrieri globali: DHL, UPS, FedEx, Cainiao, Maersk
                </CardDescription>
              </CardHeader>
              <CardContent>
                {carriersLoading ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-slate-600 mt-2">Caricamento corrieri...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Corriere</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Affidabilità</TableHead>
                        <TableHead>Tempo Medio</TableHead>
                        <TableHead>Capacità</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCarriers.map((carrier) => {
                        const IconComponent = getCarrierIcon(carrier.type);
                        return (
                          <TableRow key={carrier.id} data-testid={`row-carrier-${carrier.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <IconComponent className="w-5 h-5 text-slate-600" />
                                <div>
                                  <p className="font-medium">{carrier.name}</p>
                                  <p className="text-sm text-slate-500">{carrier.code}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{carrier.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-slate-200 rounded-full">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${carrier.reliability}%` }}
                                  />
                                </div>
                                <span className="text-sm">{carrier.reliability}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{carrier.avgDeliveryTime}h</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {carrier.specialCapabilities?.slice(0, 2).map((cap, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {cap}
                                  </Badge>
                                )) || <span className="text-sm text-slate-500">-</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={carrier.isActive ? "default" : "secondary"}>
                                {carrier.isActive ? "Attivo" : "Inattivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline"
                                data-testid={`button-configure-${carrier.id}`}
                              >
                                Configura
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zones Tab */}
          <TabsContent value="zones" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Zone Geografiche
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {zonesLoading ? (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {zones?.map((zone) => (
                        <div 
                          key={zone.id} 
                          className="flex items-center justify-between p-3 border rounded-lg"
                          data-testid={`zone-${zone.id}`}
                        >
                          <div>
                            <p className="font-medium">{zone.name}</p>
                            <p className="text-sm text-slate-500">{zone.code}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={zone.type === 'special' ? 'destructive' : 'default'}>
                              {zone.type}
                            </Badge>
                            {zone.surcharge > 0 && (
                              <p className="text-sm text-amber-600">+{zone.surcharge}%</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight className="w-5 h-5" />
                    Fasce Peso & Tonnellate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weightsLoading ? (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {weightBrackets?.map((bracket) => (
                        <div 
                          key={bracket.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                          data-testid={`weight-bracket-${bracket.id}`}
                        >
                          <div>
                            <p className="font-medium">{bracket.name}</p>
                            <p className="text-sm text-slate-500">
                              {bracket.minWeight} - {bracket.maxWeight} {bracket.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">€{bracket.basePrice}</p>
                            <p className="text-xs text-slate-500">+€{bracket.pricePerKg}/{bracket.unit}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Carrier Rates Tab */}
          <TabsContent value="carrier-rates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Listini Corrieri
                </CardTitle>
                <CardDescription>
                  Configurazione tariffe per corrieri strategici
                </CardDescription>
              </CardHeader>
              <CardContent>
                {carrierRatesLoading ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-slate-600 mt-2">Caricamento listini corrieri...</p>
                  </div>
                ) : carrierRates && carrierRates.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Corriere</TableHead>
                        <TableHead>Zona</TableHead>
                        <TableHead>Fascia Peso</TableHead>
                        <TableHead>Prezzo Base</TableHead>
                        <TableHead>Prezzo/KG</TableHead>
                        <TableHead>Sovrapprezzo</TableHead>
                        <TableHead>Valido Dal</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carrierRates.map((rate: any) => (
                        <TableRow key={rate.id} data-testid={`row-carrier-rate-${rate.id}`}>
                          <TableCell>
                            <div className="font-medium">{rate.carrierName || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{rate.zoneName || rate.zoneId}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{rate.weightMin}-{rate.weightMax} kg</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">€{rate.basePrice?.toFixed(2) || '0.00'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">€{rate.pricePerKg?.toFixed(2) || '0.00'}</div>
                          </TableCell>
                          <TableCell>
                            {rate.surcharge > 0 ? (
                              <Badge variant="destructive">+{rate.surcharge}%</Badge>
                            ) : (
                              <Badge variant="secondary">-</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-500">
                              {rate.validFrom ? new Date(rate.validFrom).toLocaleDateString('it-IT') : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" data-testid={`button-edit-carrier-rate-${rate.id}`}>
                              Modifica
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600">Nessun listino corriere configurato</p>
                    <Button className="mt-4" data-testid="button-setup-carrier-rates">
                      <Plus className="w-4 h-4 mr-2" />
                      Configura Primo Listino
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Rates Tab */}
          <TabsContent value="client-rates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Weight className="w-5 h-5" />
                  Listini Clienti
                </CardTitle>
                <CardDescription>
                  Tariffe personalizzate per merchant e sottoclienti
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clientRatesLoading ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-slate-600 mt-2">Caricamento listini clienti...</p>
                  </div>
                ) : clientRates && clientRates.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Corriere</TableHead>
                        <TableHead>Listino Base</TableHead>
                        <TableHead>Markup</TableHead>
                        <TableHead>Sconti</TableHead>
                        <TableHead>Prezzo Finale</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientRates.map((rate: any) => (
                        <TableRow key={rate.id} data-testid={`row-client-rate-${rate.id}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{rate.clientName || rate.clientId}</p>
                              <p className="text-xs text-slate-500">{rate.clientType || 'Merchant'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{rate.carrierName || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">€{rate.basePrice?.toFixed(2) || '0.00'}</div>
                          </TableCell>
                          <TableCell>
                            {rate.markup > 0 ? (
                              <Badge variant="destructive">+{rate.markup}%</Badge>
                            ) : (
                              <Badge variant="secondary">0%</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {rate.discountPercentage > 0 ? (
                              <Badge variant="default">-{rate.discountPercentage}%</Badge>
                            ) : (
                              <Badge variant="secondary">0%</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-emerald-600">
                              €{rate.finalPrice?.toFixed(2) || rate.basePrice?.toFixed(2) || '0.00'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={rate.isActive ? "default" : "secondary"}>
                              {rate.isActive ? "Attivo" : "Inattivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" data-testid={`button-edit-client-rate-${rate.id}`}>
                              Modifica
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Weight className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600">Nessun listino cliente configurato</p>
                    <Button className="mt-4" data-testid="button-setup-client-rates">
                      <Plus className="w-4 h-4 mr-2" />
                      Configura Primo Listino
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Quotazioni AI-Powered
                </CardTitle>
                <CardDescription>
                  Sistema intelligente per selezione corriere ottimale
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quotesLoading ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                  </div>
                ) : quotes && quotes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quotazione</TableHead>
                        <TableHead>Corriere</TableHead>
                        <TableHead>Tratta</TableHead>
                        <TableHead>Peso</TableHead>
                        <TableHead>Prezzo</TableHead>
                        <TableHead>AI Score</TableHead>
                        <TableHead>Stato</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotes.map((quote) => (
                        <TableRow key={quote.id} data-testid={`row-quote-${quote.id}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{quote.quoteNumber}</p>
                              <p className="text-sm text-slate-500">
                                {new Date(quote.created).toLocaleDateString('it-IT')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{quote.carrierName}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{quote.originZone}</p>
                              <p className="text-slate-500">→ {quote.destinationZone}</p>
                            </div>
                          </TableCell>
                          <TableCell>{quote.weight} kg</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">€{quote.totalPrice.toFixed(2)}</p>
                              <p className="text-xs text-slate-500">
                                Base: €{quote.basePrice.toFixed(2)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-500" />
                              <span>{quote.aiConfidence}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                quote.status === 'accepted' ? 'default' :
                                quote.status === 'pending' ? 'secondary' : 
                                'destructive'
                              }
                            >
                              {quote.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600">Nessuna quotazione disponibile</p>
                    <Button 
                      className="mt-4"
                      onClick={() => calculateRatesMutation.mutate({
                        weight: 10,
                        originZone: "zona-1",
                        destinationZone: "zona-2"
                      })}
                      data-testid="button-create-quote"
                    >
                      Genera Quotazione
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}