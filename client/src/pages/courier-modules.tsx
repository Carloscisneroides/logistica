import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CourierModuleCard } from "@/components/courier/courier-module-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Loader2, Package, Calculator } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function CourierModules() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activationDialog, setActivationDialog] = useState<{ isOpen: boolean; moduleId: string | null }>({
    isOpen: false,
    moduleId: null
  });
  const [contractCode, setContractCode] = useState("");

  const { data: modules, isLoading } = useQuery({
    queryKey: ["/api/courier-modules"],
  });

  const addModuleMutation = useMutation({
    mutationFn: async (data: { name: string; code: string; description?: string }) => {
      const res = await apiRequest("POST", "/api/courier-modules", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courier-modules"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Successo",
        description: "Modulo corriere aggiunto con successo",
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

  const activateModuleMutation = useMutation({
    mutationFn: async ({ moduleId, contractCode }: { moduleId: string; contractCode: string }) => {
      const res = await apiRequest("POST", `/api/courier-modules/${moduleId}/activate`, { contractCode });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courier-modules"] });
      setActivationDialog({ isOpen: false, moduleId: null });
      setContractCode("");
      toast({
        title: "Successo",
        description: "Modulo corriere attivato con successo",
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

  const handleActivate = (moduleId: string) => {
    setActivationDialog({ isOpen: true, moduleId });
  };

  const handleActivationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activationDialog.moduleId && contractCode.trim()) {
      activateModuleMutation.mutate({
        moduleId: activationDialog.moduleId,
        contractCode: contractCode.trim()
      });
    }
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      description: formData.get("description") as string,
    };
    
    addModuleMutation.mutate(data);
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
          <h1 className="text-3xl font-bold text-foreground">Moduli Corrieri</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci i moduli dei corrieri e i codici contratto
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-module">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Modulo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Modulo Corriere</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddModule} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Corriere</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="es. GLS Express"
                  required
                  data-testid="input-module-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Codice Modulo</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="es. GLS_IT_2024"
                  required
                  data-testid="input-module-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione (opzionale)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Descrizione del modulo"
                  data-testid="input-module-description"
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
                  disabled={addModuleMutation.isPending}
                  data-testid="button-submit-add"
                >
                  {addModuleMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Aggiungi
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(modules || []).map((module: any) => (
          <CourierModuleCard
            key={module.id}
            module={module}
            onActivate={handleActivate}
          />
        ))}
        {(!modules || modules.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nessun modulo corriere configurato</p>
              <p className="text-sm text-muted-foreground mt-1">
                Aggiungi il tuo primo modulo per iniziare
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activation Dialog */}
      <Dialog 
        open={activationDialog.isOpen} 
        onOpenChange={(open) => setActivationDialog({ isOpen: open, moduleId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attiva Modulo Corriere</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleActivationSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contractCode">Codice Contratto</Label>
              <Input
                id="contractCode"
                value={contractCode}
                onChange={(e) => setContractCode(e.target.value)}
                placeholder="Inserisci il codice contratto"
                required
                data-testid="input-contract-code"
              />
              <p className="text-sm text-muted-foreground">
                Inserisci il codice contratto fornito dal corriere per attivare il modulo
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActivationDialog({ isOpen: false, moduleId: null })}
                data-testid="button-cancel-activation"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={activateModuleMutation.isPending || !contractCode.trim()}
                data-testid="button-submit-activation"
              >
                {activateModuleMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Attiva Modulo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
