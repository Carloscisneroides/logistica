import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, BarChart3, Settings, Shield, MessageSquare, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function AdminPanel() {
  const { user } = useAuth();

  const { data: userStats } = useQuery({
    queryKey: ['/api/admin/user-stats'],
    enabled: user?.role === 'admin'
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ['/api/admin/registration-requests'],
    enabled: user?.role === 'admin'
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestione utenti, contenuti e configurazioni operative
          </p>
        </div>
        <Badge variant="default" className="px-3 py-1">
          <UserCheck className="h-4 w-4 mr-1" />
          ADMIN ACCESS
        </Badge>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Attivi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% dal mese scorso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Richieste Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Da approvare
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenuti Moderati</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.moderatedContent || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ultima settimana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{userStats?.revenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              Questo mese
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestione Utenti
            </CardTitle>
            <CardDescription>
              Approva registrazioni e gestisci utenti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-user-approval">
              <UserCheck className="h-4 w-4 mr-2" />
              Approva Registrazioni ({pendingRequests?.length || 0})
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-user-management">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-role-assignment">
              <Shield className="h-4 w-4 mr-2" />
              Role Assignment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Moderazione Contenuti
            </CardTitle>
            <CardDescription>
              Gestisci contenuti e comunicazioni
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-content-review">
              <MessageSquare className="h-4 w-4 mr-2" />
              Content Review
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-user-reports">
              <FileText className="h-4 w-4 mr-2" />
              User Reports
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-communication-tools">
              <MessageSquare className="h-4 w-4 mr-2" />
              Communication Tools
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Registration Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Richieste di Registrazione Pending
          </CardTitle>
          <CardDescription>
            Approva o rifiuta nuove registrazioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests?.slice(0, 5).map((request: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`request-${index}`}>
                <div className="space-y-1">
                  <p className="font-medium">{request.username}</p>
                  <p className="text-sm text-muted-foreground">{request.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Role: {request.role} | Company: {request.companyName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="default" data-testid={`button-approve-${index}`}>
                    Approva
                  </Button>
                  <Button size="sm" variant="destructive" data-testid={`button-reject-${index}`}>
                    Rifiuta
                  </Button>
                </div>
              </div>
            ))}
            {(!pendingRequests || pendingRequests.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                Nessuna richiesta pending al momento
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reportistica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics e Reportistica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full" data-testid="button-user-analytics">
              <Users className="h-4 w-4 mr-2" />
              User Analytics
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-revenue-reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Revenue Reports
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-system-reports">
              <Settings className="h-4 w-4 mr-2" />
              System Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}