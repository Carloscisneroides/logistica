import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Truck,
  LayoutDashboard,
  Users,
  FileText,
  Edit,
  Bus,
  BarChart3,
  Settings,
  Bot,
  Headphones,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Moduli Corrieri",
    href: "/courier-modules",
    icon: Truck,
  },
  {
    title: "AI Routing",
    href: "/ai-routing",
    icon: Bot,
  },
  {
    title: "Clienti",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Fatturazione",
    href: "/billing",
    icon: FileText,
  },
  {
    title: "Rettifiche & Supplementi",
    href: "/corrections",
    icon: Edit,
  },
  {
    title: "Commerciali",
    href: "/commercial",
    icon: Bus,
    roles: ["admin"],
  },
  {
    title: "Assistenza Clienti",
    href: "/support",
    icon: Headphones,
    roles: ["admin", "merchant", "commercial"],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Impostazioni",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || "");
  });

  return (
    <div className={cn("bg-secondary w-64 flex-shrink-0 h-full", className)}>
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="flex items-center justify-center h-16 bg-primary border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-primary-foreground text-xl font-bold">YCore</span>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-primary-foreground bg-primary"
                      : "text-gray-300 hover:text-secondary-foreground hover:bg-gray-700"
                  )}
                  data-testid={`nav-link-${item.href.replace("/", "") || "dashboard"}`}
                >
                  <Icon className="mr-3 w-4 h-4" />
                  {item.title}
                </a>
              );
            })}
          </div>
        </nav>
        
        {/* User Profile */}
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-accent-foreground text-sm font-medium">
                {user?.username?.slice(0, 2).toUpperCase() || "??"}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary-foreground" data-testid="text-username">
                {user?.username || "Unknown User"}
              </p>
              <p className="text-xs text-gray-400" data-testid="text-user-role">
                {user?.role || "User"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            Esci
          </Button>
        </div>
      </div>
    </div>
  );
}
