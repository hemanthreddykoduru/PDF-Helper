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
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-8">
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
          <span className="h-2 w-2 rounded-full bg-[#E11D48]" />
          Dashboard
        </Link>
        <div className="mt-3 px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
          CORE ENGINES
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
                active ? "bg-[#E11D48]/10 text-foreground" : "hover:bg-muted text-foreground/80",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-[#E11D48]" : "text-muted-foreground")} />
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
            Toggle Theme
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border lg:block">
        {SidebarNav}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Banner is NOT sticky to avoid head-on collisions with the header */}
        <PrivacyBanner />
        
        {/* Modern Mobile Header with Safe Area Top */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 pb-4 pt-[calc(1rem+var(--sat))] backdrop-blur-md lg:hidden">
          <Link to="/">
            <Logo className="scale-90 origin-left" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground/80 shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 pb-[calc(6rem+var(--sab))] lg:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation & FAB with Safe Area Bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
          {/* FAB - Adjusted for safe areas */}
          <div className="absolute left-1/2 -top-8 -translate-x-1/2">
            <button 
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E11D48] text-white shadow-[0_8px_20px_-4px_rgba(225,29,72,0.4)] transition-transform active:scale-95"
              aria-label="Action"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          <nav className="flex items-center justify-around border-t border-border bg-background/95 px-4 pb-[calc(0.75rem+var(--sab))] pt-3 backdrop-blur-lg">
            <Link to="/" className={cn("flex flex-col items-center gap-1 transition-colors", location.pathname === "/" ? "text-[#E11D48]" : "text-muted-foreground")}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-tight">Home</span>
            </Link>
            
            <button className="flex flex-col items-center gap-1 text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-tight">Tools</span>
            </button>

            {/* Spacer for FAB */}
            <div className="w-14" />

            <button className="flex flex-col items-center gap-1 text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-tight">History</span>
            </button>

            <button className="flex flex-col items-center gap-1 text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-tight">Settings</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}


