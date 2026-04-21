import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { FileOpener } from "@capacitor-community/file-opener";
import { Toast } from "@capacitor/toast";
import { Dialog } from "@capacitor/dialog";
import { downloadBlob } from "./fileUtils";
import { toast } from "sonner";

/**
 * Converts Uint8Array to Base64 string
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Saves a file to the device's Documents directory (Native) or downloads it (Web)
 */
export async function saveFileNative(bytes: Uint8Array | Blob, fileName: string) {
  if (!Capacitor.isNativePlatform()) {
    return downloadBlob(bytes as any, fileName);
  }

  try {
    const data = bytes instanceof Blob ? new Uint8Array(await bytes.arrayBuffer()) : bytes;
    const base64Data = uint8ArrayToBase64(data);

    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
      recursive: true
    });

    await Toast.show({
      text: "Document saved to mobile",
      duration: "long"
    });

    await Dialog.alert({
      title: "Success",
      message: "Your document has been saved to the mobile storage under the Documents folder.",
    });

    return result.uri;
  } catch (err) {
    console.error("Native save failed:", err);
    toast.error("Failed to save file to device storage.");
  }
}

/**
 * Shares a file using the system share sheet
 */
export async function shareFileNative(bytes: Uint8Array | Blob, fileName: string) {
  if (!Capacitor.isNativePlatform()) {
    // Fallback to navigator.share if available
    const data = bytes instanceof Blob ? bytes : new Blob([bytes], { type: "application/pdf" });
    const file = new File([data], fileName, { type: data.type });
    if (navigator.share) {
       try {
         await navigator.share({
           files: [file],
           title: fileName,
         });
       } catch (err) {
         if ((err as Error).name !== 'AbortError') toast.error("Share failed.");
       }
    } else {
      toast.error("Sharing is not supported in this browser.");
    }
    return;
  }

  try {
    const data = bytes instanceof Blob ? new Uint8Array(await bytes.arrayBuffer()) : bytes;
    const base64Data = uint8ArrayToBase64(data);

    // Save to Cache first to get a URI for sharing
    const { uri } = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    await Share.share({
      title: fileName,
      files: [uri],
    });
  } catch (err) {
    console.error("Native share failed:", err);
    toast.error("Failed to open share sheet.");
  }
}

/**
 * Opens a file with the system's default viewer
 */
export async function previewFileNative(bytes: Uint8Array | Blob, fileName: string) {
  if (!Capacitor.isNativePlatform()) {
    const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    return;
  }

  try {
    const data = bytes instanceof Blob ? new Uint8Array(await bytes.arrayBuffer()) : bytes;
    const base64Data = uint8ArrayToBase64(data);

    // Save to Cache to open
    const { uri } = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    await FileOpener.open({
      filePath: uri,
      contentType: fileName.endsWith(".pdf") ? "application/pdf" : "application/octet-stream",
    });
  } catch (err) {
    console.error("Native preview failed:", err);
    toast.error("No compatible app found to open this file.");
  }
}
