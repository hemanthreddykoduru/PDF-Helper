import { RouterProvider } from '@tanstack/react-router'
import { StartClient } from '@tanstack/react-start'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { getRouter } from './router'

const router = getRouter()

async function init() {
  const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    console.error("Critical Error: #root element not found!");
    return;
  }

  if (isCapacitor) {
    console.log("Running in Capacitor Mode (SPA)...");
    
    // Clear any hydration flags to ensure a fresh SPA start
    (window as any).__TSS_START_OPTIONS__ = undefined;
    (window as any).__TANSTACK_ROUTER_HYDRATION__ = undefined;

    await router.load()
    const root = createRoot(rootElement)
    root.render(<RouterProvider router={router} />)
  } else {
    // Standard Web/Vercel Mode
    console.log("Running in Web Mode (Standard Hydration)...");
    hydrateRoot(rootElement, <StartClient router={router} />)
  }
}

init().catch((err) => {
  console.error("Initialization failed:", err);
  if (typeof window !== 'undefined') {
    alert("Init Error: " + (err.message || String(err)));
  }
});