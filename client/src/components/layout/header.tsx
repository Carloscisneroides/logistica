import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Plus, Menu, Crown, User, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GlobalAIAssistant } from "@/components/ai/global-ai-assistant";
import { useAuth } from "@/hooks/use-auth";
import ycoreLogo from "@assets/Copilot_20250928_191905_1759079989814.png";

interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("it");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const { data: languages } = useQuery({
    queryKey: ["/api/languages"],
  });

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuToggle}
            data-testid="button-menu-toggle"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* YCORE Brand Integration */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src={ycoreLogo} 
                alt="YCORE Logo" 
                className="h-8 w-8 object-contain"
                data-testid="img-ycore-logo"
              />
              <div className="w-px h-8 bg-border/50"></div>
              <h1 className="text-xl font-semibold text-foreground" data-testid="text-page-title">
                {title}
              </h1>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-accent/10 text-accent border-accent/20"
            data-testid="badge-multi-tenant"
          >
            <Crown className="w-3 h-3 mr-1" />
            Multi-Tenant
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[140px]" data-testid="select-language">
              <SelectValue placeholder="Lingua" />
            </SelectTrigger>
            <SelectContent>
              {languages?.map((lang: any) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              )) || (
                <SelectItem value="it">
                  <span className="flex items-center space-x-2">
                    <span>🇮🇹</span>
                    <span>Italiano</span>
                  </span>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          
          {/* AI Assistant Globale */}
          <GlobalAIAssistant variant="header" />

          {/* Notifications */}
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
        © 2025 YCore SRL Innovativa - Proprietà riservata
      </div>
    </header>
  );
}
