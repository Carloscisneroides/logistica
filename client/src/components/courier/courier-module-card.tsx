import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Settings, Key, Clock, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourierModuleCardProps {
  module: {
    id: string;
    name: string;
    code: string;
    contractCode?: string;
    status: "active" | "inactive" | "pending" | "validation";
  };
  onActivate?: (id: string) => void;
  onConfigure?: (id: string) => void;
}

export function CourierModuleCard({ module, onActivate, onConfigure }: CourierModuleCardProps) {
  const getStatusBadge = () => {
    switch (module.status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Attivo
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            Inattivo
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Validazione
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {module.status}
          </Badge>
        );
    }
  };

  const getIcon = () => {
    // Special handling for YSpedizioni Premium
    if (module.name.toLowerCase().includes("yspedizioni")) {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
          <Crown className="w-5 h-5 text-accent-foreground" />
        </div>
      );
    }

    // Color mapping for different couriers
    const colorMap: Record<string, string> = {
      gls: "bg-primary",
      brt: "bg-orange-500",
      dhl: "bg-yellow-500",
      ups: "bg-amber-600",
      fedex: "bg-purple-600",
      tnt: "bg-orange-600",
      sda: "bg-red-500",
    };

    const courierType = module.name.toLowerCase().split(" ")[0];
    const bgColor = colorMap[courierType] || "bg-primary";

    return (
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bgColor)}>
        <Truck className="w-5 h-5 text-white" />
      </div>
    );
  };

  const getActionButton = () => {
    switch (module.status) {
      case "active":
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onConfigure?.(module.id)}
            data-testid={`button-configure-${module.id}`}
          >
            <Settings className="w-4 h-4" />
          </Button>
        );
      case "inactive":
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onActivate?.(module.id)}
            data-testid={`button-activate-${module.id}`}
          >
            <Key className="w-4 h-4" />
          </Button>
        );
      case "pending":
        return (
          <Button
            variant="ghost"
            size="sm"
            disabled
            data-testid={`button-pending-${module.id}`}
          >
            <Clock className="w-4 h-4" />
          </Button>
        );
      default:
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onConfigure?.(module.id)}
            data-testid={`button-manage-${module.id}`}
          >
            <Star className="w-4 h-4" />
          </Button>
        );
    }
  };

  const getContractInfo = () => {
    if (module.contractCode) {
      return module.contractCode;
    }
    
    if (module.name.toLowerCase().includes("yspedizioni")) {
      return "Account interno - Tariffe convenzionate";
    }
    
    return "Inserire codice contratto";
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between" data-testid={`courier-module-${module.id}`}>
          <div className="flex items-center space-x-3">
            {getIcon()}
            <div>
              <h4 className="font-medium text-foreground" data-testid={`module-name-${module.id}`}>
                {module.name}
              </h4>
              <p className="text-sm text-muted-foreground" data-testid={`module-contract-${module.id}`}>
                Codice: {getContractInfo()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge()}
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
