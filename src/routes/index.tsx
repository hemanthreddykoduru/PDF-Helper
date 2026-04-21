import { createFileRoute, Link } from "@tanstack/react-router";
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
  Upload,
} from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { useEffect, useState } from "react";
import { getRecent, type RecentEntry } from "@/utils/fileUtils";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Combine, Scissors, Minimize2, RotateCw, Lock, LockOpen, Image: ImageIcon,
  ImageDown, Info, PenLine, ScanText, Type, Hash,
};

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  useEffect(() => setRecent(getRecent()), []);

  // Filter core engines for the grid (Merge, Compress, Split, Protect)
  const coreEngines = TOOLS.filter(t => ["merge", "compress", "split", "encrypt"].includes(t.slug));

  return (
    <div className="mx-auto max-w-lg px-5 py-6 lg:max-w-4xl">
      {/* Premium Hero Card - "Select PDF" */}
      <section className="group relative mb-8 flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[32px] bg-[#1A1A1A] p-8 text-white shadow-xl transition-all active:scale-[0.98]">
        {/* Background Gradient / Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2A2A2A] to-[#121212]" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#E11D48]/10 blur-[80px]" />
        
        <div className="relative flex flex-1 flex-col items-center justify-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm">
            <Upload className="h-8 w-8 text-white/80" />
          </div>
          <h1 className="text-3xl font-black tracking-tight underline decoration-[#E11D48] decoration-4 underline-offset-8">
            Select PDF
          </h1>
          <p className="mt-4 text-[10px] font-bold tracking-widest text-white/40 uppercase">
            Tap to load from device storage
          </p>
        </div>

        {/* Small Action Badge - "Start Session" */}
        <div className="absolute right-6 top-6 rounded-full bg-[#E11D48] px-3 py-1 text-[8px] font-black tracking-wider text-white uppercase shadow-lg">
          Start Session
        </div>
      </section>

      {/* Grid Sections */}
      <div className="space-y-8">
        <section>
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/60 uppercase">
              Core Engines
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {coreEngines.map((tool) => {
              const Icon = iconMap[tool.icon] ?? Combine;
              const iconColors: Record<string, string> = {
                merge: "text-rose-500 bg-rose-500/10",
                compress: "text-amber-500 bg-amber-500/10",
                split: "text-blue-500 bg-blue-500/10",
                encrypt: "text-violet-500 bg-violet-500/10",
              };

              return (
                <Link
                  key={tool.slug}
                  to={tool.path}
                  className="flex flex-col items-center gap-3 rounded-[24px] border border-border/50 bg-surface p-5 text-center shadow-sm transition-all hover:border-primary/50 hover:bg-surface-elevated active:scale-95"
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", iconColors[tool.slug])}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-black tracking-tight">{tool.label}</div>
                    <div className="text-[8px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                      {tool.slug === 'encrypt' ? 'SECURE' : tool.slug === 'merge' ? 'COMBINE' : tool.slug === 'compress' ? 'OPTIMIZE' : 'EXTRACT'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Activity Section (Only if exists) */}
        {recent.length > 0 && (
          <section className="rounded-3xl border border-border/50 bg-surface/50 p-6">
            <h2 className="mb-4 text-[10px] font-black tracking-[0.2em] text-muted-foreground/60 uppercase">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recent.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Combine className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold leading-none">{r.name}</div>
                      <div className="text-[9px] text-muted-foreground mt-1">{r.operation}</div>
                    </div>
                  </div>
                  <div className="text-[9px] text-muted-foreground tabular-nums">
                    {new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
