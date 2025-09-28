import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import RoleProtected from "@/components/role-protected";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, DollarSign, Receipt, Zap, Shield, TrendingUp, Settings, Headphones, UserCheck, Bell, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function WalletPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [topUpAmount, setTopUpAmount] = useState("");
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);

  // Queries
  const { data: walletData, isLoading: loadingWallet } = useQuery({
    queryKey: ['/api/wallet'],
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['/api/wallet/transactions'],
  });

  // Mutations
  const topUpMutation = useMutation({
    mutationFn: (amount: number) => 
      apiRequest('/api/wallet/topup', { method: 'POST', body: { amount } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      setShowTopUpDialog(false);
      setTopUpAmount("");
      toast({ title: "Ricarica completata con successo" });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => 
      apiRequest('/api/wallet/withdraw', { method: 'POST', body: { amount } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      toast({ title: "Prelievo richiesto con successo" });
    },
  });

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (amount > 0) {
      topUpMutation.mutate(amount);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup': return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'refund': return <ArrowDownLeft className="h-4 w-4 text-blue-600" />;
      case 'payment': return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4 text-orange-600" />;
      default: return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'topup': return 'text-green-600';
      case 'refund': return 'text-blue-600';
      case 'payment': return 'text-red-600';
      case 'withdrawal': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="wallet-page">
      {/* Role-based Content */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100" data-testid="page-title">
            Wallet YCore - {user?.role === 'admin' ? 'Pannello Admin' : user?.role === 'merchant' ? 'Area Merchant' : user?.role === 'staff' ? 'Console Staff' : 'Sistema Creator'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400" data-testid="page-description">
            {user?.role === 'admin' ? 'Gestione completa wallet e amministrazione' : 
             user?.role === 'merchant' ? 'Gestione saldo, rimborsi e pagamenti' :
             user?.role === 'staff' ? 'Operazioni supporto e monitoraggio' :
             'Configurazione sistema e sicurezza'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">Protetto da Stripe</span>
        </div>
      </div>

      {/* Wallet Balance Card */}
      {walletData && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white" data-testid="card-balance">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-white">
                  Saldo Disponibile
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Aggiornato in tempo reale
                </CardDescription>
              </div>
              <Wallet className="h-12 w-12 text-white/80" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-4xl font-bold" data-testid="wallet-balance">
                €{walletData.balance?.toFixed(2) || '0.00'}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-blue-100">Rimborsi Ricevuti</div>
                  <div className="font-semibold">€{walletData.total_refunds?.toFixed(2) || '0.00'}</div>
                </div>
                <div>
                  <div className="text-blue-100">Speso Questo Mese</div>
                  <div className="font-semibold">€{walletData.monthly_spent?.toFixed(2) || '0.00'}</div>
                </div>
                <div>
                  <div className="text-blue-100">Transazioni</div>
                  <div className="font-semibold">{walletData.transaction_count || 0}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="secondary"
                  onClick={() => setShowTopUpDialog(true)}
                  data-testid="button-topup"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ricarica
                </Button>
                <Button 
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                  disabled={!walletData.balance || walletData.balance <= 0}
                  data-testid="button-withdraw"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Preleva
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-pending-refunds">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Rimborsi in Elaborazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold" data-testid="pending-refunds">
                €{walletData?.pending_refunds?.toFixed(2) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-auto-refunds">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Rimborsi Automatici
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold" data-testid="auto-refunds-count">
                {walletData?.auto_refunds_count || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-saved-amount">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Risparmiato questo Mese
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold" data-testid="saved-amount">
                €{walletData?.monthly_savings?.toFixed(2) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-wallet-status">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Stato Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <Badge variant="outline" className="text-green-600">
                Attivo
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific Content */}
      <RoleProtected allowedRoles={["admin"]}>
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <Shield className="h-5 w-5" />
              Pannello Amministratore Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-red-600">€{walletData?.system_total_balance?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-gray-600">Saldo Sistema Totale</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{walletData?.pending_admin_approvals || 0}</p>
                <p className="text-sm text-gray-600">Approvazioni Pendenti</p>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{walletData?.active_users_count || 0}</p>
                <p className="text-sm text-gray-600">Utenti Attivi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </RoleProtected>

      <RoleProtected allowedRoles={["system_creator"]}>
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Settings className="h-5 w-5" />
              Sistema Creator - Configurazioni Avanzate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-security-config">
                <Shield className="h-6 w-6 mb-2" />
                <span>Configurazione Sicurezza</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-audit-logs">
                <FileText className="h-6 w-6 mb-2" />
                <span>Audit Logs Sistema</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </RoleProtected>

      <RoleProtected allowedRoles={["staff"]}>
        <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Headphones className="h-5 w-5" />
              Console Supporto Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-16 flex items-center gap-3" data-testid="button-pending-support">
                <Bell className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Richieste Pendenti</p>
                  <p className="text-sm text-gray-600">{walletData?.pending_support_tickets || 0} ticket</p>
                </div>
              </Button>
              <Button variant="outline" className="h-16 flex items-center gap-3" data-testid="button-user-assistance">
                <UserCheck className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Assistenza Utenti</p>
                  <p className="text-sm text-gray-600">Supporto Operativo</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </RoleProtected>

      {/* Transactions */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList data-testid="tabs-transactions">
          <TabsTrigger value="all">Tutte le Transazioni</TabsTrigger>
          <TabsTrigger value="refunds">Rimborsi</TabsTrigger>
          <TabsTrigger value="payments">Pagamenti</TabsTrigger>
          <TabsTrigger value="topups">Ricariche</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card data-testid="card-transactions">
            <CardHeader>
              <CardTitle>
                {user?.role === 'admin' ? 'Cronologia Transazioni Sistema' : 
                 user?.role === 'staff' ? 'Transazioni Monitoraggio' :
                 'Cronologia Transazioni'}
              </CardTitle>
              <CardDescription>
                {user?.role === 'admin' ? 'Tutte le transazioni sistema con controllo completo' : 
                 user?.role === 'staff' ? 'Monitoraggio operazioni per supporto utenti' :
                 'Tutte le operazioni del tuo wallet con rimborsi automatici'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="text-center py-8" data-testid="loading-transactions">
                  Caricamento transazioni...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8" data-testid="no-transactions">
                  <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessuna transazione</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Le tue transazioni appariranno qui
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrizione</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Importo</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Riferimento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: any) => (
                      <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={getTransactionColor(transaction.type)}>
                            {transaction.type === 'payment' || transaction.type === 'withdrawal' ? '-' : '+'}
                            €{Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {transaction.status === 'completed' ? 'Completata' : 
                             transaction.status === 'pending' ? 'In Elaborazione' : 
                             'Fallita'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500 font-mono">
                            {transaction.reference || 'N/A'}
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

        <TabsContent value="refunds" className="space-y-4">
          <Card data-testid="card-refunds-only">
            <CardHeader>
              <CardTitle>Rimborsi Automatici</CardTitle>
              <CardDescription>
                Rimborsi ricevuti da cancellazioni spedizioni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Lista rimborsi filtrata in arrivo...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card data-testid="card-payments-only">
            <CardHeader>
              <CardTitle>Pagamenti Effettuati</CardTitle>
              <CardDescription>
                Spese per spedizioni e servizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Lista pagamenti filtrata in arrivo...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topups" className="space-y-4">
          <Card data-testid="card-topups-only">
            <CardHeader>
              <CardTitle>Ricariche Wallet</CardTitle>
              <CardDescription>
                Ricariche manuali del saldo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Lista ricariche filtrata in arrivo...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Up Dialog */}
      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent data-testid="dialog-topup">
          <DialogHeader>
            <DialogTitle>Ricarica Wallet</DialogTitle>
            <DialogDescription>
              Aggiungi fondi al tuo wallet YCore tramite Stripe
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Importo da ricaricare</label>
              <Input
                type="number"
                placeholder="0.00"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                data-testid="input-topup-amount"
                min="5"
                max="1000"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Importo minimo: €5.00 - Importo massimo: €1000.00
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Pagamento sicuro con Stripe</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowTopUpDialog(false)}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleTopUp}
              disabled={!topUpAmount || parseFloat(topUpAmount) < 5 || topUpMutation.isPending}
              data-testid="button-confirm-topup"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ricarica €{topUpAmount || '0.00'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}