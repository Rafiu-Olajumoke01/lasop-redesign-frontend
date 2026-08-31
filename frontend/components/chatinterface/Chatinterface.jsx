'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// ChatInterface — WhatsApp-style two-pane chat, restyled in LASOP blue.
//
// This component is UI-only and fully driven by props, so it can be
// previewed with mock data today and wired to a real API/WebSocket
// (e.g. Pusher) later without touching any of the markup below —
// only the data hook that feeds it needs to change.
//
// USAGE
// -----
//   <ChatInterface
//     currentUser={{ id: 12, name: 'Ada Bello', role: 'tutor' }}
//     chats={chats}                 // see shape below
//     activeChat Id={activeChatId}
//     onSelectChat={(chatId) => ...}
//     messages={messages}           // messages for the active chat only
//     onSendMessage={(text) => ...}
//     connectionStatus="connected"  // "connected" | "connecting" | "offline"
//   />
//
// SHAPES
// ------
//   chat = {
//     id, name, kind: 'cohort' | 'all_cohorts',
//     member_count, last_message: { text, sender_name, created_at } | null,
//     unread_count,
//   }
//   message = {
//     id, text, sender_id, sender_name, created_at,
//   }
// ═══════════════════════════════════════════════════════════════════════════

const BRAND_BLUE = '#0057E7';

// ─── WhatsApp-style tiled background, recolored ────────────────────────────
// A faint repeating doodle pattern, same idea as WhatsApp's chat wallpaper,
// but in a muted blue tint so it reads as LASOP's own rather than a clone.

