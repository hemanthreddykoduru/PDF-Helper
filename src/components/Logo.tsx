import { cn } from "@/lib/utils";

export function Logo({ className = "", showTagline = true }: { className?: string, showTagline?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-10 w-10 items-center justify-center">
        {/* Stylized Red Airplane / Arrow icon from reference */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-[#E11D48]"
        >
          <path
            d="M3 13.5L21 4.5L12 21L10.5 13.5L3 13.5Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-xl font-black tracking-tighter text-foreground">
            PaperKnife
          </span>
          {/* Status Dot */}
          <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        </div>
        {showTagline && (
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#E11D48] uppercase">
            Secure Engine
          </span>
        )}
      </div>
    </div>
  );
}
