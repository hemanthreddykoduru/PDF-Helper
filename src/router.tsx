import { createRouter, useRouter, createHashHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

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

// Environment Detection
const isCapacitor = typeof window !== "undefined" && (window as any).Capacitor;
const history = typeof window !== "undefined" && isCapacitor ? createHashHistory() : undefined;

// We export a fixed singleton 'router' instance at the top-level.
// This is the standard TanStack protocol and prevents most 'Invariant failed' errors.
export const router = createRouter({
  routeTree,
  history,
  basepath: "/", // Force absolute root for both platforms
  context: {},
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: DefaultErrorComponent,
});

// Retro-compatibility with our entry point logic
export const getRouter = () => router;

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
