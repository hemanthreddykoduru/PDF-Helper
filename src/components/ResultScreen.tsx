import React from "react";
import { 
  CheckCircle2, 
  Eye, 
  Share2, 
  Download, 
  RefreshCw, 
  X, 
  ShieldAlert,
  FileText
} from "lucide-react";
import { Button } from "@/components/PKButton";
import { formatBytes } from "@/utils/fileUtils";
import { 
  saveFileNative, 
  shareFileNative, 
  previewFileNative 
} from "@/utils/nativeUtils";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

interface ResultScreenProps {
  result: {
    bytes: Uint8Array | Blob;
    name: string;
  };
  onReset: () => void;
  operationLabel?: string;
  successMessage?: string;
}

export function ResultScreen({ 
  result, 
  onReset, 
  operationLabel = "Processed Document",
  successMessage = "Operation Completed Successfully"
}: ResultScreenProps) {
  const navigate = useNavigate();
  const autoDownloadRef = React.useRef(false);

  React.useEffect(() => {
    const shouldAutoDownload = localStorage.getItem("pk-auto-download") === "true";
    if (shouldAutoDownload && !autoDownloadRef.current) {
      autoDownloadRef.current = true;
      handleDownload();
    }
  }, []);

  const handleShare = async () => {
    await shareFileNative(result.bytes, result.name);
  };

  const handlePreview = async () => {
    await previewFileNative(result.bytes, result.name);
  };

  const handleDownload = async () => {
    await saveFileNative(result.bytes, result.name);
  };

  return (
    <div className="mt-4 space-y-8 animate-in zoom-in-95 fade-in duration-500">
      {/* Result Card */}
      <div className="relative group rounded-[32px] border border-border/50 bg-surface p-6">
        <div className="flex items-center gap-5">
          <div className="h-20 w-16 rounded-xl bg-background border border-border/20 flex items-center justify-center overflow-hidden shadow-sm">
            <FileText className="h-8 w-8 text-primary/40" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-lg font-black tracking-tight">{result.name}</div>
            <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">
              {operationLabel} • {formatBytes(result.bytes instanceof Blob ? result.bytes.size : result.bytes.byteLength)}
            </div>
          </div>
          <button onClick={onReset} className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground/30 hover:text-foreground transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status Badge */}
        <div className="h-14 w-full flex items-center justify-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black text-sm uppercase tracking-widest shadow-sm">
          <CheckCircle2 className="h-5 w-5" />
          {successMessage}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" onClick={handlePreview} className="h-16 rounded-2xl gap-3 text-xs">
            <Eye className="h-5 w-5 opacity-60" />
            Preview
          </Button>
          <Button variant="secondary" onClick={handleShare} className="h-16 rounded-2xl gap-3 text-xs text-rose-500">
            <Share2 className="h-5 w-5 opacity-60" />
            Share
          </Button>
        </div>

        <Button 
          variant="outline" 
          onClick={handleDownload}
          className="w-full h-20 rounded-2xl bg-white text-black hover:bg-white/90 gap-4 text-base shadow-sm active:scale-[0.98] transition-all"
        >
          <Download className="h-6 w-6" />
          Save to Device
        </Button>

        <Button variant="ghost" onClick={onReset} className="w-full h-14 rounded-2xl gap-3 opacity-60 hover:opacity-100">
          <RefreshCw className="h-5 w-5" />
          Start New Session
        </Button>
      </div>

      <div className="p-6 rounded-[28px] bg-primary/5 border border-primary/10 text-primary/60 flex items-start gap-4">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold leading-relaxed uppercase">
          All data remains strictly localized on your hardware. PDF Helper never uploads your documents during standard processing.
        </p>
      </div>

      <button 
        onClick={() => navigate({ to: "/" })}
        className="w-full py-4 text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] hover:text-foreground transition-all"
      >
        Close File
      </button>
    </div>
  );
}
