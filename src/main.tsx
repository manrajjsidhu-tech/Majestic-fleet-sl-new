import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

console.log("[VELVET] Mounting Velvet Chauffeur App root...");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
