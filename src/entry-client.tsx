import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import { getRouter } from './router'

if (typeof window !== 'undefined') {
  console.log("Forcing Pure SPA context...");
  // Clear any hydration flags that trigger Invariant Errors in TanStack Start
  (window as any).__TSS_START_OPTIONS__ = undefined;
  (window as any).__TANSTACK_ROUTER_HYDRATION__ = undefined;
}

const router = getRouter()

async function init() {
  const rootElement = document.getElementById('root')
  console.log("Root element found:", !!rootElement);

  if (rootElement) {
    console.log("Starting router load...");
    await router.load()
    console.log("Router load completed");
    
    const root = createRoot(rootElement)
    root.render(<RouterProvider router={router} />)
    console.log("React mount completed");
  } else {
    console.error("Critical Error: #root element not found!");
  }
}

init().catch((err) => {
  console.error("Initialization failed:", err);
  if (typeof window !== 'undefined') {
    alert("Init Error: " + (err.message || String(err)) + "\nStack: " + (err.stack || "none").slice(0, 100));
  }
});
