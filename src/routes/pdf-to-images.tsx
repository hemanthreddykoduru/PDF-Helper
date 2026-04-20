import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ImageDown, Download } from "lucide-react";
import JSZip from "jszip";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { useThumbnails } from "@/hooks/useThumbnails";
import { renderPagesToPngs } from "@/utils/pdfHelpers";
import { downloadBlob, stripExtension, addRecent } from "@/utils/fileUtils";

export const Route = createFileRoute("/pdf-to-images")({
  head: () => ({
    meta: [
      { title: "PDF to Images — PaperKnife" },
      { name: "description", content: "Export every PDF page as a PNG image." },
    ],
  }),
  component: PdfToImages,
});

function PdfToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const { thumbs, loading } = useThumbnails(file, 260);

  const downloadOne = async (pageIdx: number) => {
    if (!file) return;
    setBusy(true);
    try {
      const pngs = await renderPagesToPngs(file, 2);
      const bytes = pngs[pageIdx];
      const name = `${stripExtension(file.name)}-page-${pageIdx + 1}.png`;
      downloadBlob(bytes, name, "image/png");
    } finally {
      setBusy(false);
    }
  };

  const downloadAll = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const pngs = await renderPagesToPngs(file, 2);
      const zip = new JSZip();
      pngs.forEach((b, i) => zip.file(`page-${i + 1}.png`, b));
      const blob = await zip.generateAsync({ type: "blob" });
      const name = `${stripExtension(file.name)}-pages.zip`;
      downloadBlob(blob, name, "application/zip");
      addRecent({ name, size: blob.size, operation: "PDF → Images" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <PageHeader
        title="PDF to Images"
        description="Render each PDF page as a PNG. Download individually or as a ZIP."
        icon={<ImageDown className="h-5 w-5" />}
      />

      {!file && <FileDropzone onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <span className="truncate font-medium">{file.name}</span>
            <span className="text-muted-foreground">{thumbs.length} pages</span>
            <div className="ml-auto flex gap-2">
              <Button size="sm" onClick={downloadAll} loading={busy} disabled={!thumbs.length}>
                <Download className="h-4 w-4" /> Download all (ZIP)
              </Button>
              <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-primary">
                Change
              </button>
            </div>
          </div>

          {loading && <div className="py-10 text-center text-muted-foreground">Rendering pages…</div>}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {thumbs.map((t, i) => (
              <div key={t.page} className="overflow-hidden rounded-lg border border-border bg-white">
                <img src={t.dataUrl} alt={`Page ${t.page}`} className="block w-full" />
                <div className="flex items-center justify-between border-t border-border bg-surface px-2 py-1.5">
                  <span className="text-xs font-medium">Page {t.page}</span>
                  <button
                    onClick={() => downloadOne(i)}
                    disabled={busy}
                    className="rounded p-1 text-primary hover:bg-muted disabled:opacity-50"
                    aria-label={`Download page ${t.page}`}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolPage>
  );
}
