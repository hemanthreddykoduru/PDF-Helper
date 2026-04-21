import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/AppShell";
import "../styles.css";

// Minimal NotFound component
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const isCapacitor = typeof window !== "undefined" && (window as any).Capacitor;

  const content = (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppShell>
        <Outlet />
      </AppShell>
    </ThemeProvider>
  );

  if (isCapacitor) {
    // APK/Capacitor: Direct shell
    return content;
  }

  // Web/Vercel/Start: Full HTML shell with hydration scripts
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <HeadContent />
      </head>
      <body>
        <div id="root">
          {content}
        </div>
        <Scripts />
      </body>
    </html>
  );
}
