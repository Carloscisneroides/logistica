import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Package, Truck, Clock, CheckCircle, AlertTriangle, Search, Bot, Filter, Eye, MoreHorizontal, Download, DollarSign, Trash2, Receipt, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ShipmentsListPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedShipment, setSelectedShipment] = useState<string>("");

  // Queries
  const { data: shipments = [], isLoading: loadingShipments } = useQuery({
    queryKey: ['/api/shipments', { status: statusFilter, search: searchTerm }],
  });

  const { data: shipmentsStats } = useQuery({
    queryKey: ['/api/shipments/stats'],
  });

  // AI Analysis mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: (shipmentId: string) => 
      apiRequest('/api/ai/shipment-analysis', { method: 'POST', body: { shipment_id: shipmentId } }),
    onSuccess: (data) => {
      toast({ title: `AI Analysis: ${data.status}`, description: data.recommendations });
    },
  });

  // Delete shipment with automatic refund
  const deleteShipmentMutation = useMutation({
    mutationFn: (shipmentId: string) => 
      apiRequest(`/api/shipments/${shipmentId}`, { method: 'DELETE' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/shipments'] });
      toast({ 
        title: "Spedizione eliminata", 
        description: `Rimborso di €${data.refund_amount} accreditato sul wallet` 
      });
    },
  });

  // Download label
  const downloadLabel = async (shipmentId: string, trackingCode: string) => {
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/label`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `label_${trackingCode}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Etichetta scaricata con successo" });
    } catch (error) {
      toast({ title: "Errore nel download etichetta", variant: "destructive" });
    }
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
      case 'in_transito': return <MapPin className="h-4 w-4" />;
      case 'consegnato': return <CheckCircle className="h-4 w-4" />;
      case 'in_giacenza': return <Package className="h-4 w-4" />;
      case 'disponibile_ritiro': return <MapPin className="h-4 w-4" />;
      case 'in_restituzione': return <AlertTriangle className="h-4 w-4" />;
      case 'in_ritardo': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_lavorazione': return 'In Lavorazione';
      case 'spedito': return 'Spedito';
      case 'in_transito': return 'In Transito';
      case 'consegnato': return 'Consegnato';
      case 'in_giacenza': return 'In Giacenza';
      case 'disponibile_ritiro': return 'Disponibile per Ritiro';
      case 'in_restituzione': return 'In Restituzione al Mittente';
      case 'in_ritardo': return 'In Ritardo';
      default: return status;
    }
  };

  const isDelayed = (shipment: any) => {
    if (!shipment.estimated_delivery) return false;
    const now = new Date();
    const estimatedDelivery = new Date(shipment.estimated_delivery);
    return now > estimatedDelivery && shipment.status !== 'consegnato';
  };

  const filteredShipments = shipments.filter((shipment: any) => {
    const matchesSearch = 
      shipment.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination_city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="shipments-list-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100" data-testid="page-title">
            Elenco Spedizioni
          </h1>
          <p className="text-gray-600 dark:text-gray-400" data-testid="page-description">
            Gestione completa delle spedizioni con AI tracking e controllo stati
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">AI Guided</span>
        </div>
      </div>

      {/* Stats Cards */}
      {shipmentsStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card data-testid="card-total">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold" data-testid="total-shipments">
                  {shipmentsStats.total || 0}
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
                <Truck className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold" data-testid="in-transit-count">
                  {shipmentsStats.inTransit || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-delivered">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Consegnate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold" data-testid="delivered-count">
                  {shipmentsStats.delivered || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-warehouse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                In Giacenza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold" data-testid="warehouse-count">
                  {shipmentsStats.warehouse || 0}
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
                  {shipmentsStats.delayed || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card data-testid="card-filters">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca per codice tracking, destinatario, città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filtra per stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                <SelectItem value="spedito">Spedito</SelectItem>
                <SelectItem value="in_transito">In Transito</SelectItem>
                <SelectItem value="consegnato">Consegnato</SelectItem>
                <SelectItem value="in_giacenza">In Giacenza</SelectItem>
                <SelectItem value="disponibile_ritiro">Disponibile per Ritiro</SelectItem>
                <SelectItem value="in_restituzione">In Restituzione</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Esporta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card data-testid="card-shipments-table">
        <CardHeader>
          <CardTitle>Lista Spedizioni</CardTitle>
          <CardDescription>
            Monitoraggio in tempo reale con AI predittiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingShipments ? (
            <div className="text-center py-8" data-testid="loading-shipments">
              Caricamento spedizioni...
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="text-center py-8" data-testid="no-shipments">
              Nessuna spedizione trovata
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Destinazione</TableHead>
                  <TableHead>Corriere</TableHead>
                  <TableHead>Consegna Stimata</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>AI Confidence</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment: any) => (
                  <TableRow 
                    key={shipment.id} 
                    className={isDelayed(shipment) ? "bg-red-50 dark:bg-red-900/10" : ""}
                    data-testid={`row-shipment-${shipment.id}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(shipment.status)}
                        <span>{shipment.tracking_code}</span>
                        {isDelayed(shipment) && (
                          <Badge variant="destructive" className="text-xs">
                            Ritardo
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(shipment.status)}>
                        {getStatusText(shipment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{shipment.recipient_name || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{shipment.destination_city}</div>
                        <div className="text-sm text-gray-500">{shipment.destination_country}</div>
                      </div>
                    </TableCell>
                    <TableCell>{shipment.carrier || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {shipment.estimated_delivery ? 
                          new Date(shipment.estimated_delivery).toLocaleDateString() : 
                          'Da definire'
                        }
                        {isDelayed(shipment) && (
                          <div className="text-red-600 text-xs">
                            Scaduto
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="font-medium">€{shipment.cost || '0.00'}</span>
                      </div>
                      {shipment.can_refund && (
                        <Badge variant="outline" className="text-xs mt-1">
                          <Wallet className="h-2 w-2 mr-1" />
                          Rimborsabile
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {shipment.ai_confidence && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          {shipment.ai_confidence}%
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedShipment(shipment.id)}
                          data-testid={`button-view-${shipment.id}`}
                          title="Visualizza dettagli"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadLabel(shipment.id, shipment.tracking_code)}
                          data-testid={`button-download-label-${shipment.id}`}
                          title="Scarica etichetta"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => aiAnalysisMutation.mutate(shipment.id)}
                          disabled={aiAnalysisMutation.isPending}
                          data-testid={`button-ai-analysis-${shipment.id}`}
                          title="Analisi AI"
                        >
                          <Bot className="h-3 w-3" />
                        </Button>
                        {shipment.can_delete && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteShipmentMutation.mutate(shipment.id)}
                            disabled={deleteShipmentMutation.isPending}
                            data-testid={`button-delete-${shipment.id}`}
                            title="Elimina e ricevi rimborso"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats by Status */}
      <Card data-testid="card-status-breakdown">
        <CardHeader>
          <CardTitle>Dettaglio Stati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { status: 'in_lavorazione', label: 'In Lavorazione', color: 'blue' },
              { status: 'spedito', label: 'Spedito', color: 'green' },
              { status: 'in_transito', label: 'In Transito', color: 'yellow' },
              { status: 'consegnato', label: 'Consegnato', color: 'emerald' },
              { status: 'in_giacenza', label: 'In Giacenza', color: 'orange' },
              { status: 'disponibile_ritiro', label: 'Disponibile Ritiro', color: 'purple' },
              { status: 'in_restituzione', label: 'In Restituzione', color: 'red' },
            ].map(({ status, label, color }) => {
              const count = filteredShipments.filter((s: any) => s.status === status).length;
              return (
                <div key={status} className="text-center">
                  <div className={`text-2xl font-bold text-${color}-600`}>
                    {count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}