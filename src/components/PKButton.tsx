import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-gradient-to-br from-[#E11D48] to-[#BE123C] text-white shadow-[0_8px_16px_-4px_rgba(225,29,72,0.3)] hover:brightness-110 active:scale-[0.98]",
  secondary: "bg-surface-elevated text-foreground border border-border shadow-sm hover:bg-muted active:scale-[0.98]",
  ghost: "bg-transparent hover:bg-muted text-foreground active:scale-[0.98]",
  outline: "border border-border bg-transparent hover:bg-surface text-foreground active:scale-[0.98]",
  danger: "bg-destructive text-destructive-foreground shadow-sm hover:brightness-110 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs font-bold uppercase tracking-wider",
  md: "h-11 px-6 text-sm font-black uppercase tracking-widest",
  lg: "h-13 px-8 text-base font-black uppercase tracking-widest",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={loading || disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

