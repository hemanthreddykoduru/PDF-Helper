import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minimize2, ChevronLeft, Zap } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { ResultScreen } from "@/components/ResultScreen";
import { compressPdf } from "@/utils/pdfHelpers";
import { formatBytes, stripExtension, addRecent } from "@/utils/fileUtils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/compress")({
  component: CompressTool,
});

const LEVELS = [
  { key: "low" as const, label: "Eco", desc: "Lossless optimization." },
  { key: "medium" as const, label: "Medium", desc: "Balanced shrinking." },
  { key: "high" as const, label: "Extreme", desc: "Aggressive downsampling." },
];

function CompressTool() {
  const navigate = useNavigate();
  const [fileData, setFileData] = useState<{ file: File; bytes: Uint8Array } | null>(null);
  const [level, setLevel] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<{ bytes: Uint8Array; name: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const onFiles = async (files: File[]) => {
    if (!files[0]) return;
    const bytes = new Uint8Array(await files[0].arrayBuffer());
    setFileData({ file: files[0], bytes });
  };

  const run = async () => {
    if (!fileData) return;
    setBusy(true);
    setResult(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const bytes = await compressPdf(fileData.bytes as any, level);
      const name = `${stripExtension(fileData.file.name)}-compressed.pdf`;
      
      setResult({ bytes, name });
      
      await addRecent({
        name,
        size: bytes.byteLength,
        operation: `Compress (${level})`,
      }, bytes);
      
      toast.success("Document weight reduced successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Compression failed: Stream density error.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFileData(null);
    setResult(null);
    setLevel("medium");
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-4 pb-32">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate({ to: "/" })} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-elevated text-foreground/60 active:scale-90 transition-all">
              <ChevronLeft className="h-6 w-6" />
           </button>
           <h1 className="text-xl font-black tracking-tight uppercase">Compress PDF</h1>
        </div>

        {!result ? (
          <>
            <PageHeader
              title="Compress PDF"
              description="High-performance local shrinking engine."
              icon={<Minimize2 className="h-5 w-5" />}
            />

            {!fileData && (
              <div className="mt-8">
                <FileDropzone 
                  onFiles={onFiles} 
                  label="Drop PDF to shrink"
                  hint="Files processed locally — privacy guaranteed"
                />
              </div>
            )}

            {fileData && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* File Header */}
                <div className="flex items-center justify-between rounded-[28px] border border-border/50 bg-surface p-6">
                  <div className="min-w-0">
                    <div className="truncate text-base font-black tracking-tight">{fileData.file.name}</div>
                    <div className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                      Current size — {formatBytes(fileData.file.size)}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setFileData(null); setResult(null); }}>
                    Change
                  </Button>
                </div>

                {/* Level Selector */}
                <div className="space-y-4">
                  <h3 className="px-1 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                    Compression Intensity
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {LEVELS.map((l) => (
                      <button
                        key={l.key}
                        onClick={() => setLevel(l.key)}
                        className={cn(
                          "group relative flex flex-col items-start gap-1.5 rounded-[24px] border-2 p-5 text-left transition-all active:scale-[0.98]",
                          level === l.key
                            ? "border-primary bg-primary/5"
                            : "border-border/60 bg-surface hover:border-primary/40",
                        )}
                      >
                        <div className={cn(
                          "text-xs font-black tracking-wide transition-colors",
                          level === l.key ? "text-primary" : "text-foreground"
                        )}>
                          {l.label}
                        </div>
                        <div className="text-[9px] font-bold leading-relaxed text-muted-foreground/60 uppercase">
                          {l.desc}
                        </div>
                        {level === l.key && (
                          <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Button onClick={run} loading={busy} className="w-full h-14 rounded-2xl shadow-lg">
                    <Zap className="mr-2 h-5 w-5" />
                    Optimize Engine
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 fade-in duration-500">
             {/* Comparison Stats */}
             <div className="grid grid-cols-3 gap-4 p-6 rounded-[32px] bg-surface-elevated border border-border/50">
               <div className="text-center space-y-1">
                 <p className="text-[8px] font-black tracking-tighter text-muted-foreground/40 uppercase">Original</p>
                 <p className="text-xs font-black">{formatBytes(fileData!.file.size)}</p>
               </div>
               <div className="text-center space-y-1">
                 <p className="text-[8px] font-black tracking-tighter text-primary uppercase">Optimized</p>
                 <p className="text-xs font-black text-primary">{formatBytes(result.bytes.byteLength)}</p>
               </div>
               <div className="text-center space-y-1">
                 <p className="text-[8px] font-black tracking-tighter text-emerald-500 uppercase">Saving</p>
                 <p className="text-xs font-black text-emerald-500">
                    {Math.max(0, Math.round((1 - result.bytes.byteLength / fileData!.file.size) * 100))}%
                 </p>
               </div>
             </div>

             <ResultScreen 
                result={result} 
                onReset={reset} 
                operationLabel="Optimized Asset"
                successMessage="PDF Density Reduced"
             />
          </div>
        )}
      </div>

      {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative mb-8">
             <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/5 border-t-primary" />
             <Minimize2 className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase">Initializing Shrinkage</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.3em] text-muted-foreground/40 uppercase">
            Recalibrating Document Pixels
          </p>
        </div>
      )}
    </ToolPage>
  );
}
