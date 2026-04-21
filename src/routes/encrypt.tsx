import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Info } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { encryptPdf } from "@/utils/pdfHelpers";
import { downloadBlob, stripExtension, addRecent, formatBytes } from "@/utils/fileUtils";

export const Route = createFileRoute("/encrypt")({
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      const bytes = await encryptPdf(file, user, owner || undefined);
      const name = `${stripExtension(file.name)}-protected.pdf`;
      downloadBlob(bytes, name);
      addRecent({ 
        name, 
        size: bytes.byteLength, 
        operation: "Encrypt — Protected" 
      });
    } catch (error) {
      console.error("Encryption failed:", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-6 sm:pt-10">
        <PageHeader
          title="Encrypt PDF"
          description="Initialize a secure on-device cryptographic seal."
          icon={<Lock className="h-5 w-5" />}
        />

        {!file && (
          <div className="mt-8">
            <FileDropzone 
              onFiles={(f) => setFile(f[0])} 
              label="Drop PDF to Encrypt"
              hint="Files processed locally — privacy guaranteed"
            />
          </div>
        )}

        {file && (
          <div className="mt-8 space-y-6">
            {/* File Info Card */}
            <div className="flex items-center justify-between rounded-[28px] border border-border/50 bg-surface p-6">
              <div className="min-w-0">
                <div className="truncate text-base font-black tracking-tight">{file.name}</div>
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                  Source Document — {formatBytes(file.size)}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                Change
              </Button>
            </div>

            {/* Password Credentials */}
            <div className="space-y-6 rounded-[28px] border border-border bg-surface p-6 sm:p-8">
               <h3 className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">
                 Security Credentials
               </h3>
               
               <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black tracking-widest text-muted-foreground/80 uppercase">
                    Client-Side Password
                  </label>
                  <input
                    type="password"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:font-normal placeholder:text-muted-foreground/40"
                    placeholder="Enter opening password"
                  />
                  <p className="text-[8px] font-bold text-muted-foreground/40 uppercase">Required to open and view the file later.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black tracking-widest text-muted-foreground/80 uppercase">
                    Management Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:font-normal placeholder:text-muted-foreground/40"
                    placeholder="Master management key"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-primary/5 p-4 text-[10px] leading-relaxed text-primary/80">
                <Info className="h-5 w-5 shrink-0" />
                <span className="font-bold uppercase tracking-tight">
                  Vault Protocol Active: Your password never touches our servers. 
                  PaperKnife uses high-fidelity local streams for data security.
                </span>
              </div>

              <div className="pt-2">
                <Button onClick={run} loading={busy} disabled={!user} className="w-full">
                  Seal Document
                </Button>
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
             <Lock className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase">Shielding Engine</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.25em] text-muted-foreground/40 uppercase">
            Encrypting streams locally
          </p>
        </div>
      )}
    </ToolPage>
  );
}
