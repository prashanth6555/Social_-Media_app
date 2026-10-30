import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_ACCOUNT, REPLIES, seedChats, seedNotifications, seedPosts, seedStories, seedUsers } from "../data/mockData";
import { initialAvatar, uid } from "../lib/utils";

const StoreContext = createContext(null);
const EMPTY_LIST = [];
const ACCOUNTS_KEY = "lumina-accounts-v1";
const SESSION_KEY = "lumina-session-v1";
const PROFILE_KEYS = ["name", "username", "bio", "avatar", "cover", "location", "website"];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function loadAccounts() {
  const stored = readJson(ACCOUNTS_KEY, []);
  const merged = seedUsers.map((seed) => {
    const saved = stored.find((account) => account.email === seed.email);
    if (!saved) return seed;
    const patch = {};
    for (const key of PROFILE_KEYS) {
      if (saved[key] !== undefined) patch[key] = saved[key];
    }
    if (saved.password) patch.password = saved.password;
    return { ...seed, ...patch };
  });
  const extras = stored.filter((account) => !seedUsers.some((seed) => seed.email === account.email));
  return [...merged, ...extras];
}

function readSession() {
  const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.userId ? { userId: parsed.userId } : null;
  } catch {
    return null;
  }
}

function persistAccounts(list) {
  const slim = list.map((account) => ({
    id: account.id,
    name: account.name,
    username: account.username,
    email: account.email,
    password: account.password,
    bio: account.bio,
    avatar: account.avatar,
    cover: account.cover,
    location: account.location,
    website: account.website,
    verified: account.verified,
    followers: account.followers,
    following: account.following,
    online: account.online,
  }));
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(slim));
    return true;
  } catch {
    return false;
  }
}

function publicAccount(account) {
  if (!account) return null;
  const safe = { ...account };
  delete safe.password;
  return safe;
}

