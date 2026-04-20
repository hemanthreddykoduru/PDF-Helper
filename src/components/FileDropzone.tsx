import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  accept?: Record<string, string[]>;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  hint?: string;
  className?: string;
};

export function FileDropzone({
  accept = { "application/pdf": [".pdf"] },
  multiple = false,
  onFiles,
  label = "Drop your PDF here",
  hint = "or click to browse — files never leave your device",
  className,
}: Props) {
  const onDrop = useCallback(
    (files: File[]) => {
      if (files.length) onFiles(files);
    },
    [onFiles],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-surface px-6 py-12 text-center transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/60 hover:bg-surface-elevated",
        className,
      )}
    >
      <input {...getInputProps()} />
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
        <Upload className="h-6 w-6" />
      </div>
      <div className="text-base font-medium">{label}</div>
      <div className="mt-1 text-sm text-muted-foreground">{hint}</div>
    </div>
  );
}
