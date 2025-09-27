/*
 * YCore Global Logistics Page - Proprietary Frontend Module
 * Copyright © 2025 YCore SRL Innovativa - All Rights Reserved
 * 
 * WATERMARK: ycore-global-a1b2c3d4-e5f6-7890-abcd-ef1234567890
 * BUILD: 2025-09-27T23:25:00.000Z
 * 
 * CONFIDENTIAL AND PROPRIETARY - NOT FOR DISTRIBUTION
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Ship, Plane, Package, Globe, FileCheck, 
  Plus, Search, Filter, TrendingUp, Activity,
  Anchor, Container, MapPin, Clock, Zap, AlertTriangle
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: string;
  tenantId: string;
  name: string;
  type: 'vessel' | 'aircraft' | 'vehicle' | 'container';
  identifier: string;
  status: 'active' | 'maintenance' | 'inactive';
  currentLocation: string;
  capacity: number;
  created: string;
}

interface Container {
  id: string;
  tenantId: string;
  containerNumber: string;
  type: string;
  size: string;
  status: 'available' | 'in_transit' | 'loaded' | 'maintenance';
  currentLocation: string;
  temperature?: number;
  created: string;
}

interface TrackingEvent {
  id: string;
  tenantId: string;
  eventType: string;
  location: string;
  timestamp: string;
  description: string;
  status: 'normal' | 'warning' | 'critical';
}

export default function GlobalLogisticsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch data
  const { data: assets, isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["/api/global-logistics/assets"],
  });

  const { data: containers, isLoading: containersLoading } = useQuery<Container[]>({
    queryKey: ["/api/global-logistics/containers"],
  });

  const { data: trackingEvents, isLoading: trackingLoading } = useQuery<TrackingEvent[]>({
    queryKey: ["/api/global-logistics/tracking-events"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/global-logistics/dashboard/stats"],
  });

  const filteredAssets = assets?.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.identifier.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'vessel': return Ship;
      case 'aircraft': return Plane;
      case 'container': return Container;
      default: return Package;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100" data-testid="page-title">
              Logistica Globale
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1" data-testid="page-description">
              Flotte marittime/aeree, container, documentazione doganale AI, tracking intercontinentale
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-new-asset"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Asset
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              data-testid="button-track-shipment"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Traccia Spedizione
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
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Flotte Attive</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid="stat-active-fleets">
                      {stats.activeFleets || 0}
                    </p>
                  </div>
                  <Ship className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Container Attivi</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid="stat-active-containers">
                      {stats.activeContainers || 0}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Spedizioni in Transito</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid="stat-in-transit">
                      {stats.shipmentsInTransit || 0}
                    </p>
                  </div>
                  <Globe className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Documenti Doganali</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" data-testid="stat-customs-docs">
                      {stats.customsDocuments || 0}
                    </p>
                  </div>
                  <FileCheck className="w-8 h-8 text-purple-600" />
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
                  placeholder="Cerca flotte, container, spedizioni..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-logistics"
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
        <Tabs defaultValue="fleets" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fleets" data-testid="tab-fleets">
              <Ship className="w-4 h-4 mr-2" />
              Flotte Marittime/Aeree
            </TabsTrigger>
            <TabsTrigger value="containers" data-testid="tab-containers">
              <Package className="w-4 h-4 mr-2" />
              Gestione Container
            </TabsTrigger>
            <TabsTrigger value="customs" data-testid="tab-customs">
              <FileCheck className="w-4 h-4 mr-2" />
              Documentazione Doganale AI
            </TabsTrigger>
            <TabsTrigger value="tracking" data-testid="tab-tracking">
              <Globe className="w-4 h-4 mr-2" />
              Tracking Intercontinentale
            </TabsTrigger>
          </TabsList>

          {/* Fleets Tab */}
          <TabsContent value="fleets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="w-5 h-5" />
                  Flotte Marittime e Aeree
                </CardTitle>
                <CardDescription>
                  Gestione navi, aerei e veicoli per logistica globale
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assetsLoading ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-slate-600 mt-2">Caricamento flotte...</p>
                  </div>
                ) : filteredAssets.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Identificativo</TableHead>
                        <TableHead>Posizione Attuale</TableHead>
                        <TableHead>Capacità</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssets.map((asset) => {
                        const IconComponent = getAssetIcon(asset.type);
                        return (
                          <TableRow key={asset.id} data-testid={`row-asset-${asset.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <IconComponent className="w-5 h-5 text-slate-600" />
                                <div>
                                  <p className="font-medium">{asset.name}</p>
                                  <p className="text-sm text-slate-500">{asset.identifier}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{asset.type}</Badge>
                            </TableCell>
                            <TableCell>{asset.identifier}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {asset.currentLocation}
                              </div>
                            </TableCell>
                            <TableCell>{asset.capacity} ton</TableCell>
                            <TableCell>
                              <Badge variant={asset.status === 'active' ? "default" : asset.status === 'maintenance' ? "secondary" : "destructive"}>
                                {asset.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline"
                                data-testid={`button-track-${asset.id}`}
                              >
                                Traccia
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Ship className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600">Nessuna flotta configurata</p>
                    <Button className="mt-4" data-testid="button-add-fleet">
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi Prima Flotta
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Containers Tab */}
          <TabsContent value="containers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Gestione Container
                </CardTitle>
                <CardDescription>
                  Monitoraggio container, temperatura, localizzazione IoT
                </CardDescription>
              </CardHeader>
              <CardContent>
                {containersLoading ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-slate-600 mt-2">Caricamento container...</p>
                  </div>
                ) : containers && containers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Container</TableHead>
                        <TableHead>Tipo/Dimensioni</TableHead>
                        <TableHead>Posizione</TableHead>
                        <TableHead>Temperatura</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {containers.map((container) => (
                        <TableRow key={container.id} data-testid={`row-container-${container.id}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{container.containerNumber}</p>
                              <p className="text-sm text-slate-500">{container.type}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{container.size}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              {container.currentLocation}
                            </div>
                          </TableCell>
                          <TableCell>
                            {container.temperature ? (
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${container.temperature < 0 ? 'bg-blue-500' : container.temperature > 25 ? 'bg-red-500' : 'bg-green-500'}`} />
                                {container.temperature}°C
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={container.status === 'available' ? "default" : container.status === 'in_transit' ? "secondary" : "destructive"}>
                              {container.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-monitor-${container.id}`}
                            >
                              Monitora
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600">Nessun container attivo</p>
                    <Button className="mt-4" data-testid="button-add-container">
                      <Plus className="w-4 h-4 mr-2" />
                      Registra Container
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customs Tab */}
          <TabsContent value="customs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Documentazione Doganale AI
                </CardTitle>
                <CardDescription>
                  OCR intelligente, HS code prediction, compliance automatica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileCheck className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600">Sistema AI doganale in configurazione</p>
                  <Button className="mt-4" data-testid="button-setup-customs-ai">
                    <Zap className="w-4 h-4 mr-2" />
                    Configura AI Doganale
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Tracking Intercontinentale
                </CardTitle>
                <CardDescription>
                  Dashboard globale, ETA AI-powered, anomaly detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trackingLoading ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-slate-600 mt-2">Caricamento eventi...</p>
                  </div>
                ) : trackingEvents && trackingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {trackingEvents.slice(0, 10).map((event) => (
                      <div 
                        key={event.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`tracking-event-${event.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            event.status === 'critical' ? 'bg-red-500' : 
                            event.status === 'warning' ? 'bg-amber-500' : 
                            'bg-green-500'
                          }`} />
                          <div>
                            <p className="font-medium">{event.eventType}</p>
                            <p className="text-sm text-slate-500">{event.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(event.timestamp).toLocaleString('it-IT')}
                          </p>
                          <Badge variant={event.status === 'critical' ? 'destructive' : event.status === 'warning' ? 'secondary' : 'default'}>
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600">Nessun evento di tracking</p>
                    <Button className="mt-4" data-testid="button-start-tracking">
                      <MapPin className="w-4 h-4 mr-2" />
                      Avvia Tracking
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