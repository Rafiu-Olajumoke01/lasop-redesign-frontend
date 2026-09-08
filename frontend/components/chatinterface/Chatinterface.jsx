'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

const HEADER_TEAL = '#075E54';
const ACCENT_BLUE = '#0057E7';
const OUTGOING_GREEN = '#D9FDD3';

function ChatWallpaper() {
  const pattern = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <g fill="none" stroke="#B7C6BE" stroke-width="1" opacity="0.35">
        <circle cx="24" cy="30" r="9" />
        <path d="M60 20 L70 30 M70 20 L60 30" />
        <rect x="110" y="16" width="18" height="18" rx="4" />
        <path d="M16 90 q10 -12 20 0 q10 12 20 0" />
        <circle cx="90" cy="95" r="7" />
        <path d="M140 78 L154 92 M154 78 L140 92" />
        <rect x="24" y="140" width="16" height="16" rx="3" />
        <circle cx="80" cy="155" r="8" />
        <path d="M130 138 q10 -12 20 0 q10 12 20 0" />
        <path d="M170 30 l6 6 -6 6 -6 -6z" />
      </g>
    </svg>
  `);
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundColor: '#EFEAE2',
        backgroundImage: `url("data:image/svg+xml,${pattern}")`,
        backgroundSize: '200px 200px',
      }}
    />
  );
}

function Avatar({ name, size = 40 }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, background: ACCENT_BLUE, fontSize: size * 0.4 }}
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
      style={{ background: '#25D366' }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

function DoubleCheck() {
  return (
    <svg width="15" height="11" viewBox="0 0 16 11" fill="none" className="inline-block align-text-bottom">
      <path d="M1 5.5L4.5 9L11 1.5" stroke="#53BDEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5.5L8.5 9L15 1.5" stroke="#53BDEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

function ConnectionStatus({ status }) {
  if (status === 'connected') return null;
  const label = status === 'connecting' ? 'Connecting…' : 'Offline — messages will send once reconnected';
  const color = status === 'connecting' ? '#B45309' : '#B91C1C';
  const bg = status === 'connecting' ? '#FEF3C7' : '#FEE2E2';
  return (
    <div className="text-center text-[12px] font-medium py-1.5" style={{ color, background: bg }}>
      {label}
    </div>
  );
}

function ChatListItem({ chat, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-100 ${
        active ? 'bg-slate-100' : 'hover:bg-slate-50'
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

function ChatList({ chats, activeChatId, onSelectChat }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return chats;
    const q = query.toLowerCase();
    return chats.filter((c) => c.name.toLowerCase().includes(q));
  }, [chats, query]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 pt-5 pb-3 shrink-0" style={{ background: HEADER_TEAL }}>
        <h2 className="text-white font-bold text-[19px] mb-3">Chats</h2>
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

function MessageBubble({ message, isOwn, showSenderName, showTail }) {
  return (
    <div className={`flex mb-[3px] ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="relative max-w-[85%] sm:max-w-[70%]">
        <div
          className="px-2.5 pt-1.5 pb-1.5 shadow-sm rounded-lg"
          style={{
            background: isOwn ? OUTGOING_GREEN : '#FFFFFF',
            borderTopRightRadius: isOwn && showTail ? 0 : undefined,
            borderTopLeftRadius: !isOwn && showTail ? 0 : undefined,
          }}
        >
          {showSenderName && !isOwn && (
            <p className="text-[12.5px] font-bold mb-0.5" style={{ color: ACCENT_BLUE }}>
              {message.sender_name}
            </p>
          )}
          <p className="text-[14.5px] leading-snug text-slate-900 whitespace-pre-wrap break-words pr-14">
            {message.text}
          </p>
          <span className="absolute bottom-1 right-2.5 flex items-center gap-1">
            <span className="text-slate-500 text-[10.5px]">{formatBubbleTime(message.created_at)}</span>
            {isOwn && <DoubleCheck />}
          </span>
        </div>
        {showTail && (
          <svg
            width="9" height="13" viewBox="0 0 9 13"
            className={`absolute top-0 ${isOwn ? '-right-[8px]' : '-left-[8px] scale-x-[-1]'}`}
          >
            <path
              d="M0 0 L9 0 L9 13 C6 10 2 7 0 0 Z"
              fill={isOwn ? OUTGOING_GREEN : '#FFFFFF'}
            />
          </svg>
        )}
      </div>
    </div>
  );
}

function DateDivider({ label }) {
  return (
    <div className="flex justify-center my-3">
      <span className="bg-[#E1F2FA] text-slate-600 text-[12px] font-semibold px-3 py-1 rounded-md shadow-sm uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function groupBySender(messages) {
  return messages.map((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const sameAsPrev = prev && prev.sender_id === m.sender_id;
    const sameAsNext = next && next.sender_id === m.sender_id;
    const prevDay = prev ? new Date(prev.created_at).toDateString() : null;
    const thisDay = new Date(m.created_at).toDateString();
    const dayLabel = prevDay !== thisDay
      ? new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : null;
    return {
      ...m,
      _showSenderName: !sameAsPrev,
      _showTail: !sameAsNext,
      _dayLabel: dayLabel,
    };
  });
}

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
      <div className="hidden md:flex flex-1 items-center justify-center bg-[#F0F2F5]">
        <p className="text-slate-400 text-sm">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0 z-10" style={{ background: HEADER_TEAL }}>
        <button onClick={onBack} className="text-white md:hidden" aria-label="Back to chats">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <Avatar name={chat.name} size={38} />
        <div className="min-w-0">
          <p className="text-white font-semibold text-[15px] truncate">{chat.name}</p>
          <p className="text-white/70 text-[12px]">{chat.member_count} member{chat.member_count !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <ConnectionStatus status={connectionStatus} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto relative px-3 sm:px-10 py-4">
        <ChatWallpaper />
        <div className="relative">
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
                  showTail={m._showTail}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-end gap-2 px-3 sm:px-4 py-2.5 bg-[#F0F2F5] border-t border-slate-200 shrink-0">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          rows={1}
          className="flex-1 resize-none bg-white rounded-2xl px-4 py-2.5 text-[14.5px] text-slate-800 placeholder:text-slate-400 outline-none max-h-28 shadow-sm"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          aria-label="Send message"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-40 transition-opacity"
          style={{ background: HEADER_TEAL }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

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