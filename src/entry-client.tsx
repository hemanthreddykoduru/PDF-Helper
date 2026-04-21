import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import { router } from './router'

function mount() {
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    console.error("Critical Error: #root element not found!")
    return
  }

  // Pure SPA Mounting (No Hydration)
  // Since we have migrated back to a standard Single Page Application (SPA),
  // we use createRoot for a clean, stable initial render.
  // This solves the 'Invariant failed' hydration mismatch by starting fresh.
  console.log("[SPA] Mounting App Shell...")
  
  if (typeof window !== 'undefined') {
    // Purge any stale framework flags
    (window as any).__TSS_START_OPTIONS__ = undefined;
    (window as any).__TANSTACK_ROUTER_HYDRATION__ = undefined;
  }

  const root = createRoot(rootElement)
  root.render(<RouterProvider router={router} />)
}

if (typeof document !== 'undefined') {
  mount()
}