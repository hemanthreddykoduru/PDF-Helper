import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minimize2 } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { compressPdf } from "@/utils/pdfHelpers";
import { downloadBlob, formatBytes, stripExtension, addRecent } from "@/utils/fileUtils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compress")({
  component: CompressTool,
});

const LEVELS = [
  { key: "low" as const, label: "Eco", desc: "Lossless optimization." },
  { key: "medium" as const, label: "Medium", desc: "Balanced shrinking." },
  { key: "high" as const, label: "Extreme", desc: "Aggressive downsampling." },
];

function CompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<{ bytes: Uint8Array; size: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const bytes = await compressPdf(file, level);
      setResult({ bytes, size: bytes.byteLength });
      addRecent({ 
        name: `${stripExtension(file.name)}-compressed.pdf`, 
        size: bytes.byteLength, 
        operation: `Compress (${level})` 
      });
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!file || !result) return;
    const name = `${stripExtension(file.name)}-compressed.pdf`;
    downloadBlob(result.bytes, name);
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-6 sm:pt-10">
        <PageHeader
          title="Compress PDF"
          description="High-performance local shrinking engine."
          icon={<Minimize2 className="h-5 w-5" />}
        />

        {!file && (
          <div className="mt-8">
            <FileDropzone 
              onFiles={(f) => setFile(f[0])} 
              label="Drop PDF to shrink"
              hint="Files processed locally — privacy guaranteed"
            />
          </div>
        )}

        {file && (
          <div className="mt-8 space-y-6">
            {/* File Header */}
            <div className="flex items-center justify-between rounded-[28px] border border-border/50 bg-surface p-6">
              <div className="min-w-0">
                <div className="truncate text-base font-black tracking-tight">{file.name}</div>
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                  Current size — {formatBytes(file.size)}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setResult(null); }}>
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
                        ? "border-[#E11D48] bg-[#E11D48]/5"
                        : "border-border/60 bg-surface hover:border-primary/40",
                    )}
                  >
                    <div className={cn(
                      "text-xs font-black tracking-wide transition-colors",
                      level === l.key ? "text-[#E11D48]" : "text-foreground"
                    )}>
                      {l.label}
                    </div>
                    <div className="text-[9px] font-bold leading-relaxed text-muted-foreground/60 uppercase">
                      {l.desc}
                    </div>
                    {level === l.key && (
                      <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#E11D48] animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Button onClick={run} loading={busy} className="w-full">
                Optimize Engine
              </Button>
            </div>

            {result && (
              <div className="mt-8 rounded-[32px] border border-border bg-[#1A1A1A] p-8 text-white shadow-xl animate-in slide-in-from-bottom-5">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold tracking-widest text-white/30 uppercase">Original</div>
                    <div className="text-sm font-black">{formatBytes(file.size)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold tracking-widest text-white/30 uppercase">Compressed</div>
                    <div className="text-sm font-black text-rose-400">{formatBytes(result.size)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold tracking-widest text-white/30 uppercase">Economy</div>
                    <div className="text-sm font-black text-emerald-400">
                      {result.size < file.size
                        ? `${Math.round((1 - result.size / file.size) * 100)}%`
                        : "0%"}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button onClick={save} className="w-full bg-white text-black hover:bg-white/90">
                    Download Compressed PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Processing Overlay */}
      {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative mb-6">
             <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary/10 border-t-primary" />
             <Minimize2 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase">Initializing Shrinkage</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.25em] text-muted-foreground/40 uppercase">
            Recalibrating Document Pixels
          </p>
        </div>
      )}
    </ToolPage>
  );
}

