import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Combine,
  Scissors,
  Minimize2,
  RotateCw,
  Lock,
  LockOpen,
  Image as ImageIcon,
  ImageDown,
  Info,
  PenLine,
  ScanText,
  Type,
  Hash,
  Menu,
  X,
  Sun,
  Moon,
  ShieldCheck,
  Keyboard,
} from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { Logo } from "@/components/Logo";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Combine,
  Scissors,
  Minimize2,
  RotateCw,
  Lock,
  LockOpen,
  Image: ImageIcon,
  ImageDown,
  Info,
  PenLine,
  ScanText,
  Type,
  Hash,
};

function PrivacyBanner() {
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    setDismissed(localStorage.getItem("pk-privacy-dismissed") === "1");
  }, []);
  if (dismissed) return null;
  return (
    <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2 text-xs text-muted-foreground">
      <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
      <span className="flex-1 leading-relaxed">
        All processing happens 100% in your browser. No files are uploaded. No tracking. No ads.
      </span>
      <button
        onClick={() => {
          localStorage.setItem("pk-privacy-dismissed", "1");
          setDismissed(true);
        }}
        className="rounded p-1 hover:bg-muted"
        aria-label="Dismiss privacy notice"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable)
        return;
      const key = e.key.toUpperCase();
      const tool = TOOLS.find((t) => t.shortcut === key);
      if (tool) {
        e.preventDefault();
        navigate({ to: tool.path });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const SidebarNav = (
    <nav className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded p-1 hover:bg-muted lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-2 py-3">
        <Link
          to="/"
          className={cn(
            "mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
            location.pathname === "/" && "bg-muted font-medium",
          )}
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
          Home
        </Link>
        <div className="mt-3 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tools
        </div>
        {TOOLS.map((tool) => {
          const Icon = iconMap[tool.icon] ?? Combine;
          const active = location.pathname === tool.path;
          return (
            <Link
              key={tool.slug}
              to={tool.path}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-primary/15 text-foreground" : "hover:bg-muted text-foreground/80",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
              <span className="flex-1">{tool.label}</span>
              <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground group-hover:inline-block">
                {tool.shortcut}
              </kbd>
            </Link>
          );
        })}
      </div>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={toggle}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Keyboard className="h-3 w-3" /> Press a key to switch tool
          </span>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border lg:block">
        {SidebarNav}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border">
            {SidebarNav}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <PrivacyBanner />
        <header className="flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded p-1.5 hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
        </header>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
