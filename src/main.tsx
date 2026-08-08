import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { getApiUrl } from './services/api';
import './index.css';

console.log("[VELVET] Mounting Velvet Chauffeur App root...");

// Auto-load Google Maps JavaScript SDK if API Key is configured
fetch(getApiUrl("/api/config/maps-key"))
  .then((res) => res.json())
  .then(({ apiKey }) => {
    if (apiKey && !(window as any).google?.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      console.log("[VELVET] Dynamically injected Google Maps Platform JavaScript SDK.");
    }
  })
  .catch((err) => console.warn("[VELVET] Could not check Google Maps config:", err));

// Suppress cross-origin "Script error." in preview iframe environment
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.' || event.message === 'Script error') {
    event.preventDefault();
    console.warn('[VELVET] Handled cross-origin script error silently:', event);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('[VELVET] Handled unhandled promise rejection:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
