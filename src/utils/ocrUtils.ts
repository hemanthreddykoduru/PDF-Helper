import { createWorker } from "tesseract.js";

export async function ocrImage(
  imageDataUrl: string,
  onProgress?: (p: number) => void,
): Promise<string> {
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) onProgress(m.progress);
    },
  });
  const { data } = await worker.recognize(imageDataUrl);
  await worker.terminate();
  return data.text;
}

export async function ocrPdf(
  file: File,
  onProgress?: (p: number, page: number, total: number) => void,
): Promise<string> {
  const { renderPagesToPngs } = await import("@/utils/pdfHelpers");
  const pages = await renderPagesToPngs(file, 2);
  const worker = await createWorker("eng", 1);
  let out = "";
  for (let i = 0; i < pages.length; i++) {
    const blob = new Blob([pages[i] as BlobPart], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    try {
      const { data } = await worker.recognize(url);
      out += `\n\n--- Page ${i + 1} ---\n\n${data.text}`;
      if (onProgress) onProgress((i + 1) / pages.length, i + 1, pages.length);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  await worker.terminate();
  return out.trim();
}
