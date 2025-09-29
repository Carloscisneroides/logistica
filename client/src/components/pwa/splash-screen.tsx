import { useEffect, useState } from "react";
import { NyvraLogo } from "@/components/branding/nyvra-logo";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/constants";

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if splash was already shown in this session
    const splashShown = sessionStorage.getItem('nyvra-splash-shown');
    
    if (splashShown) {
      setShow(false);
      return;
    }

    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('nyvra-splash-shown', '1');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="splash-screen" data-testid="splash-screen">
      <div className="splash-logo">
        <NyvraLogo size="xl" variant="full" />
      </div>
      <p className="splash-subtitle">{BRAND_TAGLINE}</p>
    </div>
  );
}