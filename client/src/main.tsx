import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Force PWA update v2.1.0 - Clear cache mobile
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('🚀 SW v2.1.0 registered - FORCE UPDATE!');
        
        // Force immediate update check
        registration.addEventListener('updatefound', () => {
          console.log('🔄 SW Update found - Refreshing...');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                console.log('✅ SW Updated - FORCE REFRESH');
                window.location.reload();
              }
            });
          }
        });
        
        // Check for updates every 5 seconds
        setInterval(() => {
          registration.update();
        }, 5000);
      })
      .catch((error) => {
        console.log('SW registration failed: ', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
