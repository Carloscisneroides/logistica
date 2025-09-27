import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral" | "warning";
  icon: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  icon,
  className,
  "data-testid": testId,
}: StatsCardProps) {
  const getChangeIcon = () => {
    switch (changeType) {
      case "positive":
        return <ArrowUp className="w-3 h-3" />;
      case "negative":
        return <ArrowDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      case "warning":
        return "text-orange-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        className
      )}
      data-testid={testId}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground" data-testid={`${testId}-value`}>
              {value}
            </p>
            <p className={cn("text-sm flex items-center mt-1", getChangeColor())}>
              {getChangeIcon()}
              <span className="ml-1">{change}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-muted">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
