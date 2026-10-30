import { useEffect } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useStore } from "../../context/Store";
import { cn } from "../../lib/utils";
import { Composer } from "../feed/Composer";
import { PostModal } from "../feed/PostModal";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const postParam = params.get("post");
  const { openPost, closePost, closeComposer } = useStore();
  const inThread = /^\/messages\/[^/]+/.test(pathname);
  const isMessages = pathname.startsWith("/messages");

  useEffect(() => {
    if (!isMessages) window.scrollTo(0, 0);
    closeComposer();
  }, [pathname]);

  useEffect(() => {
    if (postParam) openPost(postParam);
  }, [postParam]);

  function closeSharedPost() {
    closePost();
    if (params.get("post")) {
      const next = new URLSearchParams(params);
      next.delete("post");
      setParams(next, { replace: true });
    }
  }

  return (
    <div className="min-h-dvh w-full bg-ink text-cream">
      <Sidebar />
      <MobileNav />
      <div
        className={cn(
          "shell-main w-full",
          isMessages ? "h-dvh overflow-hidden" : "min-h-dvh",
          inThread ? "pt-0 pb-0" : "pt-14 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pt-0 md:pb-0",
        )}
      >
        <Outlet />
      </div>
      <Composer />
      <PostModal onClose={closeSharedPost} />
    </div>
  );
}
