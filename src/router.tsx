import { createRouter, useRouter, createHashHistory } from "@tanstack/react-router";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">An unexpected error occurred. Please try again.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

// Singleton storage to prevent multiple initialization
let routerInstance: ReturnType<typeof createRouter> | null = null;

export const getRouter = async () => {
  if (routerInstance) return routerInstance;

  // BREAK THE CIRCULAR DEPENDENCY:
  // Dynamically import the routeTree so it's fully loaded before this function runs.
  const { routeTree } = await import("./routeTree.gen");

  const isCapacitor = typeof window !== "undefined" && (window as any).Capacitor;
  const history = typeof window !== "undefined" && isCapacitor ? createHashHistory() : undefined;
  
  if (typeof window !== "undefined") {
    console.log("Initializing Async Singleton Router. Mode:", isCapacitor ? "Capacitor (Hash)" : "Web (Browser)");
  }

  routerInstance = createRouter({
    routeTree,
    history,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return routerInstance;
};

// Types are still safe for the global registration
declare module "@tanstack/react-router" {
  interface Register {
    router: Awaited<ReturnType<typeof getRouter>>;
  }
}
