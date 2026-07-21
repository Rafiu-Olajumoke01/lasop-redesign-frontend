'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ═══════════════════════════════════════════════════════════════════════════
// Data hooks — real API calls
// ═══════════════════════════════════════════════════════════════════════════

function useTutorProfile(token) {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/tutors/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load your profile.');
      const data = await res.json();
      setTutor({
        ...data,
        first_name: data.user_detail?.first_name || '',
        last_name: data.user_detail?.last_name || '',
        email: data.user_detail?.email || '',
        phone_number: data.user_detail?.phone_number || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) refresh(); }, [token, refresh]);

  const updateProfile = async (payload) => {
    const hasFile = payload.profile_picture instanceof File;
    let body, headers = { Authorization: `Bearer ${token}` };

    if (hasFile) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (value instanceof File) formData.append(key, value);
        else if (Array.isArray(value)) formData.append(key, JSON.stringify(value));
        else formData.append(key, value);
      });
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(payload);
    }

    const res = await fetch(`${API_BASE}/api/tutors/me/`, { method: 'PATCH', headers, body });
    if (!res.ok) {
      const text = await res.text();
      console.error('Profile update failed:', text);
      throw new Error('Could not save changes.');
    }
    await refresh();
  };

  return { tutor, loading, error, refresh, updateProfile };
}

