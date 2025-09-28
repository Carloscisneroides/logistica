import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// PWA v2.2.0 - FIX MENU SOVRAPPOSTI
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // UNREGISTER ALL SERVICE WORKERS FIRST
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        console.log('🗑️ Unregistering old SW...');
        registration.unregister();
      });
      
      // CLEAR ALL STORAGES
      if ('localStorage' in window) {
        localStorage.clear();
      }
      if ('sessionStorage' in window) {
        sessionStorage.clear();
      }
      
      // REGISTER NEW CLEAN SW
      setTimeout(() => {
        navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
          .then((registration) => {
            console.log('🚀 SW v2.2.0 CLEAN registered!');
          })
          .catch((error) => {
            console.log('SW registration failed: ', error);
          });
      }, 1000);
    });
    
    // Listen for hard refresh messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'HARD_REFRESH') {
        console.log('🔄 HARD REFRESH received - Clearing all');
        
        // Clear all storages
        if (event.data.clearStorage) {
          localStorage.clear();
          sessionStorage.clear();
          
          // Clear IndexedDB if exists
          if ('indexedDB' in window) {
            indexedDB.databases().then(databases => {
              databases.forEach(db => {
                if (db.name) indexedDB.deleteDatabase(db.name);
              });
            }).catch(() => {});
          }
        }
        
        if (event.data.reloadPage) {
          setTimeout(() => {
            window.location.reload(true);
          }, 500);
        }
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
