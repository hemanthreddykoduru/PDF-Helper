import { cn } from "@/lib/utils";
import logo from "../assets/logo.png";

export function Logo({ className = "", showTagline = true }: { className?: string, showTagline?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg">
        <img 
          src={logo} 
          alt="PDF Helper Logo" 
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-xl font-black tracking-tighter text-foreground">
            PDF Helper
          </span>
          {/* Status Dot */}
          <div className="mt-1 h-2 w-2 rounded-full bg-[#0080fe] shadow-[0_0_8px_rgba(0,128,254,0.6)]" />
        </div>
        {showTagline && (
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#0080fe] uppercase">
            Secure Engine
          </span>
        )}
      </div>
    </div>
  );
}
