import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Truck, 
  ShoppingCart, 
  Users, 
  Plus,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    id: "clients",
    label: "Clienti", 
    href: "/clients",
    icon: Users,
  },
  {
    id: "more",
    label: "Altro",
    href: "/ecommerce-page",
    icon: MoreHorizontal,
  },
];

interface BottomNavigationProps {
  navigationState?: any; // Nuvra Navigation State
}

export function BottomNavigation({ navigationState }: BottomNavigationProps) {
  const [location] = useLocation();
  const { isApp } = useDeviceInterface();

  // ARCHITETTURA YLENIA SACCO - Visibilità controllata
  if (!isApp) return null;
  if (navigationState && !navigationState.isBottomNavVisible) return null;

  return (
    <>
      {/* FAB - Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-primary shadow-lg hover:shadow-xl ripple-effect tap-scale"
          data-testid="fab-new-shipment"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
      
      {/* Bottom Navigation */}
      <nav className="bottom-nav" data-testid="bottom-navigation">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);

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
    </>
  );
}