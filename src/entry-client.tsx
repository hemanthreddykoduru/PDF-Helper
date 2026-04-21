import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import { getRouter } from './router'

async function init() {
  const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    console.error("Critical Error: #root element not found!");
    return;
  }

  try {
    console.log("[STEP 1] Fetching Async Singleton Router...");
    // The getRouter function is now async to break circular dependencies
    const router = await getRouter();

    console.log("[STEP 2] Loading Router Routes...");
    // Clear any potential hydration flags that might trigger 'Invariant'
    (window as any).__TSS_START_OPTIONS__ = undefined;
    (window as any).__TANSTACK_ROUTER_HYDRATION__ = undefined;

    await router.load();

    console.log("[STEP 3] Mounting React Root...");
    const root = createRoot(rootElement);
    root.render(<RouterProvider router={router} />);
    
    console.log("[STEP 4] Mount Command Sent Successfully.");
  } catch (err: any) {
    console.error("[FATAL ERROR] Initialization Failed:", err);
    if (typeof window !== 'undefined') {
      alert("App Crash: " + (err.message || "Unknown error") + "\nCheck Console for stack trace.");
    }
  }
}

// Kickoff
console.log("PDF Helper Client Entry Point active.");
init().catch(err => console.error("Global init catch:", err));