import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, ShoppingCart, Check, X, Play, RefreshCw, Plus, Trash2 } from "lucide-react";

interface CourierProvider {
  id: string;
  tenantId: string;
  provider: string;
  displayName: string;
  apiCredentials: any;
  status: 'active' | 'inactive' | 'error';
  isReseller: boolean;
  markupPercentage: number | null;
  commissionPercentage: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MarketplaceConnection {
  id: string;
  tenantId: string;
  clientId: string | null;
  marketplaceType: string;
  displayName: string;
  storeUrl: string;
  apiCredentials: any;
  status: 'active' | 'inactive' | 'error' | 'syncing';
  autoSync: boolean;
  syncFrequency: string | null;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function IntegrationsAdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'couriers' | 'marketplaces'>('couriers');
  const [isAddCourierOpen, setIsAddCourierOpen] = useState(false);
  const [isAddMarketplaceOpen, setIsAddMarketplaceOpen] = useState(false);

  const { data: couriers = [], refetch: refetchCouriers } = useQuery<CourierProvider[]>({
    queryKey: ['/api/admin/courier-providers']
  });

  const { data: connections = [], refetch: refetchConnections } = useQuery<MarketplaceConnection[]>({
    queryKey: ['/api/admin/marketplace-connections']
  });

  const testCourierMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/courier-providers/${id}/test`, 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: data.success ? "Test successful" : "Test failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    }
  });

  const testMarketplaceMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/marketplace-connections/${id}/test`, 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: data.success ? "Test successful" : "Test failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    }
  });

  const syncOrdersMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/marketplace-connections/${id}/sync`, 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "Sync completed",
        description: `Processed ${data.result.ordersProcessed} orders`
      });
      refetchConnections();
    }
  });

  const deleteCourierMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/courier-providers/${id}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: "Provider deleted" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courier-providers'] });
    }
  });

  const deleteMarketplaceMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/marketplace-connections/${id}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: "Connection deleted" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/marketplace-connections'] });
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">External Integrations</h1>
          <p className="text-muted-foreground">Manage courier providers and marketplace connections</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="couriers" className="flex items-center gap-2" data-testid="tab-couriers">
            <Package className="h-4 w-4" />
            Courier Providers
          </TabsTrigger>
          <TabsTrigger value="marketplaces" className="flex items-center gap-2" data-testid="tab-marketplaces">
            <ShoppingCart className="h-4 w-4" />
            Marketplace Connections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="couriers" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddCourierOpen} onOpenChange={setIsAddCourierOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-courier">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Courier Provider
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Courier Provider</DialogTitle>
                  <DialogDescription>Configure a new external courier integration</DialogDescription>
                </DialogHeader>
                <CourierProviderForm onClose={() => setIsAddCourierOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Courier Providers</CardTitle>
              <CardDescription>External courier integrations for label purchasing and tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reseller</TableHead>
                    <TableHead>Markup</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {couriers.map((courier) => (
                    <TableRow key={courier.id} data-testid={`row-courier-${courier.id}`}>
                      <TableCell className="font-medium">{courier.provider}</TableCell>
                      <TableCell>{courier.displayName}</TableCell>
                      <TableCell>
                        <Badge variant={courier.status === 'active' ? 'default' : 'secondary'}>
                          {courier.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {courier.isReseller ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>{courier.markupPercentage ? `${courier.markupPercentage}%` : '-'}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testCourierMutation.mutate(courier.id)}
                          disabled={testCourierMutation.isPending}
                          data-testid={`button-test-courier-${courier.id}`}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCourierMutation.mutate(courier.id)}
                          data-testid={`button-delete-courier-${courier.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {couriers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No courier providers configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplaces" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddMarketplaceOpen} onOpenChange={setIsAddMarketplaceOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-marketplace">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Marketplace Connection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Marketplace Connection</DialogTitle>
                  <DialogDescription>Connect to an e-commerce platform for order syncing</DialogDescription>
                </DialogHeader>
                <MarketplaceConnectionForm onClose={() => setIsAddMarketplaceOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Marketplace Connections</CardTitle>
              <CardDescription>E-commerce platform integrations for automatic order processing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Store URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Auto Sync</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((connection) => (
                    <TableRow key={connection.id} data-testid={`row-marketplace-${connection.id}`}>
                      <TableCell className="font-medium">{connection.marketplaceType}</TableCell>
                      <TableCell>{connection.displayName}</TableCell>
                      <TableCell className="max-w-xs truncate">{connection.storeUrl}</TableCell>
                      <TableCell>
                        <Badge variant={connection.status === 'active' ? 'default' : 'secondary'}>
                          {connection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {connection.autoSync ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        {connection.lastSyncAt 
                          ? new Date(connection.lastSyncAt).toLocaleString() 
                          : 'Never'}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testMarketplaceMutation.mutate(connection.id)}
                          disabled={testMarketplaceMutation.isPending}
                          data-testid={`button-test-marketplace-${connection.id}`}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => syncOrdersMutation.mutate(connection.id)}
                          disabled={syncOrdersMutation.isPending}
                          data-testid={`button-sync-marketplace-${connection.id}`}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMarketplaceMutation.mutate(connection.id)}
                          data-testid={`button-delete-marketplace-${connection.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {connections.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No marketplace connections configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CourierProviderForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    provider: 'fedex',
    displayName: '',
    apiKey: '',
    secretKey: '',
    accountNumber: '',
    isReseller: true,
    markupPercentage: 15,
    status: 'active'
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/courier-providers', 'POST', data),
    onSuccess: () => {
      toast({ title: "Courier provider created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courier-providers'] });
      onClose();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      apiCredentials: {
        apiKey: formData.apiKey,
        secretKey: formData.secretKey,
        accountNumber: formData.accountNumber,
        sandbox: true
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <Select value={formData.provider} onValueChange={(v) => setFormData({ ...formData, provider: v })}>
          <SelectTrigger data-testid="select-provider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fedex">FedEx</SelectItem>
            <SelectItem value="ups">UPS</SelectItem>
            <SelectItem value="dhl">DHL</SelectItem>
            <SelectItem value="usps">USPS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          placeholder="e.g., FedEx Production"
          required
          data-testid="input-display-name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          value={formData.apiKey}
          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          required
          data-testid="input-api-key"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="secretKey">Secret Key</Label>
        <Input
          id="secretKey"
          type="password"
          value={formData.secretKey}
          onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
          required
          data-testid="input-secret-key"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          value={formData.accountNumber}
          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          data-testid="input-account-number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="markupPercentage">Markup Percentage</Label>
        <Input
          id="markupPercentage"
          type="number"
          value={formData.markupPercentage}
          onChange={(e) => setFormData({ ...formData, markupPercentage: parseFloat(e.target.value) })}
          data-testid="input-markup"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-courier">
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-courier">
          Create Provider
        </Button>
      </div>
    </form>
  );
}

function MarketplaceConnectionForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    marketplaceType: 'shopify',
    displayName: '',
    storeUrl: '',
    apiKey: '',
    accessToken: '',
    autoSync: true,
    status: 'active'
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/marketplace-connections', 'POST', data),
    onSuccess: () => {
      toast({ title: "Marketplace connection created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/marketplace-connections'] });
      onClose();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      apiCredentials: {
        apiKey: formData.apiKey,
        accessToken: formData.accessToken
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="marketplaceType">Platform</Label>
        <Select value={formData.marketplaceType} onValueChange={(v) => setFormData({ ...formData, marketplaceType: v })}>
          <SelectTrigger data-testid="select-marketplace-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shopify">Shopify</SelectItem>
            <SelectItem value="woocommerce">WooCommerce</SelectItem>
            <SelectItem value="magento">Magento</SelectItem>
            <SelectItem value="prestashop">PrestaShop</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          placeholder="e.g., My Shopify Store"
          required
          data-testid="input-marketplace-display-name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeUrl">Store URL</Label>
        <Input
          id="storeUrl"
          value={formData.storeUrl}
          onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
          placeholder="https://mystore.myshopify.com"
          required
          data-testid="input-store-url"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accessToken">Access Token</Label>
        <Input
          id="accessToken"
          type="password"
          value={formData.accessToken}
          onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
          required
          data-testid="input-access-token"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-marketplace">
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-marketplace">
          Create Connection
        </Button>
      </div>
    </form>
  );
}
