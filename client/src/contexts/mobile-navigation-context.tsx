/**
 * YCore Mobile Navigation Context
 * Context provider per condivisione stato centralizzato
 * SINGLE SOURCE OF TRUTH per tutta l'applicazione
 */

import { createContext, useContext } from 'react';
import { useMobileNavigationState } from '@/hooks/use-mobile-navigation-state';

type ActiveMenu = 'none' | 'header' | 'sidebar' | 'bottom';

interface MobileNavigationState {
  activeMenu: ActiveMenu;
  isHeaderMenuOpen: boolean;
  isSidebarOpen: boolean;
  isBottomNavVisible: boolean;
  toggleMenu: (menuType: Exclude<ActiveMenu, 'none'>) => void;
  closeAllMenus: () => void;
  debugInfo: {
    menuStack: ActiveMenu[];
    lastAction: string;
    timestamp: number;
  };
}

const MobileNavigationContext = createContext<MobileNavigationState | null>(null);

export function MobileNavigationProvider({ children }: { children: React.ReactNode }) {
  const navigationState = useMobileNavigationState();
  
  return (
    <MobileNavigationContext.Provider value={navigationState}>
      {children}
    </MobileNavigationContext.Provider>
  );
}

export function useMobileNavigationContext(): MobileNavigationState {
  const context = useContext(MobileNavigationContext);
  if (!context) {
    throw new Error('useMobileNavigationContext must be used within MobileNavigationProvider');
  }
  return context;
}