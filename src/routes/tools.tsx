import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Search, 
  Combine, 
  Scissors, 
  Minimize2, 
  RotateCw, 
  Lock, 
  Image as ImageIcon, 
  ImageDown, 
  Info, 
  PenLine, 
  ScanText, 
  Type, 
  Hash,
  ChevronRight,
  ShieldCheck,
  Zap,
  Settings2
} from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { ToolPage } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  Combine, Scissors, Minimize2, RotateCw, Lock, Image: ImageIcon,
  ImageDown, Info, PenLine, ScanText, Type, Hash,
};

export const Route = createFileRoute("/tools")({
  component: ToolsDirectory,
});

function ToolsDirectory() {
  const [query, setQuery] = useState("");

  const filtered = TOOLS.filter(t => 
    t.label.toLowerCase().includes(query.toLowerCase()) ||
    t.desc.toLowerCase().includes(query.toLowerCase())
  );

  const categories = [
    { name: "Evolution", tools: filtered.filter(t => ["merge", "split", "organize"].includes(t.slug)) },
    { name: "Synthesis", tools: filtered.filter(t => ["image-to-pdf", "pdf-to-images", "ocr"].includes(t.slug)) },
    { name: "Injection", tools: filtered.filter(t => ["page-numbers", "watermark", "sign", "metadata"].includes(t.slug)) },
    { name: "Core", tools: filtered.filter(t => ["compress", "encrypt", "unlock"].includes(t.slug)) },
  ];

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-8 pb-32">
        <header className="mb-10 space-y-6">
           <div>
              <h1 className="text-4xl font-black tracking-tight underline decoration-primary decoration-8 underline-offset-[12px]">
                Engine Hub
              </h1>
              <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase mt-4">
                Protocol V1.2.4 • Distributed Intelligence
              </p>
           </div>

           {/* Precision Search */}
           <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                 <Search className="h-5 w-5" />
              </div>
              <input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search Protocol Engine..."
                className="w-full h-16 rounded-[28px] bg-surface-elevated border border-border/40 pl-14 pr-6 text-sm font-black tracking-tight focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/20"
              />
           </div>
        </header>

        <div className="space-y-12">
           {categories.map((cat, i) => cat.tools.length > 0 && (
             <section key={i} className="space-y-5 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-3 px-1">
                   <Settings2 className="h-3 w-3 text-primary/40" />
                   <h2 className="text-[10px] font-black tracking-[0.4em] text-muted-foreground/40 uppercase">{cat.name} Protocols</h2>
                </div>
                
                <div className="grid gap-3">
                   {cat.tools.map(tool => {
                     const Icon = iconMap[tool.icon] ?? Combine;
                     return (
                       <Link
                         key={tool.slug}
                         to={tool.path}
                         className="group flex items-center gap-5 p-5 rounded-[32px] border border-border/40 bg-surface hover:bg-surface-elevated transition-all active:scale-[0.98] shadow-sm"
                       >
                         <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                            <Icon className="h-7 w-7" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="text-base font-black tracking-tight uppercase leading-tight">{tool.label}</div>
                            <div className="text-[10px] font-bold text-muted-foreground/30 mt-1 line-clamp-1">{tool.desc}</div>
                         </div>
                         <div className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground/20 group-hover:text-primary transition-colors">
                            <ChevronRight className="h-5 w-5" />
                         </div>
                       </Link>
                     )
                   })}
                </div>
             </section>
           ))}
        </div>
      </div>
    </ToolPage>
  );
}
