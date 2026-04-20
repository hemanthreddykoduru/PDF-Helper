import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PenLine, Eraser } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { SignatureCanvas, type SignatureCanvasHandle } from "@/components/SignatureCanvas";
import { useThumbnails } from "@/hooks/useThumbnails";
import { signPdf } from "@/utils/pdfHelpers";
import { downloadBlob, stripExtension, addRecent } from "@/utils/fileUtils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sign")({
  head: () => ({
    meta: [
      { title: "Sign PDF — PaperKnife" },
      { name: "description", content: "Draw or type a signature and place it on a PDF." },
    ],
  }),
  component: SignTool,
});

const FONTS = [
  { label: "Cursive", css: "'Dancing Script', 'Brush Script MT', cursive" },
  { label: "Elegant", css: "'Pinyon Script', 'Great Vibes', cursive" },
  { label: "Bold", css: "'Georgia', serif" },
  { label: "Modern", css: "Inter, sans-serif" },
];

function SignTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("");
  const [fontIdx, setFontIdx] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<SignatureCanvasHandle>(null);
  const { thumbs } = useThumbnails(file, 240);

  const signatureBytes = (): Uint8Array | null => {
    if (mode === "draw") return canvasRef.current?.toPng() ?? null;
    // Render typed signature to canvas
    if (!typed.trim()) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f1117";
    ctx.font = `64px ${FONTS[fontIdx].css}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typed, canvas.width / 2, canvas.height / 2);
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  };

  const save = async () => {
    if (!file) return;
    const sig = signatureBytes();
    if (!sig) return;
    setBusy(true);
    try {
      // Place bottom-right on the chosen page
      const bytes = await signPdf(file, sig, {
        pageIndex: pageIdx,
        x: 360,
        y: 60,
        width: 180,
        height: 60,
      });
      const name = `${stripExtension(file.name)}-signed.pdf`;
      downloadBlob(bytes, name);
      addRecent({ name, size: bytes.byteLength, operation: "Sign" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <PageHeader
        title="Sign PDF"
        description="Draw your signature or type it, then place it on a page."
        icon={<PenLine className="h-5 w-5" />}
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

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex gap-2">
                {(["draw", "type"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium",
                      mode === m
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    {m === "draw" ? "Draw" : "Type"}
                  </button>
                ))}
              </div>

              {mode === "draw" ? (
                <>
                  <SignatureCanvas ref={canvasRef} />
                  <div className="mt-2 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => canvasRef.current?.clear()}>
                      <Eraser className="h-4 w-4" /> Clear
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder="Your name"
                    className="h-12 w-full rounded-md border border-border bg-background px-3 text-center text-2xl focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ fontFamily: FONTS[fontIdx].css }}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {FONTS.map((f, i) => (
                      <button
                        key={f.label}
                        onClick={() => setFontIdx(i)}
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-xs",
                          fontIdx === i
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50",
                        )}
                        style={{ fontFamily: f.css }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-2 text-sm font-medium">Place on page</div>
              <div className="scrollbar-thin max-h-80 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {thumbs.map((t, i) => (
                    <button
                      key={t.page}
                      onClick={() => setPageIdx(i)}
                      className={cn(
                        "overflow-hidden rounded-md border-2 bg-white",
                        pageIdx === i ? "border-primary" : "border-border hover:border-primary/50",
                      )}
                    >
                      <img src={t.dataUrl} alt={`Page ${t.page}`} className="block w-full" />
                      <div className="bg-surface px-1 py-0.5 text-[10px] font-medium">
                        Page {t.page}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Signature is placed on the bottom-right of the selected page.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={save} loading={busy}>
              Sign & download
            </Button>
          </div>
        </>
      )}
    </ToolPage>
  );
}
