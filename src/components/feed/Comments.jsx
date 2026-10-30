import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../context/Store";
import { timeAgo } from "../../lib/utils";
import { RichText } from "../social/RichText";
import { Verified } from "../social/Verified";
import { Avatar } from "../ui/Avatar";

export function Comments({ post, preview = false, focusSignal = 0 }) {
  const { getUser, addComment } = useStore();
  const [open, setOpen] = useState(!preview);
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const visible = open ? post.comments : post.comments.slice(-1);

  useEffect(() => {
    if (open && !preview) inputRef.current?.focus();
  }, [open, preview]);

  useEffect(() => {
    if (!focusSignal) return;
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [focusSignal]);

  function submit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    addComment(post.id, text);
    setText("");
    setOpen(true);
  }

  return (
    <div className="mt-2 space-y-2">
      {post.comments.length > 1 && !open && (
        <button type="button" onClick={() => setOpen(true)} className="text-sm text-mist hover:text-cream">
          View all {post.comments.length} comments
        </button>
      )}
      <ul className={preview && open ? "max-h-56 space-y-2 overflow-y-auto pr-1" : "space-y-3"}>
        {visible.map((comment) => {
          const author = getUser(comment.userId);
          return (
            <li key={comment.id} className="flex gap-2.5">
              <Link to={`/profile/${author.username}`} className="mt-0.5">
                <Avatar user={author} size={preview ? 28 : 32} />
              </Link>
              <div className="min-w-0">
                <p className="text-sm leading-snug">
                  <Link to={`/profile/${author.username}`} className="font-semibold hover:underline">
                    {author.username}
                  </Link>{" "}
                  {author.verified && <Verified show className="inline" />}
                  <RichText text={comment.text} inline />
                </p>
                <p className="text-[11px] text-mist">{timeAgo(comment.createdAt)}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="text-sm text-mist hover:text-cream">
          Add a comment
        </button>
      ) : (
        <form onSubmit={submit} className="flex items-center gap-2 pt-1">
          <input
            ref={inputRef}
            value={text}
            maxLength={500}
            onChange={(event) => setText(event.target.value)}
            placeholder="Add a comment…"
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm outline-none placeholder:text-mist/70 focus:border-[#ff8fb2]/70"
          />
          <button type="submit" disabled={!text.trim()} className="text-sm font-semibold text-[#ffb4c8] disabled:opacity-40">
            Post
          </button>
        </form>
      )}
    </div>
  );
}
