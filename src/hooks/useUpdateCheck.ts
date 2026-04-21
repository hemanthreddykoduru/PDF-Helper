import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Dialog } from "@capacitor/dialog";
import { Browser } from "@capacitor/browser";
import pkg from "../../package.json";

const VERSION_URL = "https://paper-cut-craft-main.vercel.app/version.json";

export function useUpdateCheck() {
  useEffect(() => {
    // Only check on native platforms to avoid bothering web users
    if (!Capacitor.isNativePlatform()) return;

    const checkUpdates = async () => {
      try {
        const response = await fetch(`${VERSION_URL}?t=${Date.now()}`);
        if (!response.ok) return;

        const remote = await response.json();
        const currentBuild = pkg.build;

        if (remote.build > currentBuild) {
          const { value } = await Dialog.confirm({
            title: "Update Available",
            message: `A new version of PDF Helper (${remote.version}) is available.\n\nChanges:\n${remote.notes}\n\nWould you like to update now?`,
            okButtonTitle: "Update Now",
            cancelButtonTitle: "Later",
          });

          if (value) {
            await Browser.open({ url: remote.url });
          }
        }
      } catch (err) {
        console.warn("Update check failed:", err);
      }
    };

    // Check after a short delay to ensure app is ready
    const timer = setTimeout(checkUpdates, 2000);
    return () => clearTimeout(timer);
  }, []);
}
