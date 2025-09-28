/**
 * YCore Mobile Navigation Debug Overlay
 * Componente per visualizzazione stato navigazione in tempo reale
 * Attivo solo in development mode
 */

import { useMobileNavigationContext } from '@/contexts/mobile-navigation-context';
import { useDeviceInterface } from '@/hooks/use-device-interface';

export function MobileNavigationDebug() {
  // Gestione sicura del Context che potrebbe fallire
  try {
    const navigationState = useMobileNavigationContext();
    const { isApp, interfaceMode } = useDeviceInterface();

    // Solo in development e mobile
    if (!import.meta.env.DEV || !isApp) return null;

  return (
    <div className="fixed top-2 left-2 z-[9999] bg-black/80 text-white text-xs p-2 rounded font-mono max-w-[200px]">
      <div className="font-bold text-green-400">🎯 YCORE NAV DEBUG</div>
      <div>Mode: <span className="text-blue-400">{interfaceMode}</span></div>
      <div>Active: <span className="text-yellow-400">{navigationState.activeMenu}</span></div>
      <div>Header: <span className={navigationState.isHeaderMenuOpen ? 'text-green-400' : 'text-red-400'}>
        {navigationState.isHeaderMenuOpen ? 'OPEN' : 'CLOSED'}
      </span></div>
      <div>Sidebar: <span className={navigationState.isSidebarOpen ? 'text-green-400' : 'text-red-400'}>
        {navigationState.isSidebarOpen ? 'OPEN' : 'CLOSED'}
      </span></div>
      <div>Bottom: <span className={navigationState.isBottomNavVisible ? 'text-green-400' : 'text-red-400'}>
        {navigationState.isBottomNavVisible ? 'VISIBLE' : 'HIDDEN'}
      </span></div>
      <div className="text-gray-400 mt-1">
        Last: {navigationState.debugInfo.lastAction}
      </div>
      <div className="text-gray-400">
        Stack: {navigationState.debugInfo.menuStack.slice(-3).join('→')}
      </div>
    </div>
  );
  } catch (error) {
    // Fallback sicuro se Context non disponibile
    if (!import.meta.env.DEV) return null;
    return (
      <div className="fixed top-2 left-2 z-[9999] bg-red-900/80 text-white text-xs p-2 rounded font-mono max-w-[200px]">
        <div className="font-bold text-red-400">❌ NAV DEBUG ERROR</div>
        <div>Context non disponibile</div>
      </div>
    );
  }
}