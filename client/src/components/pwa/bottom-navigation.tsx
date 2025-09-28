import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Truck, 
  ShoppingCart, 
  Users, 
  Settings,
  Bot
} from "lucide-react";
import { useDeviceInterface } from "@/hooks/use-device-interface";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  {
    id: "dashboard",
    label: "Home",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    id: "shipments", 
    label: "Spedizioni",
    href: "/shipments",
    icon: Truck,
  },
  {
    id: "ecommerce",
    label: "Shop",
    href: "/ecommerce-page",
    icon: ShoppingCart,
  },
  {
    id: "clients",
    label: "Clienti", 
    href: "/clients",
    icon: Users,
  },
  {
    id: "ai",
    label: "AI",
    href: "#",
    icon: Bot,
    isAction: true,
  },
];

export function BottomNavigation() {
  const [location] = useLocation();
  const { isApp } = useDeviceInterface();

  if (!isApp) return null;

  return (
    <nav className="bottom-nav" data-testid="bottom-navigation">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
        
        if (item.isAction) {
          return (
            <button
              key={item.id}
              className={cn(
                "bottom-nav-item ripple-effect tap-scale",
                "active:bg-primary/20"
              )}
              data-testid={`bottom-nav-${item.id}`}
              onClick={() => {
                // Trigger AI Assistant
                const aiButton = document.querySelector('[data-testid="ai-assistant-trigger"]') as HTMLButtonElement;
                if (aiButton) aiButton.click();
              }}
            >
              <Icon className="bottom-nav-icon" />
              <span className="bottom-nav-label">{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "bottom-nav-item ripple-effect tap-scale",
              isActive && "active"
            )}
            data-testid={`bottom-nav-${item.id}`}
          >
            <Icon className="bottom-nav-icon" />
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}