import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  FileText, 
  Download, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Loader2,
  Euro
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Billing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["/api/invoices", selectedClient],
    enabled: !!selectedClient,
  });

  const { data: pendingInvoices } = useQuery({
    queryKey: ["/api/invoices/pending"],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/invoices", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices/pending"] });
      setIsCreateInvoiceOpen(false);
      toast({
        title: "Successo",
        description: "Fattura creata con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Pagata</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Inviata</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Scaduta</Badge>;
      case "draft":
        return <Badge variant="secondary"><FileText className="w-3 h-3 mr-1" />Bozza</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBillingModeLabel = (mode: string) => {
    switch (mode) {
      case "prepaid":
        return "Ricarica Anticipata";
      case "postpaid":
        return "Fatturazione Posticipata";
      default:
        return mode;
    }
  };

  const getBillingFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "Giornaliera";
      case "weekly":
        return "Settimanale";
      case "biweekly":
        return "Ogni 15 giorni";
      case "monthly":
        return "Mensile";
      default:
        return frequency;
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      clientId: formData.get("clientId") as string,
      amount: parseFloat(formData.get("amount") as string),
      dueDate: formData.get("dueDate") as string,
      invoiceNumber: `INV-${Date.now()}`,
    };
    
    createInvoiceMutation.mutate(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fatturazione</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci fatture, pagamenti e modalità di fatturazione
          </p>
        </div>
        <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-invoice">
              <Plus className="w-4 h-4 mr-2" />
              Nuova Fattura
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea Nuova Fattura</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente</Label>
                <Select name="clientId" required>
                  <SelectTrigger data-testid="select-invoice-client">
                    <SelectValue placeholder="Seleziona cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Importo (€)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  data-testid="input-invoice-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Data Scadenza</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                  data-testid="input-invoice-due-date"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateInvoiceOpen(false)}
                  data-testid="button-cancel-invoice"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={createInvoiceMutation.isPending}
                  data-testid="button-submit-invoice"
                >
                  {createInvoiceMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Crea Fattura
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fatture in Sospeso</p>
                <p className="text-3xl font-bold text-foreground" data-testid="stats-pending-invoices">
                  {pendingInvoices?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Mensile</p>
                <p className="text-3xl font-bold text-foreground" data-testid="stats-monthly-total">
                  €{pendingInvoices?.reduce((sum: number, inv: any) => sum + parseFloat(inv.amount || 0), 0).toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Euro className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clienti Prepagati</p>
                <p className="text-3xl font-bold text-foreground" data-testid="stats-prepaid-clients">
                  {clients?.filter((c: any) => c.billingMode === "prepaid").length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clienti Postpagati</p>
                <p className="text-3xl font-bold text-foreground" data-testid="stats-postpaid-clients">
                  {clients?.filter((c: any) => c.billingMode === "postpaid").length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Billing Settings */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Configurazione Clienti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Seleziona Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger data-testid="select-client-billing">
                    <SelectValue placeholder="Seleziona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClient && (
                <div className="space-y-4 pt-4 border-t">
                  {(() => {
                    const client = clients?.find((c: any) => c.id === selectedClient);
                    if (!client) return null;
                    
                    return (
                      <>
                        <div>
                          <Label className="text-sm text-muted-foreground">Modalità Attuale</Label>
                          <p className="font-medium" data-testid="client-current-billing-mode">
                            {getBillingModeLabel(client.billingMode)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Frequenza</Label>
                          <p className="font-medium" data-testid="client-current-billing-frequency">
                            {getBillingFrequencyLabel(client.billingFrequency)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Saldo Attuale</Label>
                          <p className="font-medium text-lg" data-testid="client-current-balance">
                            €{parseFloat(client.currentBalance || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Limite di Credito</Label>
                          <p className="font-medium" data-testid="client-credit-limit">
                            €{parseFloat(client.creditLimit || 0).toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          data-testid="button-modify-billing"
                        >
                          Modifica Configurazione
                        </Button>
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedClient ? "Fatture Cliente" : "Fatture in Sospeso"}
                </CardTitle>
                <Button variant="outline" size="sm" data-testid="button-export-invoices">
                  <Download className="w-4 h-4 mr-2" />
                  Esporta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numero</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Importo</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Scadenza</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedClient ? invoices : pendingInvoices)?.map((invoice: any) => (
                      <TableRow key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          {clients?.find((c: any) => c.id === invoice.clientId)?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          €{parseFloat(invoice.amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell>
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("it-IT") : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" data-testid={`button-view-invoice-${invoice.id}`}>
                              Visualizza
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-download-invoice-${invoice.id}`}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!selectedClient ? !pendingInvoices?.length : !invoices?.length) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nessuna fattura trovata
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
