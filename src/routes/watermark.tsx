import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Droplet, ChevronLeft, Type } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { ResultScreen } from "@/components/ResultScreen";
import { watermarkPdf } from "@/utils/pdfHelpers"; // Corrected name
import { formatBytes, stripExtension, addRecent } from "@/utils/fileUtils";
import { toast } from "sonner";

export const Route = createFileRoute("/watermark")({
  component: WatermarkTool,
});

function WatermarkTool() {
  const navigate = useNavigate();
  const [fileData, setFileData] = useState<{ file: File; bytes: Uint8Array } | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.4);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ bytes: Uint8Array; name: string } | null>(null);

  const onFiles = async (files: File[]) => {
    if (!files[0]) return;
    const bytes = new Uint8Array(await files[0].arrayBuffer());
    setFileData({ file: files[0], bytes });
  };

  const run = async () => {
    if (!fileData) return;
    setBusy(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Corrected function call and options structure
      const bytes = await watermarkPdf(fileData.file as any, text, { 
        fontSize: 48,
        opacity,
        angle: 45,
        color: { r: 128, g: 128, b: 128 },
        position: "center"
      });
      const name = `${stripExtension(fileData.file.name)}-watermarked.pdf`;
      setResult({ bytes, name });
      await addRecent({ name, size: bytes.byteLength, operation: "Watermark" }, bytes);
      toast.success("Security overlay applied successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Watermark failed: Overlay synthesis error.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFileData(null);
    setResult(null);
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-4 pb-32">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate({ to: "/" })} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-elevated text-foreground/60 active:scale-90 transition-all">
              <ChevronLeft className="h-6 w-6" />
           </button>
           <h1 className="text-xl font-black tracking-tight uppercase">Watermark</h1>
        </div>

        {!result ? (
          <>
            <PageHeader
               title="Watermark PDF"
               description="Apply high-fidelity security overlays to your document."
               icon={<Droplet className="h-5 w-5" />}
            />

            {!fileData && (
              <div className="mt-8">
                <FileDropzone 
                  onFiles={onFiles} 
                  label="Drop PDF to watermark"
                  hint="Files processed locally — privacy guaranteed"
                />
              </div>
            )}

            {fileData && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between rounded-[28px] border border-border/50 bg-surface p-6">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-black tracking-tight">{fileData.file.name}</div>
                    <div className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                      Target Document — {formatBytes(fileData.file.size)}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFileData(null)}>Change</Button>
                </div>

                <div className="space-y-6 rounded-[28px] border border-border bg-surface p-6 sm:p-8 shadow-sm">
                   <h3 className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Overlay Design</h3>
                   
                   <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black tracking-widest text-muted-foreground/80 uppercase">Watermark Text</label>
                      <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. CONFIDENTIAL"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                       <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black tracking-widest text-muted-foreground/80 uppercase">Opacity Intensity</label>
                          <span className="text-[10px] font-black text-primary">{(opacity * 100).toFixed(0)}%</span>
                       </div>
                       <input 
                          type="range" 
                          min="0.1" 
                          max="1.0" 
                          step="0.1" 
                          value={opacity}
                          onChange={(e) => setOpacity(parseFloat(e.target.value))}
                          className="w-full accent-primary"
                       />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button onClick={run} loading={busy} className="w-full h-14 rounded-2xl shadow-lg">
                      Apply Overlay
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <ResultScreen 
             result={result} 
             onReset={reset} 
             operationLabel="Secured Document"
             successMessage="Security Overlay Applied"
          />
        )}
      </div>

       {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative mb-8">
             <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/5 border-t-primary" />
             <Droplet className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase px-6 text-center">Overlay Synthesis</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.3em] text-muted-foreground/40 uppercase">
            Embedding visual watermark locally
          </p>
        </div>
      )}
    </ToolPage>
  );
}
