import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ImageOff, Play } from "lucide-react";
import { cn } from "../../lib/utils";

export function MediaFrame({ media, onDoubleLike, className, rounded = true, priority = false }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [burst, setBurst] = useState(false);
  const videoRef = useRef(null);
  const lastTap = useRef(0);

  if (!media) return null;

  function handlePointer(event) {
    if (media.type === "video") return;
    if (event.target.closest("button")) return;
    const now = Date.now();
    if (now - lastTap.current < 280) {
      onDoubleLike?.();
      setBurst(true);
      window.setTimeout(() => setBurst(false), 650);
    }
    lastTap.current = now;
  }

  return (
    <div
      className={cn("relative overflow-hidden bg-white/[0.04]", rounded && "rounded-[22px]", className)}
      onClick={handlePointer}
    >
      {failed ? (
        <div className="absolute inset-0 grid place-items-center gap-2 text-mist">
          <ImageOff size={28} />
          <span className="text-sm">Preview unavailable</span>
        </div>
      ) : media.type === "video" ? (
        <video
          ref={videoRef}
          src={media.url}
          poster={media.poster}
          playsInline
          controls={playing}
          className="absolute inset-0 h-full w-full bg-black object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={media.url}
          alt={media.alt || ""}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition duration-700",
            loaded ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
          )}
        />
      )}

      {!loaded && !failed && media.type !== "video" && <div className="skeleton absolute inset-0" />}

      {media.type === "video" && !playing && !failed && (
        <button
          type="button"
          aria-label="Play video"
          onClick={(event) => {
            event.stopPropagation();
            setPlaying(true);
            requestAnimationFrame(() => videoRef.current?.play());
          }}
          className="absolute inset-0 grid place-items-center"
        >
          <span className="grid size-16 place-items-center rounded-full bg-white text-ink shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition hover:scale-105">
            <Play size={26} className="ml-1" fill="currentColor" />
          </span>
        </button>
      )}

      <AnimatePresence>
        {burst && (
          <motion.div
            className="pointer-events-none absolute inset-0 grid place-items-center"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
          >
            <Heart className="size-24 fill-white text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
