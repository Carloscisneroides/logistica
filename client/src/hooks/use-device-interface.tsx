import { useState, useEffect } from 'react';

export type InterfaceMode = 'pc' | 'app';

export function useDeviceInterface() {
  const [interfaceMode, setInterfaceMode] = useState<InterfaceMode>('pc');
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    function detectInterface() {
      // Rileva se è in modalità standalone (PWA installata)
      const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as any).standalone;
      const isPWAStandalone = isStandalonePWA || isIOSStandalone;

      // Rileva tipo di dispositivo
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Rileva dispositivi mobili
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                            (isTouchDevice && screenWidth <= 1024);

      // Rileva tablet in orientamento landscape
      const isTabletLandscape = isTouchDevice && screenWidth > 768 && screenWidth <= 1024;

      setIsMobile(isMobileDevice);
      setIsStandalone(isPWAStandalone);
      setScreenSize({ width: screenWidth, height: screenHeight });

      // Logica di decisione interfaccia
      let newMode: InterfaceMode = 'pc';

      if (isPWAStandalone) {
        // Se è PWA installata, usa sempre interfaccia APP
        newMode = 'app';
      } else if (isMobileDevice) {
        // Su mobile usa interfaccia APP  
        newMode = 'app';
      } else if (isTabletLandscape) {
        // Su tablet in landscape, usa interfaccia PC
        newMode = 'pc';
      } else if (screenWidth <= 768) {
        // Schermi piccoli usano interfaccia APP
        newMode = 'app';
      } else {
        // Desktop e schermi grandi usano interfaccia PC
        newMode = 'pc';
      }

      // Override manuale via localStorage (per testing)
      const manualMode = localStorage.getItem('ycore-interface-mode') as InterfaceMode;
      if (manualMode && (manualMode === 'pc' || manualMode === 'app')) {
        newMode = manualMode;
      }

      setInterfaceMode(newMode);

      // Applica classe CSS al body per styling condizionale
      document.body.classList.remove('interface-pc', 'interface-app');
      document.body.classList.add(`interface-${newMode}`);

      // Applica variabili CSS personalizzate
      document.documentElement.style.setProperty('--interface-mode', newMode);
      document.documentElement.style.setProperty('--screen-width', `${screenWidth}px`);
      document.documentElement.style.setProperty('--screen-height', `${screenHeight}px`);
      document.documentElement.style.setProperty('--is-standalone', isPWAStandalone ? '1' : '0');
      document.documentElement.style.setProperty('--is-mobile', isMobileDevice ? '1' : '0');

      console.log(`🎯 YCORE Interface: ${newMode.toUpperCase()} | Screen: ${screenWidth}x${screenHeight} | Mobile: ${isMobileDevice} | PWA: ${isPWAStandalone}`);
    }

    // Keyboard detection for mobile
    function detectKeyboard() {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const fullHeight = window.screen.height;
      const heightDiff = fullHeight - currentHeight;
      
      // Keyboard is likely open if height difference > 200px
      const keyboardIsOpen = heightDiff > 200;
      setKeyboardOpen(keyboardIsOpen);
      
      // Apply CSS variable for keyboard state
      document.documentElement.style.setProperty('--keyboard-open', keyboardIsOpen ? '1' : '0');
    }

    // Safe area detection - Read from CSS variables (set by CSS env())
    function detectSafeArea() {
      const computedStyle = getComputedStyle(document.documentElement);
      const top = parseInt(computedStyle.getPropertyValue('--safe-area-top')) || 0;
      const bottom = parseInt(computedStyle.getPropertyValue('--safe-area-bottom')) || 0;
      const left = parseInt(computedStyle.getPropertyValue('--safe-area-left')) || 0;
      const right = parseInt(computedStyle.getPropertyValue('--safe-area-right')) || 0;
      
      setSafeArea({ top, bottom, left, right });
      
      // Don't override CSS env() values - they're already set in CSS
      // Just read the computed values for JS use
    }

    // Rileva al caricamento iniziale
    detectInterface();
    detectKeyboard();
    detectSafeArea();

    // Rileva al ridimensionamento finestra
    const handleResize = () => {
      detectInterface();
      detectKeyboard();
    };

    // Rileva cambio orientamento mobile
    const handleOrientationChange = () => {
      setTimeout(() => {
        detectInterface();
        detectKeyboard();
        detectSafeArea();
      }, 100); // Piccolo delay per aspettare il ridimensionamento
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Visual viewport listeners for keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', detectKeyboard);
    }
    
    // Rileva cambio modalità standalone (se supportato)
    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    if (standaloneMediaQuery.addEventListener) {
      standaloneMediaQuery.addEventListener('change', detectInterface);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', detectKeyboard);
      }
      if (standaloneMediaQuery.removeEventListener) {
        standaloneMediaQuery.removeEventListener('change', detectInterface);
      }
    };
  }, []);

  // Funzione per switch manuale (per testing/debugging)
  const switchInterface = (mode: InterfaceMode) => {
    localStorage.setItem('ycore-interface-mode', mode);
    setInterfaceMode(mode);
    document.body.classList.remove('interface-pc', 'interface-app');
    document.body.classList.add(`interface-${mode}`);
    document.documentElement.style.setProperty('--interface-mode', mode);
    console.log(`🎯 YCORE Interface switched to: ${mode.toUpperCase()}`);
  };

  // Funzione per reset automatico
  const resetToAutoDetect = () => {
    localStorage.removeItem('ycore-interface-mode');
    window.location.reload(); // Ricarica per rieseguire auto-detect
  };

  // Component policy mapping for app-first UX
  const componentPolicy = {
    Dialog: interfaceMode === 'app' ? 'Drawer' : 'Dialog',
    Popover: interfaceMode === 'app' ? 'BottomSheet' : 'Popover', 
    Tabs: interfaceMode === 'app' ? 'Segmented' : 'Tabs',
    Menu: interfaceMode === 'app' ? 'BottomSheet' : 'Menu',
    Select: interfaceMode === 'app' ? 'NativeSelect' : 'Select',
    Table: interfaceMode === 'app' ? 'CardList' : 'Table'
  };

  return {
    interfaceMode,
    isMobile,
    isStandalone,
    screenSize,
    keyboardOpen,
    safeArea,
    componentPolicy,
    switchInterface,
    resetToAutoDetect,
    isPC: interfaceMode === 'pc',
    isApp: interfaceMode === 'app',
    isPWA: isStandalone
  };
}