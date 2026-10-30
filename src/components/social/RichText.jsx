import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

export function RichText({ text, className, inline = false }) {
  if (!text) return null;
  const parts = text.split(/([#@][\w.]+)/g);
  const Tag = inline ? "span" : "div";
  return (
    <Tag className={cn("whitespace-pre-wrap break-words", className)}>
      {parts.map((part, index) => {
        if (part.startsWith("#")) {
          return (
            <Link key={`${part}-${index}`} to={`/explore?q=${encodeURIComponent(part)}`} className="font-medium text-[#ffb4c8] hover:underline">
              {part}
            </Link>
          );
        }
        if (part.startsWith("@")) {
          return (
            <Link key={`${part}-${index}`} to={`/profile/${part.slice(1)}`} className="font-medium text-[#d6ccff] hover:underline">
              {part}
            </Link>
          );
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </Tag>
  );
}