function useTutorStats(token) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await fetch(`${API_BASE}/api/tutors/me/stats/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Could not load your stats.');
        setStats(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return { stats, loading, error };
}

function useTutorCohorts(token) {
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await fetch(`${API_BASE}/api/tutors/me/cohorts/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Could not load your cohorts.');
        const data = await res.json();
        setCohorts(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return { cohorts, loading, error };
}

// ── Class sessions for a given cohort (tutor's own) ─────────────────────────

function useCohortSessions(token, cohortId) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!cohortId) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cohorts/sessions/?cohort=${cohortId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load sessions.');
      const data = await res.json();
      const all = Array.isArray(data) ? data : data.results || [];
      // Defensive client-side filter in case the backend doesn't yet
      // support ?cohort= filtering and returns every session for this tutor.
      setSessions(all.filter((s) => s.cohort === cohortId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, cohortId]);

  useEffect(() => { if (token && cohortId) refresh(); }, [token, cohortId, refresh]);

  const createSession = async (payload) => {
    const res = await fetch(`${API_BASE}/api/cohorts/sessions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...payload, cohort: cohortId }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Session create failed:', text);
      throw new Error('Could not create session.');
    }
    await refresh();
  };

  return { sessions, loading, error, refresh, createSession };
}

// ── Roster + attendance for a single session ─────────────────────────────────

function useSessionAttendance(token, sessionId) {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cohorts/sessions/${sessionId}/roster/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load the roster.');
      setRoster(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, sessionId]);

  useEffect(() => { if (token && sessionId) refresh(); }, [token, sessionId, refresh]);

  const submitAttendance = async (records) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/cohorts/sessions/${sessionId}/attendance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ records }),
      });
      if (!res.ok) throw new Error('Could not save attendance.');
      return await res.json();
    } finally {
      setSaving(false);
    }
  };

  return { roster, loading, error, saving, refresh, submitAttendance };
}

// ═══════════════════════════════════════════════════════════════════════════
// Shared UI — mirrors Backstage's component set
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

function Spinner({ text }) {
  return (
    <div className="py-16 text-center">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#0057E7] animate-spin mx-auto mb-3" />
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 mb-5">
      <span className="mt-0.5 shrink-0">⚠</span>
      {message}
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

function ComingSoon({ title, hint }) {
  return (
    <div>
      <PageHeader title={title} />
      <Card><EmptyState title="Coming soon" hint={hint || "This section will be wired up once the backend for it is ready."} /></Card>
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
  { key: 'messages', label: 'Message', icon: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /> },
  { key: 'queries', label: 'Queries', icon: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></> },
  { key: 'settings', label: 'Settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></> },
  { key: 'profile', label: 'Profile', icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" /></> },
];

// ═══════════════════════════════════════════════════════════════════════════
// Message tab — nav item + 4 sub-tabs (All, Admin, Cohorts, Private), per
// admin's instruction. No Message/Conversation model exists yet, so each
// sub-tab is an honest "coming soon" state for now.
// ═══════════════════════════════════════════════════════════════════════════

function MessageTab() {
  const [subTab, setSubTab] = useState('all');
  const subTabs = [
    { key: 'all', label: 'All' },
    { key: 'admin', label: 'Admin' },
    { key: 'cohorts', label: 'Cohorts' },
    { key: 'private', label: 'Private' },
  ];

  const hints = {
    all: 'Every conversation you\u2019re part of will show up here.',
    admin: 'Your direct conversation with admin will show up here.',
    cohorts: 'Group chats for your cohorts will show up here.',
    private: 'One-to-one conversations with students will show up here.',
  };

  return (
    <div>
      <PageHeader title="Message" subtitle="Talk to admin and students directly">
        <div className="flex items-center gap-1.5 flex-wrap">
          {subTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setSubTab(t.key)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${subTab === t.key
                ? 'border-[#0057E7] bg-[#0057E7] text-white shadow-sm'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </PageHeader>
      <Card>
        <EmptyState title="Coming soon" hint={hints[subTab]} />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard tab
// ═══════════════════════════════════════════════════════════════════════════

function DashboardTab({ tutor, statsData, cohortsData, setTab }) {
  const { stats, loading: statsLoading, error: statsError } = statsData;
  const { cohorts, loading: cohortsLoading, error: cohortsError } = cohortsData;

  const ongoing = cohorts.filter((c) => c.current_stage_label && c.current_stage_label !== 'Completed');

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="text-[19px] font-bold text-slate-900">Welcome back, {tutor.first_name}</h1>
          <p className="text-slate-400 text-sm mt-0.5">Here's how your cohorts are doing</p>
        </div>
      </div>

      <ErrorBanner message={statsError} />

      {statsLoading || !stats ? (
        <div className="mb-8"><Spinner text="Loading your stats…" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard label="Courses teaching" value={stats.courses} icon={<Icon path={ICONS.courses} />} />
          <StatCard label="Cohorts total" value={stats.cohorts_total} icon={<Icon path={ICONS.cohort} />} />
          <StatCard label="Cohorts completed" value={stats.cohorts_completed} icon={<Icon path={ICONS.check} />} accent="text-emerald-600" />
          <StatCard label="Cohorts ongoing" value={stats.cohorts_ongoing} icon={<Icon path={ICONS.ongoing} />} accent="text-[#0057E7]" />
          <StatCard label="Days absent" value={stats.days_absent} icon={<Icon path={ICONS.absent} />} accent={stats.days_absent > 0 ? 'text-amber-600' : 'text-slate-900'} />
          <StatCard label="Pending queries" value={stats.queries_pending} icon={<Icon path={ICONS.query} />} accent={stats.queries_pending > 0 ? 'text-rose-600' : 'text-slate-900'} />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-900 font-bold text-base">Your cohorts</h2>
        <button onClick={() => setTab('cohorts')} className="text-[#0057E7] text-[13px] font-semibold hover:underline">View all cohorts</button>
      </div>

      <ErrorBanner message={cohortsError} />

      {cohortsLoading ? (
        <Spinner text="Loading your cohorts…" />
      ) : ongoing.length === 0 ? (
        <Card><EmptyState title="No ongoing cohorts" hint="Your ongoing cohorts will show up here." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ongoing.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-slate-900 font-bold text-[15px]">{c.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{c.current_stage_label} · {c.student_count ?? 0} students</p>
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
// Cohorts tab — now with class sessions + attendance
// ═══════════════════════════════════════════════════════════════════════════

const emptySession = { topics_covered: '', date: '', start_time: '', end_time: '' };

function SessionAttendanceView({ token, session, onBack }) {
  const { roster, loading, error, saving, submitAttendance } = useSessionAttendance(token, session.id);
  const [statuses, setStatuses] = useState({});
  const [saveErr, setSaveErr] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (roster.length) {
      const initial = {};
      roster.forEach((r) => { initial[r.application_id] = statuses[r.application_id] || 'present'; });
      setStatuses((prev) => ({ ...initial, ...prev }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster]);

  const setStatus = (appId, status) => setStatuses((prev) => ({ ...prev, [appId]: status }));

  const handleSubmit = async () => {
    setSaveErr(''); setSaved(false);
    try {
      const records = roster.map((r) => ({
        application: r.application_id,
        status: statuses[r.application_id] || 'present',
      }));
      await submitAttendance(records);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveErr(e.message);
    }
  };

  const statusStyles = {
    present: 'border-emerald-500 bg-emerald-500 text-white',
    late: 'border-amber-500 bg-amber-500 text-white',
    absent: 'border-rose-500 bg-rose-500 text-white',
  };

  return (
    <div>
      <button onClick={onBack} className="text-[#0057E7] text-sm font-semibold mb-4 flex items-center gap-1.5 hover:underline">
        <Icon path={<path d="M15 18l-6-6 6-6" />} size={16} /> Back to sessions
      </button>
      <PageHeader
        title={session.topics_covered ? session.topics_covered.split('\n')[0] : 'Class session'}
        subtitle={`${session.date} · ${session.start_time}–${session.end_time}`}
      />

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-4">
          Attendance saved
        </div>
      )}
      <ErrorBanner message={error || saveErr} />

      {loading ? (
        <Spinner text="Loading roster…" />
      ) : roster.length === 0 ? (
        <Card><EmptyState title="No students enrolled" hint="This cohort has no applications yet." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-100">
            {roster.map((r) => (
              <div key={r.application_id} className="flex items-center justify-between px-5 py-3.5 flex-wrap gap-3">
                <div>
                  <p className="text-slate-800 font-semibold text-sm">{r.student_name}</p>
                  <p className="text-slate-400 text-xs">{r.student_email}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {['present', 'late', 'absent'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(r.application_id, s)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border capitalize transition ${(statuses[r.application_id] || 'present') === s
                        ? statusStyles[s]
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {roster.length > 0 && (
        <PrimaryButton className="mt-5" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : 'Save attendance'}
        </PrimaryButton>
      )}
    </div>
  );
}

function CohortSessionsView({ token, cohort, onBack }) {
  const { sessions, loading, error, createSession } = useCohortSessions(token, cohort.id);
  const [openSession, setOpenSession] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptySession);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  if (openSession) {
    return <SessionAttendanceView token={token} session={openSession} onBack={() => setOpenSession(null)} />;
  }

  const handleCreate = async () => {
    if (!form.topics_covered || !form.date || !form.start_time || !form.end_time) {
      setFormErr('Please fill in all fields before creating the session.');
      return;
    }
    setSaving(true); setFormErr('');
    try {
      await createSession(form);
      setForm(emptySession);
      setModalOpen(false);
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="text-[#0057E7] text-sm font-semibold mb-4 flex items-center gap-1.5 hover:underline">
        <Icon path={<path d="M15 18l-6-6 6-6" />} size={16} /> Back to cohorts
      </button>
      <PageHeader
        title={cohort.name}
        subtitle={`${cohort.current_stage_label} · ${cohort.student_count ?? 0} students`}
      >
        <PrimaryButton onClick={() => setModalOpen(true)}>+ New session</PrimaryButton>
      </PageHeader>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner text="Loading sessions…" />
      ) : sessions.length === 0 ? (
        <Card>
          <EmptyState
            title="No class sessions yet"
            hint="Create your first session for this cohort to start marking attendance."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s) => (
            <Card key={s.id} className="p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-slate-900 font-bold text-[15px]">
                  {s.topics_covered ? s.topics_covered.split('\n')[0] : 'Untitled session'}
                </h3>
                <Pill color="blue">{s.duration_hours}h</Pill>
              </div>
              <p className="text-slate-400 text-xs mb-4">{s.date} · {s.start_time}–{s.end_time}</p>
              <SecondaryButton onClick={() => setOpenSession(s)} className="w-full justify-center">
                Mark attendance
              </SecondaryButton>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-slate-900 font-bold text-base mb-4">New class session</h3>
            {formErr && <ErrorBanner message={formErr} />}
            <div className="space-y-4">
              <Field label="Topics covered">
                <textarea
                  className={inputClass}
                  rows={4}
                  value={form.topics_covered}
                  onChange={(e) => setForm({ ...form, topics_covered: e.target.value })}
                  placeholder={"e.g. HTML Tables\nHTML Forms\nHTML Tags"}
                />
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start time">
                  <input
                    type="time"
                    className={inputClass}
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  />
                </Field>
                <Field label="End time">
                  <input
                    type="time"
                    className={inputClass}
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  />
                </Field>
              </div>
              <div className="flex gap-2 pt-2">
                <SecondaryButton className="flex-1 justify-center" onClick={() => setModalOpen(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton className="flex-1 justify-center" onClick={handleCreate} disabled={saving}>
                  {saving ? 'Creating…' : 'Create session'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CohortsTab({ token, cohorts, loading, error }) {
  const [openCohortId, setOpenCohortId] = useState(null);
  const cohort = cohorts.find((c) => c.id === openCohortId);

  if (cohort) {
    return <CohortSessionsView token={token} cohort={cohort} onBack={() => setOpenCohortId(null)} />;
  }

  return (
    <div>
      <PageHeader title="Cohorts" subtitle={`${cohorts.length} cohort${cohorts.length !== 1 ? 's' : ''} assigned to you`} />
      <ErrorBanner message={error} />
      {loading ? (
        <Spinner text="Loading your cohorts…" />
      ) : cohorts.length === 0 ? (
        <Card><EmptyState title="No cohorts assigned yet" hint="Cohorts assigned to you by admin will show up here." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cohorts.map((c) => (
            <Card key={c.id} className="p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-slate-900 font-bold text-base leading-snug pr-4">{c.name}</h3>
                <Pill color="blue">{c.status}</Pill>
              </div>
              <p className="text-slate-400 text-xs mb-4">{c.current_stage_label} · {c.student_count ?? 0} students</p>
              <SecondaryButton onClick={() => setOpenCohortId(c.id)} className="w-full justify-center">View cohort</SecondaryButton>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Settings tab
// ═══════════════════════════════════════════════════════════════════════════

function SettingsTab({ tutor, updateProfile }) {
  const [bio, setBio] = useState(tutor.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [err, setErr] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const flashSaved = (label) => { setSaved(label); setTimeout(() => setSaved(''), 2200); };

  const saveBio = async () => {
    setSaving(true); setErr('');
    try { await updateProfile({ bio }); flashSaved('Bio updated'); }
    catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const savePicture = async () => {
    setSaving(true); setErr('');
    try { await updateProfile({ profile_picture: avatarFile }); flashSaved('Profile picture updated'); setAvatarFile(null); }
    catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader title="Settings" />

      {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">{saved}</div>}
      <ErrorBanner message={err} />

      <Card className="p-6">
        <h3 className="text-slate-900 font-bold text-sm mb-4">Profile picture</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400 font-bold text-xl shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : tutor.profile_picture ? (
              <img src={`${API_BASE}${tutor.profile_picture}`} alt="Current" className="w-full h-full object-cover" />
            ) : (
              tutor.first_name.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <input type="file" accept="image/*" onChange={handleAvatarChange} className={inputClass} />
          </div>
        </div>
        {avatarFile && <PrimaryButton className="mt-4" onClick={savePicture} disabled={saving}>{saving ? 'Saving…' : 'Save picture'}</PrimaryButton>}
      </Card>

      <Card className="p-6">
        <h3 className="text-slate-900 font-bold text-sm mb-4">Bio</h3>
        <Field label="About you">
          <textarea className={inputClass} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
        </Field>
        <PrimaryButton className="mt-4" onClick={saveBio} disabled={saving}>{saving ? 'Saving…' : 'Save bio'}</PrimaryButton>
      </Card>

      <Card className="p-6 opacity-60">
        <h3 className="text-slate-900 font-bold text-sm mb-2">Login email & password</h3>
        <p className="text-slate-400 text-sm">Coming soon. For now, contact admin to update your login email or password.</p>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Profile tab
// ═══════════════════════════════════════════════════════════════════════════

function ProfileTab({ tutor }) {
  const stars = Math.round(tutor.performance_rating || 0);
  return (
    <div>
      <PageHeader title="Profile" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 md:col-span-1 text-center">
          <div className="w-20 h-20 rounded-full bg-[#0057E7] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 overflow-hidden">
            {tutor.profile_picture ? (
              <img src={`${API_BASE}${tutor.profile_picture}`} alt={tutor.first_name} className="w-full h-full object-cover" />
            ) : (
              <>{tutor.first_name.charAt(0)}{tutor.last_name.charAt(0)}</>
            )}
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
              <span className="text-slate-500 text-sm ml-1.5 font-semibold">{tutor.performance_rating || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 space-y-5">
          <div>
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-1.5">Bio</p>
            <p className="text-slate-700 text-sm leading-relaxed">{tutor.bio || 'No bio added yet.'}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-2">Courses of instruction</p>
            <div className="flex flex-wrap gap-1.5">
              {(tutor.courses_of_instruction || []).length === 0 ? (
                <span className="text-slate-400 text-xs italic">None assigned</span>
              ) : (
                tutor.courses_of_instruction.map((c) => <Pill key={c} color="blue">{c}</Pill>)
              )}
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-1.5">Date of employment</p>
            <p className="text-slate-700 text-sm font-medium">
              {tutor.date_of_employment
                ? new Date(tutor.date_of_employment).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—'}
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
        className={`fixed lg:static top-20 lg:top-0 left-0 h-[calc(100vh-5rem)] lg:h-screen w-64 z-50 flex flex-col border-r border-blue-900/40 transition-transform duration-200 ease-out ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ background: '#152035' }}
      >
        <div className="flex items-start justify-between px-5 pt-6 pb-5 border-b border-blue-900/30">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <img src="/logo.webp" alt="LASOP" className="h-7 w-7 object-contain" />
              <span className="text-[#8BB8FF] font-bold text-[15px] tracking-wide">LASOP</span>
            </div>
            <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-[0.14em]">Tutor Portal</span>
          </div>
          <button onClick={onClose} className="text-slate-400 lg:hidden mt-0.5" aria-label="Close menu">
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
          <button
            onClick={() => {
              localStorage.removeItem('access');
              localStorage.removeItem('refresh');
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-2.5 text-[13px] font-medium text-slate-400 hover:text-white px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <Icon path={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>} size={15} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenuClick, title, tutor }) {
  const initial = tutor?.first_name?.charAt(0) || '?';
  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} aria-label="Menu" className="text-slate-500 lg:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <p className="text-slate-800 font-semibold text-[14px]">{title}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#0057E7] flex items-center justify-center text-white text-xs font-bold overflow-hidden">
          {tutor?.profile_picture ? (
            <img src={`${API_BASE}${tutor.profile_picture}`} alt="" className="w-full h-full object-cover" />
          ) : initial}
        </div>
        <span className="text-slate-700 font-medium text-[13px] hidden sm:inline">
          {tutor ? `${tutor.first_name} ${tutor.last_name}` : ''}
        </span>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Page shell
// ═══════════════════════════════════════════════════════════════════════════

export default function TutorPortalPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('access');
    if (!t) { router.push('/login'); return; }
    const verifyTutor = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/profile/`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          router.push('/login');
          return;
        }
        const profile = await res.json();
        if (profile.is_staff) { router.push('/backstage'); return; }
        if (!profile.is_tutor) { router.push('/dashboard'); return; }
        setToken(t);
        setAuthChecked(true);
      } catch {
        router.push('/login');
      }
    };
    verifyTutor();
  }, []);

  const profileData = useTutorProfile(token);
  const statsData = useTutorStats(token);
  const cohortsData = useTutorCohorts(token);

  const currentLabel = NAV.find((n) => n.key === tab)?.label || 'Dashboard';

  if (!authChecked || profileData.loading || !profileData.tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-[#0057E7] animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">{!authChecked ? 'Verifying access…' : 'Loading your profile…'}</p>
        </div>
      </div>
    );
  }

  if (profileData.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="p-6 max-w-sm text-center">
          <p className="text-rose-600 font-semibold mb-2">Couldn't load your profile</p>
          <p className="text-slate-500 text-sm mb-4">{profileData.error}</p>
          <PrimaryButton onClick={profileData.refresh}>Try again</PrimaryButton>
        </Card>
      </div>
    );
  }

  const tutor = profileData.tutor;

  return (
    <div className="min-h-screen flex bg-slate-50 pt-20">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} tab={tab} setTab={setTab} />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={currentLabel} tutor={tutor} />
        <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto pb-24">
          <div className="max-w-6xl">
            {tab === 'dashboard' && (
              <DashboardTab tutor={tutor} statsData={statsData} cohortsData={cohortsData} setTab={setTab} />
            )}
            {tab === 'cohorts' && (
              <CohortsTab token={token} cohorts={cohortsData.cohorts} loading={cohortsData.loading} error={cohortsData.error} />
            )}
            {tab === 'messages' && <MessageTab />}
            {tab === 'queries' && (
              <ComingSoon title="Queries" hint="This will be wired up once the Query model is built on the backend." />
            )}
            {tab === 'settings' && <SettingsTab tutor={tutor} updateProfile={profileData.updateProfile} />}
            {tab === 'profile' && <ProfileTab tutor={tutor} />}
          </div>
        </div>
      </div>
    </div>
  );
}