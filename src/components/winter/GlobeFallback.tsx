import cabin from "@/assets/intro-cabin.jpg";

export function GlobeFallback({ note }: { note?: string }) {
  return (
    <div className="mx-auto flex aspect-square w-full max-w-md flex-col items-center justify-center">
      <div className="relative aspect-square w-[78%] overflow-hidden rounded-full border border-ivory/30 shadow-[var(--shadow-glow)]">
        <img src={cabin} alt="A snowy cabin glowing inside a glass globe" width={1600} height={914} loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,oklch(1_0_0/0.45),transparent_40%)]" />
      </div>
      <div className="h-10 w-[60%] rounded-b-3xl bg-cocoa" />
      {note && <p className="mt-3 text-xs text-night-foreground/60">{note}</p>}
    </div>
  );
}
