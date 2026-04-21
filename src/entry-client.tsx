import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import { getRouter } from './router'

const router = getRouter()

async function init() {
  const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    console.error("Critical Error: #root element not found!");
    return;
  }

  // Pure SPA Mounting for ALL platforms.
  // This resolves all 'Invariant failed' hydration errors by starting fresh.
  console.log(`Running in ${isCapacitor ? "Capacitor" : "Web"} Mode (SPA Unification)...`);
  
  // Clear any potential hydration flags from old builds
  (window as any).__TSS_START_OPTIONS__ = undefined;
  (window as any).__TANSTACK_ROUTER_HYDRATION__ = undefined;

  await router.load()
  const root = createRoot(rootElement)
  root.render(<RouterProvider router={router} />)
}

init().catch((err) => {
  console.error("Initialization failed:", err);
  if (typeof window !== 'undefined') {
    // Keep internal error logging silent in production unless critical
    console.debug("Init Error details:", err);
  }
});