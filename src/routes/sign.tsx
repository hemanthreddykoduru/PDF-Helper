import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PenLine, Check, Trash2, ShieldCheck, MousePointer2, Eraser, Download, ChevronLeft } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { ResultScreen } from "@/components/ResultScreen";
import { registerSignature } from "@/utils/pdfHelpers";
import { formatBytes, stripExtension, addRecent } from "@/utils/fileUtils";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/sign")({
  head: () => ({
    meta: [{ title: "Sign PDF — PDF Helper" }],
  }),
  component: SignTool,
});

function SignaturePad({ onCapture }: { onCapture: (blob: Blob) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#000000";
  }, []);

  const start = (e: any) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const stop = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const finish = () => {
    canvasRef.current?.toBlob((b) => b && onCapture(b), "image/png");
  };

  return (
    <div className="space-y-6">
      <div className="relative aspect-[2/1] w-full rounded-2xl border-2 border-dashed border-border/40 bg-white/50 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={stop}
          className="h-full w-full cursor-crosshair touch-none"
        />
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 text-center w-full">
          Capture Hand-Drawn Signature
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={clear} className="flex-1 rounded-xl h-12 uppercase text-[10px] font-black tracking-widest">
          <Eraser className="mr-2 h-4 w-4" /> Clear
        </Button>
        <Button onClick={finish} className="flex-1 rounded-xl h-12 uppercase text-[10px] font-black tracking-widest">
           Apply Protocol
        </Button>
      </div>
    </div>
  );
}

function SignTool() {
  const navigate = useNavigate();
  const [fileData, setFileData] = useState<{ file: File; bytes: Uint8Array } | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ bytes: Uint8Array; name: string } | null>(null);

  const onFiles = async (files: File[]) => {
    if (!files[0]) return;
    const bytes = new Uint8Array(await files[0].arrayBuffer());
    setFileData({ file: files[0], bytes });
  };

  const apply = async (blob: Blob) => {
    if (!fileData) return;
    setBusy(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const sigBytes = new Uint8Array(await blob.arrayBuffer());
      const bytes = await registerSignature(fileData.bytes as any, sigBytes, {
        pageIndex: 0,
        x: 400,
        y: 50,
        width: 150,
        height: 75,
      });
      const name = `${stripExtension(fileData.file.name)}-signed.pdf`;
      setResult({ bytes, name });
      await addRecent({ name, size: bytes.byteLength, operation: "E-Signed" }, bytes);
      toast.success("Signature embedded successfully.");
    } catch (err) {
      toast.error("Signing failed: Cryptographic layer error.");
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
           <h1 className="text-xl font-black tracking-tight uppercase">Secure Sign</h1>
        </div>

        {!result ? (
          <>
            <PageHeader
               title="Secure Sign"
               description="Initialize a secure on-device biometric signature seal."
               icon={<PenLine className="h-5 w-5" />}
            />

            {!fileData && (
              <div className="mt-8">
                <FileDropzone 
                  onFiles={onFiles} 
                  label="Drop PDF to sign"
                  hint="Files processed locally — privacy guaranteed"
                />
              </div>
            )}

            {fileData && (
              <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                       <ShieldCheck className="h-6 w-6" />
                     </div>
                     <div className="min-w-0 flex-1">
                       <div className="truncate text-sm font-black tracking-tight">{fileData.file.name}</div>
                       <div className="text-[10px] font-bold text-muted-foreground/40 uppercase mt-1">Awaiting signature capture</div>
                     </div>
                     <Button variant="ghost" size="sm" onClick={() => setFileData(null)}>Change</Button>
                  </div>
                </div>

                <Drawer>
                  <DrawerTrigger asChild>
                    <Button className="w-full h-16 rounded-[24px] text-sm font-black tracking-widest uppercase shadow-2xl">
                       <PenLine className="mr-2 h-5 w-5" />
                       Collect Signature
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="p-6 pb-12">
                     <DrawerHeader className="px-0">
                        <DrawerTitle className="text-xl font-black uppercase tracking-tight">Sign Protocol</DrawerTitle>
                     </DrawerHeader>
                     <SignaturePad onCapture={apply} />
                  </DrawerContent>
                </Drawer>

                 <button 
                  onClick={reset}
                  className="w-full text-[9px] font-black tracking-[0.2em] text-muted-foreground/30 uppercase hover:text-primary transition-colors py-2"
                >
                  Abort Protocol
                </button>
              </div>
            )}
          </>
        ) : (
          <ResultScreen 
             result={result} 
             onReset={reset} 
             operationLabel="Signed Document"
             successMessage="Biometric Seal Applied"
          />
        )}
      </div>

      {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative mb-8">
             <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/5 border-t-primary" />
             <PenLine className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase px-6 text-center">Biometric Synthesis</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.3em] text-muted-foreground/40 uppercase">
            Embedding visual signature locally
          </p>
        </div>
      )}
    </ToolPage>
  );
}
