import { Outlet, createRootRoute, HeadContent } from "@tanstack/react-router";
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
    <ThemeProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </ThemeProvider>
  );

  if (isCapacitor) {
    // APK/Capacitor: Direct shell, no wrapping HTML tags
    return content;
  }

  // Web/Vercel: Naked shell for SPA mounting. 
  // We keep the structural tags for SSR shells but remove <Scripts/> 
  // because we are mounting from scratch in entry-client.tsx.
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {content}
      </body>
    </html>
  );
}
