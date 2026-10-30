import { useState } from "react";
import { Plus } from "lucide-react";
import { useStore } from "../../context/Store";
import { cn } from "../../lib/utils";
import { StoryViewer } from "./StoryViewer";

function Ring({ user, seen, label, onClick, onPlus }) {
  return (
    <div className="flex w-[76px] shrink-0 flex-col items-center gap-1.5">
      <span className="relative grid size-[68px] place-items-center">
        <button type="button" onClick={onClick} aria-label={label} className="absolute inset-0">
          <span className={cn("absolute inset-0 rounded-full", seen ? "story-ring-seen" : "story-ring")} />
          <span className="absolute inset-[2.5px] rounded-full bg-ink" />
          <img src={user?.avatar} alt="" className="absolute inset-[4px] size-[calc(100%-8px)] rounded-full object-cover" />
        </button>
        {onPlus && (
          <button
            type="button"
            aria-label="Add to your story"
            onClick={onPlus}
            className="absolute bottom-0 right-0 z-10 grid size-5 place-items-center rounded-full bg-[linear-gradient(135deg,#ff7a59,#7a5cff)] text-white ring-2 ring-ink"
          >
            <Plus size={12} />
          </button>
        )}
      </span>
      <span className="w-full truncate text-center text-[11px] text-mist">{label}</span>
    </div>
  );
}

export function StoriesBar() {
  const { user, stories, getUser, openComposer } = useStore();
  const [activeId, setActiveId] = useState(null);
  const mine = stories.find((story) => story.userId === user?.id);
  const rest = stories.filter((story) => story.userId !== user?.id);
  const ordered = [...rest.filter((story) => !story.seen), ...rest.filter((story) => story.seen)];
  const playlist = mine ? [mine, ...ordered] : ordered;
  const active = playlist.find((story) => story.id === activeId) || null;

  function move(step) {
    const index = playlist.findIndex((story) => story.id === activeId);
    const next = playlist[index + step];
    setActiveId(next ? next.id : null);
  }

  return (
    <section className="relative border-b border-white/[0.06]">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-4 sm:px-5">
        <Ring
          user={user}
          seen={!mine}
          label="Your story"
          onClick={() => (mine ? setActiveId(mine.id) : openComposer("story"))}
          onPlus={() => openComposer("story")}
        />
        {ordered.map((story) => {
          const author = getUser(story.userId);
          return <Ring key={story.id} user={author} seen={story.seen} label={author.username} onClick={() => setActiveId(story.id)} />;
        })}
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-10 bg-gradient-to-l from-ink to-transparent" />
      {active && (
        <StoryViewer
          key={active.id}
          story={active}
          onClose={() => setActiveId(null)}
          onNextUser={() => move(1)}
          onPrevUser={() => move(-1)}
        />
      )}
    </section>
  );
}
