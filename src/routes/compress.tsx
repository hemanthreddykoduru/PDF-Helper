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
  head: () => ({
    meta: [
      { title: "Compress PDF — PaperKnife" },
      { name: "description", content: "Reduce PDF size locally with three compression levels." },
    ],
  }),
  component: CompressTool,
});

const LEVELS = [
  { key: "low" as const, label: "Low", desc: "Lossless optimization. Best for text PDFs." },
  { key: "medium" as const, label: "Medium", desc: "Good balance. Downsamples images." },
  { key: "high" as const, label: "High", desc: "Aggressive. Rasterizes pages." },
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
      const bytes = await compressPdf(file, level);
      setResult({ bytes, size: bytes.byteLength });
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!file || !result) return;
    const name = `${stripExtension(file.name)}-compressed.pdf`;
    downloadBlob(result.bytes, name);
    addRecent({ name, size: result.size, operation: `Compress ${level}` });
  };

  return (
    <ToolPage>
      <PageHeader
        title="Compress PDF"
        description="Shrink PDFs directly in your browser. No quality data is sent anywhere."
        icon={<Minimize2 className="h-5 w-5" />}
      />

      {!file && <FileDropzone onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <div className="mb-5 rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">Original: {formatBytes(file.size)}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setResult(null); }}>
                Change
              </Button>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {LEVELS.map((l) => (
              <button
                key={l.key}
                onClick={() => setLevel(l.key)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  level === l.key
                    ? "border-primary bg-primary/5"
                    : "border-border bg-surface hover:border-primary/50",
                )}
              >
                <div className="font-medium">{l.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{l.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={run} loading={busy}>
              Compress
            </Button>
          </div>

          {result && (
            <div className="mt-6 rounded-lg border border-border bg-surface p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Original</div>
                  <div className="text-lg font-semibold">{formatBytes(file.size)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Compressed</div>
                  <div className="text-lg font-semibold">{formatBytes(result.size)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Saved</div>
                  <div className="text-lg font-semibold text-primary">
                    {result.size < file.size
                      ? `${Math.round((1 - result.size / file.size) * 100)}%`
                      : "0%"}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-center">
                <Button onClick={save}>Download compressed PDF</Button>
              </div>
            </div>
          )}
        </>
      )}
    </ToolPage>
  );
}
