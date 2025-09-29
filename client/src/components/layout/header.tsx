import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Plus, Menu, Crown, User, LogOut, ArrowLeft, Search, LayoutDashboard, Settings, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GlobalAIAssistant } from "@/components/ai/global-ai-assistant";
import { useAuth } from "@/hooks/use-auth";
import { useDeviceInterface } from "@/hooks/use-device-interface";
import { useLocation } from "wouter";
import { NyvraLogo } from "@/components/branding/nyvra-logo";

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
    <header className="bg-card border-b border-border">
      <div className={`${!mobileMode ? 'desktop-container header-grid-3' : 'flex items-center justify-between px-4 py-3'}`}>
        {/* LEFT AREA - Menu/Logo */}
        <div className="flex items-center space-x-3">
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
            <div className="flex items-center space-x-2">
              <NyvraLogo size="sm" variant="icon" animated={false} />
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuToggle}
                data-testid="button-menu-toggle"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div className="flex items-center space-x-3">
                <NyvraLogo size="sm" variant="icon" animated={false} />
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-cyan-400 border-blue-500/20"
                  data-testid="badge-antifraud"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Antifraud AI
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* CENTER AREA - Title (sempre centrato) */}
        {isApp ? (
          <div className="flex-1 header-center">
            <h1 className="heading-2 text-foreground truncate max-w-[180px]" data-testid="text-page-title">
              {title}
            </h1>
          </div>
        ) : (
          <div className="header-center">
            <h1 className="heading-1 text-foreground" data-testid="text-page-title">
              {title}
            </h1>
          </div>
        )}

        {/* RIGHT AREA - Actions */}
        <div className={`flex items-center ${isApp ? 'space-x-1' : 'space-x-3'}`}>
          {/* Desktop: Full feature set */}
          {!isApp && (
            <>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[120px] body-text" data-testid="select-language">
                  <SelectValue placeholder="Lingua" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(languages) ? languages.map((lang: any) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span className="body-text">{lang.name}</span>
                      </span>
                    </SelectItem>
                  )) : (
                    <SelectItem value="it">
                      <span className="flex items-center space-x-2">
                        <span>🇮🇹</span>
                        <span className="body-text">Italiano</span>
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
                  className="w-10 h-10"
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
              <Button variant="ghost" size="sm" data-testid="button-search-mobile" className="w-10 h-10">
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
              className={`flex items-center space-x-2 ${isApp ? 'w-10 h-10' : ''}`}
              data-testid="button-user-menu"
            >
              <User className="w-5 h-5" />
              <span className="hidden md:block body-text">{user?.username || "Admin"}</span>
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

          {/* Quick Actions - Desktop only */}
          {!isApp && (
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
              data-testid="button-quick-action"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="body-text font-medium">Nuovo Cliente</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Copyright notice sempre visibile */}
      <div className="text-xs text-muted-foreground/50 text-right pr-2 mt-1">
        © 2025 NYVRA - Neural Yield Verification Risk Analysis - All Rights Reserved
      </div>
    </header>
  );
}
