import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Hash } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { addPageNumbers } from "@/utils/pdfHelpers";
import { downloadBlob, stripExtension, addRecent } from "@/utils/fileUtils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/page-numbers")({
  head: () => ({
    meta: [
      { title: "Add Page Numbers — PaperKnife" },
      { name: "description", content: "Add customizable page numbers to your PDF." },
    ],
  }),
  component: PageNumbersTool,
});

function PageNumbersTool() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<"header" | "footer">("footer");
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [fontSize, setFontSize] = useState(12);
  const [startAt, setStartAt] = useState(1);
  const [format, setFormat] = useState("{n} / {total}");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const bytes = await addPageNumbers(file, { position, align, fontSize, startAt, format });
      const name = `${stripExtension(file.name)}-numbered.pdf`;
      downloadBlob(bytes, name);
      addRecent({ name, size: bytes.byteLength, operation: "Page numbers" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <PageHeader
        title="Page Numbers"
        description="Stamp page numbers into the header or footer."
        icon={<Hash className="h-5 w-5" />}
      />

      {!file && <FileDropzone onFiles={(f) => setFile(f[0])} />}

      {file && (
        <>
          <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <span className="truncate font-medium">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-primary">
              Change
            </button>
          </div>

          <div className="space-y-5 rounded-lg border border-border bg-surface p-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Position</label>
              <div className="flex gap-2">
                {(["header", "footer"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPosition(p)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium capitalize",
                      position === p ? "border-primary bg-primary/10 text-primary" : "border-border",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Alignment</label>
              <div className="flex gap-2">
                {(["left", "center", "right"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAlign(a)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium capitalize",
                      align === a ? "border-primary bg-primary/10 text-primary" : "border-border",
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Font size: {fontSize}</label>
                <input
                  type="range"
                  min={8}
                  max={24}
                  value={fontSize}
                  onChange={(e) => setFontSize(+e.target.value)}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Start at</label>
                <input
                  type="number"
                  min={0}
                  value={startAt}
                  onChange={(e) => setStartAt(+e.target.value)}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Format</label>
              <input
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Use <code className="rounded bg-muted px-1">{"{n}"}</code> for the current page and{" "}
                <code className="rounded bg-muted px-1">{"{total}"}</code> for the page count.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={run} loading={busy}>
                Apply & download
              </Button>
            </div>
          </div>
        </>
      )}
    </ToolPage>
  );
}
