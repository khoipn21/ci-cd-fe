import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

console.log('[Main] Starting React application...');
console.log('[Main] Environment variables:', {
  NODE_ENV: import.meta.env.MODE,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  BASE_URL: import.meta.env.BASE_URL
});

const rootElement = document.getElementById('root');
console.log('[Main] Root element found:', !!rootElement);

if (!rootElement) {
  console.error('[Main] Root element not found!');
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

console.log('[Main] React app render initiated');
