import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Plus, Menu, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("it");

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
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            {title}
          </h1>
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
    </header>
  );
}
