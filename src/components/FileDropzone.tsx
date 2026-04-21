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
        "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed px-6 py-12 text-center transition-all duration-300",
        isDragActive
          ? "border-[#E11D48] bg-[#E11D48]/5"
          : "border-border/60 bg-surface hover:border-[#E11D48]/50 hover:bg-surface-elevated active:scale-[0.99]",
        className,
      )}
    >
      <input {...getInputProps()} />
      
      {/* Decorative Gradient for premium feel */}
      <div className={cn(
        "absolute -right-16 -top-16 h-40 w-40 rounded-full blur-[60px] transition-colors duration-500",
        isDragActive ? "bg-[#E11D48]/20" : "bg-[#E11D48]/5"
      )} />

      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E11D48]/10 text-[#E11D48] shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#E11D48]/20 sm:h-20 sm:w-20">
        <Upload className="h-7 w-7 sm:h-8 sm:w-8" />
      </div>
      
      <div className="relative space-y-2">
        <div className="text-lg font-black tracking-tight">{label}</div>
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">{hint}</div>
      </div>

      {isDragActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px]">
          <div className="rounded-full bg-[#E11D48] px-6 py-2 text-sm font-black text-white shadow-xl animate-in zoom-in-75">
            Drop to Process
          </div>
        </div>
      )}
    </div>
  );
}

