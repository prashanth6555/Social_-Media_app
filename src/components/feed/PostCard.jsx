import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Copy, Flag, Heart, MapPin, MessageCircle, MoreHorizontal, Send, Sparkles, Trash2 } from "lucide-react";
import { useStore } from "../../context/Store";
import { cn, compact, likeLabel, timeAgo } from "../../lib/utils";
import { RichText } from "../social/RichText";
import { Verified } from "../social/Verified";
import { Avatar } from "../ui/Avatar";
import { Comments } from "./Comments";
import { MediaFrame } from "./MediaFrame";

function Menu({ label, icon: Icon, items, onOpenChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (!ref.current?.contains(event.target)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onOpenChange]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setOpen(next);
          onOpenChange?.(next);
        }}
        className="grid size-10 place-items-center rounded-full text-cream transition hover:bg-white/8"
      >
        <Icon size={22} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#221f2c] p-1 shadow-2xl"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenChange?.(false);
                  item.onClick();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/8"
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PostActions({ post, onComment }) {
  const { user, toggleLike, toggleSave, bumpShare, deletePost, ensureChat, setMessageDraft, toast, addStory } = useStore();
  const navigate = useNavigate();
  const [raised, setRaised] = useState(false);
  const mine = post.userId === user?.id;

  async function copyLink() {
    const url = `${window.location.origin}/?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      toast("Couldn't copy the link");
    }
    bumpShare(post.id);
  }

  function sendInChat() {
    const url = `${window.location.origin}/?post=${post.id}`;
    setMessageDraft(`Look at this on Lumina: ${url}`);
    bumpShare(post.id);
    if (mine) {
      toast("Pick a chat to send it");
      navigate("/messages");
      return;
    }
    const chatId = ensureChat(post.userId);
    toast("Ready to send");
    navigate(`/messages/${chatId}`);
  }

  return (
    <div className={cn("relative flex items-center", raised && "z-20")}>
      <motion.button
        type="button"
        aria-label={post.liked ? "Unlike" : "Like"}
        aria-pressed={post.liked}
        whileTap={{ scale: 0.84 }}
        onClick={() => toggleLike(post.id)}
        className="grid size-10 place-items-center rounded-full hover:bg-white/8"
      >
        <Heart size={22} className={cn("transition", post.liked && "fill-[#ff4d6d] text-[#ff4d6d]")} />
      </motion.button>
      <button type="button" aria-label="Comment" onClick={onComment} className="grid size-10 place-items-center rounded-full hover:bg-white/8">
        <MessageCircle size={22} />
      </button>
      <Menu
        label="Share"
        icon={Send}
        onOpenChange={setRaised}
        items={[
          { label: "Copy link", icon: Copy, onClick: copyLink },
          { label: "Send in a chat", icon: Send, onClick: sendInChat },
          {
            label: "Add to your story",
            icon: Sparkles,
            onClick: () => {
              if (!post.media) {
                toast("Stories need a photo or video");
                return;
              }
              addStory({ media: post.media, caption: post.caption?.slice(0, 120) || "From the feed" });
              bumpShare(post.id);
            },
          },
        ]}
      />
      <span className="flex-1" />
      <button
        type="button"
        aria-label={post.saved ? "Unsave" : "Save"}
        aria-pressed={post.saved}
        onClick={() => toggleSave(post.id)}
        className="grid size-10 place-items-center rounded-full hover:bg-white/8"
      >
        <Bookmark size={22} className={cn(post.saved && "fill-cream text-cream")} />
      </button>
      <Menu
        label="More"
        icon={MoreHorizontal}
        onOpenChange={setRaised}
        items={
          mine
            ? [{ label: "Delete post", icon: Trash2, onClick: () => deletePost(post.id) }]
            : [
                { label: post.saved ? "Unsave" : "Save", icon: Bookmark, onClick: () => toggleSave(post.id) },
                { label: "Report", icon: Flag, onClick: () => toast("Thanks — we'll take a look") },
              ]
        }
      />
    </div>
  );
}

export function PostCard({ post, priority = false }) {
  const { getUser, toggleLike } = useStore();
  const [focusSignal, setFocusSignal] = useState(0);
  const author = getUser(post.userId);

  return (
    <article className="border-b border-white/[0.06] px-0 py-4 transition-colors hover:bg-white/[0.02] sm:px-5">
      <header className="mb-3 flex items-center gap-3 px-4 sm:px-1">
        <Link to={`/profile/${author.username}`}>
          <Avatar user={author} size={44} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <Link to={`/profile/${author.username}`} className="truncate font-semibold hover:underline">
              {author.name}
            </Link>
            <Verified show={author.verified} />
          </div>
          <p className="flex items-center gap-1 truncate text-xs text-mist">
            <span>@{author.username}</span>
            <span>·</span>
            <span>{timeAgo(post.createdAt)}</span>
            {post.location && (
              <>
                <span>·</span>
                <MapPin size={11} />
                <span className="truncate">{post.location}</span>
              </>
            )}
          </p>
        </div>
      </header>

      {post.media ? (
        <>
          {post.caption && <RichText text={post.caption} className="mb-3 px-4 text-[15px] leading-relaxed sm:px-1" />}
          <MediaFrame
            media={post.media}
            priority={priority}
            rounded={false}
            onDoubleLike={() => {
              if (!post.liked) toggleLike(post.id);
            }}
            className="aspect-[4/5] sm:mx-0 sm:aspect-[3/2] sm:rounded-[24px]"
          />
        </>
      ) : (
        <div className="bg-[linear-gradient(145deg,#3a2230,#171824_55%,#17242c)] px-6 py-12 sm:rounded-[24px]">
          <RichText text={post.caption} className="font-display text-2xl leading-snug sm:text-[1.7rem]" />
        </div>
      )}

      <div className="px-2 pt-1 sm:px-0">
        <PostActions post={post} onComment={() => setFocusSignal((value) => value + 1)} />
        <p className="px-2 text-sm font-semibold">{likeLabel(post)}</p>
        {post.shares > 0 && <p className="px-2 text-xs text-mist">{compact(post.shares)} shares</p>}
        <div className="px-2">
          <Comments post={post} preview focusSignal={focusSignal} />
        </div>
      </div>
    </article>
  );
}
