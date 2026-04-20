import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Type } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { addWatermark } from "@/utils/pdfHelpers";
import { downloadBlob, stripExtension, addRecent } from "@/utils/fileUtils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/watermark")({
  head: () => ({
    meta: [
      { title: "Watermark PDF — PaperKnife" },
      { name: "description", content: "Overlay a text watermark on every page." },
    ],
  }),
  component: WatermarkTool,
});

function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  return {
    r: parseInt(m.slice(0, 2), 16),
    g: parseInt(m.slice(2, 4), 16),
    b: parseInt(m.slice(4, 6), 16),
  };
}

function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.25);
  const [angle, setAngle] = useState(45);
  const [color, setColor] = useState("#e63946");
  const [position, setPosition] = useState<"center" | "diagonal" | "tiled">("diagonal");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Simple preview by drawing on canvas
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 420;
    canvas.height = 560;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Fake page content
    ctx.fillStyle = "#e5e7eb";
    for (let y = 60; y < canvas.height - 60; y += 20) {
      ctx.fillRect(40, y, canvas.width - 80 - Math.random() * 80, 6);
    }
    const draw = (x: number, y: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text || " ", 0, 0);
      ctx.restore();
    };
    if (position === "tiled") {
      const step = fontSize * 3;
      for (let y = 0; y < canvas.height + step; y += step) {
        for (let x = -step; x < canvas.width + step; x += step) {
          draw(x, y, angle);
        }
      }
    } else if (position === "diagonal") {
      draw(canvas.width / 2, canvas.height / 2, angle);
    } else {
      draw(canvas.width / 2, canvas.height / 2, 0);
    }
    setPreview(canvas.toDataURL("image/png"));
  }, [text, fontSize, opacity, angle, color, position]);

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const bytes = await addWatermark(file, {
        text,
        fontSize,
        opacity,
        angle,
        color: hexToRgb(color),
        position,
      });
      const name = `${stripExtension(file.name)}-watermarked.pdf`;
      downloadBlob(bytes, name);
      addRecent({ name, size: bytes.byteLength, operation: "Watermark" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage>
      <PageHeader
        title="Watermark"
        description="Add a custom text watermark to every page. Preview before applying."
        icon={<Type className="h-5 w-5" />}
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
            <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
              <div>
                <label className="mb-1 block text-sm font-medium">Text</label>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Font size: {fontSize}</label>
                  <input
                    type="range"
                    min={16}
                    max={120}
                    value={fontSize}
                    onChange={(e) => setFontSize(+e.target.value)}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Angle: {angle}°</label>
                  <input
                    type="range"
                    min={-90}
                    max={90}
                    value={angle}
                    onChange={(e) => setAngle(+e.target.value)}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Opacity: {Math.round(opacity * 100)}%</label>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={opacity * 100}
                    onChange={(e) => setOpacity(+e.target.value / 100)}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-md border border-border bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Position</label>
                <div className="flex gap-2">
                  {(["center", "diagonal", "tiled"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPosition(p)}
                      className={cn(
                        "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium capitalize",
                        position === p
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-5">
              <div className="mb-2 text-sm font-medium">Preview</div>
              {preview && (
                <img
                  src={preview}
                  alt="Watermark preview"
                  className="w-full rounded-md border border-border"
                />
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={run} loading={busy} disabled={!text.trim()}>
              Apply watermark & download
            </Button>
          </div>
        </>
      )}
    </ToolPage>
  );
}
