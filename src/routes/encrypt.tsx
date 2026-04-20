import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Info } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { encryptPdf } from "@/utils/pdfHelpers";
import { downloadBlob, stripExtension, addRecent } from "@/utils/fileUtils";

export const Route = createFileRoute("/encrypt")({
  head: () => ({
    meta: [
      { title: "Encrypt PDF — PaperKnife" },
      { name: "description", content: "Password-protect a PDF in your browser." },
    ],
  }),
  component: EncryptTool,
});

function EncryptTool() {
  const [file, setFile] = useState<File | null>(null);
  const [user, setUser] = useState("");
  const [owner, setOwner] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!file || !user) return;
    setBusy(true);
    try {
      const bytes = await encryptPdf(file, user, owner || undefined);
      const name = `${stripExtension(file.name)}-protected.pdf`;
      downloadBlob(bytes, name);
      addRecent({ name, size: bytes.byteLength, operation: "Encrypt" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <PageHeader
        title="Encrypt PDF"
        description="Add password protection to a PDF. Everything stays in your browser."
        icon={<Lock className="h-5 w-5" />}
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

          <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
            <div>
              <label className="mb-1 block text-sm font-medium">User password</label>
              <input
                type="password"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Required"
              />
              <p className="mt-1 text-xs text-muted-foreground">Needed to open the PDF.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Owner password (optional)</label>
              <input
                type="password"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Restricts printing/editing"
              />
            </div>
            <div className="flex items-start gap-2 rounded-md bg-background/50 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                PaperKnife uses a pure-JavaScript pipeline. True AES-256 encryption requires a
                desktop tool — for maximum-strength protection, pair this with a system-level
                encrypted container.
              </span>
            </div>
            <div className="flex justify-end">
              <Button onClick={run} loading={busy} disabled={!user}>
                Protect & download
              </Button>
            </div>
          </div>
        </>
      )}
    </ToolPage>
  );
}
