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
  FileText,
  ShieldCheck,
  Zap,
  Smartphone,
  Download
} from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { useEffect, useState } from "react";
import { getRecent, type RecentEntry } from "@/utils/fileUtils";
import { cn, formatBytes } from "@/lib/utils";
import { ToolPage } from "@/components/PageHeader";
import { Capacitor } from "@capacitor/core";

const iconMap: Record<string, any> = {
  Combine, Scissors, Minimize2, RotateCw, Lock, LockOpen, Image: ImageIcon,
  ImageDown, Info, PenLine, ScanText, Type, Hash,
};

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  useEffect(() => setRecent(getRecent()), []);

  const coreEngines = TOOLS.filter(t => ["merge", "compress", "split", "encrypt"].includes(t.slug));

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-4 pb-24 space-y-10">
        {/* Elite Hero Protocol */}
         <Link 
           to="/tools"
           className="group relative pt-12 block"
         >
            <div className="absolute inset-0 -top-20 -z-10 overflow-hidden pointer-events-none">
               <div className="absolute top-0 right-0 h-[300px] w-[300px] bg-primary/10 blur-[100px] rounded-full opacity-50" />
            </div>
 
            <div className="relative overflow-hidden rounded-[40px] bg-surface-elevated border border-border/40 p-1 shadow-2xl transition-all active:scale-[0.98]">
               <div className="bg-background/40 backdrop-blur-md rounded-[38px] p-8 text-center flex flex-col items-center justify-center min-h-[300px] border border-white/5">
                  <div className="mb-6 relative">
                     <div className="h-20 w-20 rounded-[32px] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Upload className="h-9 w-9" />
                     </div>
                     <div className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-background">
                        <Zap className="h-4 w-4 fill-white" />
                     </div>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight underline decoration-primary decoration-8 underline-offset-[12px] mb-8">
                    Select PDF
                  </h1>
                  <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase">
                     Protocol V1.2.4 • On-Device Engine
                  </p>
               </div>
               
               <div className="absolute right-8 top-8 px-4 py-1.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-xl">
                  Secure Session
               </div>
            </div>
         </Link>

        {/* Primary Core Engines */}
        <section className="space-y-4">
           <h2 className="px-1 text-[10px] font-black tracking-[0.25em] text-muted-foreground/50 uppercase">
             Core Engines
           </h2>
           <div className="grid grid-cols-2 gap-4">
              {coreEngines.map((tool) => {
                const Icon = iconMap[tool.icon] ?? Combine;
                return (
                  <Link
                    key={tool.slug}
                    to={tool.path}
                    className="group relative flex flex-col items-center justify-center gap-4 rounded-[32px] border border-border/40 bg-surface p-6 transition-all hover:bg-surface-elevated active:scale-95 shadow-sm overflow-hidden"
                  >
                    <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-primary/5 p-2 transition-transform group-hover:scale-125 opacity-20">
                       <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>

                    <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="text-center">
                      <div className="text-base font-black tracking-tight">{tool.label}</div>
                      <div className="text-[8px] font-black tracking-widest text-[#E11D48] opacity-40 uppercase mt-1">
                        Secure Engine
                      </div>
                    </div>
                  </Link>
                );
              })}
           </div>
        </section>

        {/* Mobile App Promotion — Only visible on Web */}
        {!Capacitor.isNativePlatform() && (
          <section className="relative overflow-hidden rounded-[40px] bg-primary p-8 text-white shadow-2xl">
             <div className="absolute right-0 top-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
             <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="h-16 w-16 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center">
                   <Smartphone className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black tracking-tight">PDF Helper Mobile</h3>
                   <p className="text-xs font-bold text-white/60 tracking-wider uppercase">V46 Master Build • Android</p>
                </div>
                <a 
                  href="/pdf-helper.apk" 
                  download
                  className="w-full flex items-center justify-center gap-3 bg-white text-primary rounded-2xl h-16 font-black tracking-tight hover:bg-white/90 active:scale-[0.98] transition-all text-base shadow-lg"
                >
                   <Download className="h-5 w-5" />
                   Download Master APK
                </a>
             </div>
          </section>
        )}

        {/* Protocol Activity Stream */}
        {recent.length > 0 && (
          <section className="space-y-5 pb-8">
             <div className="flex items-center justify-between px-1">
               <h2 className="text-[10px] font-black tracking-[0.3em] text-muted-foreground/50 uppercase">Recent Activity</h2>
               <Link to="/history" className="text-[10px] font-black text-primary uppercase tracking-widest">Protocol Log</Link>
             </div>

             <div className="space-y-3">
               {recent.slice(0, 4).map((r, i) => (
                 <div key={i} className="group relative rounded-[28px] border border-border/40 bg-surface p-5 transition-all hover:bg-surface-elevated active:scale-[0.99] shadow-sm">
                   {/* SECURE TAG */}
                   <div className="absolute right-5 top-5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">VERIFIED</span>
                   </div>

                   <div className="flex items-center gap-4">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background border border-border/10 text-primary/40 group-hover:text-primary transition-colors">
                       <FileText className="h-5 w-5" />
                     </div>
                     <div className="flex-1 min-w-0 pr-16">
                       <div className="truncate text-sm font-black tracking-tight uppercase leading-tight">{r.name}</div>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black tracking-widest text-primary uppercase">{r.operation}</span>
                          <span className="text-[9px] font-bold text-muted-foreground/20 uppercase">/</span>
                          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">{formatBytes(r.size)}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </section>
        )}
      </div>
    </ToolPage>
  );
}
