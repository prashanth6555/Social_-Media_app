import { BadgeCheck } from "lucide-react";

export function Verified({ show }) {
  if (!show) return null;
  return <BadgeCheck className="size-4 shrink-0 text-[#7dd3fc]" aria-label="Verified" />;
}
