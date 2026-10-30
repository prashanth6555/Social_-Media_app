import { useStore } from "../../context/Store";
import { cn } from "../../lib/utils";

export function FollowButton({ userId, className }) {
  const { user, followingIds, toggleFollow } = useStore();
  if (!user || userId === user.id) return null;
  const following = followingIds.includes(userId);

  return (
    <button
      type="button"
      onClick={() => toggleFollow(userId)}
      className={cn(
        "group shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
        following
          ? "border border-white/15 bg-white/[0.04] text-cream hover:border-rose-300/40 hover:text-rose-200"
          : "btn-gradient",
        className,
      )}
    >
      {following ? (
        <>
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:inline">Unfollow</span>
        </>
      ) : (
        "Follow"
      )}
    </button>
  );
}
