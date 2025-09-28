import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Users, Database, Activity, Globe, Lock, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function SystemCreatorDashboard() {
  const { user } = useAuth();

  const { data: systemStats } = useQuery({
    queryKey: ['/api/admin/system-stats'],
    enabled: user?.role === 'system_creator'
  });

  const { data: securityLogs } = useQuery({
    queryKey: ['/api/admin/security-logs'],
    enabled: user?.role === 'system_creator'
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-600" />
            System Creator Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Accesso totale al sistema - Gestione configurazioni globali e sicurezza
          </p>
        </div>
        <Badge variant="destructive" className="px-3 py-1">
          <Lock className="h-4 w-4 mr-1" />
          SYSTEM ACCESS
        </Badge>
      </div>

      {/* Global System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants Attivi</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalTenants || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 dal mese scorso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-xs text-muted-foreground">
              Uptime last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts Attivi</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{systemStats?.alerts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurazioni Globali
            </CardTitle>
            <CardDescription>
              Gestisci configurazioni di sistema e parametri globali
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-global-settings">
              <Database className="h-4 w-4 mr-2" />
              Database Configuration
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-api-limits">
              <Activity className="h-4 w-4 mr-2" />
              API Rate Limits
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-feature-flags">
              <Shield className="h-4 w-4 mr-2" />
              Feature Flags
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestione Ruoli
            </CardTitle>
            <CardDescription>
              Gestisci permessi e ruoli di sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-role-management">
              <Users className="h-4 w-4 mr-2" />
              Role Management
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-permission-matrix">
              <Lock className="h-4 w-4 mr-2" />
              Permission Matrix
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-access-audit">
              <Shield className="h-4 w-4 mr-2" />
              Access Audit
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Logs
          </CardTitle>
          <CardDescription>
            Monitor di sicurezza in tempo reale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {securityLogs?.slice(0, 10).map((log: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`log-entry-${index}`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">{log.action || 'System Event'}</p>
                    <p className="text-xs text-muted-foreground">{log.timestamp || new Date().toISOString()}</p>
                  </div>
                </div>
                <Badge variant={log.severity === 'high' ? 'destructive' : 'secondary'}>
                  {log.severity || 'medium'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}