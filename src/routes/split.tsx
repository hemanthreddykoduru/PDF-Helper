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
  head: () => ({
    meta: [
      { title: "Split PDF — PaperKnife" },
      { name: "description", content: "Extract pages or split a PDF into multiple files locally." },
    ],
  }),
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
      if (!isNaN(a) && !isNaN(b)) for (let i = a; i <= b; i++) next.add(i);
      else if (!isNaN(a)) next.add(a);
    });
    setSelected(next);
  };

  const downloadSelected = async () => {
    if (!file || selected.size === 0) return;
    setBusy(true);
    try {
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
      <PageHeader
        title="Split PDF"
        description="Pick pages visually or by range. Download a single PDF or a ZIP of separate pages."
        icon={<Scissors className="h-5 w-5" />}
      />

      {!file && (
        <FileDropzone
          onFiles={(files) => setFile(files[0])}
          label="Drop a PDF to split"
          hint="Or click to browse"
        />
      )}

      {file && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <span className="truncate font-medium">{file.name}</span>
            <span className="text-muted-foreground">{thumbs.length} pages</span>
            <button
              onClick={() => {
                setFile(null);
                setSelected(new Set());
              }}
              className="ml-auto text-xs text-muted-foreground hover:text-primary"
            >
              Change file
            </button>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              placeholder="e.g. 1-3, 5, 8-10"
              className="h-9 flex-1 min-w-[180px] rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button variant="outline" size="sm" onClick={applyRange}>
              Apply range
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set(thumbs.map((t) => t.page)))}
            >
              Select all
            </Button>
          </div>

          {loading && <div className="py-10 text-center text-muted-foreground">Rendering pages…</div>}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {thumbs.map((t) => {
              const isSel = selected.has(t.page);
              return (
                <button
                  key={t.page}
                  onClick={() => togglePage(t.page)}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border-2 bg-white transition-all",
                    isSel ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50",
                  )}
                >
                  <img src={t.dataUrl} alt={`Page ${t.page}`} className="h-auto w-full" />
                  <div
                    className={cn(
                      "absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                      isSel
                        ? "bg-primary text-primary-foreground"
                        : "bg-black/60 text-white opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {isSel ? <Check className="h-3.5 w-3.5" /> : t.page}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-center text-[11px] font-medium text-white">
                    Page {t.page}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {selected.size > 0 ? `${selected.size} page${selected.size === 1 ? "" : "s"} selected` : "No pages selected"}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={downloadPerPage} loading={busy}>
                Download all as ZIP
              </Button>
              <Button onClick={downloadSelected} loading={busy} disabled={selected.size === 0}>
                Extract {selected.size || ""} page{selected.size === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        </>
      )}
    </ToolPage>
  );
}
