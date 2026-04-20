import { useEffect, useState } from "react";
import { renderPageThumbnails } from "@/utils/pdfHelpers";

export type Thumb = { page: number; dataUrl: string; width: number; height: number };

export function useThumbnails(file: File | null, maxWidth = 200) {
  const [thumbs, setThumbs] = useState<Thumb[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setThumbs([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    renderPageThumbnails(file, { maxWidth })
      .then((res) => {
        if (!cancelled) setThumbs(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to render PDF");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file, maxWidth]);

  return { thumbs, loading, error };
}
