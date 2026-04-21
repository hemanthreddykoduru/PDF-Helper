import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ScanText, Copy, Download, FileText, ChevronLeft, Zap } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { ResultScreen } from "@/components/ResultScreen";
import { ocrPdf, ocrImage } from "@/utils/ocrUtils";
import { formatBytes, stripExtension, addRecent } from "@/utils/fileUtils";
import { toast } from "sonner";

export const Route = createFileRoute("/ocr")({
  head: () => ({
    meta: [
      { title: "OCR PDF — PDF Helper" },
      { name: "description", content: "Extract text from scanned PDFs and images, in your browser." },
    ],
  }),
  component: OcrTool,
});

function OcrTool() {
  const navigate = useNavigate();
  const [fileData, setFileData] = useState<{ file: File; bytes: Uint8Array } | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<{ bytes: Blob; name: string } | null>(null);

  const onFiles = async (files: File[]) => {
    if (!files[0]) return;
    const bytes = new Uint8Array(await files[0].arrayBuffer());
    setFileData({ file: files[0], bytes });
  };

  const run = async () => {
    if (!fileData) return;
    setBusy(true);
    setText("");
    setProgress(0);
    setStatus("Loading language model…");
    try {
      let extracted = "";
      if (fileData.file.type === "application/pdf" || fileData.file.name.toLowerCase().endsWith(".pdf")) {
        extracted = await ocrPdf(fileData.bytes, (p, page, total) => {
          setProgress(p);
          setStatus(`Recognized page ${page} of ${total}`);
        });
      } else {
        const blob = new Blob([fileData.bytes], { type: fileData.file.type });
        const url = URL.createObjectURL(blob);
        try {
          extracted = await ocrImage(url, (p) => {
            setProgress(p);
            setStatus("Recognizing text…");
          });
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      setText(extracted);
      const blob = new Blob([extracted], { type: "text/plain" });
      const name = `${stripExtension(fileData.file.name)}.txt`;
      
      setResult({ bytes: blob, name });
      
      await addRecent({
        name,
        size: blob.size,
        operation: "OCR",
      });
      
      toast.success("Text recognized successfully.");
    } catch (e: any) {
      setStatus(`Error: ${e?.message ?? "OCR failed"}`);
      toast.error("OCR failure: Recognition engine error.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFileData(null);
    setText("");
    setResult(null);
    setProgress(0);
    setStatus("");
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-4 pb-32">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate({ to: "/" })} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-elevated text-foreground/60 active:scale-90 transition-all">
              <ChevronLeft className="h-6 w-6" />
           </button>
           <h1 className="text-xl font-black tracking-tight uppercase">OCR Engine</h1>
        </div>

        {!result ? (
          <>
            <PageHeader
              title="OCR — Text Extraction"
              description="High-fidelity on-device optical character recognition."
              icon={<ScanText className="h-5 w-5" />}
            />

            {!fileData && (
              <div className="mt-8">
                <FileDropzone
                  accept={{ "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                  onFiles={onFiles}
                  label="Drop PDF or Image"
                  hint="First run downloads ~10MB language model"
                />
              </div>
            )}

            {fileData && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between rounded-[28px] border border-border bg-surface p-6">
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

                {!busy ? (
                  <div className="pt-4">
                    <Button onClick={run} className="w-full h-16 rounded-[24px] text-sm font-black tracking-widest shadow-2xl">
                      <Zap className="mr-2 h-5 w-5" />
                      Initialize Recognition
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6 p-8 rounded-[32px] border border-border bg-surface-elevated">
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase px-1">
                          <span>{status}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <ProgressBar value={progress} />
                     </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 fade-in duration-500">
             <div className="rounded-[32px] border border-border bg-surface p-1 shadow-sm overflow-hidden">
                <textarea
                  readOnly
                  value={text}
                  className="scrollbar-thin h-60 w-full resize-none bg-background p-6 font-mono text-[11px] leading-relaxed focus:outline-none rounded-[28px]"
                  placeholder="No text recovered."
                />
                <div className="p-4 bg-surface flex justify-end">
                   <Button variant="ghost" size="sm" onClick={() => {
                      navigator.clipboard.writeText(text);
                      toast.success("Text copied to clipboard.");
                   }}>
                      <Copy className="h-4 w-4 mr-2" /> Copy Text
                   </Button>
                </div>
             </div>

             <ResultScreen 
                result={result} 
                onReset={reset} 
                operationLabel="Extracted Text Protocol"
                successMessage="Recognition Complete"
             />
          </div>
        )}
      </div>
    </ToolPage>
  );
}
