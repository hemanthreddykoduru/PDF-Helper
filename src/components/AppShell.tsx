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
} from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { Logo } from "@/components/Logo";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { useUpdateCheck } from "@/hooks/useUpdateCheck";

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

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Automated Update Engine
  useUpdateCheck();

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
          <span className="h-2 w-2 rounded-full bg-primary" />
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
                active ? "bg-primary/10 text-foreground" : "hover:bg-muted text-foreground/80",
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
      <div className="border-t border-sidebar-border p-4">
        <div className="flex flex-col gap-3">
          <button
            onClick={toggle}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Toggle Theme
          </button>
          
          <a 
            href="https://github.com/hemanthreddykoduru" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-2 py-1 text-[9px] font-black tracking-[0.2em] text-muted-foreground/40 uppercase hover:text-primary transition-colors"
          >
            Created by hemanthreddykoduru
          </a>
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

        <main className="flex-1 pb-[calc(5rem+var(--sab))] lg:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Hub — Optimized for Samsung S21 FE (Safe Areas) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
          <div className="absolute inset-x-0 bottom-0 top-0 bg-background/80 backdrop-blur-xl border-t border-border/40" />
          
          <nav className="relative flex items-center justify-around px-2 pb-[var(--sab)] pt-2 h-[calc(4.5rem+var(--sab))]">
            <Link 
              to="/" 
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all active:scale-90",
                location.pathname === "/" ? "text-primary" : "text-muted-foreground/40"
              )}
            >
              <svg viewBox="0 0 24 24" fill={location.pathname === "/" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-tight">Home</span>
            </Link>
            
            <Link 
              to="/tools" 
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all active:scale-90",
                location.pathname === "/tools" ? "text-primary" : "text-muted-foreground/40"
              )}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-tight">Tools</span>
            </Link>

            <div className="relative -top-3">
               <Link to="/tools" className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary text-white shadow-[0_8px_20px_-4px_rgba(0,128,254,0.4)] transition-all active:scale-95 active:rotate-45">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
               </Link>
            </div>

            <Link 
              to="/history" 
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all active:scale-90",
                location.pathname === "/history" ? "text-primary" : "text-muted-foreground/40"
              )}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-tight">History</span>
            </Link>

            <Link 
              to="/settings" 
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all active:scale-90",
                location.pathname === "/settings" ? "text-primary" : "text-muted-foreground/40"
              )}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-tight">Settings</span>
            </Link>
          </nav>
          
          <div className="absolute top-[100%] left-0 w-full flex justify-center pt-2">
             <a 
              href="https://github.com/hemanthreddykoduru" 
              className="text-[7px] font-black tracking-widest text-muted-foreground/20 uppercase"
             >
                Created by hemanthreddykoduru
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}
