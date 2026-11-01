import { cn } from "@/lib/utils";

/** Snowflake woven from a single thread: six arms, each crossed by an over-under loop. */
export function Emblem({ className }: { className?: string }) {
  const arms = [0, 60, 120, 180, 240, 300];
  return (
    <svg viewBox="-24 -24 48 48" className={cn("h-8 w-8", className)} aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round">
      <circle r="21" strokeWidth="1" opacity="0.45" />
      {arms.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 -3 V-16" strokeWidth="1.8" />
          <path d="M-4.5 -11 Q0 -6.5 4.5 -11" strokeWidth="1.4" />
          <path d="M-3 -15.5 L0 -18.5 L3 -15.5" strokeWidth="1.4" />
        </g>
      ))}
      <circle r="3" strokeWidth="1.6" />
    </svg>
  );
}

export function Logo({ className, emblemClassName, size = "md" }: { className?: string; emblemClassName?: string; size?: "md" | "lg" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Emblem className={cn(size === "lg" ? "h-16 w-16 md:h-20 md:w-20" : "h-8 w-8", emblemClassName)} />
      <span className={cn("font-display italic leading-none tracking-tight", size === "lg" ? "text-5xl md:text-7xl" : "text-2xl")}>Your logo</span>
    </span>
  );
}
