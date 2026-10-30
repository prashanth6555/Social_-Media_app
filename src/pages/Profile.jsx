import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Camera, Grid3x3, Heart, Link2, MapPin, MessageCircle, Play } from "lucide-react";
import { useStore } from "../context/Store";
import { profileErrors } from "../lib/validate";
import { cn, compact, fileToImage, gradientBtn, safeUrl } from "../lib/utils";
import { FollowButton } from "../components/social/FollowButton";
import { Verified } from "../components/social/Verified";
import { Avatar } from "../components/ui/Avatar";
import { Field } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";

const ownTabs = [
  { id: "posts", label: "Posts", icon: Grid3x3 },
  { id: "videos", label: "Videos", icon: Play },
  { id: "liked", label: "Liked", icon: Heart },
  { id: "saved", label: "Saved", icon: Heart },
];

export function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, people, posts, followingIds, updateProfile, ensureChat, openPost, toast } = useStore();
  const profile = username ? people.find((person) => person.username.toLowerCase() === username.toLowerCase()) : user;
  const mine = profile && user && profile.id === user.id;
  const [tab, setTab] = useState("posts");
  const [editing, setEditing] = useState(false);
  const [roster, setRoster] = useState(null);
  const [form, setForm] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState("");

  useEffect(() => {
    document.title = profile ? `Lumina — @${profile.username}` : "Lumina — Profile";
  }, [profile?.id, profile?.username]);

  useEffect(() => {
    setTab("posts");
  }, [profile?.id]);

  useEffect(() => {
    if (!editing || !profile) return;
    setForm({
      name: profile.name,
      username: profile.username,
      bio: profile.bio || "",
      location: profile.location || "",
      website: profile.website || "",
      avatar: profile.avatar,
      cover: profile.cover || "",
    });
    setAttempted(false);
  }, [editing, profile?.id]);

  if (!profile) {
    return (
      <div className="grid min-h-[60dvh] place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-3xl">That profile wandered off</h1>
          <p className="mt-2 text-sm text-mist">We couldn't find @{username}.</p>
          <Link to="/explore" className="mt-4 inline-flex text-sm font-semibold text-[#ffb4c8]">
            Explore people
          </Link>
        </div>
      </div>
    );
  }

  const owned = posts.filter((post) => post.userId === profile.id);
  const visible =
    tab === "videos"
      ? owned.filter((post) => post.media?.type === "video")
      : tab === "liked"
        ? posts.filter((post) => post.liked)
        : tab === "saved"
          ? posts.filter((post) => post.saved)
          : owned;
  const tabs = mine ? ownTabs : ownTabs.slice(0, 2);
  const website = safeUrl(profile.website);
  const errors = form ? profileErrors(form, people, user.id) : {};
  const rosterPeople =
    roster === "following" && mine
      ? people.filter((person) => followingIds.includes(person.id))
      : people.filter((person) => person.id !== profile.id).slice(0, 6);

  async function onPhoto(event, key) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setPhotoBusy(key);
    try {
      const data = await fileToImage(file, key === "cover" ? 1400 : 640);
      setForm((current) => ({ ...current, [key]: data }));
    } catch {
      toast("Couldn't read that image");
    } finally {
      setPhotoBusy("");
    }
  }

  function saveProfile(event) {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(errors).length || !form) return;
    setSaving(true);
    const result = updateProfile(form);
    setSaving(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast(result.persisted ? "Profile updated" : "Profile updated for this session");
    setEditing(false);
    if (username && form.username !== profile.username) navigate(`/profile/${form.username}`, { replace: true });
  }

  return (
    <div className="min-h-dvh pb-8">
      <div className="relative h-44 sm:h-56 md:h-64">
        {profile.cover ? (
          <img src={profile.cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(120deg,#ff7a59,#ff4d8d_45%,#7a5cff)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-black/10" />
      </div>

      <div className="px-4 sm:px-8">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="rounded-full bg-[linear-gradient(135deg,#ff7a59,#ff4d8d,#7a5cff)] p-[3px] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <img src={profile.avatar} alt="" className="size-24 rounded-full object-cover ring-4 ring-ink sm:size-32" />
          </div>
          <div className="flex flex-wrap gap-2">
            {mine ? (
              <button type="button" onClick={() => setEditing(true)} className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
                Edit profile
              </button>
            ) : (
              <>
                <FollowButton userId={profile.id} />
                <button
                  type="button"
                  onClick={() => navigate(`/messages/${ensureChat(profile.id)}`)}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/8"
                >
                  Message
                </button>
              </>
            )}
            <button
              type="button"
              onClick={async () => {
                const url = `${window.location.origin}/profile/${profile.username}`;
                try {
                  await navigator.clipboard.writeText(url);
                  toast("Profile link copied");
                } catch {
                  toast(url);
                }
              }}
              className="grid size-11 place-items-center rounded-full border border-white/15 hover:bg-white/8"
              aria-label="Copy profile link"
            >
              <Link2 size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          <h1 className="font-display text-3xl sm:text-4xl">{profile.name}</h1>
          <Verified show={profile.verified} />
        </div>
        <p className="text-mist">@{profile.username}</p>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">{profile.bio || (mine ? "Add a short bio so people know what you notice." : "No bio yet.")}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mist">
          {profile.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} /> {profile.location}
            </span>
          )}
          {website && (
            <a href={website} target="_blank" rel="noreferrer" className="text-[#ffb4c8] hover:underline">
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        <div className="mt-5 grid max-w-md grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10">
          <div className="px-3 py-3 text-center">
            <p className="font-display text-xl">{compact(owned.length)}</p>
            <p className="text-xs text-mist">Posts</p>
          </div>
          <button type="button" onClick={() => setRoster("followers")} className="px-3 py-3 text-center hover:bg-white/[0.04]">
            <p className="font-display text-xl">{compact(profile.followers)}</p>
            <p className="text-xs text-mist">Followers</p>
          </button>
          <button type="button" onClick={() => setRoster("following")} className="px-3 py-3 text-center hover:bg-white/[0.04]">
            <p className="font-display text-xl">{compact(profile.following)}</p>
            <p className="text-xs text-mist">Following</p>
          </button>
        </div>
      </div>

      <div className="mt-6 flex border-y border-white/8">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition",
                tab === item.id ? "border-b-2 border-[#ff8fb2] text-cream" : "text-mist hover:text-cream",
              )}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-mist">
          {tab === "posts" ? "No posts yet." : tab === "videos" ? "No videos yet." : tab === "liked" ? "Posts you like will gather here." : "Saved posts will gather here."}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
          {visible.map((post) => (
            <button key={post.id} type="button" onClick={() => openPost(post.id)} className="group relative aspect-square overflow-hidden bg-white/5">
              {post.media ? (
                <img src={post.media.poster || post.media.url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <span className="grid h-full place-items-center bg-[linear-gradient(145deg,#3a2230,#171824)] p-3 text-left text-xs sm:text-sm">{post.caption}</span>
              )}
              {post.media?.type === "video" && (
                <Play size={16} className="absolute right-2 top-2 fill-white text-white" />
              )}
              <span className="absolute inset-0 hidden items-center justify-center gap-3 bg-black/45 text-sm font-semibold sm:flex sm:opacity-0 sm:transition sm:group-hover:opacity-100">
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

      <Modal open={Boolean(roster)} onClose={() => setRoster(null)} label={roster === "following" ? "Following" : "Followers"} className="max-w-md">
        <div className="px-5 py-4 pr-14">
          <h2 className="font-display text-2xl">{roster === "following" ? "Following" : "Followers"}</h2>
          <p className="text-sm text-mist">People on Lumina. The public counts include everyone outside this demo.</p>
        </div>
        <ul className="max-h-[60dvh] overflow-y-auto pb-4">
          {rosterPeople.length === 0 && <li className="px-5 py-6 text-sm text-mist">No one here yet.</li>}
          {rosterPeople.map((person) => (
            <li key={person.id} className="flex items-center gap-3 px-5 py-2.5">
              <Link to={`/profile/${person.username}`} onClick={() => setRoster(null)}>
                <Avatar user={person} size={44} />
              </Link>
              <Link to={`/profile/${person.username}`} onClick={() => setRoster(null)} className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{person.name}</span>
                <span className="block truncate text-sm text-mist">@{person.username}</span>
              </Link>
              <FollowButton userId={person.id} className="px-3 py-1.5 text-xs" />
            </li>
          ))}
        </ul>
      </Modal>

      <Modal open={editing} onClose={() => setEditing(false)} label="Edit profile" className="max-w-lg">
        {form && (
          <form onSubmit={saveProfile} className="max-h-[92dvh] overflow-y-auto">
            <div className="relative h-32">
              {form.cover ? <img src={form.cover} alt="" className="h-full w-full object-cover" /> : <div className="h-full bg-[linear-gradient(120deg,#ff7a59,#7a5cff)]" />}
              <label className="absolute bottom-3 left-3 inline-flex cursor-pointer items-center gap-1 rounded-full bg-black/55 px-3 py-1.5 text-xs">
                <Camera size={14} />
                {photoBusy === "cover" ? "Working…" : "Cover"}
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => onPhoto(event, "cover")} />
              </label>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="flex items-center gap-4">
                <img src={form.avatar} alt="" className="size-16 rounded-full object-cover" />
                <label className="cursor-pointer text-sm font-semibold text-[#ffb4c8]">
                  {photoBusy === "avatar" ? "Updating photo…" : "Change photo"}
                  <input type="file" accept="image/*" className="sr-only" onChange={(event) => onPhoto(event, "avatar")} />
                </label>
              </div>
              <Field label="Name" name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} error={attempted ? errors.name : ""} />
              <Field label="Username" name="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} error={attempted ? errors.username : ""} />
              <label className="block text-sm font-medium text-cream/85">
                Bio
                <textarea
                  value={form.bio}
                  maxLength={160}
                  onChange={(event) => setForm({ ...form, bio: event.target.value })}
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] font-normal outline-none focus:border-[#ff8fb2]/80"
                />
                <span className="mt-1 block text-xs font-normal text-mist">{form.bio.length}/160</span>
                {attempted && errors.bio && <span className="mt-1 block text-xs font-normal text-rose-300">{errors.bio}</span>}
              </label>
              <Field label="Location" name="location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} error={attempted ? errors.location : ""} />
              <Field label="Website" name="website" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} error={attempted ? errors.website : ""} placeholder="yoursite.com" />
              <button type="submit" disabled={saving} className={cn(gradientBtn, "w-full")}>
                {saving ? "Saving…" : "Save profile"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
