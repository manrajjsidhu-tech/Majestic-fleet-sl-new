import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

console.log("[VELVET] Mounting Velvet Chauffeur App root...");

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
