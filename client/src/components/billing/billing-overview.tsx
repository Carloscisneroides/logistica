import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BillingOverviewProps {
  pendingInvoicesCount: number;
  monthlyTotal: number;
  pendingCorrections: number;
}

export function BillingOverview({ 
  pendingInvoicesCount, 
  monthlyTotal, 
  pendingCorrections 
}: BillingOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Fatturazione</CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-manage-billing">
            Gestisci
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-foreground" data-testid="text-pending-invoices">
              {pendingInvoicesCount}
            </p>
            <p className="text-sm text-muted-foreground">Fatture Pending</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-accent" data-testid="text-monthly-total">
              €{monthlyTotal.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Totale Mensile</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Ricariche Anticipate</span>
            <span className="text-sm font-medium text-foreground" data-testid="text-prepaid-clients">
              34 clienti
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Fatturazione Posticipata</span>
            <span className="text-sm font-medium text-foreground" data-testid="text-postpaid-clients">
              55 clienti
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Rettifiche in Attesa</span>
            <span className="text-sm font-medium text-orange-600" data-testid="text-pending-corrections">
              {pendingCorrections} voci
            </span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Prossime Scadenze</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">E-Commerce Plus</span>
              <span className="text-foreground">Domani</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Logistics Master</span>
              <span className="text-foreground">3 giorni</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Fast Shop</span>
              <span className="text-foreground">5 giorni</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
