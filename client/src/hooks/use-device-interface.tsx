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
      // Check for debug override first (QA only)
      const urlParams = new URLSearchParams(window.location.search);
      const debugMode = urlParams.get('mode') as InterfaceMode;
      if (debugMode === 'app' || debugMode === 'pc') {
        setInterfaceMode(debugMode);
        return;
      }

      // Check localStorage override (hidden QA feature)
      const savedMode = localStorage.getItem('nuvra-debug-mode') as InterfaceMode;
      if (savedMode === 'app' || savedMode === 'pc') {
        setInterfaceMode(savedMode);
        return;
      }

      // ROBUST AUTOMATIC DETECTION
      
      // 1. PWA Standalone Detection
      const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as any).standalone;
      const isPWAStandalone = isStandalonePWA || isIOSStandalone;
      
      // 2. iPadOS Detection (reports as Mac but has touch)
      const isIpadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
      
      // 3. Touch-first device detection (more reliable than UA)
      const isTouchFirst = window.matchMedia('(pointer: coarse)').matches || 
                          navigator.maxTouchPoints > 0;
      
      // 4. Small viewport detection
      const isSmallViewport = window.matchMedia('(max-width: 900px)').matches;
      
      // 5. No hover capability (typically mobile)
      const noHover = !window.matchMedia('(hover: hover)').matches;
      
      // 6. Screen dimensions
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // DECISION LOGIC: APP mode criteria - AGGRESSIVE MOBILE DETECTION
      let newMode: InterfaceMode = 'pc';
      
      if (isPWAStandalone) {
        // PWA installed = always APP mode
        newMode = 'app';
      } else if (isIpadOS) {
        // iPadOS = APP mode (even though UA says Mac)
        newMode = 'app';
      } else if (screenWidth <= 1024) {
        // Mobile/tablet screens = APP mode (more aggressive)
        newMode = 'app';
      } else if (isTouchFirst) {
        // Any touch device = APP mode
        newMode = 'app';
      } else if (isSmallViewport || noHover) {
        // No hover or small viewport = APP mode
        newMode = 'app';
      }
      // Otherwise: PC mode (desktop browsers, large screens with hover)

      // Update state
      setIsMobile(isTouchFirst && (isSmallViewport || noHover || isIpadOS));
      setIsStandalone(isPWAStandalone);
      setScreenSize({ width: screenWidth, height: screenHeight });

      setInterfaceMode(newMode);

      // Applica classe CSS al body per styling condizionale
      document.body.classList.remove('interface-pc', 'interface-app');
      document.body.classList.add(`interface-${newMode}`);

      // Applica variabili CSS personalizzate
      document.documentElement.style.setProperty('--interface-mode', newMode);
      document.documentElement.style.setProperty('--screen-width', `${screenWidth}px`);
      document.documentElement.style.setProperty('--screen-height', `${screenHeight}px`);
      document.documentElement.style.setProperty('--is-standalone', isPWAStandalone ? '1' : '0');
      document.documentElement.style.setProperty('--is-mobile', (isTouchFirst && (isSmallViewport || noHover || isIpadOS)) ? '1' : '0');

      console.log(`🎯 YCORE Interface: ${newMode.toUpperCase()} | Screen: ${screenWidth}x${screenHeight} | Touch: ${isTouchFirst} | PWA: ${isPWAStandalone} | iPad: ${isIpadOS} | Small: ${isSmallViewport} | NoHover: ${noHover}`);
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

  // Hidden QA debug functions (not exposed in UI)
  const setDebugMode = (mode: InterfaceMode | null) => {
    if (mode) {
      localStorage.setItem('ycore-debug-mode', mode);
    } else {
      localStorage.removeItem('ycore-debug-mode');
    }
    window.location.reload(); // Refresh to apply
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
    __debugSetMode: setDebugMode,
    isPC: interfaceMode === 'pc',
    isApp: interfaceMode === 'app',
    isPWA: isStandalone
  };
}