import { storeFile, deleteFile, getFile } from "./db";

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

// Recent files metadata
export type RecentEntry = { 
  name: string; 
  size: number; 
  operation: string; 
  timestamp: number;
  fileId?: string;
};

const KEY = "pk-recent";

export async function addRecent(entry: Omit<RecentEntry, "timestamp" | "fileId">, bytes?: Uint8Array) {
  try {
    // Check for Auto-Wipe (Privacy Mode)
    const autoWipe = localStorage.getItem("pk-auto-wipe") === "true";
    if (autoWipe) {
      console.log("Privacy Protocol Active: History bypass engaged.");
      return;
    }

    const list: RecentEntry[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    const timestamp = Date.now();
    const fileId = bytes ? `pk-${timestamp}` : undefined;

    const newEntry: RecentEntry = { ...entry, timestamp, fileId };
    list.unshift(newEntry);
    
    // Support Dynamic History Limit
    const limit = parseInt(localStorage.getItem("pk-history-limit") || "10");
    
    if (list.length > limit) {
      const removed = list.splice(limit);
      for (const item of removed) {
        if (item.fileId) {
          await deleteFile(item.fileId).catch(() => {});
        }
      }
    }

    localStorage.setItem(KEY, JSON.stringify(list));
    
    if (bytes && fileId) {
      await storeFile(fileId, bytes);
    }
  } catch (err) {
    console.error("Storage failed:", err);
  }
}

export function getRecent(): RecentEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export async function downloadFromHistory(fileId: string, filename: string) {
  const bytes = await getFile(fileId);
  if (bytes) {
    downloadBlob(bytes, filename);
    return true;
  }
  return false;
}

export async function clearRecent() {
  const list = getRecent();
  for (const item of list) {
    if (item.fileId) {
      await deleteFile(item.fileId).catch(() => {});
    }
  }
  localStorage.removeItem(KEY);
}
