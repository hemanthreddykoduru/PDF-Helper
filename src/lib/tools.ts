export const TOOLS = [
  { slug: "merge", path: "/merge", label: "Merge", shortcut: "M", icon: "Combine", desc: "Combine multiple PDFs into one" },
  { slug: "split", path: "/split", label: "Split", shortcut: "S", icon: "Scissors", desc: "Extract pages or split into multiple PDFs" },
  { slug: "compress", path: "/compress", label: "Compress", shortcut: "C", icon: "Minimize2", desc: "Reduce PDF file size" },
  { slug: "organize", path: "/organize", label: "Rotate & Reorder", shortcut: "R", icon: "RotateCw", desc: "Rotate and rearrange pages" },
  { slug: "encrypt", path: "/encrypt", label: "Encrypt", shortcut: "E", icon: "Lock", desc: "Password-protect a PDF" },
  { slug: "unlock", path: "/unlock", label: "Unlock", shortcut: "U", icon: "LockOpen", desc: "Remove password from a PDF" },
  { slug: "image-to-pdf", path: "/image-to-pdf", label: "Image → PDF", shortcut: "I", icon: "Image", desc: "Convert images to PDF" },
  { slug: "pdf-to-images", path: "/pdf-to-images", label: "PDF → Images", shortcut: "P", icon: "ImageDown", desc: "Export PDF pages as PNG" },
  { slug: "metadata", path: "/metadata", label: "Metadata", shortcut: "D", icon: "Info", desc: "Edit or purge PDF metadata" },
  { slug: "sign", path: "/sign", label: "Sign", shortcut: "G", icon: "PenLine", desc: "Draw or type a signature" },
  { slug: "ocr", path: "/ocr", label: "OCR", shortcut: "O", icon: "ScanText", desc: "Extract text from scanned PDFs" },
  { slug: "watermark", path: "/watermark", label: "Watermark", shortcut: "W", icon: "Type", desc: "Add text watermark to pages" },
  { slug: "page-numbers", path: "/page-numbers", label: "Page Numbers", shortcut: "N", icon: "Hash", desc: "Add page numbers to PDFs" },
] as const;

export type ToolSlug = (typeof TOOLS)[number]["slug"];
