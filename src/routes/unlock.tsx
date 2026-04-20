import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LockOpen } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { removePasswordFallback } from "@/utils/pdfHelpers";
import { downloadBlob, stripExtension, addRecent } from "@/utils/fileUtils";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Unlock PDF — PaperKnife" },
      { name: "description", content: "Remove the password from a protected PDF locally." },
    ],
  }),
  component: UnlockTool,
});

function UnlockTool() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!file || !password) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await removePasswordFallback(file, password);
      const name = `${stripExtension(file.name)}-unlocked.pdf`;
      downloadBlob(bytes, name);
      addRecent({ name, size: bytes.byteLength, operation: "Unlock" });
    } catch (e: any) {
      setError(e?.message ?? "Could not unlock with that password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <PageHeader
        title="Unlock PDF"
        description="Enter the password to remove protection and save a clean copy."
        icon={<LockOpen className="h-5 w-5" />}
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
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter the user password"
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <div className="flex justify-end">
              <Button onClick={run} loading={busy} disabled={!password}>
                Unlock & download
              </Button>
            </div>
          </div>
        </>
      )}
    </ToolPage>
  );
}
