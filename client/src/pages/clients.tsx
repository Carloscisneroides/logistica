import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Loader2, Users, Building, UserCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Clients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const addClientMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/clients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Successo",
        description: "Cliente aggiunto con successo",
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

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      type: formData.get("type") as string,
      billingMode: formData.get("billingMode") as string,
      billingFrequency: formData.get("billingFrequency") as string,
      creditLimit: parseFloat(formData.get("creditLimit") as string) || 1000,
    };
    
    addClientMutation.mutate(data);
  };

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case "merchant":
        return <Building className="w-4 h-4" />;
      case "platform":
        return <Users className="w-4 h-4" />;
      case "sub_client":
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case "merchant":
        return "Merchant";
      case "platform":
        return "Piattaforma";
      case "sub_client":
        return "Sotto-cliente";
      default:
        return type;
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clienti</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci merchant, piattaforme e sotto-clienti
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-client">
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Cliente</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="es. E-Commerce Plus"
                  required
                  data-testid="input-client-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="cliente@esempio.it"
                  required
                  data-testid="input-client-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo Cliente</Label>
                <Select name="type" defaultValue="merchant" required>
                  <SelectTrigger data-testid="select-client-type">
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merchant">Merchant</SelectItem>
                    <SelectItem value="platform">Piattaforma Logistica</SelectItem>
                    <SelectItem value="sub_client">Sotto-cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingMode">Modalità Fatturazione</Label>
                <Select name="billingMode" defaultValue="postpaid" required>
                  <SelectTrigger data-testid="select-billing-mode">
                    <SelectValue placeholder="Seleziona modalità" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepaid">Ricarica Anticipata</SelectItem>
                    <SelectItem value="postpaid">Fatturazione Posticipata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingFrequency">Frequenza Fatturazione</Label>
                <Select name="billingFrequency" defaultValue="monthly" required>
                  <SelectTrigger data-testid="select-billing-frequency">
                    <SelectValue placeholder="Seleziona frequenza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Giornaliera</SelectItem>
                    <SelectItem value="weekly">Settimanale</SelectItem>
                    <SelectItem value="biweekly">Ogni 15 giorni</SelectItem>
                    <SelectItem value="monthly">Mensile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Limite di Credito (€)</Label>
                <Input
                  id="creditLimit"
                  name="creditLimit"
                  type="number"
                  placeholder="1000"
                  min="0"
                  step="0.01"
                  data-testid="input-credit-limit"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  data-testid="button-cancel-add"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={addClientMutation.isPending}
                  data-testid="button-submit-add"
                >
                  {addClientMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Aggiungi
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients?.map((client: any) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow" data-testid={`client-card-${client.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getClientTypeIcon(client.type)}
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                </div>
                <Badge 
                  variant={client.isActive ? "default" : "secondary"}
                  className={client.isActive ? "bg-green-100 text-green-800" : ""}
                >
                  {client.isActive ? "Attivo" : "Inattivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium" data-testid={`client-email-${client.id}`}>
                  {client.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="text-sm font-medium" data-testid={`client-type-${client.id}`}>
                  {getClientTypeLabel(client.type)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fatturazione</p>
                <p className="text-sm font-medium" data-testid={`client-billing-${client.id}`}>
                  {getBillingModeLabel(client.billingMode)} - {getBillingFrequencyLabel(client.billingFrequency)}
                </p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Attuale</p>
                  <p className="text-lg font-bold text-foreground" data-testid={`client-balance-${client.id}`}>
                    €{parseFloat(client.currentBalance || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Limite</p>
                  <p className="text-sm font-medium" data-testid={`client-limit-${client.id}`}>
                    €{parseFloat(client.creditLimit || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!clients || clients.length === 0) && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nessun cliente configurato</p>
              <p className="text-sm text-muted-foreground mt-1">
                Aggiungi il tuo primo cliente per iniziare
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
