import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Plus, Menu, Crown, User, LogOut, ArrowLeft, Search, LayoutDashboard, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GlobalAIAssistant } from "@/components/ai/global-ai-assistant";
import { useAuth } from "@/hooks/use-auth";
import { useDeviceInterface } from "@/hooks/use-device-interface";
import { useLocation } from "wouter";
import nuvraLogo from "@assets/Copilot_20250928_191905_1759079989814.png";

interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
  mobileMode?: boolean;
  navigationState?: any; // Nuvra Navigation State per mobile
}

export function Header({ title, onMenuToggle, mobileMode = false, navigationState }: HeaderProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("it");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { isApp, isPC } = useDeviceInterface();
  const [location] = useLocation();
  const canGoBack = isApp && location !== "/";

  const { data: languages } = useQuery({
    queryKey: ["/api/languages"],
  });

  return (
    <header className={`bg-card border-b border-border ${mobileMode ? 'px-4 py-3' : 'px-0 py-4'}`}>
      <div className={`flex items-center justify-between ${!mobileMode ? 'desktop-container' : ''}`}>
        <div className="flex items-center space-x-4">
          {/* ARCHITETTURA YLENIA SACCO - GESTIONE CENTRALIZZATA */}
          {mobileMode && navigationState ? (
            /* MOBILE MODE: Menu hamburger con stato centralizzato */
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigationState.toggleMenu('header')}
              data-testid="button-mobile-menu-toggle"
              className={navigationState.isHeaderMenuOpen ? 'bg-accent' : ''}
            >
              <Menu className="w-6 h-6" />
            </Button>
          ) : mobileMode ? (
            /* MOBILE FALLBACK: Solo logo */
            <div className="flex items-center space-x-3">
              <img src={nuvraLogo} alt="Nuvra" className="h-8 w-8" />
              <span className="font-bold text-lg text-primary">{title}</span>
            </div>
          ) : (
            /* DESKTOP MODE: Menu toggle tradizionale */
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              data-testid="button-menu-toggle"
            >
              <Menu className="w-6 h-6" />
            </Button>
          )}
          
          {/* Title - Mobile Centered */}
          {isApp ? (
            <div className="flex-1 flex justify-center">
              <h1 className="text-lg font-semibold text-foreground truncate max-w-[180px]" data-testid="text-page-title">
                {title}
              </h1>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={nuvraLogo} 
                  alt="Nuvra Logo" 
                  className="h-8 w-8 object-contain"
                  data-testid="img-nuvra-logo"
                />
                <div className="w-px h-8 bg-border/50"></div>
                <h1 className="text-xl font-semibold text-foreground" data-testid="text-page-title">
                  {title}
                </h1>
              </div>
            </div>
          )}
          {!isApp && (
            <Badge 
              variant="secondary" 
              className="bg-accent/10 text-accent border-accent/20"
              data-testid="badge-multi-tenant"
            >
              <Crown className="w-3 h-3 mr-1" />
              Multi-Tenant
            </Badge>
          )}
        </div>
        
        <div className={`flex items-center ${isApp ? 'space-x-1' : 'space-x-4'}`}>
          {/* Desktop: Full feature set */}
          {!isApp && (
            <>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[140px]" data-testid="select-language">
                  <SelectValue placeholder="Lingua" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(languages) ? languages.map((lang: any) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  )) : (
                    <SelectItem value="it">
                      <span className="flex items-center space-x-2">
                        <span>🇮🇹</span>
                        <span>Italiano</span>
                      </span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <GlobalAIAssistant variant="header" />
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-testid="button-notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
            </>
          )}
          
          {/* Mobile: Compact actions */}
          {isApp && (
            <>
              <Button variant="ghost" size="sm" data-testid="button-search-mobile">
                <Search className="w-5 h-5" />
              </Button>
              <GlobalAIAssistant variant="header" />
            </>
          )}
          
          {/* User Menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2"
              data-testid="button-user-menu"
            >
              <User className="w-5 h-5" />
              <span className="hidden md:block">{user?.username || "Admin"}</span>
            </Button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user?.username || "Admin"}</p>
                    <p className="text-xs text-muted-foreground">Utente autorizzato</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      logoutMutation.mutate();
                      setUserMenuOpen(false);
                    }}
                    disabled={logoutMutation.isPending}
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {logoutMutation.isPending ? "Disconnessione..." : "Logout"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-quick-action"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Cliente
          </Button>
        </div>
      </div>
      
      {/* Copyright notice sempre visibile */}
      <div className="text-xs text-muted-foreground/50 text-right pr-2 mt-1">
        © 2025 Nuvra SRL Innovativa - Proprietà riservata
      </div>
    </header>
  );
}
