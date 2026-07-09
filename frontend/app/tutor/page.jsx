'use client';

import { useState } from 'react';
import Image from 'next/image';

// ═══════════════════════════════════════════════════════════════════════════
// DUMMY DATA — replace with real API calls once backend endpoints exist.
// Look for "TODO: connect" comments to find every spot that needs wiring up.
// ═══════════════════════════════════════════════════════════════════════════

const DUMMY_TUTOR = {
  first_name: 'Amaka',
  last_name: 'Eze',
  email: 'amaka.eze@lasop.net',
  phone_number: '+234 803 555 1122',
  bio: 'Backend-leaning full-stack tutor with 5 years teaching experience, passionate about helping beginners build real production habits from day one.',
  courses_of_instruction: ['Full-Stack Web Development', 'Backend with Django'],
  date_of_employment: '2024-03-11',
  performance_rating: 4.6,
};

const DUMMY_STATS = {
  courses: 2,
  cohorts_total: 5,
  cohorts_completed: 3,
  cohorts_ongoing: 2,
  total_hours: 214,
  days_absent: 2,
  queries_pending: 1,
};

const DUMMY_COHORTS = [
  {
    id: 1,
    name: 'January 2026 Set',
    status: 'ongoing',
    stage: 'Afternoon Class',
    students: [
      { id: 1, name: 'Tobi Fashola', email: 'tobi.f@example.com', present: true },
      { id: 2, name: 'Ngozi Umeh', email: 'ngozi.u@example.com', present: true },
      { id: 3, name: 'Chuka Obi', email: 'chuka.o@example.com', present: false },
      { id: 4, name: 'Halima Bello', email: 'halima.b@example.com', present: true },
    ],
  },
  {
    id: 2,
    name: 'March 2026 Set',
    status: 'ongoing',
    stage: 'Morning Class',
    students: [
      { id: 5, name: 'Femi Adekunle', email: 'femi.a@example.com', present: true },
      { id: 6, name: 'Blessing Okon', email: 'blessing.o@example.com', present: true },
      { id: 7, name: 'David Nwachukwu', email: 'david.n@example.com', present: true },
    ],
  },
  {
    id: 3,
    name: 'October 2025 Set',
    status: 'completed',
    stage: 'Completed',
    students: [
      { id: 8, name: 'Ijeoma Kalu', email: 'ijeoma.k@example.com', present: true },
      { id: 9, name: 'Yusuf Aliyu', email: 'yusuf.a@example.com', present: true },
    ],
  },
];

