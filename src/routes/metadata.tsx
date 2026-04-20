import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Info, Eraser } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { getMetadata, saveMetadata } from "@/utils/pdfHelpers";
import { downloadBlob, stripExtension, addRecent } from "@/utils/fileUtils";

export const Route = createFileRoute("/metadata")({
  head: () => ({
    meta: [
      { title: "PDF Metadata Editor — PaperKnife" },
      { name: "description", content: "View, edit or purge PDF metadata in your browser." },
    ],
  }),
  component: MetadataTool,
});

const FIELDS: { key: keyof Meta; label: string; type?: "textarea" }[] = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "subject", label: "Subject" },
  { key: "keywords", label: "Keywords (comma-separated)" },
  { key: "creator", label: "Creator" },
  { key: "producer", label: "Producer" },
];

type Meta = Awaited<ReturnType<typeof getMetadata>>;

function MetadataTool() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return;
    getMetadata(file).then(setMeta).catch(() => setMeta(null));
  }, [file]);

  const save = async (purge = false) => {
    if (!file || !meta) return;
    setBusy(true);
    try {
      const bytes = await saveMetadata(file, meta, purge);
      const suffix = purge ? "purged" : "metadata";
      const name = `${stripExtension(file.name)}-${suffix}.pdf`;
      downloadBlob(bytes, name);
      addRecent({ name, size: bytes.byteLength, operation: purge ? "Purge metadata" : "Edit metadata" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <PageHeader
        title="Metadata Editor"
        description="Inspect a PDF's metadata. Edit any field or one-click purge everything."
        icon={<Info className="h-5 w-5" />}
      />

      {!file && <FileDropzone onFiles={(f) => setFile(f[0])} />}

      {file && meta && (
        <>
          <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <span className="truncate font-medium">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-primary">
              Change
            </button>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-sm font-medium">{f.label}</label>
                <input
                  value={(meta[f.key] as string) ?? ""}
                  onChange={(e) => setMeta({ ...meta, [f.key]: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-muted-foreground">
              <div>
                <div className="font-medium text-foreground">Created</div>
                <div>{meta.creationDate || "—"}</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Modified</div>
                <div>{meta.modificationDate || "—"}</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => save(true)} loading={busy}>
                <Eraser className="h-4 w-4" /> Purge all metadata
              </Button>
              <Button onClick={() => save(false)} loading={busy}>
                Save changes
              </Button>
            </div>
          </div>
        </>
      )}
    </ToolPage>
  );
}
