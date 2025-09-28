/*
 * YCore Navigation Component - Proprietary UI Module
 * Copyright © 2025 YCore SRL Innovativa - All Rights Reserved
 * 
 * WATERMARK: ycore-nav-a1b2c3d4-e5f6-7890-abcd-ef1234567890
 * BUILD: 2025-09-27T22:08:15.000Z
 * 
 * CONFIDENTIAL AND PROPRIETARY - NOT FOR DISTRIBUTION
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useRolePermissions } from "@/components/role-protected";
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
  ShoppingCart,
  Store,
  TrendingUp,
  CreditCard,
  Ship,
  Plane,
  Package,
  Globe,
  FileCheck,
  Calculator,
  ChevronDown,
  ChevronRight,
  Link as LinkIcon,
  Webhook,
  MapPin,
  RotateCcw,
  Archive,
  UserCheck,
  Wrench,
  Shield,
  AlertTriangle,
  Bell,
  Warehouse,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Spedizioni",
    href: "/shipments", 
    icon: Truck,
    submenu: [
      {
        title: "Dashboard Spedizioni",
        href: "/shipments",
        icon: Truck,
      },
      {
        title: "Shipment Tracking",
        href: "/shipment-tracking",
        icon: MapPin,
      },
      {
        title: "Elenco Spedizioni",
        href: "/shipments-list",
        icon: Package,
      },
      {
        title: "Logistica Magazzini",
        href: "/logistics-warehouses",
        icon: Warehouse,
      }
    ]
  },
  {
    title: "Logistica Globale",
    href: "/global-logistics",
    icon: Globe,
    roles: ["admin", "merchant"],
  },
  {
    title: "Moduli Corrieri",
    href: "/courier-modules",
    icon: Bus,
    submenu: [
      {
        title: "Listini & Corrieri",
        href: "/rates-carriers",
        icon: Calculator,
      },
      {
        title: "Shipment Tracking",
        href: "/shipment-tracking",
        icon: MapPin,
      }
    ]
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
    title: "eCommerce",
    href: "/ecommerce",
    icon: ShoppingCart,
    roles: ["admin", "merchant"],
    submenu: [
      {
        title: "Dashboard eCommerce",
        href: "/ecommerce",
        icon: ShoppingCart,
      },
      {
        title: "Magazzini",
        href: "/ecommerce/warehouses",
        icon: Warehouse,
      },
      {
        title: "Fornitori",
        href: "/ecommerce/suppliers",
        icon: Package,
      },
      {
        title: "CSM Tickets",
        href: "/ecommerce/csm-tickets",
        icon: UserCheck,
      },
      {
        title: "TSM Support",
        href: "/ecommerce/tsm-support",
        icon: Wrench,
      }
    ]
  },
  {
    title: "Marketplace B2B",
    href: "/marketplace",
    icon: Store,
    roles: ["admin", "merchant"],
  },
  {
    title: "Fidelity Card",
    href: "/fidelity",
    icon: CreditCard,
    roles: ["admin", "merchant"],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Platform Connections",
    href: "/platform-connections",
    icon: LinkIcon,
    roles: ["admin", "merchant"],
  },
  {
    title: "Platform Webhooks",
    href: "/platform-webhooks", 
    icon: Webhook,
    roles: ["admin"],
  },
  {
    title: "Gestione Resi",
    href: "/returns",
    icon: RotateCcw,
    roles: ["admin", "merchant"],
  },
  {
    title: "Storage Items",
    href: "/storage-items",
    icon: Archive,
    roles: ["admin", "merchant"],
  },
  {
    title: "Sistema Audit",
    href: "/audit-system",
    icon: Shield,
    roles: ["admin"],
    submenu: [
      {
        title: "Audit Logs",
        href: "/audit-logs",
        icon: FileCheck,
      },
      {
        title: "Escalations",
        href: "/escalations",
        icon: AlertTriangle,
      },
      {
        title: "Notifications",
        href: "/notifications",
        icon: Bell,
      }
    ]
  },
  {
    title: "Impostazioni",
    href: "/settings",
    icon: Settings,
  },
  // Client-specific areas
  {
    title: "Marketplace",
    href: "/client/marketplace",
    icon: Store,
    roles: ["client"],
    clientType: "marketplace",
  },
  {
    title: "Area Logistica",
    href: "/client/logistica",
    icon: Truck,
    roles: ["client"], 
    clientType: "logistica",
  },
  // Commerciale-specific areas
  {
    title: "Dashboard Agente",
    href: "/commerciale/agente",
    icon: TrendingUp,
    roles: ["commerciale"],
    subRole: "agente",
  },
  {
    title: "Dashboard Responsabile",
    href: "/commerciale/responsabile",
    icon: UserCheck,
    roles: ["commerciale"],
    subRole: "responsabile",
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { user, logoutMutation } = useAuth();
  const { hasRole, canAccess } = useRolePermissions();

  const filteredMenuItems = menuItems.filter(item => {
    // System creator and admin should see ALL items including commerciale areas
    if (user?.role === 'system_creator') {
      // Hide only client-specific areas
      if (item.clientType) return false;
      return true;
    }
    
    if (user?.role === 'admin') {
      // Hide only client-specific areas  
      if (item.clientType) return false;
      return true;
    }
    
    // Check role permission for other roles
    if (item.roles && !item.roles.includes(user?.role || "")) return false;
    
    // Check clientType for client users
    if (item.clientType && user?.role === 'client') {
      return (user as any).clientType === item.clientType;
    }
    
    // Check subRole for commerciale users
    if ((item as any).subRole && user?.role === 'commerciale') {
      return (user as any).subRole === (item as any).subRole;
    }
    
    return true;
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
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-700">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenu === item.title;
              
              return (
                <div key={item.href}>
                  {hasSubmenu ? (
                    <>
                      <button
                        onClick={() => setExpandedMenu(isExpanded ? null : item.title)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          "text-gray-300 hover:text-secondary-foreground hover:bg-gray-700"
                        )}
                        data-testid={`nav-toggle-${item.href.replace("/", "") || "dashboard"}`}
                      >
                        <div className="flex items-center">
                          <Icon className="mr-3 w-4 h-4" />
                          {item.title}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="ml-6 space-y-1 mt-1">
                          {item.submenu.map((subItem) => {
                            const isSubActive = location === subItem.href;
                            const SubIcon = subItem.icon;
                            
                            return (
                              <Link
                                key={subItem.href}
                                to={subItem.href}
                                className={cn(
                                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                  isSubActive
                                    ? "text-primary-foreground bg-primary"
                                    : "text-gray-400 hover:text-secondary-foreground hover:bg-gray-700"
                                )}
                                data-testid={`nav-sub-${subItem.href.replace("/", "")}`}
                              >
                                <SubIcon className="mr-3 w-4 h-4" />
                                {subItem.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href}
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
                    </Link>
                  )}
                </div>
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
