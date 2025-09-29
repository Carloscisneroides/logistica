/**
 * Nuvra Mobile Navigation State Manager
 * Autore: Ylenia Sacco - Founder & CEO, Nuvra
 * Data: 29 settembre 2025
 * 
 * Modulo centralizzato per gestione stato menu mobile
 * Garantisce esclusione reciproca e UX fluida
 */

import { useState, useCallback, useEffect } from 'react';
import { useDeviceInterface } from '@/hooks/use-device-interface';

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

export function useMobileNavigationState(): MobileNavigationState {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('none');
  const [menuStack, setMenuStack] = useState<ActiveMenu[]>([]);
  const [lastAction, setLastAction] = useState<string>('init');
  const { isApp } = useDeviceInterface();

  // LOGICA DI ESCLUSIONE RECIPROCA - SINGOLA FONTE DI VERITÀ
  const isHeaderMenuOpen = activeMenu === 'header';
  const isSidebarOpen = activeMenu === 'sidebar';
  const isBottomNavVisible = isApp && (activeMenu === 'none' || activeMenu === 'bottom');

  // FUNZIONE CENTRALIZZATA PER GESTIONE MENU
  const toggleMenu = useCallback((menuType: Exclude<ActiveMenu, 'none'>) => {
    setActiveMenu(prevActive => {
      const newActive = prevActive === menuType ? 'none' : menuType;
      
      // Log per debug e tracciabilità
      setLastAction(`toggle_${menuType}_${prevActive}_to_${newActive}`);
      setMenuStack(prev => [...prev.slice(-4), newActive]); // Keep last 5
      
      // Console logs only in development
      if (import.meta.env.DEV) {
        console.log(`🎯 Nuvra Navigation: ${menuType} ${prevActive === menuType ? 'CLOSED' : 'OPENED'} | Active: ${newActive}`);
      }
      
      return newActive;
    });
  }, []);

  // CHIUSURA GLOBALE - RESET STATO
  const closeAllMenus = useCallback(() => {
    setActiveMenu('none');
    setLastAction('close_all');
    if (import.meta.env.DEV) {
      console.log('🎯 YCORE Navigation: ALL MENUS CLOSED');
    }
  }, []);

  // AUTO-CLOSE su cambio viewport (orientamento, keyboard, etc)
  useEffect(() => {
    const handleResize = () => {
      if (activeMenu !== 'none') {
        closeAllMenus();
        setLastAction('auto_close_resize');
      }
    };

    // Auto-close su escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeMenu !== 'none') {
        closeAllMenus();
        setLastAction('auto_close_escape');
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenu, closeAllMenus]);

  // RESET se non è app mode
  useEffect(() => {
    if (!isApp && activeMenu !== 'none') {
      closeAllMenus();
      setLastAction('auto_close_desktop_mode');
    }
  }, [isApp, activeMenu, closeAllMenus]);

  return {
    activeMenu,
    isHeaderMenuOpen,
    isSidebarOpen,
    isBottomNavVisible,
    toggleMenu,
    closeAllMenus,
    debugInfo: {
      menuStack,
      lastAction,
      timestamp: Date.now()
    }
  };
}