import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { trends } from "../../data/mockData";
import { useStore } from "../../context/Store";
import { compact } from "../../lib/utils";
import { FollowButton } from "../social/FollowButton";
import { Verified } from "../social/Verified";
import { Avatar } from "../ui/Avatar";

function rotate(list, amount) {
  if (!list.length) return [];
  const index = amount % list.length;
  return [...list.slice(index), ...list.slice(0, index)];
}

export function TopicRow() {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 sm:px-5">
      {trends.map((trend) => (
        <Link
          key={trend.tag}
          to={`/explore?q=${encodeURIComponent("#" + trend.tag)}`}
          className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm transition hover:border-[#ff8fb2]/50 hover:bg-white/[0.07]"
        >
          <span className="text-[#ffb4c8]">#{trend.tag}</span>
          <span className="ml-2 text-xs text-mist">{trend.posts}</span>
        </Link>
      ))}
    </div>
  );
}

export function PeopleRow({ limit = 8 }) {
  const { user, people, followingIds } = useStore();
  const suggestions = people.filter((person) => person.id !== user?.id && !followingIds.includes(person.id)).slice(0, limit);
  if (!suggestions.length) return null;
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 py-2 sm:px-5">
      {suggestions.map((person) => (
        <div key={person.id} className="w-[148px] shrink-0 rounded-3xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <Link to={`/profile/${person.username}`} className="mx-auto block w-fit">
            <Avatar user={person} size={64} />
          </Link>
          <Link to={`/profile/${person.username}`} className="mt-2 block truncate text-sm font-semibold hover:underline">
            {person.name}
          </Link>
          <p className="truncate text-xs text-mist">@{person.username}</p>
          <FollowButton userId={person.id} className="mt-3 w-full px-2" />
        </div>
      ))}
    </div>
  );
}

export function SuggestedPosts() {
  const { posts, openPost } = useStore();
  const picks = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 6);
  return (
    <section className="border-b border-white/[0.06] py-4">
      <div className="mb-3 flex items-end justify-between px-4 sm:px-5">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-mist">Suggested</p>
          <h2 className="font-display text-xl">Trending now</h2>
        </div>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 sm:px-5">
        {picks.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => openPost(post.id)}
            className="group w-[210px] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-card text-left transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <span className="relative block aspect-[4/5] overflow-hidden bg-white/5">
              {post.media?.type === "video" ? (
                <img src={post.media.poster} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : post.media ? (
                <img src={post.media.url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <span className="grid h-full place-items-center px-4 text-sm">{post.caption}</span>
              )}
            </span>
            <span className="block px-3 py-3 text-xs text-mist">{compact(post.likes)} likes</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function SideRail() {
  const { user, people, followingIds, posts, openPost, toast } = useStore();
  const navigate = useNavigate();
  const [spin, setSpin] = useState(0);
  const suggestions = rotate(
    people.filter((person) => person.id !== user?.id && !followingIds.includes(person.id)),
    spin,
  ).slice(0, 3);
  const picks = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3);

  return (
    <aside className="sticky top-0 hidden h-dvh overflow-y-auto border-l border-white/8 px-5 py-6 xl:block">
      <button
        type="button"
        onClick={() => navigate("/explore")}
        className="mb-6 flex w-full items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-mist transition hover:border-white/20"
      >
        Search Lumina
      </button>

      <section className="mb-6">
        <h2 className="mb-3 font-display text-lg">Trending</h2>
        <ul className="space-y-1">
          {trends.map((trend, index) => (
            <li key={trend.tag}>
              <Link to={`/explore?q=${encodeURIComponent("#" + trend.tag)}`} className="block rounded-2xl px-2 py-2 transition hover:bg-white/[0.04]">
                <p className="text-xs text-mist">
                  {index + 1} · {trend.category}
                </p>
                <p className="font-semibold">#{trend.tag}</p>
                <p className="text-xs text-mist">{trend.posts} posts</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg">Suggested people</h2>
          <button type="button" aria-label="Refresh suggestions" onClick={() => setSpin((value) => value + 1)} className="grid size-8 place-items-center rounded-full hover:bg-white/8">
            <RefreshCw size={15} />
          </button>
        </div>
        {suggestions.length === 0 && <p className="text-sm text-mist">You're following everyone here.</p>}
        <ul className="space-y-3">
          {suggestions.map((person) => (
            <li key={person.id} className="flex items-center gap-3">
              <Link to={`/profile/${person.username}`}>
                <Avatar user={person} size={42} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/profile/${person.username}`} className="flex items-center gap-1 truncate text-sm font-semibold hover:underline">
                  {person.name}
                  <Verified show={person.verified} />
                </Link>
                <p className="truncate text-xs text-mist">@{person.username}</p>
              </div>
              <FollowButton userId={person.id} className="px-3 py-1.5 text-xs" />
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-display text-lg">Suggested posts</h2>
        <ul className="space-y-3">
          {picks.map((post) => (
            <li key={post.id}>
              <button type="button" onClick={() => openPost(post.id)} className="flex w-full items-center gap-3 rounded-2xl text-left hover:bg-white/[0.04]">
                <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  <img src={post.media?.poster || post.media?.url} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm">{post.caption}</span>
                  <span className="text-xs text-mist">{compact(post.likes)} likes</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <button type="button" onClick={() => toast("Lumina is a demo social space — nothing here leaves your browser.")} className="px-2 text-left text-xs leading-5 text-mist">
        About · Help · Privacy · Terms
        <span className="mt-1 block text-mist/70">© 2026 Lumina</span>
      </button>
    </aside>
  );
}
