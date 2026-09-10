'use client';

import { MessageCircle, Bell, ChevronDown, Menu } from 'lucide-react';

export default function Topbar({ onMenuClick, title, dateLabel }) {
  return (
    <header className="bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} aria-label="Menu" className="text-slate-500 hover:text-slate-700 transition-colors lg:hidden">
          <Menu size={20} strokeWidth={2} />
        </button>
        <p className="text-slate-800 font-semibold text-[14px] tracking-tight">{title}</p>
      </div>

      <div className="flex items-center gap-1">
        {dateLabel && (
          <span className="hidden sm:inline-flex items-center border border-slate-200 rounded-md px-2.5 py-1 text-slate-500 font-medium text-[12px] bg-white mr-1.5">
            {dateLabel}
          </span>
        )}
        <button aria-label="Messages" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-md p-1.5">
          <MessageCircle size={16} strokeWidth={2} />
        </button>
        <button aria-label="Notifications" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-md p-1.5">
          <Bell size={16} strokeWidth={2} />
        </button>
        <button className="flex items-center gap-1.5 text-slate-700 font-medium text-[13px] hover:bg-slate-100 transition-colors rounded-md pl-1.5 pr-2 py-1.5 ml-0.5">
          <span className="w-6 h-6 rounded-full bg-[#0057E7] text-white text-[11px] font-bold flex items-center justify-center shrink-0">A</span>
          <span className="hidden sm:inline">Admin</span>
          <ChevronDown size={12} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}