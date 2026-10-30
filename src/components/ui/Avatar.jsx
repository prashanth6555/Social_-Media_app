import { cn } from "../../lib/utils";

export function Avatar({ user, size = 40, showOnline = false, className }) {
  return (
    <span className={cn("relative inline-grid shrink-0", className)} style={{ width: size, height: size }}>
      <img src={user?.avatar} alt="" className="size-full rounded-full object-cover" />
      {showOnline && user?.online && (
        <span className="absolute bottom-0 right-0 size-3">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-70" />
          <span className="relative block size-3 rounded-full bg-emerald-400 ring-2 ring-ink" />
        </span>
      )}
    </span>
  );
}
