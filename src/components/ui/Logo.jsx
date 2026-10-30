import { cn } from "../../lib/utils";

export function Logo({ withWord = true, className, wordClassName, markClassName }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#ff7a59,#ff4d8d_55%,#7a5cff)] shadow-[0_8px_20px_rgba(255,77,141,0.35)]",
          markClassName,
        )}
      >
        <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" strokeLinecap="round" />
        </svg>
      </span>
      {withWord && <span className={cn("font-display text-[1.35rem] font-bold tracking-tight", wordClassName)}>Lumina</span>}
    </span>
  );
}
