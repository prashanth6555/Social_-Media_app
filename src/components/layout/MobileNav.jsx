import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Plus, Search, X } from "lucide-react";
import { useStore } from "../../context/Store";
import { NAV } from "../../lib/nav";
import { cn } from "../../lib/utils";
import { Avatar } from "../ui/Avatar";
import { Logo } from "../ui/Logo";

export function MobileNav() {
  const { user, notifications, chats, openComposer, logout } = useStore();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inThread = /^\/messages\/[^/]+/.test(pathname);
  const badges = {
    notes: notifications.filter((item) => !item.read).length,
    messages: chats.reduce((sum, chat) => sum + chat.unread, 0),
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (inThread) return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/8 bg-ink/85 px-3 backdrop-blur-xl md:hidden">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="grid size-10 place-items-center rounded-full hover:bg-white/8"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <NavLink to="/" aria-label="Lumina home">
          <Logo markClassName="size-8 rounded-xl" wordClassName="text-lg" />
        </NavLink>
        <NavLink to="/explore" aria-label="Search" className="grid size-10 place-items-center rounded-full hover:bg-white/8">
          <Search size={20} />
        </NavLink>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <ul className="grid h-16 grid-cols-5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const badge = item.badge ? badges[item.badge] : 0;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex h-full flex-col items-center justify-center gap-1 text-[10px] font-medium",
                      isActive ? "text-cream" : "text-mist",
                    )
                  }
                >
                  <span className="relative">
                    <Icon size={21} strokeWidth={1.75} />
                    {badge > 0 && (
                      <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-[#ff4d8d] px-1 text-[9px] font-bold text-white">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </span>
                  <span className="max-[359px]:sr-only">{item.short}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-50 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -340 }}
              animate={{ x: 0 }}
              exit={{ x: -340 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-[320px] flex-col bg-ink shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between px-4 py-4">
                <Logo />
                <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-white/8">
                  <X size={20} />
                </button>
              </div>
              <NavLink to="/profile" className="mx-3 flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
                <Avatar user={user} size={46} showOnline />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{user?.name}</span>
                  <span className="block truncate text-sm text-mist">@{user?.username}</span>
                </span>
              </NavLink>
              <nav className="mt-3 flex flex-col gap-1 px-3">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const badge = item.badge ? badges[item.badge] : 0;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium",
                          isActive ? "bg-white/8 text-cream" : "text-mist hover:bg-white/5 hover:text-cream",
                        )
                      }
                    >
                      <Icon size={20} />
                      {item.label}
                      {badge > 0 && (
                        <span className="ml-auto rounded-full bg-[#ff4d8d] px-2 py-0.5 text-[10px] font-bold text-white">{badge}</span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openComposer("post");
                }}
                className="btn-gradient mx-3 mt-3 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold"
              >
                <Plus size={18} />
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="mx-3 mt-auto mb-4 flex items-center gap-3 rounded-2xl px-3 py-3 text-mist hover:bg-white/5 hover:text-cream"
              >
                <LogOut size={18} />
                Log out
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
