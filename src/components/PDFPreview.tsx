import { useEffect, useMemo, useState } from "react";

/**
 * Embedded PDF preview. We use a Blob URL with the browser's native viewer.
 */
export function PDFPreview({ bytes, height = 500 }: { bytes: Uint8Array | null; height?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const blob = useMemo(
    () => (bytes ? new Blob([bytes as BlobPart], { type: "application/pdf" }) : null),
    [bytes],
  );

  useEffect(() => {
    if (!blob) return;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  if (!url) return null;
  return (
    <iframe
      title="PDF preview"
      src={url}
      className="w-full rounded-lg border border-border bg-white"
      style={{ height }}
    />
  );
}
