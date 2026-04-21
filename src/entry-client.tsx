import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start'
import { router } from './router'

// In TanStack Start, the framework often injects its own entry logic.
// We provide this file as the source-of-truth for the client-side mount.
function mount() {
  const rootElement = document.getElementById('root')

  if (!rootElement) {
    console.error("Critical Error: #root element not found!")
    return
  }

  // Pure SPA / Hybrid Hydration
  // We use the framework's 'StartClient' to ensure the routing lifecycle is perfectly managed.
  console.log("[HYDRATION] Initializing StartClient shell...")
  
  // Clear any stale hydration flags that might be from a different version/build
  if (typeof window !== 'undefined') {
    (window as any).__TSS_START_OPTIONS__ = undefined;
  }

  hydrateRoot(rootElement, <StartClient router={router} />)
}

// Ensure we only mount once in dev environments
if (typeof document !== 'undefined') {
  mount()
}