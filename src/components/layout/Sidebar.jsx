import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Plus, Search } from "lucide-react";
import { useStore } from "../../context/Store";
import { NAV } from "../../lib/nav";
import { cn } from "../../lib/utils";
import { Avatar } from "../ui/Avatar";
import { Logo } from "../ui/Logo";

export function Sidebar() {
  const { user, notifications, chats, openComposer, logout } = useStore();
  const navigate = useNavigate();
  const badges = {
    notes: notifications.filter((item) => !item.read).length,
    messages: chats.reduce((sum, chat) => sum + chat.unread, 0),
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--nav-w)] flex-col border-r border-white/8 bg-ink/95 backdrop-blur-xl md:flex">
      <div className="flex items-center px-4 py-5 lg:px-5">
        <NavLink to="/" aria-label="Lumina home">
          <Logo wordClassName="hidden lg:inline" />
        </NavLink>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const badge = item.badge ? badges[item.badge] : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center gap-3 rounded-2xl px-2 py-3 text-[15px] font-medium transition lg:justify-start lg:px-3",
                  isActive ? "bg-white/8 text-cream" : "text-mist hover:bg-white/5 hover:text-cream",
                )
              }
            >
              <span className="relative">
                <Icon size={22} strokeWidth={1.75} />
                {badge > 0 && (
                  <span className="absolute -right-2 -top-2 grid min-w-4 place-items-center rounded-full bg-[#ff4d8d] px-1 text-[9px] font-bold text-white lg:hidden">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span className="hidden lg:inline">{item.label}</span>
              {badge > 0 && (
                <span className="ml-auto hidden min-w-5 place-items-center rounded-full bg-[linear-gradient(120deg,#ff7a59,#ff4d8d)] px-1.5 text-[10px] font-bold text-white lg:grid">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => openComposer("post")}
          className="btn-gradient mt-3 flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold lg:justify-start"
        >
          <Plus size={20} />
          <span className="hidden lg:inline">Create</span>
        </button>

        <NavLink
          to="/explore"
          title="Search"
          className="mt-1 flex items-center justify-center gap-3 rounded-2xl px-2 py-3 text-mist transition hover:bg-white/5 hover:text-cream lg:justify-start lg:px-3"
        >
          <Search size={22} strokeWidth={1.75} />
          <span className="hidden lg:inline">Search</span>
        </NavLink>
      </nav>

      <div className="border-t border-white/8 p-3">
        <NavLink to="/profile" className="mb-1 flex items-center justify-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-white/5 lg:justify-start lg:px-2">
          <Avatar user={user} size={36} />
          <span className="hidden min-w-0 lg:block">
            <span className="block truncate text-sm font-semibold">{user?.name}</span>
            <span className="block truncate text-xs text-mist">@{user?.username}</span>
          </span>
        </NavLink>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center justify-center gap-3 rounded-2xl px-2 py-3 text-mist transition hover:bg-white/5 hover:text-cream lg:justify-start lg:px-3"
        >
          <LogOut size={20} />
          <span className="hidden lg:inline">Log out</span>
        </button>
      </div>
    </aside>
  );
}
