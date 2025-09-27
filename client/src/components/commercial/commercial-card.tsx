import { Card, CardContent } from "@/components/ui/card";

interface CommercialCardProps {
  name: string;
  role: string;
  clients: number;
  revenue: number;
  commission: number;
  initials: string;
}

export function CommercialCard({
  name,
  role,
  clients,
  revenue,
  commission,
  initials
}: CommercialCardProps) {
  const getInitialsColor = () => {
    const colors = [
      "bg-primary",
      "bg-green-500",
      "bg-orange-500",
      "bg-purple-500",
      "bg-blue-500",
      "bg-red-500"
    ];
    
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card className="bg-muted">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getInitialsColor()}`}>
            <span className="text-white text-sm font-medium">{initials}</span>
          </div>
          <div>
            <h4 className="font-medium text-foreground" data-testid={`commercial-name-${initials}`}>
              {name}
            </h4>
            <p className="text-sm text-muted-foreground" data-testid={`commercial-role-${initials}`}>
              {role}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Clienti:</span>
            <span className="text-foreground font-medium" data-testid={`commercial-clients-${initials}`}>
              {clients}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fatturato:</span>
            <span className="text-foreground font-medium" data-testid={`commercial-revenue-${initials}`}>
              €{revenue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Provvigione:</span>
            <span className="text-accent font-medium" data-testid={`commercial-commission-${initials}`}>
              €{commission.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
