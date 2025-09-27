import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  Users, 
  TrendingUp, 
  Euro, 
  FileText, 
  Plus,
  Download,
  Loader2,
  Bus,
  Target
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { CommercialCard } from "@/components/commercial/commercial-card";

export default function Commercial() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddCommercialOpen, setIsAddCommercialOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: commissions, isLoading } = useQuery({
    queryKey: ["/api/commissions", selectedMonth, selectedYear],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const addCommercialMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commissions"] });
      setIsAddCommercialOpen(false);
      toast({
        title: "Successo",
        description: "Commerciale aggiunto con successo",
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

  const handleAddCommercial = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: "commercial",
    };
    
    addCommercialMutation.mutate(data);
  };

  // Group commissions by commercial
  const commercialStats = commissions?.reduce((acc: any, commission: any) => {
    const commercialId = commission.commercialId;
    if (!acc[commercialId]) {
      acc[commercialId] = {
        commercialId,
        totalCommission: 0,
        totalRevenue: 0,
        clientCount: new Set(),
        commissions: [],
      };
    }
    
    acc[commercialId].totalCommission += parseFloat(commission.amount || 0);
    acc[commercialId].clientCount.add(commission.clientId);
    acc[commercialId].commissions.push(commission);
    
    return acc;
  }, {}) || {};

  const totalCommissions = Object.values(commercialStats).reduce(
    (sum: number, stats: any) => sum + stats.totalCommission, 
    0
  );

  const months = [
    { value: 1, label: "Gennaio" },
    { value: 2, label: "Febbraio" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Aprile" },
    { value: 5, label: "Maggio" },
    { value: 6, label: "Giugno" },
    { value: 7, label: "Luglio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Settembre" },
    { value: 10, label: "Ottobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Dicembre" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Commerciali</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci il team commerciale e le provvigioni
          </p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isAddCommercialOpen} onOpenChange={setIsAddCommercialOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-commercial">
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Commerciale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiungi Nuovo Commerciale</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCommercial} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="username.commerciale"
                    required
                    data-testid="input-commercial-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="commerciale@esempio.it"
                    required
                    data-testid="input-commercial-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password Temporanea</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password temporanea"
                    required
                    data-testid="input-commercial-password"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddCommercialOpen(false)}
                    data-testid="button-cancel-commercial"
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    disabled={addCommercialMutation.isPending}
                    data-testid="button-submit-commercial"
                  >
                    {addCommercialMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Aggiungi
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Periodo di Riferimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="space-y-2">
              <Label>Mese</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-[150px]" data-testid="select-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Anno</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-[120px]" data-testid="select-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Attivo</p>
                <p className="text-3xl font-bold text-foreground" data-testid="stats-active-team">
                  {Object.keys(commercialStats).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clienti Gestiti</p>
                <p className="text-3xl font-bold text-foreground" data-testid="stats-managed-clients">
                  {clients?.filter((c: any) => c.commercialId).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Provvigioni Totali</p>
                <p className="text-3xl font-bold text-accent" data-testid="stats-total-commissions">
                  €{totalCommissions.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Euro className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Media per Commerciale</p>
                <p className="text-3xl font-bold text-foreground" data-testid="stats-average-commission">
                  €{Object.keys(commercialStats).length > 0 ? 
                    (totalCommissions / Object.keys(commercialStats).length).toLocaleString() : 
                    "0"
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commercial Team Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance Team</CardTitle>
            <Button variant="outline" size="sm" data-testid="button-export-commissions">
              <Download className="w-4 h-4 mr-2" />
              Esporta Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : Object.keys(commercialStats).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(commercialStats).map((stats: any) => (
                <CommercialCard
                  key={stats.commercialId}
                  name={`Commerciale ${stats.commercialId.slice(0, 8)}`}
                  role="Account Manager"
                  clients={stats.clientCount.size}
                  revenue={stats.totalRevenue}
                  commission={stats.totalCommission}
                  initials={stats.commercialId.slice(0, 2).toUpperCase()}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bus className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Nessun dato di commissione per il periodo selezionato</p>
              <p className="text-sm">Seleziona un periodo diverso o aggiungi nuovi commerciali</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dettaglio Provvigioni</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commerciale</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Percentuale</TableHead>
                  <TableHead>Importo</TableHead>
                  <TableHead>Mese/Anno</TableHead>
                  <TableHead>Stato Pagamento</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions?.map((commission: any) => (
                  <TableRow key={commission.id} data-testid={`commission-row-${commission.id}`}>
                    <TableCell>
                      {commission.commercialId?.slice(0, 8) || "N/A"}
                    </TableCell>
                    <TableCell>
                      {clients?.find((c: any) => c.id === commission.clientId)?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {parseFloat(commission.percentage || 0).toFixed(1)}%
                    </TableCell>
                    <TableCell className="font-medium">
                      €{parseFloat(commission.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {commission.month}/{commission.year}
                    </TableCell>
                    <TableCell>
                      {commission.paidAt ? (
                        <Badge className="bg-green-100 text-green-800">
                          Pagata
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          In Attesa
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" data-testid={`button-view-commission-${commission.id}`}>
                          Visualizza
                        </Button>
                        {!commission.paidAt && (
                          <Button variant="ghost" size="sm" data-testid={`button-pay-commission-${commission.id}`}>
                            Segna Pagata
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!commissions || commissions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nessuna provvigione trovata per il periodo selezionato
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
