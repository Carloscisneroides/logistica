import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, Package, MessageCircle, Clock, CheckCircle, AlertCircle, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function StaffConsole() {
  const { user } = useAuth();

  const { data: tickets } = useQuery({
    queryKey: ['/api/staff/tickets'],
    enabled: user?.role === 'staff'
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/staff/orders'],
    enabled: user?.role === 'staff'
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Headphones className="h-8 w-8 text-green-600" />
            Staff Console
          </h1>
          <p className="text-muted-foreground mt-2">
            Operazioni quotidiane, supporto clienti e gestione richieste
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <User className="h-4 w-4 mr-1" />
          STAFF ACCESS
        </Badge>
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Aperti</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets?.open || 0}</div>
            <p className="text-xs text-muted-foreground">
              Da gestire
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordini Pending</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Risposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3h</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risolti Oggi</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tickets?.resolved || 0}</div>
            <p className="text-xs text-muted-foreground">
              Closed successfully
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Gestione Ticket
            </CardTitle>
            <CardDescription>
              Supporto clienti e risoluzione problemi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-new-tickets">
              <MessageCircle className="h-4 w-4 mr-2" />
              Nuovi Ticket ({tickets?.new || 0})
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-my-tickets">
              <User className="h-4 w-4 mr-2" />
              I Miei Ticket
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-escalated">
              <AlertCircle className="h-4 w-4 mr-2" />
              Escalated Issues
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gestione Ordini
            </CardTitle>
            <CardDescription>
              Monitoring e assistenza ordini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-pending-orders">
              <Package className="h-4 w-4 mr-2" />
              Ordini Pending ({orders?.pending || 0})
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-shipping-issues">
              <AlertCircle className="h-4 w-4 mr-2" />
              Shipping Issues
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-refund-requests">
              <Package className="h-4 w-4 mr-2" />
              Refund Requests
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comunicazioni
            </CardTitle>
            <CardDescription>
              Chat interne e coordinamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-team-chat">
              <MessageCircle className="h-4 w-4 mr-2" />
              Team Chat
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-announcements">
              <AlertCircle className="h-4 w-4 mr-2" />
              Announcements
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-knowledge-base">
              <Package className="h-4 w-4 mr-2" />
              Knowledge Base
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Ticket Attivi
          </CardTitle>
          <CardDescription>
            Ticket assegnati e da gestire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets?.active?.slice(0, 5).map((ticket: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`ticket-${index}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                      {ticket.priority || 'normal'}
                    </Badge>
                    <p className="font-medium">#{ticket.id || `TK-${index + 1}`}</p>
                  </div>
                  <p className="text-sm">{ticket.subject || 'Issue with order delivery'}</p>
                  <p className="text-xs text-muted-foreground">
                    Customer: {ticket.customer || 'Mario Rossi'} | Created: {ticket.created || '2 ore fa'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" data-testid={`button-view-ticket-${index}`}>
                    View
                  </Button>
                  <Button size="sm" variant="default" data-testid={`button-respond-ticket-${index}`}>
                    Respond
                  </Button>
                </div>
              </div>
            ))}
            {(!tickets?.active || tickets.active.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                Nessun ticket attivo al momento - Ottimo lavoro! 🎉
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats and Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Ticket Risolti</span>
              <span className="font-bold text-green-600">{tickets?.resolved || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tempo Medio Risposta</span>
              <span className="font-bold">2.3h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Customer Satisfaction</span>
              <span className="font-bold text-green-600">94%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tools Rapidi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-order-lookup">
              <Package className="h-4 w-4 mr-2" />
              Order Lookup
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-customer-history">
              <User className="h-4 w-4 mr-2" />
              Customer History
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-shipping-tracker">
              <Package className="h-4 w-4 mr-2" />
              Shipping Tracker
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}