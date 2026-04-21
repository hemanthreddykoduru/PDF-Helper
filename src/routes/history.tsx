import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { 
  History, 
  Trash2, 
  FileText, 
  Clock, 
  Zap,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  ArrowDownToLine,
  ShieldAlert
} from "lucide-react";
import { getRecent, clearRecent, type RecentEntry } from "@/utils/fileUtils";
import { getFile } from "@/utils/db";
import { saveFileNative } from "@/utils/nativeUtils";
import { ToolPage } from "@/components/PageHeader";
import { Button } from "@/components/PKButton";
import { cn, formatBytes } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  component: ProtocolHistory,
});

function ProtocolHistory() {
  const [history, setHistory] = useState<RecentEntry[]>([]);
  const [query, setQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getRecent());
  }, []);

  const handleDownload = async (item: RecentEntry) => {
    if (!item.fileId) {
       toast.error("Protocol error: Binary stream not found in local cache.");
       return;
    }
    
    setProcessingId(item.fileId);
    try {
      const bytes = await getFile(item.fileId);
      if (bytes) {
         await saveFileNative(bytes, item.name);
         // Toast and Dialog are handled inside saveFileNative
      } else {
         toast.error("Binary stream expired or purged from local hardware.");
      }
    } catch (err) {
      toast.error("Extraction failed: Cache corruption detected.");
    } finally {
      setProcessingId(null);
    }
  };

  const purge = async () => {
    if (confirm("Execute total protocol purge? This cannot be undone.")) {
      await clearRecent();
      setHistory([]);
    }
  };

  const filtered = history.filter(h => 
     h.name.toLowerCase().includes(query.toLowerCase()) ||
     h.operation.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-8 pb-32">
        <header className="mb-10 space-y-6">
           <div className="flex items-start justify-between">
              <div>
                 <h1 className="text-4xl font-black tracking-tight underline decoration-primary decoration-8 underline-offset-[12px]">
                   Protocol Log
                 </h1>
                 <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase mt-4">
                   Session Intelligence • Local Stream
                 </p>
              </div>
              <button 
                onClick={purge}
                disabled={history.length === 0}
                className="h-14 w-14 rounded-[20px] bg-rose-500/10 text-rose-500 flex items-center justify-center active:scale-90 transition-all disabled:opacity-20"
              >
                 <Trash2 className="h-6 w-6" />
              </button>
           </div>

           <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-muted-foreground/30">
                 <Search className="h-5 w-5" />
              </div>
              <input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Query operation stream..."
                className="w-full h-16 rounded-[28px] bg-surface-elevated border border-border/40 pl-14 pr-6 text-sm font-black tracking-tight focus:outline-none placeholder:text-muted-foreground/20"
              />
           </div>
        </header>

        {history.length === 0 ? (
          <div className="py-20 text-center space-y-4">
             <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-border/40 flex items-center justify-center mx-auto text-muted-foreground/20">
                <Clock className="h-10 w-10" />
             </div>
             <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Zero Historical Markers Found</p>
          </div>
        ) : (
          <div className="space-y-4">
             {filtered.map((item, i) => (
               <div 
                 key={i} 
                 className="group relative rounded-[32px] border border-border/40 bg-surface p-5 transition-all hover:bg-surface-elevated active:scale-[0.99] animate-in fade-in slide-in-from-bottom-2"
                 style={{ animationDelay: `${i * 50}ms` }}
               >
                 <div className="absolute right-6 top-6 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                 
                 <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-background border border-border/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                       <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="truncate text-base font-black tracking-tight uppercase leading-tight mb-1">
                          {item.name}
                       </div>
                       <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                             <div className="h-1 w-1 rounded-full bg-primary" />
                             <span className="text-[9px] font-black text-primary uppercase tracking-tighter">{item.operation}</span>
                          </div>
                          <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">•</span>
                          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase">{formatBytes(item.size)}</span>
                          <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">•</span>
                          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">
                             {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleDownload(item)}
                      disabled={processingId !== null}
                      className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground/20 hover:text-primary transition-colors active:scale-90 disabled:opacity-50"
                    >
                       {processingId === item.fileId ? (
                         <Loader2 className="h-5 w-5 animate-spin text-primary" />
                       ) : (
                         <ArrowDownToLine className="h-5 w-5" />
                       )}
                    </button>
                 </div>
               </div>
             ))}
             
             {filtered.length < history.length && filtered.length === 0 && (
               <div className="py-20 text-center">
                  <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">No Protocol Matches Query</p>
               </div>
             )}
          </div>
        )}

        {history.length > 0 && (
           <div className="mt-12 p-8 rounded-[40px] bg-primary/5 border border-primary/10 text-center space-y-3">
              <ShieldAlert className="h-6 w-6 text-primary mx-auto mb-2 opacity-40" />
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Privacy Protocol Active</p>
              <p className="text-[9px] font-bold text-muted-foreground/40 leading-relaxed uppercase">
                All historical data is strictly localized to your hardware cache and never transmitted to the network.
              </p>
           </div>
        )}
      </div>
    </ToolPage>
  );
}
