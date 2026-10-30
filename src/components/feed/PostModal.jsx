import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { useStore } from "../../context/Store";
import { likeLabel, timeAgo } from "../../lib/utils";
import { RichText } from "../social/RichText";
import { Verified } from "../social/Verified";
import { Avatar } from "../ui/Avatar";
import { Modal } from "../ui/Modal";
import { Comments } from "./Comments";
import { MediaFrame } from "./MediaFrame";
import { PostActions } from "./PostCard";

export function PostModal({ onClose }) {
  const { posts, activePostId, getUser, closePost } = useStore();
  const post = posts.find((item) => item.id === activePostId);
  const author = post ? getUser(post.userId) : null;
  const [focusSignal, setFocusSignal] = useState(0);

  function handleClose() {
    closePost();
    onClose?.();
  }

  return (
    <Modal open={Boolean(post)} onClose={handleClose} label="Post" className="max-w-5xl bg-ink sm:overflow-hidden" showClose>
      {post && (
        <div className="grid max-h-[100dvh] md:h-[min(86dvh,780px)] md:grid-cols-[1.15fr_0.9fr]">
          <div className="bg-black">
            {post.media ? (
              <MediaFrame media={post.media} rounded={false} className="h-[46dvh] md:h-full" />
            ) : (
              <div className="grid h-[36dvh] place-items-center bg-[linear-gradient(145deg,#3a2230,#171824)] px-8 md:h-full">
                <RichText text={post.caption} className="font-display text-3xl leading-snug" />
              </div>
            )}
          </div>
          <div className="flex min-h-0 flex-col">
            <header className="flex items-center gap-3 border-b border-white/8 px-4 py-4 pr-14">
              <Link to={`/profile/${author.username}`} onClick={handleClose}>
                <Avatar user={author} size={42} />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <Link to={`/profile/${author.username}`} onClick={handleClose} className="truncate font-semibold hover:underline">
                    {author.name}
                  </Link>
                  <Verified show={author.verified} />
                </div>
                <p className="flex items-center gap-1 truncate text-xs text-mist">
                  <span>{timeAgo(post.createdAt)}</span>
                  {post.location && (
                    <>
                      <span>·</span>
                      <MapPin size={11} />
                      {post.location}
                    </>
                  )}
                </p>
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {post.media && post.caption && <RichText text={post.caption} className="mb-4 text-[15px] leading-relaxed" />}
              <Comments key={post.id} post={post} focusSignal={focusSignal} />
            </div>
            <div className="border-t border-white/8 px-3 py-2">
              <PostActions post={post} onComment={() => setFocusSignal((value) => value + 1)} />
              <p className="px-2 pb-2 text-sm font-semibold">{likeLabel(post)}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
