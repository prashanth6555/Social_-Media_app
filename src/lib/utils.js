export function cn(...parts) {
  return parts.flat().filter(Boolean).join(" ");
}

export function uid() {
  return `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function timeAgo(iso) {
  const delta = Date.now() - new Date(iso).getTime();
  const seconds = Math.max(0, Math.floor(delta / 1000));
  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function compact(n) {
  const value = Number(n) || 0;
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (abs >= 10_000) return `${Math.round(value / 1000)}K`;
  if (abs >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${value}`;
}

export function likeLabel(post) {
  if (!post.likes) return "Be the first to like this";
  if (post.liked && post.likes === 1) return "Liked by you";
  if (post.liked) {
    const others = post.likes - 1;
    return `Liked by you and ${compact(others)} ${others === 1 ? "other" : "others"}`;
  }
  return `${compact(post.likes)} ${post.likes === 1 ? "like" : "likes"}`;
}

export function initialAvatar(name) {
  const letter = (name || "L").trim().charAt(0).toUpperCase() || "L";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%23ff7a59'/><stop offset='0.5' stop-color='%23ff4d8d'/><stop offset='1' stop-color='%237a5cff'/></linearGradient></defs><rect width='200' height='200' fill='url(%23g)'/><text x='50%' y='56%' text-anchor='middle' fill='white' font-size='92' font-family='Georgia,serif'>${letter}</text></svg>`;
  return `data:image/svg+xml,${svg}`;
}

export function safeUrl(value) {
  if (!value) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

export function fileToImage(file, max = 960) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image"));
    };
    img.src = url;
  });
}

export const gradientBtn =
  "btn-gradient inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60";
