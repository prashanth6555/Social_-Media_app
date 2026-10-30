import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../context/Store";
import { PostCard } from "../components/feed/PostCard";
import { PeopleRow, SideRail, SuggestedPosts, TopicRow } from "../components/feed/Highlights";
import { StoriesBar } from "../components/feed/StoriesBar";
import { Avatar } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";

let feedIntroPlayed = false;

function ComposerBar() {
  const { user, openComposer } = useStore();
  return (
    <button type="button" onClick={() => openComposer("post")} className="flex w-full items-center gap-3 border-b border-white/[0.06] px-4 py-4 text-left transition hover:bg-white/[0.03] sm:px-5">
      <Avatar user={user} size={42} />
      <span className="flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-mist">Share something luminous…</span>
      <span className="btn-gradient hidden rounded-full px-4 py-2 text-sm font-semibold sm:inline-flex">Post</span>
    </button>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-5">
      {[0, 1].map((item) => (
        <div key={item} className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 rounded-full" />
              <Skeleton className="h-2.5 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="aspect-[4/5] w-full rounded-none sm:aspect-[3/2] sm:rounded-[24px]" />
        </div>
      ))}
    </div>
  );
}

export function Home() {
  const { posts } = useStore();
  const [booting, setBooting] = useState(!feedIntroPlayed);

  useEffect(() => {
    document.title = "Lumina — Home";
    if (feedIntroPlayed) return undefined;
    const timer = window.setTimeout(() => {
      feedIntroPlayed = true;
      setBooting(false);
    }, 700);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 xl:border-r xl:border-white/8">
        <StoriesBar />
        <ComposerBar />
        <div className="border-b border-white/[0.06] xl:hidden">
          <TopicRow />
          <PeopleRow limit={6} />
        </div>
        {booting ? (
          <FeedSkeleton />
        ) : (
          posts.map((post, index) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 5) * 0.05, duration: 0.35 }}>
              <PostCard post={post} priority={index < 2} />
              {index === 1 && <SuggestedPosts />}
            </motion.div>
          ))
        )}
      </div>
      <SideRail />
    </div>
  );
}
