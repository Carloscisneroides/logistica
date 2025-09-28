/**
 * YCore Mobile Header Menu
 * Menu mobile che appare quando navigationState.isHeaderMenuOpen = true
 * Integrato con il sistema centralizzato di gestione stato
 */

import { Link } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  ShoppingCart, 
  Settings, 
  LogOut,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import ycoreLogo from "@assets/Copilot_20250928_191905_1759079989814.png";

interface MobileHeaderMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    id: "clients",
    label: "Clienti",
    href: "/clients",
    icon: Users,
  },
  {
    id: "shipments",
    label: "Spedizioni",
    href: "/shipments",
    icon: Truck,
  },
  {
    id: "ecommerce",
    label: "eCommerce",
    href: "/ecommerce",
    icon: ShoppingCart,
  },
  {
    id: "settings",
    label: "Impostazioni",
    href: "/settings",
    icon: Settings,
  },
];

export function MobileHeaderMenu({ isOpen, onClose }: MobileHeaderMenuProps) {
  const { logoutMutation } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        data-testid="mobile-menu-overlay"
      />
      
      {/* Menu Drawer */}
      <div className="fixed top-0 left-0 h-full w-[280px] bg-card border-r border-border z-50 transform transition-transform duration-300 ease-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <img src={ycoreLogo} alt="YCORE" className="h-8 w-8" />
              <div>
                <span className="font-bold text-lg text-primary">YCORE</span>
                <p className="text-xs text-muted-foreground">Business Platform</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-mobile-menu"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex-1 py-4 px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={onClose}
                  data-testid={`mobile-menu-link-${item.id}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Bottom Section */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                logoutMutation.mutate();
                onClose();
              }}
              data-testid="button-logout-mobile-menu"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}