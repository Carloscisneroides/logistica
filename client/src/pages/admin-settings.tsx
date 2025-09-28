import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Users, CreditCard, Brain, Package, BarChart3, Settings, Shield, Bell, Flag, Gift, Eye, Download, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminSettings() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");

  // Main data queries
  const { data: users = [] } = useQuery({ queryKey: ['/api/admin/users'], enabled: true });
  const { data: systemStats = {} } = useQuery({ queryKey: ['/api/admin/system-stats'], enabled: true });
  const { data: moduleStates = [] } = useQuery({ queryKey: ['/api/admin/modules'], enabled: true });
  const { data: aiConfig = {} } = useQuery({ queryKey: ['/api/admin/ai-config'], enabled: true });
  const { data: auditLogs = [] } = useQuery({ queryKey: ['/api/admin/audit-logs'], enabled: true });

  // Mutations for various admin actions
  const userActionMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/admin/users/${data.userId}/action`, 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Azione completata", description: "Modifiche applicate con successo" });
    }
  });

  const moduleToggleMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/admin/modules/${data.moduleId}/toggle`, 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/modules'] });
      toast({ title: "Modulo aggiornato", description: "Configurazione salvata" });
    }
  });

  const aiConfigMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/ai-config', 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-config'] });
      toast({ title: "AI configurata", description: "Impostazioni aggiornate" });
    }
  });

  const reportExportMutation = useMutation({
    mutationFn: (reportType: string) => apiRequest(`/api/admin/reports/${reportType}/export`, 'POST'),
    onSuccess: () => {
      toast({ title: "Report generato", description: "Il download inizierà automaticamente" });
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">IMPOSTAZIONI ADMIN SYSTEM YCORE</h1>
          <p className="text-muted-foreground">Gestione centralizzata di tutti i moduli e configurazioni sistema</p>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Utenti Attivi</p>
                <p className="text-2xl font-bold" data-testid="stat-active-users">{systemStats?.activeUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Moduli Attivi</p>
                <p className="text-2xl font-bold" data-testid="stat-active-modules">{systemStats?.activeModules || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">AI Routing</p>
                <Badge variant={aiConfig?.isActive ? "default" : "secondary"} data-testid="badge-ai-status">
                  {aiConfig?.isActive ? "Attivo" : "Disattivo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Alert Attivi</p>
                <p className="text-2xl font-bold" data-testid="stat-active-alerts">{systemStats?.activeAlerts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utenti e Ruoli
          </TabsTrigger>
          <TabsTrigger value="fidelity" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Fidelity Card
          </TabsTrigger>
          <TabsTrigger value="commercials" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Commerciali
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI & Algoritmi
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Moduli Attivi
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Report & Audit
          </TabsTrigger>
        </TabsList>

        {/* 🔐 Gestione Utenti e Ruoli */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestione Utenti e Ruoli
              </CardTitle>
              <CardDescription>Visualizzazione completa di clienti, sottoclienti, commerciali e team interni</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <Select>
                    <SelectTrigger className="w-200" data-testid="select-user-filter">
                      <SelectValue placeholder="Filtra per ruolo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i Ruoli</SelectItem>
                      <SelectItem value="client">Clienti</SelectItem>
                      <SelectItem value="commerciale">Commerciali</SelectItem>
                      <SelectItem value="admin">Team Interni</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-200" data-testid="select-status-filter">
                      <SelectValue placeholder="Filtra per stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Attivi</SelectItem>
                      <SelectItem value="suspended">Sospesi</SelectItem>
                      <SelectItem value="blocked">Bloccati</SelectItem>
                      <SelectItem value="pending">In Attesa</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input placeholder="Cerca utente..." className="flex-1" data-testid="input-user-search" />
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utente</TableHead>
                      <TableHead>Ruolo</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Ultimo Accesso</TableHead>
                      <TableHead>Area/Categoria</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: any, index: number) => (
                      <TableRow key={user.id} data-testid={`user-row-${index}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                          {user.subRole && <Badge variant="secondary" className="ml-1">{user.subRole}</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "destructive"}>
                            {user.isActive ? "Attivo" : "Disattivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Mai"}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{user.geographicArea || user.category || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" data-testid={`button-user-actions-${index}`}>
                                  Azioni
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Azioni Utente: {user.username}</DialogTitle>
                                  <DialogDescription>Gestione account e permessi</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      data-testid="button-deactivate-user"
                                      onClick={() => userActionMutation.mutate({ userId: user.id, action: 'deactivate' })}
                                    >
                                      Disattiva Account
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      data-testid="button-block-user"
                                      onClick={() => userActionMutation.mutate({ userId: user.id, action: 'block' })}
                                    >
                                      Blocca Accesso
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      data-testid="button-reset-credentials"
                                      onClick={() => userActionMutation.mutate({ userId: user.id, action: 'reset_credentials' })}
                                    >
                                      Reset Credenziali
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      data-testid="button-view-logs"
                                      onClick={() => userActionMutation.mutate({ userId: user.id, action: 'view_logs' })}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Storico
                                    </Button>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Modifica Ruolo</Label>
                                    <Select>
                                      <SelectTrigger data-testid="select-change-role">
                                        <SelectValue placeholder="Seleziona nuovo ruolo" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="merchant">Merchant</SelectItem>
                                        <SelectItem value="client">Client</SelectItem>
                                        <SelectItem value="commerciale">Commerciale</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Area Geografica</Label>
                                    <Input 
                                      placeholder="Assegna area geografica..." 
                                      defaultValue={user.geographicArea || ""}
                                      data-testid="input-geographic-area"
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🧾 Configurazioni Fidelity Card */}
        <TabsContent value="fidelity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configurazioni Fidelity Card
              </CardTitle>
              <CardDescription>Gestione card, limiti, saldi e collegamenti con Wallet e AI Routing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configurazioni Globali</h3>
                  
                  <div className="space-y-4 border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Label>Attiva Fidelity Card Sistema</Label>
                      <Switch defaultChecked data-testid="switch-fidelity-global" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Limite Ricarica Giornaliera (€)</Label>
                      <Input type="number" defaultValue="1000" data-testid="input-daily-limit" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Percentuale Commissione YCORE (%)</Label>
                      <Input type="number" step="0.01" defaultValue="1.00" data-testid="input-commission-rate" />
                    </div>

                    <div className="space-y-2">
                      <Label>AI Routing per Fidelity</Label>
                      <Select>
                        <SelectTrigger data-testid="select-ai-routing-mode">
                          <SelectValue placeholder="Modalità AI" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automatico</SelectItem>
                          <SelectItem value="manual">Manuale</SelectItem>
                          <SelectItem value="hybrid">Ibrido</SelectItem>
                          <SelectItem value="disabled">Disabilitato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Gestione Utenti Singoli</h3>
                  
                  <div className="space-y-2">
                    <Label>Seleziona Utente</Label>
                    <Select onValueChange={setSelectedUserId}>
                      <SelectTrigger data-testid="select-fidelity-user">
                        <SelectValue placeholder="Cerca utente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.username} - {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedUserId && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Attiva Card per Utente</Label>
                        <Switch data-testid="switch-user-fidelity" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Limite Spesa (€)</Label>
                          <Input type="number" defaultValue="500" data-testid="input-user-spending-limit" />
                        </div>
                        <div>
                          <Label>Limite Ricarica (€)</Label>
                          <Input type="number" defaultValue="200" data-testid="input-user-recharge-limit" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Saldo Attuale</Label>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-green-600" data-testid="text-user-balance">€125.50</span>
                          <Button size="sm" variant="outline" data-testid="button-view-movements">
                            Visualizza Movimenti
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" data-testid="button-add-credit">
                          Accredita
                        </Button>
                        <Button size="sm" variant="outline" data-testid="button-process-refund">
                          Rimborso
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 💼 Gestione Commerciali */}
        <TabsContent value="commercials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestione Commerciali
              </CardTitle>
              <CardDescription>Performance, percentuali, livelli e gestione richieste bonifico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">15</p>
                        <p className="text-sm text-muted-foreground">Agenti Attivi</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">3</p>
                        <p className="text-sm text-muted-foreground">Responsabili</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">5</p>
                        <p className="text-sm text-muted-foreground">Richieste Bonifico</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commerciale</TableHead>
                      <TableHead>Livello</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Fidelity Card</TableHead>
                      <TableHead>Richieste Bonifico</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.filter((user: any) => user.role === 'commerciale').map((commercial: any, index: number) => (
                      <TableRow key={commercial.id} data-testid={`commercial-row-${index}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{commercial.username}</p>
                            <p className="text-sm text-muted-foreground">{commercial.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline">{commercial.livello || "Base"}</Badge>
                            <p className="text-xs text-muted-foreground">{commercial.percentuale || "5.00"}%</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={75} className="w-20" />
                            <p className="text-xs text-muted-foreground">75% obiettivo</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch defaultChecked data-testid={`switch-commercial-fidelity-${index}`} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" data-testid={`badge-bonifico-requests-${index}`}>
                            2 Pending
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" data-testid={`button-commercial-settings-${index}`}>
                                  Gestisci
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Gestione Commerciale: {commercial.username}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Livello</Label>
                                    <Select defaultValue={commercial.livello || "base"}>
                                      <SelectTrigger data-testid="select-commercial-level">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="base">Base</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Percentuale Commissione (%)</Label>
                                    <Input 
                                      type="number" 
                                      step="0.01" 
                                      defaultValue={commercial.percentuale || "5.00"}
                                      data-testid="input-commercial-percentage"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Area Assegnata</Label>
                                    <Input 
                                      placeholder="Area geografica o clienti..." 
                                      defaultValue={commercial.assignedArea || ""}
                                      data-testid="input-commercial-area"
                                    />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <Label>Fidelity Card Attiva</Label>
                                    <Switch defaultChecked data-testid="switch-commercial-fidelity-detail" />
                                  </div>

                                  <Button className="w-full" data-testid="button-save-commercial-settings">
                                    Salva Modifiche
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🧠 AI e Algoritmi */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI e Algoritmi
              </CardTitle>
              <CardDescription>Gestione moduli AI, routing automatico, anomalie e ottimizzazioni</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configurazioni AI Routing</h3>
                  
                  <div className="space-y-4 border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Label>AI Routing Attivo</Label>
                      <Switch defaultChecked data-testid="switch-ai-routing" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Modalità Operativa</Label>
                      <Select defaultValue="automatic">
                        <SelectTrigger data-testid="select-ai-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automatico Completo</SelectItem>
                          <SelectItem value="assisted">Assistito</SelectItem>
                          <SelectItem value="manual">Manuale con Suggerimenti</SelectItem>
                          <SelectItem value="learning">Modalità Apprendimento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Priorità AI Routing</Label>
                      <Select defaultValue="high">
                        <SelectTrigger data-testid="select-ai-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critica</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="low">Bassa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" data-testid="button-force-ai-recalc">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Forza Ricalcolo
                      </Button>
                      <Button size="sm" variant="outline" data-testid="button-ai-logs">
                        Visualizza Log
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-lg p-4">
                    <h4 className="font-medium">Moduli AI Specifici</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Anti-Fraud Detection</Label>
                        <Switch defaultChecked data-testid="switch-ai-fraud" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Wallet Optimization</Label>
                        <Switch defaultChecked data-testid="switch-ai-wallet" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Commercial Matching</Label>
                        <Switch defaultChecked data-testid="switch-ai-commercial" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Logistics Optimization</Label>
                        <Switch data-testid="switch-ai-logistics" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Fidelity Predictions</Label>
                        <Switch defaultChecked data-testid="switch-ai-fidelity" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Monitoraggio e Anomalie</h3>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Suggerimenti Attivi</span>
                        </div>
                        <p className="text-2xl font-bold">127</p>
                        <p className="text-xs text-muted-foreground">Ultimo aggiornamento: 2 min fa</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Anomalie Rilevate</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">3</p>
                        <p className="text-xs text-muted-foreground">Ultime 24 ore</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">Alert Critici</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">1</p>
                        <p className="text-xs text-muted-foreground">Richiede attenzione immediata</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-medium">Ultime Anomalie</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Bonifico Sospetto</p>
                          <p className="text-xs text-muted-foreground">€5,000 - Pattern anomalo rilevato</p>
                        </div>
                        <Button size="sm" variant="outline" data-testid="button-investigate-anomaly">
                          Investiga
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Velocità Transazioni</p>
                          <p className="text-xs text-muted-foreground">Commerciale ID: AGE001</p>
                        </div>
                        <Button size="sm" variant="outline" data-testid="button-review-velocity">
                          Rivedi
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 📦 Moduli Attivi */}
        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Moduli Attivi
              </CardTitle>
              <CardDescription>Gestione stato, versioni e collegamenti tra moduli dell'ecosistema YCORE</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'wallet', name: 'Wallet YCORE', status: 'active', version: '2.1.0', description: 'Sistema pagamenti e credito virtuale' },
                  { id: 'marketplace', name: 'Marketplace', status: 'active', version: '1.8.3', description: 'Piattaforma e-commerce integrata' },
                  { id: 'logistics', name: 'Logistica', status: 'active', version: '1.5.2', description: 'Gestione spedizioni e corrieri' },
                  { id: 'fidelity', name: 'Fidelity Card', status: 'active', version: '1.3.1', description: 'Sistema fedeltà e rimborsi' },
                  { id: 'ai_routing', name: 'AI Routing', status: 'active', version: '2.0.0', description: 'Algoritmi intelligenti e ottimizzazione' },
                  { id: 'commercial', name: 'Gestione Commerciali', status: 'active', version: '1.4.0', description: 'Network agenti e responsabili' },
                  { id: 'global_logistics', name: 'Global Logistics', status: 'development', version: '0.9.0', description: 'Logistica internazionale' },
                  { id: 'customs', name: 'Customs Management', status: 'planning', version: '0.1.0', description: 'Gestione documentazione doganale' },
                  { id: 'fleet', name: 'Fleet Management', status: 'planning', version: '0.1.0', description: 'Gestione flotte navali e aeree' }
                ].map((module, index) => (
                  <Card key={module.id} className={`border-l-4 ${
                    module.status === 'active' ? 'border-l-green-500' : 
                    module.status === 'development' ? 'border-l-yellow-500' : 'border-l-gray-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{module.name}</h4>
                          <Badge 
                            variant={module.status === 'active' ? 'default' : module.status === 'development' ? 'secondary' : 'outline'}
                            data-testid={`badge-module-status-${index}`}
                          >
                            {module.status === 'active' ? 'Attivo' : 
                             module.status === 'development' ? 'Sviluppo' : 'Pianificato'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>v{module.version}</span>
                          <Switch 
                            defaultChecked={module.status === 'active'} 
                            disabled={module.status === 'planning'}
                            data-testid={`switch-module-${index}`}
                            onCheckedChange={(checked) => 
                              moduleToggleMutation.mutate({ moduleId: module.id, enabled: checked })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Accesso per Ruoli</Label>
                          <div className="flex flex-wrap gap-1">
                            {['admin', 'staff', 'commerciale', 'client'].map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" data-testid={`button-module-config-${index}`}>
                            Config
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" data-testid={`button-module-logs-${index}`}>
                            Logs
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 📊 Report e Audit */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Report e Audit
              </CardTitle>
              <CardDescription>Generazione report, esportazione dati e visualizzazione log operazioni sensibili</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Generazione Report</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { type: 'transactions', label: 'Transazioni', icon: CreditCard, description: 'Report completo di tutte le transazioni' },
                      { type: 'users', label: 'Attività Utenti', icon: Users, description: 'Log accessi e operazioni utenti' },
                      { type: 'earnings', label: 'Guadagni YCORE', icon: BarChart3, description: 'Commissioni e ricavi piattaforma' },
                      { type: 'fidelity', label: 'Fidelity Card', icon: Gift, description: 'Utilizzo e statistiche fidelity' }
                    ].map((report, index) => (
                      <Card key={report.type} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <report.icon className="h-8 w-8 text-primary" />
                            <div className="flex-1">
                              <h4 className="font-medium">{report.label}</h4>
                              <p className="text-sm text-muted-foreground">{report.description}</p>
                            </div>
                            <Button 
                              size="sm" 
                              data-testid={`button-generate-report-${report.type}`}
                              onClick={() => reportExportMutation.mutate(report.type)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Esporta
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-medium">Filtri Report</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data Inizio</Label>
                        <Input type="date" data-testid="input-report-start-date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Data Fine</Label>
                        <Input type="date" data-testid="input-report-end-date" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Formato Export</Label>
                      <Select defaultValue="excel">
                        <SelectTrigger data-testid="select-export-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Log Operazioni Sensibili</h3>
                  
                  <div className="border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                    {auditLogs?.map((log: any, index: number) => (
                      <div key={log.id} className="flex items-start gap-3 p-2 border rounded" data-testid={`audit-log-${index}`}>
                        <div className="flex-shrink-0">
                          {log.severity === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          {log.severity === 'warning' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                          {log.severity === 'info' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {log.userEmail} | {new Date(log.createdAt).toLocaleString()}
                            </span>
                            {log.ipAddress && (
                              <Badge variant="outline" className="text-xs">
                                {log.ipAddress}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Flag className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">Alert Sistema</p>
                        <p className="text-2xl font-bold text-red-600">7</p>
                        <p className="text-xs text-muted-foreground">Ultime 24 ore</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <Bell className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">Notifiche</p>
                        <p className="text-2xl font-bold text-blue-600">23</p>
                        <p className="text-xs text-muted-foreground">Da leggere</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sezione IDEE AGGIUNTIVE */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Funzionalità Avanzate</CardTitle>
              <CardDescription>Strumenti aggiuntivi per gestione completa sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium">Notifiche Personalizzate</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Gestisci notifiche per ruoli, eventi e scadenze</p>
                    <Button size="sm" variant="outline" className="w-full" data-testid="button-notification-settings">
                      Configura
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium">Scadenze e Rinnovi</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Controllo centralizzato abbonamenti e accessi</p>
                    <Button size="sm" variant="outline" className="w-full" data-testid="button-renewal-management">
                      Gestisci
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-purple-500" />
                      <h4 className="font-medium">API e Integrazioni</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Controllo endpoint e connessioni esterne</p>
                    <Button size="sm" variant="outline" className="w-full" data-testid="button-api-management">
                      Monitora
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-red-500" />
                      <h4 className="font-medium">Privacy e Consensi</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Visualizza e modifica consensi utenti</p>
                    <Button size="sm" variant="outline" className="w-full" data-testid="button-privacy-management">
                      Configura
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-indigo-500" />
                      <h4 className="font-medium">Simulatore AI</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Testa scenari routing, upgrade e rimborsi</p>
                    <Button size="sm" variant="outline" className="w-full" data-testid="button-ai-simulator">
                      Simula
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-orange-500" />
                      <h4 className="font-medium">Crediti Promozionali</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Assegna bonus, sconti e campagne fidelity</p>
                    <Button size="sm" variant="outline" className="w-full" data-testid="button-promotional-credits">
                      Gestisci
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}