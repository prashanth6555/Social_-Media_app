import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Heart, MessageCircle, Play, Search } from "lucide-react";
import { trends } from "../data/mockData";
import { useStore } from "../context/Store";
import { compact, cn } from "../lib/utils";
import { FollowButton } from "../components/social/FollowButton";
import { Verified } from "../components/social/Verified";
import { Avatar } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";

const chips = [
  { id: "all", label: "For you" },
  { id: "people", label: "People" },
  { id: "photos", label: "Photos" },
  { id: "videos", label: "Videos" },
  { id: "trending", label: "Trending" },
];

export function Explore() {
  const { posts, people, user, openPost } = useStore();
  const [params] = useSearchParams();
  const qParam = params.get("q") || "";
  const [query, setQuery] = useState(qParam);
  const [debounced, setDebounced] = useState(qParam);
  const [searching, setSearching] = useState(false);
  const [chip, setChip] = useState("all");

  useEffect(() => {
    document.title = "Lumina — Explore";
  }, []);

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    setSearching(true);
    const timer = window.setTimeout(() => {
      setDebounced(query);
      setSearching(false);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query]);

  const needle = debounced.trim().toLowerCase();

  const matchedPeople = useMemo(() => {
    return people.filter((person) => {
      if (person.id === user?.id) return false;
      if (!needle) return true;
      return `${person.name} ${person.username} ${person.bio}`.toLowerCase().includes(needle.replace("@", ""));
    });
  }, [people, user?.id, needle]);

  const matchedPosts = useMemo(() => {
    let list = posts.filter((post) => {
      if (!needle) return true;
      const author = people.find((person) => person.id === post.userId);
      const hay = `${post.caption} ${post.location} ${author?.name || ""} ${author?.username || ""}`.toLowerCase();
      return hay.includes(needle.replace("#", ""));
    });
    if (chip === "photos") list = list.filter((post) => post.media?.type === "image");
    if (chip === "videos") list = list.filter((post) => post.media?.type === "video");
    if (chip === "trending") list = [...list].sort((a, b) => b.likes - a.likes);
    return list;
  }, [posts, people, needle, chip]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-14 z-20 border-b border-white/8 bg-ink/85 backdrop-blur-xl md:top-0">
        <div className="px-4 py-4 sm:px-5">
          <h1 className="font-display text-3xl">Explore</h1>
          <label className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 focus-within:border-[#ff8fb2]/70">
            <Search size={18} className="text-mist" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people, places, posts"
              className="w-full bg-transparent text-sm outline-none placeholder:text-mist/70"
            />
          </label>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 sm:px-5">
          {chips.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setChip(item.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
                chip === item.id ? "btn-gradient" : "border border-white/10 bg-white/[0.03] text-mist hover:text-cream",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {(chip === "all" || chip === "trending") && !needle && (
        <section className="border-b border-white/8 px-4 py-5 sm:px-5">
          <h2 className="font-display text-xl">Trending</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {trends.map((trend, index) => (
              <button
                key={trend.tag}
                type="button"
                onClick={() => setQuery(`#${trend.tag}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <p className="text-xs text-mist">
                  {index + 1} · {trend.category}
                </p>
                <p className="font-semibold">#{trend.tag}</p>
                <p className="text-xs text-mist">{trend.posts} posts</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {(chip === "all" || chip === "people") && (
        <section className="border-b border-white/8">
          <h2 className="px-4 pt-5 font-display text-xl sm:px-5">Suggested people</h2>
          <ul>
            {matchedPeople.slice(0, chip === "people" ? 12 : 4).map((person) => (
              <li key={person.id} className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3 sm:px-5">
                <Link to={`/profile/${person.username}`}>
                  <Avatar user={person} size={52} showOnline />
                </Link>
                <Link to={`/profile/${person.username}`} className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="truncate">{person.name}</span>
                    <Verified show={person.verified} />
                  </span>
                  <span className="block truncate text-sm text-mist">@{person.username}</span>
                  <span className="block truncate text-sm text-mist">{person.bio}</span>
                </Link>
                <FollowButton userId={person.id} />
              </li>
            ))}
            {matchedPeople.length === 0 && <li className="px-4 py-8 text-sm text-mist sm:px-5">No people match that search.</li>}
          </ul>
        </section>
      )}

      {chip !== "people" && (
        <section className="py-3" aria-busy={searching}>
          {searching ? (
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square" />
              ))}
            </div>
          ) : matchedPosts.length === 0 ? (
            <p className="px-4 py-16 text-center text-sm text-mist">Nothing matches yet. Try a name, a place, or a hashtag.</p>
          ) : (
            <div className="columns-2 gap-1 sm:columns-3 xl:columns-4">
              {matchedPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => openPost(post.id)}
                  className="group relative mb-1 block w-full break-inside-avoid overflow-hidden bg-white/5"
                >
                  {post.media?.type === "video" ? (
                    <img src={post.media.poster} alt="" className="w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : post.media ? (
                    <img src={post.media.url} alt={post.media.alt || ""} className="w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="grid min-h-40 place-items-center bg-[linear-gradient(145deg,#3a2230,#171824)] p-4 text-left text-sm">{post.caption}</span>
                  )}
                  {post.media?.type === "video" && (
                    <span className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-black/50">
                      <Play size={13} fill="white" />
                    </span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center gap-4 bg-black/45 text-sm font-semibold opacity-0 transition group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1">
                      <Heart size={16} className="fill-white" /> {compact(post.likes)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle size={16} /> {post.comments.length}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
