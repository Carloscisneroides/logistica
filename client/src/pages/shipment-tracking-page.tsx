import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Package, Truck, Clock, CheckCircle, AlertTriangle, Search, Bot, Zap, Globe, Navigation, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ShipmentTrackingPage() {
  const { toast } = useToast();
  const [trackingCode, setTrackingCode] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<string>("");

  // Queries
  const { data: trackingData, isLoading: loadingTracking } = useQuery({
    queryKey: ['/api/tracking', trackingCode],
    enabled: !!trackingCode,
  });

  const { data: activeShipments = [], isLoading: loadingShipments } = useQuery({
    queryKey: ['/api/shipments/active'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/tracking/stats'],
  });

  // AI Tracking mutation
  const aiTrackingMutation = useMutation({
    mutationFn: (code: string) => 
      apiRequest('/api/ai/tracking', { method: 'POST', body: { tracking_code: code } }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracking'] });
      toast({ title: `AI Tracking: ${data.status}`, description: data.estimated_delivery });
    },
  });

  const handleTrackShipment = () => {
    if (!trackingCode) {
      toast({ title: "Inserisci un codice di tracking", variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['/api/tracking', trackingCode] });
  };

  const handleAITracking = () => {
    if (!trackingCode) {
      toast({ title: "Inserisci un codice per AI tracking", variant: "destructive" });
      return;
    }
    aiTrackingMutation.mutate(trackingCode);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_lavorazione': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'spedito': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_transito': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'consegnato': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'in_giacenza': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'disponibile_ritiro': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'in_restituzione': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'in_ritardo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_lavorazione': return <Clock className="h-4 w-4" />;
      case 'spedito': return <Truck className="h-4 w-4" />;
      case 'in_transito': return <Navigation className="h-4 w-4" />;
      case 'consegnato': return <CheckCircle className="h-4 w-4" />;
      case 'in_giacenza': return <Package className="h-4 w-4" />;
      case 'disponibile_ritiro': return <MapPin className="h-4 w-4" />;
      case 'in_restituzione': return <AlertTriangle className="h-4 w-4" />;
      case 'in_ritardo': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="shipment-tracking-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100" data-testid="page-title">
            Shipment Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400" data-testid="page-description">
            Tracciamento intelligente spedizioni con AI integrata
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">AI Powered</span>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-active-shipments">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Spedizioni Attive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold" data-testid="active-count">
                  {stats.activeShipments || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-in-transit">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                In Transito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold" data-testid="transit-count">
                  {stats.inTransit || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-delivered">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Consegnate Oggi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold" data-testid="delivered-count">
                  {stats.deliveredToday || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-delayed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                In Ritardo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold" data-testid="delayed-count">
                  {stats.delayed || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tracking Search */}
      <Card data-testid="card-tracking-search">
        <CardHeader>
          <CardTitle>Traccia Spedizione</CardTitle>
          <CardDescription>
            Inserisci il codice di tracking per seguire la tua spedizione
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Inserisci codice tracking..."
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="pl-10"
                data-testid="input-tracking-code"
              />
            </div>
            <Button 
              onClick={handleTrackShipment}
              disabled={loadingTracking}
              data-testid="button-track"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Traccia
            </Button>
            <Button 
              variant="outline"
              onClick={handleAITracking}
              disabled={aiTrackingMutation.isPending}
              data-testid="button-ai-track"
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Track
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Result */}
      {trackingData && (
        <Card data-testid="card-tracking-result">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tracking: {trackingCode}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(trackingData.status)}
                  <Badge className={getStatusColor(trackingData.status)}>
                    {trackingData.status_display}
                  </Badge>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Aggiornato: {new Date(trackingData.last_update).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Corriere</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{trackingData.carrier}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Destinazione</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{trackingData.destination}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Consegna Stimata</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {trackingData.estimated_delivery ? new Date(trackingData.estimated_delivery).toLocaleDateString() : 'Da definire'}
                  </p>
                </div>
              </div>

              {trackingData.ai_insights && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-600">AI Insights</span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-300">{trackingData.ai_insights}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList data-testid="tabs-tracking">
          <TabsTrigger value="live" data-testid="tab-live">
            <Activity className="h-4 w-4 mr-2" />
            Tracking Live
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <Clock className="h-4 w-4 mr-2" />
            Cronologia
          </TabsTrigger>
          <TabsTrigger value="map" data-testid="tab-map">
            <Globe className="h-4 w-4 mr-2" />
            Mappa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spedizioni in Tempo Reale</CardTitle>
              <CardDescription>
                Monitoraggio live delle spedizioni attive con aggiornamenti AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingShipments ? (
                <div className="text-center py-8" data-testid="loading-shipments">
                  Caricamento spedizioni...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Corriere</TableHead>
                      <TableHead>Destinazione</TableHead>
                      <TableHead>Consegna Stimata</TableHead>
                      <TableHead>AI Status</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeShipments.map((shipment: any) => (
                      <TableRow key={shipment.id} data-testid={`row-shipment-${shipment.id}`}>
                        <TableCell className="font-medium">{shipment.tracking_code}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(shipment.status)}>
                            {getStatusIcon(shipment.status)}
                            <span className="ml-1">{shipment.status_display}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{shipment.carrier}</TableCell>
                        <TableCell>{shipment.destination_city}</TableCell>
                        <TableCell>
                          {shipment.estimated_delivery ? 
                            new Date(shipment.estimated_delivery).toLocaleDateString() : 
                            'Da definire'
                          }
                        </TableCell>
                        <TableCell>
                          {shipment.ai_confidence && (
                            <Badge variant="outline">
                              <Zap className="h-3 w-3 mr-1" />
                              {shipment.ai_confidence}%
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setTrackingCode(shipment.tracking_code)}
                            >
                              <MapPin className="h-3 w-3" />
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

        <TabsContent value="history" className="space-y-4">
          <Card data-testid="card-history">
            <CardHeader>
              <CardTitle>Cronologia Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Cronologia eventi tracking in arrivo...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card data-testid="card-map">
            <CardHeader>
              <CardTitle>Mappa Spedizioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Mappa interattiva spedizioni in arrivo...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}