export function downloadBlob(data: Uint8Array | Blob, filename: string, mime = "application/pdf") {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export function stripExtension(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

// Recent files (metadata only, never file content)
export type RecentEntry = { name: string; size: number; operation: string; timestamp: number };

const KEY = "pk-recent";

export function addRecent(entry: Omit<RecentEntry, "timestamp">) {
  try {
    const list: RecentEntry[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    list.unshift({ ...entry, timestamp: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 10)));
  } catch {}
}

export function getRecent(): RecentEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearRecent() {
  localStorage.removeItem(KEY);
}
