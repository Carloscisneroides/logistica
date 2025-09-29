import { useEffect, useState } from "react";
import nuvraLogo from "@assets/Copilot_20250928_191905_1759079989814.png";

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if splash was already shown in this session
    const splashShown = sessionStorage.getItem('nuvra-splash-shown');
    
    if (splashShown) {
      setShow(false);
      return;
    }

    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('nuvra-splash-shown', '1');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="splash-screen" data-testid="splash-screen">
      <img 
        src={nuvraLogo} 
        alt="Nuvra Logo" 
        className="splash-logo"
      />
      <h1 className="splash-title">Nuvra</h1>
      <p className="splash-subtitle">Logistics & E-commerce Platform</p>
    </div>
  );
}