function ChatWallpaper() {
  const pattern = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
      <g fill="none" stroke="#0057E7" stroke-width="1.2" opacity="0.06">
        <circle cx="20" cy="24" r="7" />
        <path d="M50 18 L58 26 M58 18 L50 26" />
        <rect x="84" y="14" width="14" height="14" rx="3" />
        <path d="M14 70 q8 -10 16 0 q8 10 16 0" />
        <circle cx="70" cy="72" r="5" />
        <path d="M100 60 L112 72 M112 60 L100 72" />
        <rect x="20" y="100" width="12" height="12" rx="2" />
        <circle cx="60" cy="112" r="6" />
        <path d="M92 100 q8 -10 16 0 q8 10 16 0" />
      </g>
    </svg>
  `);
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundColor: '#EEF3FB',
        backgroundImage: `url("data:image/svg+xml,${pattern}")`,
        backgroundSize: '140px 140px',
      }}
    />
  );
}

// ─── Shared bits (mirrors Backstage / Tutor Portal styling) ────────────────

function Avatar({ name, size = 40 }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, background: BRAND_BLUE, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}

function Badge({ count }) {
  if (!count) return null;
  return (
    <span
      className="min-w-[20px] h-5 px-1.5 rounded-full text-white text-[11px] font-bold flex items-center justify-center"
      style={{ background: BRAND_BLUE }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

function formatListTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatBubbleTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ─── Connection status pill ─────────────────────────────────────────────────

function ConnectionStatus({ status }) {
  if (status === 'connected') return null; // silent when healthy, like WhatsApp
  const label = status === 'connecting' ? 'Connecting…' : 'Offline — messages will send once reconnected';
  const color = status === 'connecting' ? '#B45309' : '#B91C1C';
  const bg = status === 'connecting' ? '#FEF3C7' : '#FEE2E2';
  return (
    <div className="text-center text-[12px] font-medium py-1.5" style={{ color, background: bg }}>
      {label}
    </div>
  );
}

// ─── Chat list (left pane / mobile home) ───────────────────────────────────

function ChatListItem({ chat, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-100 ${
        active ? 'bg-blue-50' : 'hover:bg-slate-50'
      }`}
    >
      <Avatar name={chat.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-slate-900 font-semibold text-[14px] truncate">{chat.name}</p>
          {chat.last_message && (
            <span className="text-slate-400 text-[11px] shrink-0">{formatListTime(chat.last_message.created_at)}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-slate-500 text-[12.5px] truncate">
            {chat.last_message
              ? `${chat.last_message.sender_name}: ${chat.last_message.text}`
              : `${chat.member_count} member${chat.member_count !== 1 ? 's' : ''}`}
          </p>
          <Badge count={chat.unread_count} />
        </div>
      </div>
    </button>
  );
}

function ChatList({ chats, activeChatId, onSelectChat, currentUser }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return chats;
    const q = query.toLowerCase();
    return chats.filter((c) => c.name.toLowerCase().includes(q));
  }, [chats, query]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 pt-5 pb-3 shrink-0" style={{ background: BRAND_BLUE }}>
        <h2 className="text-white font-bold text-[17px] mb-3">Chats</h2>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="w-full bg-white/95 rounded-full pl-9 pr-3.5 py-2 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-16 text-center px-6">
            <p className="text-slate-400 text-sm">No chats match "{query}"</p>
          </div>
        ) : (
          filtered.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              active={chat.id === activeChatId}
              onClick={() => onSelectChat(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Message bubble ─────────────────────────────────────────────────────────

function MessageBubble({ message, isOwn, showSenderName }) {
  return (
    <div className={`flex mb-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] px-3.5 py-2 shadow-sm ${
          isOwn
            ? 'bg-blue-100 text-slate-900 rounded-2xl rounded-tr-sm'
            : 'bg-white text-slate-900 rounded-2xl rounded-tl-sm'
        }`}
      >
        {showSenderName && !isOwn && (
          <p className="text-[12px] font-bold mb-0.5" style={{ color: BRAND_BLUE }}>
            {message.sender_name}
          </p>
        )}
        <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{message.text}</p>
        <p className="text-slate-400 text-[10.5px] text-right mt-0.5">{formatBubbleTime(message.created_at)}</p>
      </div>
    </div>
  );
}

function DateDivider({ label }) {
  return (
    <div className="flex justify-center my-3">
      <span className="bg-white/90 text-slate-500 text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
        {label}
      </span>
    </div>
  );
}

function groupBySender(messages) {
  // Marks which messages should show the sender name (first in a run from
  // that sender) and which day-divider should precede each message.
  return messages.map((m, i) => {
    const prev = messages[i - 1];
    const showSenderName = !prev || prev.sender_id !== m.sender_id;
    const prevDay = prev ? new Date(prev.created_at).toDateString() : null;
    const thisDay = new Date(m.created_at).toDateString();
    const dayLabel = prevDay !== thisDay ? new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
    return { ...m, _showSenderName: showSenderName, _dayLabel: dayLabel };
  });
}

// ─── Conversation view (right pane / mobile full-screen) ──────────────────

function ConversationView({ chat, messages, currentUser, onSend, onBack, connectionStatus }) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, chat?.id]);

  const grouped = useMemo(() => groupBySender(messages), [messages]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat) {
    return (
      <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0 z-10" style={{ background: BRAND_BLUE }}>
        <button onClick={onBack} className="text-white md:hidden" aria-label="Back to chats">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <Avatar name={chat.name} size={36} />
        <div className="min-w-0">
          <p className="text-white font-semibold text-[14.5px] truncate">{chat.name}</p>
          <p className="text-blue-100 text-[11.5px]">{chat.member_count} member{chat.member_count !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <ConnectionStatus status={connectionStatus} />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative px-3 sm:px-6 py-4">
        <ChatWallpaper />
        <div className="relative max-w-2xl mx-auto">
          {grouped.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-sm">No messages yet — say hello 👋</p>
            </div>
          ) : (
            grouped.map((m) => (
              <div key={m.id}>
                {m._dayLabel && <DateDivider label={m._dayLabel} />}
                <MessageBubble
                  message={m}
                  isOwn={m.sender_id === currentUser.id}
                  showSenderName={m._showSenderName}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="flex items-end gap-2 px-3 sm:px-4 py-3 bg-white border-t border-slate-200 shrink-0">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          rows={1}
          className="flex-1 resize-none bg-slate-100 rounded-2xl px-4 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none max-h-28"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          aria-label="Send message"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-40 transition-opacity"
          style={{ background: BRAND_BLUE }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Root component ─────────────────────────────────────────────────────────

export default function ChatInterface({
  currentUser,
  chats,
  activeChatId,
  onSelectChat,
  messages,
  onSendMessage,
  connectionStatus = 'connected',
}) {
  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const showListOnMobile = !activeChatId;

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[480px] bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className={`w-full md:w-[340px] shrink-0 border-r border-slate-200 ${showListOnMobile ? 'block' : 'hidden md:block'}`}>
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={onSelectChat}
          currentUser={currentUser}
        />
      </div>
      <div className={`flex-1 ${showListOnMobile ? 'hidden md:flex' : 'flex'} flex-col`}>
        <ConversationView
          chat={activeChat}
          messages={messages}
          currentUser={currentUser}
          onSend={onSendMessage}
          onBack={() => onSelectChat(null)}
          connectionStatus={connectionStatus}
        />
      </div>
    </div>
  );
}