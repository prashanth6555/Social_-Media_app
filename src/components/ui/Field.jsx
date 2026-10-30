import { cn } from "../../lib/utils";

export function Field({ label, hint, error, end, className, ...props }) {
  const id = props.id || props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-cream/85">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full rounded-2xl border bg-white/[0.04] px-4 py-3 text-[15px] text-cream outline-none transition placeholder:text-mist/70 focus:bg-white/[0.07]",
            end && "pr-12",
            error ? "border-rose-400/70" : "border-white/10 focus:border-[#ff8fb2]/80",
          )}
          {...props}
        />
        {end && <div className="absolute inset-y-0 right-2 flex items-center">{end}</div>}
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-300">{error}</p> : hint ? <p className="mt-1.5 text-xs text-mist">{hint}</p> : null}
    </div>
  );
}