export function StoreProvider({ children }) {
  const [accounts, setAccounts] = useState(loadAccounts);
  const [session, setSession] = useState(readSession);
  const [posts, setPosts] = useState(seedPosts);
  const [stories, setStories] = useState(seedStories);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [chats, setChats] = useState(seedChats);
  const [likedBy, setLikedBy] = useState({ u1: ["p1", "p4", "p5"] });
  const [savedBy, setSavedBy] = useState({ u1: ["p6", "p7"] });
  const [graph, setGraph] = useState({ u1: ["u2", "u3", "u5", "u7"] });
  const [composer, setComposer] = useState(null);
  const [activePostId, setActivePostId] = useState(null);
  const [typingChatId, setTypingChatId] = useState(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [toasts, setToasts] = useState([]);

  const user = accounts.find((account) => account.id === session?.userId) || null;
  const userId = user?.id;

  useEffect(() => {
    if (userId !== "u1") return undefined;
    const timer = window.setTimeout(() => {
      setNotifications((current) => [
        {
          id: uid(),
          type: "like",
          userId: "u5",
          text: "liked your latest post.",
          postId: "p3",
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...current,
      ]);
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [userId]);

  function toast(message) {
    const id = uid();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 2800);
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((item) => item.id !== id));
  }

  function startSession(userId, remember) {
    const value = JSON.stringify({ userId });
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (remember) localStorage.setItem(SESSION_KEY, value);
    else sessionStorage.setItem(SESSION_KEY, value);
    setSession({ userId });
  }

  function login({ email, password, remember }) {
    const account = accounts.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, error: "Incorrect email or password" };
    }
    startSession(account.id, remember);
    return { ok: true };
  }

  function signup(values) {
    const email = values.email.trim().toLowerCase();
    const username = values.username.trim().toLowerCase();
    if (accounts.some((account) => account.email.toLowerCase() === email)) {
      return { ok: false, error: "An account with this email already exists" };
    }
    if (accounts.some((account) => account.username.toLowerCase() === username)) {
      return { ok: false, error: "That username is taken" };
    }
    const account = {
      id: uid(),
      name: values.name.trim(),
      username,
      email,
      password: values.password,
      bio: "",
      avatar: initialAvatar(values.name),
      cover: "",
      location: "",
      website: "",
      followers: 0,
      following: 0,
      verified: false,
      online: true,
    };
    const next = [account, ...accounts];
    setAccounts(next);
    persistAccounts(next);
    startSession(account.id, values.remember);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  function updateProfile(patch) {
    if (!user) return { ok: false, error: "You need to be signed in" };
    const username = patch.username?.trim().toLowerCase();
    if (username && accounts.some((account) => account.id !== user.id && account.username.toLowerCase() === username)) {
      return { ok: false, error: "That username is taken" };
    }
    const next = accounts.map((account) =>
      account.id === user.id
        ? {
            ...account,
            ...patch,
            name: patch.name?.trim() ?? account.name,
            username: username || account.username,
            bio: patch.bio?.trim() ?? account.bio,
            location: patch.location?.trim() ?? account.location,
            website: patch.website?.trim() ?? account.website,
          }
        : account,
    );
    setAccounts(next);
    const saved = persistAccounts(next);
    return { ok: true, persisted: saved };
  }

  function toggleLike(postId) {
    if (!user) return;
    const mine = likedBy[user.id] || [];
    const on = mine.includes(postId);
    setLikedBy((current) => ({
      ...current,
      [user.id]: on ? mine.filter((id) => id !== postId) : [...mine, postId],
    }));
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, likes: Math.max(0, post.likes + (on ? -1 : 1)) } : post,
      ),
    );
  }

  function toggleSave(postId) {
    if (!user) return;
    const mine = savedBy[user.id] || [];
    const on = mine.includes(postId);
    setSavedBy((current) => ({
      ...current,
      [user.id]: on ? mine.filter((id) => id !== postId) : [...mine, postId],
    }));
    toast(on ? "Removed from saved" : "Saved to your profile");
  }

  function addComment(postId, text) {
    if (!user) return;
    const clean = text.trim().slice(0, 500);
    if (!clean) return;
    const comment = { id: uid(), userId: user.id, text: clean, createdAt: new Date().toISOString() };
    setPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, comments: [...post.comments, comment] } : post)),
    );
  }

  function bumpShare(postId) {
    setPosts((current) => current.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)));
  }

  function createPost({ caption, media, location }) {
    const post = {
      id: uid(),
      userId: user.id,
      caption: caption.trim(),
      media,
      location: location.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      shares: 0,
      comments: [],
    };
    setPosts((current) => [post, ...current]);
    toast("Posted to Lumina");
    return post.id;
  }

  function deletePost(postId) {
    setPosts((current) => current.filter((post) => post.id !== postId));
    setActivePostId((current) => (current === postId ? null : current));
    toast("Post removed");
  }

  function toggleFollow(userId) {
    if (!user || userId === user.id) return;
    const currentFollowing = graph[user.id] || [];
    const on = currentFollowing.includes(userId);
    setGraph((current) => ({
      ...current,
      [user.id]: on ? currentFollowing.filter((id) => id !== userId) : [...currentFollowing, userId],
    }));
    setAccounts((current) =>
      current.map((account) => {
        if (account.id === userId) return { ...account, followers: Math.max(0, account.followers + (on ? -1 : 1)) };
        if (account.id === user.id) return { ...account, following: Math.max(0, account.following + (on ? -1 : 1)) };
        return account;
      }),
    );
    if (!on) {
      const person = accounts.find((account) => account.id === userId);
      toast(`Following ${person?.name.split(" ")[0] || "them"}`);
    }
  }

  function markRead(id) {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }

  function markAllRead() {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }

  function ensureChat(userId) {
    const existing = chats.find((chat) => chat.userId === userId);
    if (existing) return existing.id;
    const id = uid();
    setChats((current) => [{ id, userId, messages: [], unread: 0 }, ...current]);
    return id;
  }

  function markChatRead(id) {
    setChats((current) => {
      const chat = current.find((item) => item.id === id);
      if (!chat?.unread) return current;
      return current.map((item) => (item.id === id ? { ...item, unread: 0 } : item));
    });
  }

  function sendMessage(chatId, text) {
    const clean = text.trim().slice(0, 1000);
    if (!clean) return;
    const message = { id: uid(), from: "me", text: clean, createdAt: new Date().toISOString() };
    setChats((current) =>
      current.map((chat) => (chat.id === chatId ? { ...chat, messages: [...chat.messages, message], unread: 0 } : chat)),
    );
    setTypingChatId(chatId);
    window.setTimeout(() => {
      const reply = {
        id: uid(),
        from: "them",
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
        createdAt: new Date().toISOString(),
      };
      setChats((current) =>
        current.map((chat) => (chat.id === chatId ? { ...chat, messages: [...chat.messages, reply] } : chat)),
      );
      setTypingChatId((current) => (current === chatId ? null : current));
    }, 1200);
  }

  function addStory({ media, caption }) {
    const slide = {
      id: uid(),
      type: media.type,
      url: media.url,
      poster: media.poster,
      caption,
      timeLabel: "Just now",
    };
    setStories((current) => {
      const mine = current.find((story) => story.userId === user.id);
      if (!mine) return [{ id: uid(), userId: user.id, seen: false, slides: [slide] }, ...current];
      return current.map((story) =>
        story.userId === user.id ? { ...story, seen: false, slides: [...story.slides, slide] } : story,
      );
    });
    toast("Your story is live");
  }

  function markStorySeen(id) {
    setStories((current) => {
      const story = current.find((item) => item.id === id);
      if (!story || story.seen) return current;
      return current.map((item) => (item.id === id ? { ...item, seen: true } : item));
    });
  }

  const mineLikes = (user && likedBy[user.id]) || EMPTY_LIST;
  const mineSaves = (user && savedBy[user.id]) || EMPTY_LIST;
  const followingIds = (user && graph[user.id]) || EMPTY_LIST;

  const feed = useMemo(() => {
    const likes = new Set(mineLikes);
    const saves = new Set(mineSaves);
    return [...posts]
      .map((post) => ({ ...post, liked: likes.has(post.id), saved: saves.has(post.id) }))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [posts, mineLikes, mineSaves]);

  const value = {
    user: publicAccount(user),
    people: accounts.map(publicAccount),
    posts: feed,
    stories,
    notifications,
    chats,
    followingIds,
    composer,
    activePostId,
    typingChatId,
    messageDraft,
    toasts,
    demo: DEMO_ACCOUNT,
    login,
    signup,
    logout,
    updateProfile,
    toggleLike,
    toggleSave,
    addComment,
    bumpShare,
    createPost,
    deletePost,
    toggleFollow,
    markRead,
    markAllRead,
    ensureChat,
    markChatRead,
    sendMessage,
    addStory,
    markStorySeen,
    setMessageDraft,
    openComposer: (mode = "post") => setComposer(mode),
    closeComposer: () => setComposer(null),
    openPost: (id) => setActivePostId((current) => (current === id ? current : id)),
    closePost: () => setActivePostId(null),
    toast,
    dismissToast,
    getUser(id) {
      return publicAccount(accounts.find((account) => account.id === id)) || {
        id,
        name: "Lumina member",
        username: "member",
        avatar: initialAvatar("L"),
        verified: false,
        bio: "",
        followers: 0,
        following: 0,
      };
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
