import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useStore } from "../../context/Store";
import { Avatar } from "../ui/Avatar";

export function StoryViewer({ story, onClose, onNextUser, onPrevUser }) {
  const { getUser, markStorySeen } = useStore();
  const [slide, setSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const author = getUser(story.userId);
  const current = story.slides[slide];
  const nextRef = useRef(onNextUser);
  const prevRef = useRef(onPrevUser);
  const closeRef = useRef(onClose);

  useEffect(() => {
    nextRef.current = onNextUser;
    prevRef.current = onPrevUser;
    closeRef.current = onClose;
  });

  useEffect(() => {
    markStorySeen(story.id);
  }, [story.id]);

  useEffect(() => {
    let frame = 0;
    let stopped = false;
    setProgress(0);
    const start = performance.now();
    const tick = (now) => {
      if (stopped) return;
      const next = Math.min(1, (now - start) / 4600);
      setProgress(next);
      if (next < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      stopped = true;
      if (slide < story.slides.length - 1) setSlide(slide + 1);
      else nextRef.current();
    };
    frame = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
    };
  }, [slide, story.id, story.slides.length]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key === "ArrowRight") {
        if (slide < story.slides.length - 1) setSlide(slide + 1);
        else nextRef.current();
      }
      if (event.key === "ArrowLeft") {
        if (slide > 0) setSlide(slide - 1);
        else prevRef.current();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [slide, story.slides.length]);

  return (
    <div className="fixed inset-0 z-[60] bg-black text-white">
      <div className="mx-auto flex h-full w-full max-w-[520px] flex-col">
        <div className="absolute inset-0 sm:left-1/2 sm:w-[min(100%,520px)] sm:-translate-x-1/2">
          {current?.type === "video" ? (
            <video src={current.url} poster={current.poster} autoPlay muted playsInline className="h-full w-full object-cover" />
          ) : (
            <img src={current?.url} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
        </div>

        <div className="relative z-30 flex gap-1 px-3 pt-3">
          {story.slides.map((item, index) => (
            <span key={item.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                className="block h-full bg-white transition-[width] duration-75"
                style={{ width: index < slide ? "100%" : index === slide ? `${progress * 100}%` : "0%" }}
              />
            </span>
          ))}
        </div>

        <div className="relative z-30 flex items-center gap-3 px-3 py-3">
          <Avatar user={author} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{author.username}</p>
            <p className="text-xs text-white/75">{current?.timeLabel}</p>
          </div>
          <button type="button" aria-label="Close story" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-black/30 hover:bg-black/50">
            <X size={20} />
          </button>
        </div>

        <div className="pointer-events-none relative z-30 mt-auto px-5 pb-8">
          {current?.caption && <p className="text-sm leading-relaxed">{current.caption}</p>}
        </div>

        <button type="button" aria-label="Previous story" className="absolute inset-y-0 left-0 z-10 w-1/3 sm:left-[max(0px,calc(50%-260px))] sm:w-[170px]" onClick={() => (slide > 0 ? setSlide((value) => value - 1) : onPrevUser())} />
        <button type="button" aria-label="Next story" className="absolute inset-y-0 right-0 z-10 w-1/3 sm:right-[max(0px,calc(50%-260px))] sm:w-[170px]" onClick={() => (slide < story.slides.length - 1 ? setSlide((value) => value + 1) : onNextUser())} />
      </div>
    </div>
  );
}
