import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Send } from "lucide-react";
import { useStore } from "../context/Store";
import { cn, timeAgo } from "../lib/utils";
import { Verified } from "../components/social/Verified";
import { Avatar } from "../components/ui/Avatar";

export function Messages() {
  const { chatId } = useParams();
  const { chats, getUser, sendMessage, typingChatId, messageDraft, setMessageDraft, markChatRead } = useStore();
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const chat = chats.find((item) => item.id === chatId);
  const person = chat ? getUser(chat.userId) : null;

  useEffect(() => {
    document.title = person ? `Lumina — ${person.name}` : "Lumina — Messages";
  }, [person?.name, chatId]);

  useEffect(() => {
    if (chatId) markChatRead(chatId);
  }, [chatId]);

  useEffect(() => {
    if (chat && messageDraft) {
      setText(messageDraft);
      setMessageDraft("");
    }
  }, [chat, messageDraft, setMessageDraft]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages.length, typingChatId, chatId]);

  const filtered = [...chats]
    .sort((a, b) => new Date(b.messages.at(-1)?.createdAt || 0) - new Date(a.messages.at(-1)?.createdAt || 0))
    .filter((item) => {
      const other = getUser(item.userId);
      return `${other.name} ${other.username}`.toLowerCase().includes(query.trim().toLowerCase());
    });

  function submit(event) {
    event.preventDefault();
    if (!chat || !text.trim()) return;
    sendMessage(chat.id, text);
    setText("");
  }

  return (
    <div className="flex h-full min-h-0 w-full">
      <aside className={cn("h-full min-h-0 w-full flex-col border-white/8 md:flex md:w-[340px] md:shrink-0 md:border-r", chatId ? "hidden" : "flex")}>
        <div className="border-b border-white/8 px-4 py-4">
          <h1 className="font-display text-3xl">Messages</h1>
          <label className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
            <Search size={16} className="text-mist" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search chats" className="w-full bg-transparent text-sm outline-none placeholder:text-mist/70" />
          </label>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {filtered.length === 0 && <li className="px-4 py-10 text-sm text-mist">No conversations match.</li>}
          {filtered.map((item) => {
            const other = getUser(item.userId);
            const last = item.messages.at(-1);
            const active = item.id === chatId;
            return (
              <li key={item.id}>
                <Link to={`/messages/${item.id}`} className={cn("flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.04]", active && "bg-white/[0.06]")}>
                  <Avatar user={other} size={52} showOnline />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1">
                      <span className="truncate font-semibold">{other.name}</span>
                      <Verified show={other.verified} />
                    </span>
                    <span className={cn("block truncate text-sm", item.unread ? "text-cream" : "text-mist")}>{last?.text || "Say hello"}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[11px] text-mist">{last ? timeAgo(last.createdAt) : ""}</span>
                    {item.unread > 0 && <span className="mt-1 ml-auto grid size-5 place-items-center rounded-full bg-[#ff4d8d] text-[10px] font-bold">{item.unread}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className={cn("h-full min-h-0 min-w-0 flex-1 flex-col", chatId ? "flex" : "hidden md:flex")}>
        {!chat ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div>
              <p className="font-display text-3xl">Your inbox</p>
              <p className="mt-2 text-sm text-mist">{chatId ? "That conversation isn't here." : "Choose someone and keep it easy."}</p>
              {chatId && (
                <Link to="/messages" className="mt-4 inline-flex text-sm font-semibold text-[#ffb4c8]">
                  Back to chats
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-white/8 px-3 py-3 sm:px-5">
              <Link to="/messages" aria-label="Back to chats" className="grid size-10 place-items-center rounded-full hover:bg-white/8 md:hidden">
                <ArrowLeft size={18} />
              </Link>
              <Link to={`/profile/${person.username}`} className="flex min-w-0 items-center gap-3">
                <Avatar user={person} size={42} showOnline />
                <span className="min-w-0">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="truncate">{person.name}</span>
                    <Verified show={person.verified} />
                  </span>
                  <span className="block text-xs text-mist">{person.online ? "Active now" : `@${person.username}`}</span>
                </span>
              </Link>
            </header>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5">
              {chat.messages.length === 0 && <p className="text-center text-sm text-mist">No messages yet. Start with something small.</p>}
              {chat.messages.map((message, index) => {
                const mine = message.from === "me";
                return (
                  <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index > chat.messages.length - 3 ? 0.05 : 0 }} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[80%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed", mine ? "rounded-br-md bg-[linear-gradient(120deg,#ff7a59,#ff4d8d_60%,#7a5cff)] text-white" : "rounded-bl-md bg-white/8 text-cream")}>
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                      <p className={cn("mt-1 text-[10px]", mine ? "text-white/75" : "text-mist")}>{timeAgo(message.createdAt)}</p>
                    </div>
                  </motion.div>
                );
              })}
              {typingChatId === chat.id && (
                <div className="flex items-center gap-2 text-sm text-mist">
                  <span className="flex gap-1 rounded-full bg-white/8 px-3 py-2">
                    <i className="size-1.5 animate-bounce rounded-full bg-mist [animation-delay:-0.2s]" />
                    <i className="size-1.5 animate-bounce rounded-full bg-mist [animation-delay:-0.1s]" />
                    <i className="size-1.5 animate-bounce rounded-full bg-mist" />
                  </span>
                  {person.name.split(" ")[0]} is typing
                </div>
              )}
              <div ref={endRef} />
            </div>
            <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/8 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
              <input
                value={text}
                onChange={(event) => setText(event.target.value.slice(0, 1000))}
                placeholder={`Message ${person.name.split(" ")[0]}`}
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-mist/70 focus:border-[#ff8fb2]/70"
              />
              <button type="submit" disabled={!text.trim()} aria-label="Send message" className="btn-gradient grid size-11 place-items-center rounded-full disabled:opacity-40">
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
