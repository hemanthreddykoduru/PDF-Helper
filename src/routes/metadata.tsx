import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Info, FileText, ChevronLeft, Save } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { ResultScreen } from "@/components/ResultScreen";
import { saveMetadata } from "@/utils/pdfHelpers"; // Corrected name
import { formatBytes, stripExtension, addRecent } from "@/utils/fileUtils";
import { toast } from "sonner";

export const Route = createFileRoute("/metadata")({
  component: MetadataTool,
});

function MetadataTool() {
  const navigate = useNavigate();
  const [fileData, setFileData] = useState<{ file: File; bytes: Uint8Array } | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
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
      await new Promise((resolve) => setTimeout(resolve, 800));
      const bytes = await saveMetadata(fileData.file as any, {
        title: title || undefined,
        author: author || undefined,
        subject: subject || undefined,
        keywords: keywords || undefined,
      });
      const name = `${stripExtension(fileData.file.name)}-meta.pdf`;
      setResult({ bytes, name });
      await addRecent({ name, size: bytes.byteLength, operation: "Edit Metadata" }, bytes);
      toast.success("Document identity updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Metadata injection failed: Stream integrity error.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFileData(null);
    setResult(null);
    setTitle("");
    setAuthor("");
    setSubject("");
    setKeywords("");
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-4 pb-32">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate({ to: "/" })} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-elevated text-foreground/60 active:scale-90 transition-all">
              <ChevronLeft className="h-6 w-6" />
           </button>
           <h1 className="text-xl font-black tracking-tight uppercase">Edit Metadata</h1>
        </div>

        {!result ? (
          <>
            <PageHeader
               title="Edit Metadata"
               description="Inject custom descriptive properties into your PDF."
               icon={<Info className="h-5 w-5" />}
            />

            {!fileData && (
              <div className="mt-8">
                <FileDropzone 
                  onFiles={onFiles} 
                  label="Drop PDF to edit metadata"
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
                   <h3 className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Identity Matrix</h3>
                   
                   <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black tracking-widest text-muted-foreground/80 uppercase">Document Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:font-normal placeholder:text-muted-foreground/40"
                        placeholder="Internal protocol name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black tracking-widest text-muted-foreground/80 uppercase">Author / Organization</label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:font-normal placeholder:text-muted-foreground/40"
                        placeholder="Data originator"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black tracking-widest text-muted-foreground/80 uppercase">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:font-normal placeholder:text-muted-foreground/40"
                        placeholder="Stream categorization"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black tracking-widest text-muted-foreground/80 uppercase">Keywords</label>
                      <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:font-normal placeholder:text-muted-foreground/40"
                        placeholder="Discovery tags (comma separated)"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button onClick={run} loading={busy} className="w-full h-14 rounded-2xl shadow-lg">
                      <Save className="mr-2 h-5 w-5" />
                      Inject Metadata
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
             operationLabel="Identified Asset"
             successMessage="Metadata Injected Successfully"
          />
        )}
      </div>

       {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative mb-8">
             <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/5 border-t-primary" />
             <FileText className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase">Protocol Update</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.3em] text-muted-foreground/40 uppercase">
            Rewriting document headers
          </p>
        </div>
      )}
    </ToolPage>
  );
}
