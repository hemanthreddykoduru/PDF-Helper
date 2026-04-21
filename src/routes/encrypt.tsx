import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Lock, 
  Info, 
  ChevronLeft,
  ShieldAlert
} from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { ResultScreen } from "@/components/ResultScreen";
import { encryptPdf } from "@/utils/pdfHelpers";
import { formatBytes, stripExtension, addRecent } from "@/utils/fileUtils";
import { toast } from "sonner";

export const Route = createFileRoute("/encrypt")({
  component: EncryptTool,
});

function EncryptTool() {
  const navigate = useNavigate();
  const [fileData, setFileData] = useState<{ file: File; bytes: Uint8Array } | null>(null);
  const [result, setResult] = useState<{ bytes: Uint8Array; name: string } | null>(null);
  const [user, setUser] = useState("");
  const [owner, setOwner] = useState("");
  const [busy, setBusy] = useState(false);

  const onFiles = async (files: File[]) => {
    if (!files[0]) return;
    const bytes = new Uint8Array(await files[0].arrayBuffer());
    setFileData({ file: files[0], bytes });
  };

  const run = async () => {
    if (!fileData || !user) return;
    setBusy(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const bytes = await encryptPdf(fileData.bytes as any, user, owner || undefined);
      const name = `${stripExtension(fileData.file.name)}-protected.pdf`;
      
      setResult({ bytes, name });
      
      await addRecent({ 
        name, 
        size: bytes.byteLength, 
        operation: "Encrypt — Protected" 
      }, bytes);
      
      toast.success("Cryptographic seal applied successfully.");
    } catch (error) {
      console.error("Encryption failed:", error);
      toast.error("Encryption failure: Local stream interrupted.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFileData(null);
    setResult(null);
    setUser("");
    setOwner("");
  };

  return (
    <ToolPage>
      <div className="mx-auto max-w-2xl px-5 pt-4 pb-32">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate({ to: "/" })} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-elevated text-foreground/60 active:scale-90 transition-all">
              <ChevronLeft className="h-6 w-6" />
           </button>
           <h1 className="text-xl font-black tracking-tight uppercase">Protect PDF</h1>
        </div>

        {!result ? (
          <>
            <PageHeader
              title="Encrypt PDF"
              description="Initialize a secure on-device cryptographic seal."
              icon={<Lock className="h-5 w-5" />}
            />

            {!fileData && (
              <div className="mt-8">
                <FileDropzone 
                  onFiles={onFiles} 
                  label="Drop PDF to Encrypt"
                  hint="Files processed locally — privacy guaranteed"
                />
              </div>
            )}

            {fileData && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between rounded-[28px] border border-border/50 bg-surface p-6">
                  <div className="min-w-0">
                    <div className="truncate text-base font-black tracking-tight">{fileData.file.name}</div>
                    <div className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                      Source Document — {formatBytes(fileData.file.size)}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFileData(null)}>
                    Change
                  </Button>
                </div>

                <div className="space-y-6 rounded-[28px] border border-border bg-surface p-6 sm:p-8 shadow-sm">
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
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:font-normal placeholder:text-muted-foreground/40"
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
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:font-normal placeholder:text-muted-foreground/40"
                        placeholder="Master management key"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl bg-destructive/5 p-5 text-[10px] leading-relaxed text-destructive/80 border border-destructive/10">
                    <Info className="h-5 w-5 shrink-0" />
                    <span className="font-bold uppercase tracking-tight">
                      Vault Protocol Active: Your password never touches our servers. 
                      PDF Helper uses high-fidelity local streams for data security.
                    </span>
                  </div>

                  <div className="pt-2">
                    <Button onClick={run} loading={busy} disabled={!user} className="w-full h-14 rounded-2xl shadow-lg">
                      Seal Document
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8">
            <ResultScreen 
              result={result} 
              onReset={reset} 
              operationLabel="Protected Document"
              successMessage="Encrypted Successfully"
            />
            <div className="p-6 rounded-[28px] bg-amber-500/5 border border-amber-500/10 text-amber-500 flex items-start gap-4">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold leading-relaxed uppercase">
                PDF Helper cannot recover forgotten passwords. Please ensure you have documented your management key securely.
              </p>
            </div>
          </div>
        )}
      </div>

      {busy && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative mb-8">
             <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/5 border-t-primary" />
             <Lock className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase px-6 text-center">Shielding Engine</h2>
          <p className="mt-2 text-[10px] font-black tracking-[.3em] text-muted-foreground/40 uppercase">
            Encrypting streams locally
          </p>
        </div>
      )}
    </ToolPage>
  );
}
