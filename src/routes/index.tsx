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
    <div className="mx-auto max-w-lg px-4 py-4 lg:max-w-4xl lg:px-8 lg:py-12">
      {/* Premium Hero Card - "Select PDF" */}
      <section className="group relative mb-6 flex min-h-[220px] sm:min-h-[280px] flex-col justify-end overflow-hidden rounded-[32px] bg-[#1A1A1A] p-6 sm:p-8 text-white shadow-xl transition-all active:scale-[0.98]">
        {/* Background Gradient / Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2A2A2A] to-[#121212]" />
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#E11D48]/10 blur-[80px]" />
        
        <div className="relative flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm sm:h-16 sm:w-16">
            <Upload className="h-7 w-7 text-white/80 sm:h-8 sm:w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight underline decoration-[#E11D48] decoration-4 underline-offset-[10px] sm:text-3xl">
            Select PDF
          </h1>
          <p className="mt-5 text-[9px] font-bold tracking-[.15em] text-white/30 uppercase sm:text-[10px]">
            Tap to load from device storage
          </p>
        </div>

        {/* Small Action Badge - "Start Session" */}
        <div className="absolute right-5 top-5 rounded-full bg-[#E11D48] px-2.5 py-1 text-[7px] font-black tracking-wider text-white uppercase shadow-lg sm:px-3 sm:text-[8px]">
          Start Session
        </div>
      </section>

      {/* Grid Sections */}
      <div className="space-y-6">
        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[9px] font-black tracking-[0.25em] text-muted-foreground/50 uppercase sm:text-[10px]">
              Core Engines
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                  className="flex flex-col items-center gap-3 rounded-[28px] border border-border/40 bg-surface p-4 text-center shadow-sm transition-all hover:border-primary/50 hover:bg-surface-elevated active:scale-95 sm:p-6"
                >
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-[14px] sm:h-12 sm:w-12", iconColors[tool.slug])}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-black tracking-tight sm:text-sm">{tool.label}</div>
                    <div className="text-[7px] font-bold tracking-widest text-muted-foreground/40 uppercase sm:text-[8px]">
                      {tool.slug === 'encrypt' ? 'SECURE' : tool.slug === 'merge' ? 'COMBINE' : tool.slug === 'compress' ? 'OPTIMIZE' : 'EXTRACT'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Activity Section */}
        {recent.length > 0 && (
          <section className="space-y-4">
             <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-[9px] font-black tracking-[0.25em] text-muted-foreground/50 uppercase sm:text-[10px]">
                Recent Sessions
              </h2>
            </div>
            
            <div className="space-y-3">
              {recent.slice(0, 4).map((r, i) => (
                <div key={i} className="group flex items-center gap-4 rounded-[24px] border border-border/40 bg-surface/40 p-4 transition-all hover:bg-surface-elevated active:scale-[0.99]">
                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary/60 transition-colors group-hover:bg-primary/10">
                     <FileText className="h-4 w-4" />
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <div className="truncate text-sm font-black tracking-tight">{r.name}</div>
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-[9px] font-black tracking-widest text-[#E11D48] uppercase">{r.operation}</span>
                        <span className="text-[9px] font-bold text-muted-foreground/30 uppercase">•</span>
                       <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">{formatBytes(r.size)}</span>
                     </div>
                   </div>

                   <div className="text-[9px] font-black tracking-tighter text-muted-foreground/30 tabular-nums uppercase">
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
