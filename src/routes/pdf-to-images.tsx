import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Download, FileText, ChevronLeft, Zap, ImageIcon, Archive } from "lucide-react";
import JSZip from "jszip";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { ResultScreen } from "@/components/ResultScreen";
import { renderPagesToPngs } from "@/utils/pdfHelpers"; // Corrected name
import { formatBytes, stripExtension, addRecent } from "@/utils/fileUtils";
import { toast } from "sonner";

export const Route = createFileRoute("/pdf-to-images")({
  component: PdfToImagesTool,
});

function PdfToImagesTool() {
  const navigate = useNavigate();
  const [fileData, setFileData] = useState<{ file: File; bytes: Uint8Array } | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ bytes: Blob; name: string } | null>(null);

  const onFiles = async (files: File[]) => {
    if (!files[0]) return;
    const bytes = new Uint8Array(await files[0].arrayBuffer());
    setFileData({ file: files[0], bytes });
  };

  const run = async () => {
    if (!fileData) return;
    setBusy(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const images = await renderPagesToPngs(fileData.file as any); // Corrected function call
      const zip = new JSZip();
      
      images.forEach((imgBytes, i) => {
        zip.file(`page-${i + 1}.png`, imgBytes);
      });
      
      const blob = await zip.generateAsync({ type: "blob" });
      const name = `${stripExtension(fileData.file.name)}-images.zip`;
      
      setResult({ bytes: blob, name });
      
      await addRecent({
        name,
        size: blob.size,
        operation: "PDF → Images",
      });
      
      toast.success("Document fragmentation complete: ZIP ready.");
    } catch (err) {
      console.error(err);
      toast.error("Process failed: Image synthesis error.");
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
           <h1 className="text-xl font-black tracking-tight uppercase">PDF → Images</h1>
        </div>

        {!result ? (
          <>
            <PageHeader
               title="PDF → Images"
               description="Convert document layers into high-fidelity image sequences."
               icon={<ImageIcon className="h-5 w-5" />}
            />

            {!fileData && (
              <div className="mt-8">
                <FileDropzone 
                  onFiles={onFiles} 
                  label="Drop PDF to Transform"
                  hint="Export all pages as PNG images in a ZIP"
                />
              </div>
            )}

            {fileData && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between rounded-[28px] border border-border/50 bg-surface p-6">
                  <div className="min-w-0 flex-1 flex items-center gap-4">
                     <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                        <FileText className="h-5 w-5" />
                     </div>
                     <div className="min-w-0">
                       <div className="truncate text-sm font-black tracking-tight">{fileData.file.name}</div>
                       <div className="text-[10px] font-bold text-muted-foreground/40 uppercase">{formatBytes(fileData.file.size)}</div>
                     </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFileData(null)}>Change</Button>
                </div>

                <div className="pt-4">
                  <Button onClick={run} loading={busy} className="w-full h-16 rounded-[24px] text-sm font-black tracking-widest shadow-2xl">
                    <Zap className="mr-2 h-5 w-5" />
                    Transform to Images
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <ResultScreen 
             result={result} 
             onReset={reset} 
             operationLabel="Visual Asset Bundle"
             successMessage="Transformation Complete"
          />
        )}
      </div>

       {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative mb-8">
             <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/5 border-t-primary" />
             <ImageIcon className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase px-6 text-center">Visual Synthesis</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.3em] text-muted-foreground/40 uppercase">
            Rendering document layers locally
          </p>
        </div>
      )}
    </ToolPage>
  );
}
