import { cn } from "@/lib/utils";

export function Emblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 100"
      className={cn("nivelle-emblem", className)}
      aria-hidden="true"
      fill="none"
    >
      <ellipse cx="40" cy="50" rx="30" ry="43" stroke="currentColor" strokeWidth="1" />
      <path d="M22 77V24h6l28 45V24h3v53h-6L25 32v45z" fill="currentColor" />
      <path d="M17 24h18M46 77h18" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
export function Logo({
  className,
  emblemClassName,
  size = "md",
}: {
  className?: string;
  emblemClassName?: string;
  size?: "md" | "lg";
}) {
  return (
    <span className={cn("nivelle-logo", size === "lg" && "nivelle-logo-large", className)}>
      <Emblem className={emblemClassName ?? ""} />
      <span>
        NIVELLE<small>THE WINTER ATELIER</small>
      </span>
    </span>
  );
}
