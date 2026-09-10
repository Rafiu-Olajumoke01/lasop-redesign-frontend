'use client';

import { useState } from 'react';
import { NAV, NavIcon } from './Icons';

export default function Sidebar({ open, onClose, tab, setTab, studentsSubTab, setStudentsSubTab }) {
  const [studentsExpanded, setStudentsExpanded] = useState(false);

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        />
      )}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 z-50 flex flex-col border-r border-blue-900/40
  transition-transform duration-200 ease-out
  ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ background: '#152035' }}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-blue-900/30">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.16em]">Admin Panel</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors lg:hidden" aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav
          className="sidebar-scroll flex-1 px-2.5 pt-3 space-y-0.5 overflow-y-auto pb-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}
        >
          {NAV.map((item) => {
            const active = tab === item.key;

            if (item.key === 'students') {
              return (
                <div key={item.key}>
                  <button
                    onClick={() => {
                      setTab('students');
                      setStudentsExpanded((v) => !v);
                    }}
                    className={`relative w-full flex items-center gap-2.5 text-[13px] px-3 py-2 rounded-md transition-all duration-150 ${active
                      ? 'bg-white text-[#0057E7] font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-white/[0.08] hover:text-white font-medium'
                      }`}
                  >
                    {active && <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-[#0057E7]" />}
                    <NavIcon icon={item.icon} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <svg
                      className={`transition-transform ${studentsExpanded ? 'rotate-180' : ''}`}
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {studentsExpanded && (
                    <div className="ml-8 mt-0.5 space-y-0.5">
                      {[
                        { key: 'list', label: 'List' },
                        { key: 'assessment', label: 'Assessment' },
                        { key: 'projects', label: 'Projects' },
                      ].map((sub) => (
                        <button
                          key={sub.key}
                          onClick={() => {
                            setTab('students');
                            setStudentsSubTab(sub.key);
                            onClose();
                          }}
                          className={`w-full text-left text-[12.5px] px-3 py-1.5 rounded-md transition ${studentsSubTab === sub.key && tab === 'students'
                            ? 'text-white font-semibold bg-white/[0.12]'
                            : 'text-slate-400 hover:bg-white/[0.08] hover:text-white'
                            }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); onClose(); }}
                className={`relative w-full flex items-center gap-2.5 text-[13px] px-3 py-2 rounded-md transition-all duration-150 ${active
                  ? 'bg-white text-[#0057E7] font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-white/[0.08] hover:text-white font-medium'
                  }`}
              >
                {active && <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-[#0057E7]" />}
                <NavIcon icon={item.icon} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-2.5 pb-5 pt-2 border-t border-blue-900/30">
          <button className="w-full flex items-center gap-2.5 text-[13px] font-medium text-slate-400 hover:text-white px-3 py-2 rounded-md hover:bg-white/[0.08] transition-colors mt-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
            Log out
          </button>
        </div>

        <style jsx>{`
          .sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.18);
            border-radius: 9999px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </aside>
    </>
  );
}