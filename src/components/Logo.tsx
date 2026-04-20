export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Paper knife / letter opener */}
        <path
          d="M4 26L18 12L24 18L10 32L4 26Z"
          transform="translate(0,-4)"
          fill="var(--color-primary)"
        />
        <rect
          x="20.5"
          y="4.5"
          width="3"
          height="14"
          rx="1"
          transform="rotate(45 22 11.5)"
          fill="var(--color-foreground)"
        />
        <circle cx="6" cy="22" r="1.5" fill="var(--color-foreground)" />
      </svg>
      <span className="text-lg font-bold tracking-tight">
        Paper<span className="text-primary">Knife</span>
      </span>
    </div>
  );
}
