import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Scissors, Check } from "lucide-react";
import JSZip from "jszip";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { useThumbnails } from "@/hooks/useThumbnails";
import { extractPages, splitToIndividualPages } from "@/utils/pdfHelpers";
import { downloadBlob, stripExtension, addRecent } from "@/utils/fileUtils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/split")({
  component: SplitTool,
});

function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState("");
  const [busy, setBusy] = useState(false);
  const { thumbs, loading } = useThumbnails(file);

  const togglePage = (p: number) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });

  const applyRange = () => {
    if (!rangeInput.trim()) return;
    const next = new Set<number>();
    rangeInput.split(",").forEach((part) => {
      const [a, b] = part.trim().split("-").map((n) => parseInt(n, 10));
      if (!isNaN(a) && !isNaN(b)) for (let i = Math.max(1, a); i <= Math.min(thumbs.length, b); i++) next.add(i);
      else if (!isNaN(a) && a >= 1 && a <= thumbs.length) next.add(a);
    });
    setSelected(next);
  };

  const downloadSelected = async () => {
    if (!file || selected.size === 0) return;
    setBusy(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const indices = [...selected].sort((a, b) => a - b).map((p) => p - 1);
      const bytes = await extractPages(file, indices);
      const name = `${stripExtension(file.name)}-extract.pdf`;
      downloadBlob(bytes, name);
      addRecent({ name, size: bytes.byteLength, operation: "Split — extract" });
    } finally {
      setBusy(false);
    }
  };

  const downloadPerPage = async () => {
    if (!file) return;
    setBusy(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pages = await splitToIndividualPages(file);
      const zip = new JSZip();
      pages.forEach((p) => zip.file(p.name, p.bytes));
      const blob = await zip.generateAsync({ type: "blob" });
      const name = `${stripExtension(file.name)}-pages.zip`;
      downloadBlob(blob, name, "application/zip");
      addRecent({ name, size: blob.size, operation: "Split — per page" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-4xl px-5 pt-6 sm:pt-10">
        <PageHeader
          title="Split PDF"
          description="Precision extraction from any PDF archive."
          icon={<Scissors className="h-5 w-5" />}
        />

        {!file && (
          <div className="mt-8">
            <FileDropzone
              onFiles={(files) => setFile(files[0])}
              label="Drop PDF to split"
              hint="Extract pages visually or by range"
            />
          </div>
        )}

        {file && (
          <div className="mt-8 space-y-6">
            {/* File Info Card */}
            <div className="flex flex-col gap-4 rounded-[28px] border border-border/50 bg-surface p-6 sm:flex-row sm:items-center">
               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                 <Check className={cn("h-6 w-6 transition-transform", selected.size > 0 && "scale-110")} />
               </div>
               <div className="flex-1 min-w-0">
                 <div className="truncate text-base font-black tracking-tight">{file.name}</div>
                 <div className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                    Source Document — {thumbs.length} pages
                 </div>
               </div>
               <Button variant="ghost" size="sm" onClick={() => { setFile(null); setSelected(new Set()); }}>
                 Change File
               </Button>
            </div>

            {/* Split Options */}
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                   <h3 className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                    Visual Page Selection ({selected.size})
                  </h3>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                       Clear
                     </Button>
                     <Button variant="ghost" size="sm" onClick={() => setSelected(new Set(thumbs.map((t) => t.page)))}>
                       All
                     </Button>
                  </div>
                </div>

                {loading ? (
                   <div className="flex flex-col items-center justify-center py-20 text-center">
                     <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                     <div className="text-[10px] font-black tracking-widest text-muted-foreground/40 uppercase">
                       Rendering Previews
                     </div>
                   </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {thumbs.map((t) => {
                      const isSel = selected.has(t.page);
                      return (
                        <button
                          key={t.page}
                          onClick={() => togglePage(t.page)}
                          className={cn(
                            "group relative aspect-[3/4] overflow-hidden rounded-[20px] border-2 bg-white transition-all active:scale-[0.98]",
                            isSel ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border/60 hover:border-primary/40",
                          )}
                        >
                          <img src={t.dataUrl} alt={`Page ${t.page}`} className="h-full w-full object-cover" />
                          <div
                            className={cn(
                              "absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black shadow-sm transition-all transition-all duration-300",
                              isSel
                                ? "bg-primary text-white scale-110"
                                : "bg-black/40 text-white group-hover:bg-primary/80 group-hover:scale-105",
                            )}
                          >
                            {isSel ? <Check className="h-4 w-4" /> : t.page}
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-center">
                            <span className="text-[9px] font-black tracking-wider text-white uppercase">Page {t.page}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Controls */}
              <div className="space-y-6">
                 <div className="rounded-[28px] border border-border/50 bg-surface p-6 space-y-4">
                    <h4 className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                      Precision Range
                    </h4>
                    <div className="space-y-3">
                      <input
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        placeholder="e.g. 1-3, 5, 8-10"
                        className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:font-normal placeholder:text-muted-foreground/40"
                      />
                      <Button variant="secondary" className="w-full" size="sm" onClick={applyRange}>
                        Inject Range
                      </Button>
                    </div>
                 </div>

                 <div className="rounded-[28px] border border-border/50 bg-surface p-6 space-y-4">
                    <h4 className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                      Extraction Mode
                    </h4>
                    <div className="space-y-3">
                      <Button 
                        onClick={downloadSelected} 
                        loading={busy} 
                        disabled={selected.size === 0}
                        className="w-full"
                      >
                        Extract Pages
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={downloadPerPage} 
                        loading={busy} 
                        className="w-full"
                      >
                        Split to ZIP
                      </Button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Overlay */}
      {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative mb-6">
             <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary/10 border-t-primary" />
             <Scissors className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase">Compiling Page Streams</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.25em] text-muted-foreground/40 uppercase">
            Executing Precision Cuts locally
          </p>
        </div>
      )}
    </ToolPage>
  );
}