const DUMMY_QUERIES = [
  {
    id: 1,
    subject: 'Late class start — March 3rd',
    status: 'pending',
    date: '2026-07-05',
    from: 'Admin — Kemi Johnson',
    thread: [
      { from: 'admin', text: 'We noticed your March 3rd afternoon class started 40 minutes late. Please explain.', date: '2026-07-05' },
    ],
  },
  {
    id: 2,
    subject: 'Missed attendance submission',
    status: 'resolved',
    date: '2026-06-28',
    from: 'Admin — Kemi Johnson',
    thread: [
      { from: 'admin', text: 'Attendance wasn\u2019t submitted for June 26th, please confirm.', date: '2026-06-28' },
      { from: 'tutor', text: 'Apologies, network issue on my end that day. Submitted now, all students were present.', date: '2026-06-28' },
      { from: 'admin', text: 'Noted, thanks for the quick fix. Marked resolved.', date: '2026-06-29' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Shared UI — mirrors the component set already used in Backstage, so this
// page reads as part of the same product rather than a new visual identity.
// ═══════════════════════════════════════════════════════════════════════════

function Card({ children, className = '' }) {
  return <div className={`bg-white border border-slate-200 rounded-2xl ${className}`}>{children}</div>;
}

function Pill({ children, color = 'slate' }) {
  const map = {
    blue: 'bg-blue-50 text-[#0057E7] border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-wide ${map[color] || map.slate}`}>
      {children}
    </span>
  );
}

function EmptyState({ title, hint }) {
  return (
    <div className="py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center text-xl">📭</div>
      <p className="text-slate-700 font-semibold mb-1">{title}</p>
      {hint && <p className="text-slate-400 text-sm">{hint}</p>}
    </div>
  );
}

function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-200 transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

function LinkButton({ children, danger, ...props }) {
  return (
    <button
      {...props}
      className={`text-[13px] font-semibold transition hover:underline underline-offset-2 ${danger ? 'text-rose-600 hover:text-rose-700' : 'text-[#0057E7] hover:text-[#0A66FF]'}`}
    >
      {children}
    </button>
  );
}

const inputClass =
  'w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-white border border-slate-200 rounded-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[88vh] overflow-y-auto shadow-2xl`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-sm">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

function StatCard({ label, value, icon, accent = 'text-slate-900' }) {
  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-4">
      <div>
        <p className="text-slate-500 font-medium text-[13px] mb-1.5">{label}</p>
        <p className={`font-bold text-[22px] leading-none ${accent}`}>{value}</p>
      </div>
      <div className="text-slate-300 shrink-0">{icon}</div>
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function Icon({ path, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {path}
    </svg>
  );
}

const ICONS = {
  courses: <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />,
  cohort: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M2 10h20" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12l2.5 2.5 5-5" /></>,
  ongoing: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  absent: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></>,
  query: <><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></>,
};

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" /> },
  { key: 'cohorts', label: 'Cohorts', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></> },
  { key: 'queries', label: 'Queries', icon: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></> },
  { key: 'settings', label: 'Settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></> },
  { key: 'profile', label: 'Profile', icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" /></> },
];

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard tab
// ═══════════════════════════════════════════════════════════════════════════

function DashboardTab({ tutor, stats, cohorts, setTab }) {
  const ongoing = cohorts.filter((c) => c.status === 'ongoing');
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="text-[19px] font-bold text-slate-900">Welcome back, {tutor.first_name}</h1>
          <p className="text-slate-400 text-sm mt-0.5">Here's how your cohorts are doing</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Courses teaching" value={stats.courses} icon={<Icon path={ICONS.courses} />} />
        <StatCard label="Cohorts total" value={stats.cohorts_total} icon={<Icon path={ICONS.cohort} />} />
        <StatCard label="Cohorts completed" value={stats.cohorts_completed} icon={<Icon path={ICONS.check} />} accent="text-emerald-600" />
        <StatCard label="Cohorts ongoing" value={stats.cohorts_ongoing} icon={<Icon path={ICONS.ongoing} />} accent="text-[#0057E7]" />
        <StatCard label="Total hours taught" value={stats.total_hours} icon={<Icon path={ICONS.clock} />} />
        <StatCard label="Days absent" value={stats.days_absent} icon={<Icon path={ICONS.absent} />} accent={stats.days_absent > 0 ? 'text-amber-600' : 'text-slate-900'} />
        <StatCard label="Pending queries" value={stats.queries_pending} icon={<Icon path={ICONS.query} />} accent={stats.queries_pending > 0 ? 'text-rose-600' : 'text-slate-900'} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-900 font-bold text-base">Today's classes</h2>
        <LinkButton onClick={() => setTab('cohorts')}>View all cohorts</LinkButton>
      </div>

      {ongoing.length === 0 ? (
        <Card><EmptyState title="No ongoing classes" hint="Your ongoing cohorts will show up here." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ongoing.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-slate-900 font-bold text-[15px]">{c.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{c.stage} · {c.students.length} students</p>
                </div>
                <Pill color="blue">{c.status}</Pill>
              </div>
              <SecondaryButton onClick={() => setTab('cohorts')} className="w-full justify-center">Open cohort</SecondaryButton>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Cohorts tab — list, then a student roster with tutor actions
// ═══════════════════════════════════════════════════════════════════════════

function StudentActionModal({ type, student, onClose, onConfirm }) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');

  const titles = {
    query: `Query ${student?.name || 'student'}`,
    classwork: `Assign class work — ${student ? student.name : 'whole class'}`,
    month_project: "Assign this month's project",
    capstone: 'Assign capstone project',
  };

  return (
    <Modal title={titles[type]} onClose={onClose}>
      <div className="space-y-4">
        <Field label={type === 'query' ? 'Message to student' : 'Instructions'}>
          <textarea
            className={inputClass}
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={type === 'query' ? 'Explain the issue clearly...' : 'What should students submit and by when?'}
          />
        </Field>
        {type !== 'query' && (
          <Field label="Due date">
            <input type="date" className={inputClass} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        )}
        <Field label="Attachment (optional)">
          <input type="file" className={inputClass} />
        </Field>
        <PrimaryButton className="w-full justify-center" onClick={() => { onConfirm(text); onClose(); }} disabled={!text.trim()}>
          {type === 'query' ? 'Send query' : 'Assign'}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function CohortsTab({ cohorts, setCohorts }) {
  const [openCohortId, setOpenCohortId] = useState(null);
  const [classLive, setClassLive] = useState({});
  const [actionModal, setActionModal] = useState(null); // { type, student }
  const [toast, setToast] = useState('');

  const cohort = cohorts.find((c) => c.id === openCohortId);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const toggleAttendance = (studentId) => {
    setCohorts((prev) =>
      prev.map((c) =>
        c.id !== openCohortId ? c : { ...c, students: c.students.map((s) => (s.id === studentId ? { ...s, present: !s.present } : s)) }
      )
    );
  };

  const toggleClass = () => {
    const live = !classLive[openCohortId];
    setClassLive((prev) => ({ ...prev, [openCohortId]: live }));
    showToast(live ? 'Class started — students have been notified' : 'Class ended');
  };

  if (cohort) {
    const isLive = !!classLive[cohort.id];
    return (
      <div>
        <button onClick={() => setOpenCohortId(null)} className="text-[#0057E7] text-sm font-semibold mb-4 flex items-center gap-1.5 hover:underline">
          <Icon path={<path d="M15 18l-6-6 6-6" />} size={16} /> Back to cohorts
        </button>

        <PageHeader title={cohort.name} subtitle={`${cohort.stage} · ${cohort.students.length} students`}>
          <SecondaryButton onClick={() => setActionModal({ type: 'classwork' })}>Assign class work</SecondaryButton>
          <SecondaryButton onClick={() => setActionModal({ type: 'month_project' })}>Assign month's project</SecondaryButton>
          <SecondaryButton onClick={() => setActionModal({ type: 'capstone' })}>Assign capstone</SecondaryButton>
          <PrimaryButton onClick={toggleClass} className={isLive ? '!bg-rose-600 hover:!bg-rose-700' : ''}>
            {isLive ? 'Stop class' : 'Start class'}
          </PrimaryButton>
        </PageHeader>

        {isLive && (
          <div className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl px-4 py-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Class is live — students can see this in real time
          </div>
        )}

        {toast && (
          <div className="mb-5 bg-slate-900 text-white text-sm rounded-xl px-4 py-3">{toast}</div>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  {['Student', 'Attendance', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohort.students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#0057E7] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-slate-800 font-semibold leading-none mb-0.5">{s.name}</p>
                          <p className="text-slate-400 text-[11px]">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleAttendance(s.id)}>
                        <Pill color={s.present ? 'emerald' : 'rose'}>{s.present ? 'Present' : 'Absent'}</Pill>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <LinkButton danger onClick={() => setActionModal({ type: 'query', student: s })}>Query</LinkButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {actionModal && (
          <StudentActionModal
            type={actionModal.type}
            student={actionModal.student}
            onClose={() => setActionModal(null)}
            onConfirm={() =>
              showToast(
                actionModal.type === 'query'
                  ? `Query sent to ${actionModal.student.name}`
                  : 'Assignment sent — students have been notified'
              )
            }
          />
        )}
      </div>
    );
  }

  const statusColor = { ongoing: 'blue', completed: 'slate', upcoming: 'amber' };

  return (
    <div>
      <PageHeader title="Cohorts" subtitle={`${cohorts.length} cohort${cohorts.length !== 1 ? 's' : ''} assigned to you`} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cohorts.map((c) => (
          <Card key={c.id} className="p-5 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-slate-900 font-bold text-base leading-snug pr-4">{c.name}</h3>
              <Pill color={statusColor[c.status] || 'slate'}>{c.status}</Pill>
            </div>
            <p className="text-slate-400 text-xs mb-4">{c.stage} · {c.students.length} students</p>
            <SecondaryButton onClick={() => setOpenCohortId(c.id)} className="w-full justify-center">View cohort</SecondaryButton>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Queries tab
// ═══════════════════════════════════════════════════════════════════════════

function QueriesTab({ queries, setQueries }) {
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [reply, setReply] = useState('');

  const counts = {
    all: queries.length,
    pending: queries.filter((q) => q.status === 'pending').length,
    resolved: queries.filter((q) => q.status === 'resolved').length,
  };

  const filtered = filter === 'all' ? queries : queries.filter((q) => q.status === filter);
  const open = queries.find((q) => q.id === openId);

  const sendReply = () => {
    if (!reply.trim()) return;
    setQueries((prev) =>
      prev.map((q) => (q.id === openId ? { ...q, thread: [...q.thread, { from: 'tutor', text: reply, date: 'Just now' }] } : q))
    );
    setReply('');
  };

  return (
    <div>
      <PageHeader title="Queries" subtitle={`${counts.pending} pending · ${counts.resolved} resolved`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[['all', `Total (${counts.all})`], ['pending', `Pending (${counts.pending})`], ['resolved', `Resolved (${counts.resolved})`]].map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${filter === f ? 'border-[#0057E7] bg-[#0057E7] text-white shadow-sm' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </PageHeader>

      {filtered.length === 0 ? (
        <Card><EmptyState title="No queries here" hint="Nothing matches this filter yet." /></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <button key={q.id} onClick={() => setOpenId(q.id)} className="w-full text-left">
              <Card className="px-6 py-4 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-slate-900 font-bold mb-1">{q.subject}</p>
                    <p className="text-slate-400 text-xs">{q.from} · {q.date}</p>
                  </div>
                  <Pill color={q.status === 'pending' ? 'amber' : 'emerald'}>{q.status}</Pill>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      {open && (
        <Modal title={open.subject} onClose={() => setOpenId(null)} wide>
          <div className="space-y-4">
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {open.thread.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'tutor' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.from === 'tutor' ? 'bg-[#0057E7] text-white' : 'bg-slate-100 text-slate-800'}`}>
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-1 ${m.from === 'tutor' ? 'text-blue-100' : 'text-slate-400'}`}>{m.date}</p>
                  </div>
                </div>
              ))}
            </div>
            {open.status === 'pending' && (
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <textarea className={inputClass} rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your response..." />
                <div className="flex items-center gap-2">
                  <input type="file" className={inputClass} />
                  <PrimaryButton onClick={sendReply} disabled={!reply.trim()}>Reply</PrimaryButton>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Settings tab
// ═══════════════════════════════════════════════════════════════════════════

function SettingsTab({ tutor }) {
  const [email, setEmail] = useState(tutor.email);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saved, setSaved] = useState('');
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const flashSaved = (label) => { setSaved(label); setTimeout(() => setSaved(''), 2200); };

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader title="Settings" />

      {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">{saved}</div>}

      <Card className="p-6">
        <h3 className="text-slate-900 font-bold text-sm mb-4">Profile picture</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 font-bold text-xl shrink-0">
            {avatarPreview ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" /> : tutor.first_name.charAt(0)}
          </div>
          <div className="flex-1">
            <input type="file" accept="image/*" onChange={handleAvatarChange} className={inputClass} />
          </div>
        </div>
        {avatarPreview && <PrimaryButton className="mt-4" onClick={() => flashSaved('Profile picture updated')}>Save picture</PrimaryButton>}
      </Card>

      <Card className="p-6">
        <h3 className="text-slate-900 font-bold text-sm mb-4">Login email</h3>
        <Field label="Email address">
          <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <PrimaryButton className="mt-4" onClick={() => flashSaved('Email updated')}>Save email</PrimaryButton>
      </Card>

      <Card className="p-6">
        <h3 className="text-slate-900 font-bold text-sm mb-4">Password</h3>
        <div className="space-y-3">
          <Field label="Current password">
            <input type="password" className={inputClass} value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
          </Field>
          <Field label="New password">
            <input type="password" className={inputClass} value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
          </Field>
          <Field label="Confirm new password">
            <input type="password" className={inputClass} value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
          </Field>
        </div>
        <PrimaryButton
          className="mt-4"
          disabled={!passwords.current || !passwords.next || passwords.next !== passwords.confirm}
          onClick={() => { flashSaved('Password updated'); setPasswords({ current: '', next: '', confirm: '' }); }}
        >
          Save password
        </PrimaryButton>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Profile tab
// ═══════════════════════════════════════════════════════════════════════════

function ProfileTab({ tutor }) {
  const stars = Math.round(tutor.performance_rating);
  return (
    <div>
      <PageHeader title="Profile" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 md:col-span-1 text-center">
          <div className="w-20 h-20 rounded-full bg-[#0057E7] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {tutor.first_name.charAt(0)}{tutor.last_name.charAt(0)}
          </div>
          <p className="text-slate-900 font-bold text-lg">{tutor.first_name} {tutor.last_name}</p>
          <p className="text-slate-400 text-sm mt-1">{tutor.email}</p>
          <p className="text-slate-400 text-sm">{tutor.phone_number}</p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-1.5">Performance rating</p>
            <div className="flex items-center justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= stars ? 'text-amber-400' : 'text-slate-200'}>★</span>
              ))}
              <span className="text-slate-500 text-sm ml-1.5 font-semibold">{tutor.performance_rating}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 space-y-5">
          <div>
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-1.5">Bio</p>
            <p className="text-slate-700 text-sm leading-relaxed">{tutor.bio}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-2">Courses of instruction</p>
            <div className="flex flex-wrap gap-1.5">
              {tutor.courses_of_instruction.map((c) => <Pill key={c} color="blue">{c}</Pill>)}
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-1.5">Date of employment</p>
            <p className="text-slate-700 text-sm font-medium">
              {new Date(tutor.date_of_employment).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sidebar + top bar
// ═══════════════════════════════════════════════════════════════════════════

function Sidebar({ open, onClose, tab, setTab }) {
  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/30 z-40 lg:hidden" />}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 z-50 flex flex-col border-r border-blue-900/40 transition-transform duration-200 ease-out ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ background: '#152035' }}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-blue-900/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#0057E7] flex items-center justify-center text-white text-xs font-bold">L</div>
            <span className="text-white font-bold text-[15px] tracking-wide">LASOP · Tutor</span>
          </div>
          <button onClick={onClose} className="text-slate-400 lg:hidden" aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-2.5 pt-3 space-y-0.5 overflow-y-auto pb-4">
          {NAV.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); onClose(); }}
                className={`w-full flex items-center gap-2.5 text-[13px] px-3 py-2 rounded-md transition-colors ${active ? 'bg-white text-[#0057E7] font-semibold' : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'}`}
              >
                <Icon path={item.icon} size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-2.5 pb-5 pt-2 border-t border-blue-900/30">
          <button className="w-full flex items-center gap-2.5 text-[13px] font-medium text-slate-400 hover:text-white px-3 py-2 rounded-md hover:bg-white/10 transition-colors">
            <Icon path={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>} size={15} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenuClick, title }) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} aria-label="Menu" className="text-slate-500 lg:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <p className="text-slate-800 font-semibold text-[14px]">{title}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#0057E7] flex items-center justify-center text-white text-xs font-bold">A</div>
        <span className="text-slate-700 font-medium text-[13px] hidden sm:inline">Amaka Eze</span>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Page shell
// ═══════════════════════════════════════════════════════════════════════════

export default function TutorPortalPage() {
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cohorts, setCohorts] = useState(DUMMY_COHORTS);
  const [queries, setQueries] = useState(DUMMY_QUERIES);

  // TODO: connect — replace the auth check below with the same
  // verifyStaff-style pattern used in BackstagePage, but checking
  // `profile.is_tutor` (or similar) instead of `profile.is_staff`,
  // and redirecting to /login if there's no token.

  const currentLabel = NAV.find((n) => n.key === tab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} tab={tab} setTab={setTab} />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={currentLabel} />
        <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto pb-24">
          <div className="max-w-6xl">
            {tab === 'dashboard' && <DashboardTab tutor={DUMMY_TUTOR} stats={DUMMY_STATS} cohorts={cohorts} setTab={setTab} />}
            {tab === 'cohorts' && <CohortsTab cohorts={cohorts} setCohorts={setCohorts} />}
            {tab === 'queries' && <QueriesTab queries={queries} setQueries={setQueries} />}
            {tab === 'settings' && <SettingsTab tutor={DUMMY_TUTOR} />}
            {tab === 'profile' && <ProfileTab tutor={DUMMY_TUTOR} />}
          </div>
        </div>
      </div>
    </div>
  );
}