import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Combine,
  Scissors,
  Minimize2,
  RotateCw,
  Lock,
  LockOpen,
  Image as ImageIcon,
  ImageDown,
  Info,
  PenLine,
  ScanText,
  Type,
  Hash,
  ShieldCheck,
  Zap,
  FileLock2,
  ArrowRight,
} from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { getRecent, type RecentEntry } from "@/utils/fileUtils";
import { useEffect, useState } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Combine, Scissors, Minimize2, RotateCw, Lock, LockOpen, Image: ImageIcon,
  ImageDown, Info, PenLine, ScanText, Type, Hash,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PaperKnife — Private PDF Toolkit, 100% In Your Browser" },
      {
        name: "description",
        content:
          "Merge, split, compress, sign, OCR and more. Every PDF tool you need, with zero uploads. Your files never leave your device.",
      },
      { property: "og:title", content: "PaperKnife — Private PDF Toolkit" },
      {
        property: "og:description",
        content: "Every PDF tool you need, with zero uploads. Your files never leave your device.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  useEffect(() => setRecent(getRecent()), []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-14">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-background px-6 py-12 sm:px-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            100% private · Zero uploads · Works offline
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            The PDF toolkit that <span className="text-primary">never</span> touches a server.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Merge, split, compress, sign, OCR, watermark and more — every operation runs entirely
            in your browser. Your files stay on your device.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/merge"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:brightness-110"
            >
              Start merging <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/ocr"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-surface px-5 text-sm font-medium hover:bg-surface-elevated"
            >
              Try OCR
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Instant — runs locally
            </div>
            <div className="flex items-center gap-2">
              <FileLock2 className="h-4 w-4 text-primary" /> No accounts, no tracking
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Open-source stack
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">All tools</h2>
            <p className="text-sm text-muted-foreground">
              Press the highlighted key from anywhere to jump between tools.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = iconMap[tool.icon] ?? Combine;
            return (
              <Link
                key={tool.slug}
                to={tool.path}
                className="group relative flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-surface-elevated"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {tool.shortcut}
                  </kbd>
                </div>
                <div className="font-medium">{tool.label}</div>
                <div className="text-xs text-muted-foreground">{tool.desc}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">Recent activity</h2>
          <div className="rounded-xl border border-border bg-surface">
            {recent.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.operation} · {new Date(r.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            <div className="px-4 py-2 text-[11px] text-muted-foreground">
              Only filenames and operation types are stored locally. File contents are never saved.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
