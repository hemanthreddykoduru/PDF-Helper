import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScanText, Copy, Download, FileText } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/PKButton";
import { PageHeader, ToolPage } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { ocrPdf, ocrImage } from "@/utils/ocrUtils";
import { downloadBlob, stripExtension, addRecent } from "@/utils/fileUtils";

export const Route = createFileRoute("/ocr")({
  head: () => ({
    meta: [
      { title: "OCR PDF — PaperKnife" },
      { name: "description", content: "Extract text from scanned PDFs and images, in your browser." },
    ],
  }),
  component: OcrTool,
});

function OcrTool() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setText("");
    setProgress(0);
    setStatus("Loading language model…");
    try {
      let result = "";
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        result = await ocrPdf(file, (p, page, total) => {
          setProgress(p);
          setStatus(`Recognized page ${page} of ${total}`);
        });
      } else {
        const url = URL.createObjectURL(file);
        try {
          result = await ocrImage(url, (p) => {
            setProgress(p);
            setStatus("Recognizing text…");
          });
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      setText(result);
      addRecent({
        name: `${stripExtension(file.name)}.txt`,
        size: result.length,
        operation: "OCR",
      });
    } catch (e: any) {
      setStatus(`Error: ${e?.message ?? "OCR failed"}`);
    } finally {
      setBusy(false);
    }
  };

  const downloadTxt = () => {
    if (!text || !file) return;
    const blob = new Blob([text], { type: "text/plain" });
    downloadBlob(blob, `${stripExtension(file.name)}.txt`, "text/plain");
  };

  return (
    <ToolPage>
      <PageHeader
        title="OCR — Extract text"
        description="Pulls text out of scanned PDFs or images using Tesseract.js, entirely on-device."
        icon={<ScanText className="h-5 w-5" />}
      />

      {!file && (
        <FileDropzone
          accept={{ "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
          onFiles={(f) => setFile(f[0])}
          label="Drop a PDF or image"
          hint="First run downloads ~10MB language model"
        />
      )}

      {file && (
        <>
          <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="truncate font-medium">{file.name}</span>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setText("");
              }}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Change
            </button>
          </div>

          {!text && !busy && (
            <div className="flex justify-end">
              <Button onClick={run}>Run OCR</Button>
            </div>
          )}

          {busy && (
            <div className="rounded-lg border border-border bg-surface p-5">
              <ProgressBar value={progress} label={status} />
            </div>
          )}

          {text && (
            <div className="rounded-lg border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-sm font-medium">Extracted text</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(text)}
                  >
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadTxt}>
                    <Download className="h-4 w-4" /> .txt
                  </Button>
                </div>
              </div>
              <textarea
                readOnly
                value={text}
                className="scrollbar-thin h-80 w-full resize-none bg-background p-4 font-mono text-xs focus:outline-none"
              />
            </div>
          )}
        </>
      )}
    </ToolPage>
  );
}
