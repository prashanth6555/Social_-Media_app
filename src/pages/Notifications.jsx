import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AtSign, Heart, MessageCircle, Send, UserPlus } from "lucide-react";
import { useStore } from "../context/Store";
import { cn, timeAgo } from "../lib/utils";
import { Avatar } from "../components/ui/Avatar";

const filters = [
  { id: "all", label: "All" },
  { id: "like", label: "Likes" },
  { id: "comment", label: "Comments" },
  { id: "follow", label: "Follows" },
  { id: "mention", label: "Mentions" },
];

const icons = {
  like: { icon: Heart, className: "bg-rose-500/15 text-rose-300" },
  comment: { icon: MessageCircle, className: "bg-sky-500/15 text-sky-300" },
  follow: { icon: UserPlus, className: "bg-emerald-500/15 text-emerald-300" },
  mention: { icon: AtSign, className: "bg-violet-500/15 text-violet-300" },
  share: { icon: Send, className: "bg-amber-500/15 text-amber-200" },
};

export function Notifications() {
  const { notifications, getUser, posts, markRead, markAllRead, openPost } = useStore();
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const unread = notifications.filter((item) => !item.read).length;
  const visible = notifications.filter((item) => (filter === "all" ? true : item.type === filter));

  useEffect(() => {
    document.title = unread ? `(${unread}) Lumina — Notifications` : "Lumina — Notifications";
  }, [unread]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-14 z-20 border-b border-white/8 bg-ink/85 px-4 py-4 backdrop-blur-xl sm:px-6 md:top-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Notifications</h1>
            <p className="text-sm text-mist">{unread ? `${unread} new` : "You're caught up"}</p>
          </div>
          <button type="button" onClick={markAllRead} disabled={!unread} className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium hover:bg-white/5 disabled:opacity-40">
            Mark all read
          </button>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn("shrink-0 rounded-full px-4 py-1.5 text-sm font-medium", filter === item.id ? "btn-gradient" : "bg-white/[0.04] text-mist hover:text-cream")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>
      <ul>
        {visible.length === 0 && <li className="px-4 py-16 text-center text-sm text-mist">Nothing in this filter yet.</li>}
        {visible.map((item, index) => {
          const actor = getUser(item.userId);
          const post = posts.find((entry) => entry.id === item.postId);
          const meta = icons[item.type] || icons.like;
          const Icon = meta.icon;
          return (
            <motion.li key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.03 }}>
              <button
                type="button"
                onClick={() => {
                  markRead(item.id);
                  if (item.type === "follow") navigate(`/profile/${actor.username}`);
                  else if (item.postId) openPost(item.postId);
                }}
                className={cn("flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.04] sm:px-6", !item.read && "bg-white/[0.035]")}
              >
                <span className="relative">
                  <Avatar user={actor} size={48} />
                  <span className={cn("absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full", meta.className)}>
                    <Icon size={12} />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-snug">
                    <span className="font-semibold">{actor.name}</span> {item.text}
                  </span>
                  <span className="mt-1 block text-xs text-mist">{timeAgo(item.createdAt)}</span>
                </span>
                {!item.read && <span className="size-2 shrink-0 rounded-full bg-[#ff4d8d]" />}
                {post?.media && (
                  <img src={post.media.poster || post.media.url} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                )}
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
