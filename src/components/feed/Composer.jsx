import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, ImagePlus, MapPin, X } from "lucide-react";
import { useStore } from "../../context/Store";
import { wait } from "../../lib/utils";
import { Avatar } from "../ui/Avatar";
import { Modal } from "../ui/Modal";

const EMOJIS = ["✨", "🔥", "🤍", "🌙", "🌿", "🎵", "📸", "☕"];

export function Composer() {
  const { user, composer, closeComposer, createPost, addStory, toast } = useStore();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [media, setMedia] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [posting, setPosting] = useState(false);
  const story = composer === "story";
  const limit = story ? 120 : 2200;

  useEffect(() => {
    if (!composer) return;
    setText("");
    setLocation("");
    setMedia(null);
    setPosting(false);
  }, [composer]);

  function takeFile(file) {
    if (!file) return;
    const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null;
    if (!kind) {
      toast("Choose a photo or video");
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      toast("Keep videos under 40MB for this demo");
      return;
    }
    if (media?.url) URL.revokeObjectURL(media.url);
    setMedia({ type: kind, url: URL.createObjectURL(file), alt: file.name });
  }

  async function submit(event) {
    event.preventDefault();
    if (posting) return;
    if (story && !media) {
      toast("Add a photo or video for your story");
      return;
    }
    if (!story && !text.trim() && !media) {
      toast("Add a caption or a photo");
      return;
    }
    if (text.length > limit) return;
    setPosting(true);
    await wait(520);
    if (story) {
      addStory({ media, caption: text.trim() });
      closeComposer();
    } else {
      createPost({ caption: text, media, location });
      closeComposer();
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setPosting(false);
  }

  return (
    <Modal open={Boolean(composer)} onClose={closeComposer} label={story ? "New story" : "Create post"} className="max-w-xl">
      <form onSubmit={submit} className="flex max-h-[92dvh] flex-col">
        <div className="border-b border-white/8 px-5 py-4 pr-14">
          <h2 className="font-display text-xl">{story ? "New story" : "Create post"}</h2>
          <p className="text-sm text-mist">{story ? "It stays up with the rest of today's rings." : "Share a photo, a clip, or just the thought."}</p>
        </div>
        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar user={user} size={40} />
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-mist">@{user?.username}</p>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value.slice(0, limit))}
            rows={story ? 2 : 4}
            placeholder={story ? "Add a short caption" : "Share something luminous…"}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] outline-none placeholder:text-mist/70 focus:border-[#ff8fb2]/70"
          />
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              takeFile(event.dataTransfer.files?.[0]);
            }}
            className={`rounded-2xl border border-dashed p-3 transition ${dragging ? "border-[#ff8fb2] bg-[#ff4d8d]/10" : "border-white/15"}`}
          >
            {media ? (
              <div className="relative">
                {media.type === "video" ? (
                  <video src={media.url} controls className="max-h-72 w-full rounded-xl bg-black" />
                ) : (
                  <img src={media.url} alt="" className="max-h-72 w-full rounded-xl object-cover" />
                )}
                <button
                  type="button"
                  aria-label="Remove media"
                  onClick={() => {
                    URL.revokeObjectURL(media.url);
                    setMedia(null);
                  }}
                  className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/60"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-mist">Drop a photo or video here</p>
            )}
          </div>
          {!story && (
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3">
              <MapPin size={16} className="text-mist" />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value.slice(0, 40))}
                placeholder="Add a location"
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-mist/70"
              />
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setText((current) => (current + emoji).slice(0, limit))}
                className="grid size-9 place-items-center rounded-full bg-white/5 text-base hover:bg-white/10"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-white/8 px-5 py-4">
          <label className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-white/8" title="Photo">
            <ImagePlus size={18} />
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => takeFile(event.target.files?.[0])} />
          </label>
          <label className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-white/8" title="Video">
            <Film size={18} />
            <input type="file" accept="video/*" className="sr-only" onChange={(event) => takeFile(event.target.files?.[0])} />
          </label>
          <span className="ml-auto text-xs text-mist">
            {text.length}/{limit}
          </span>
          <button type="submit" disabled={posting} className="btn-gradient rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
            {posting ? "Sharing…" : story ? "Share story" : "Post"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
