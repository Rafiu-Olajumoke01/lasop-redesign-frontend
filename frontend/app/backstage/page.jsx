'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApplicantName(a) {
  const s = a.student_detail || a.student || a.user_detail || a.user || {};
  const full = `${s.first_name || ''} ${s.last_name || ''}`.trim();
  if (full) return full;
  if (s.email) return s.email;
  if (a.applicant_name) return a.applicant_name;
  if (a.email) return a.email;
  return null;
}

function getApplicantEmail(a) {
  const s = a.student_detail || a.student || a.user_detail || a.user || {};
  return s.email || a.email || null;
}

function getCourseTitle(a) {
  return a.course_detail?.title || a.course?.title || a.course_title || null;
}

function getCourseFee(a) {
  return Number(a.course_detail?.fee ?? a.course?.fee ?? a.fee ?? 0);
}

function formatMoney(n) {
  return `₦${Number(n || 0).toLocaleString()}`;
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ─── Shared UI (light theme, sharpened) ────────────────────────────────────

function Card({ children, className = '', interactive = false }) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.04)]
        ${interactive ? 'hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:border-slate-300 hover:-translate-y-[1px] transition-all duration-200' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80">
      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em]">{title}</h3>
      {action}
    </div>
  );
}

function Pill({ children, color = 'slate' }) {
  const map = {
    blue: 'bg-blue-50 text-[#0057E7] border-blue-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    slate: 'bg-slate-100 text-slate-600 border-slate-200/80',
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-wide leading-none ${map[color] || map.slate}`}>
      {children}
    </span>
  );
}

function ModePill({ mode }) {
  if (!mode) return null;
  return <Pill color={mode === 'online' ? 'blue' : 'slate'}>{mode}</Pill>;
}

function PaymentPill({ payment }) {
  if (!payment) return <span className="text-slate-400 text-xs">—</span>;
  const map = {
    pending: { label: 'Pending', color: 'slate' },
    awaiting_confirmation: { label: 'In review', color: 'amber' },
    paid: { label: 'Paid', color: 'emerald' },
    expired: { label: 'Expired', color: 'rose' },
    failed: { label: 'Failed', color: 'rose' },
  };
  const cfg = map[payment.status] || { label: payment.status, color: 'slate' };
  return <Pill color={cfg.color}>{cfg.label}</Pill>;
}

function EmptyState({ title, hint }) {
  return (
    <div className="py-20 text-center">
      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 mx-auto mb-4 flex items-center justify-center text-xl">
        📭
      </div>
      <p className="text-slate-700 font-semibold mb-1">{title}</p>
      {hint && <p className="text-slate-400 text-sm">{hint}</p>}
    </div>
  );
}

function Spinner({ text }) {
  return (
    <div className="py-20 text-center">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#0057E7] animate-spin mx-auto mb-3" />
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3 mb-5">
      <span className="mt-0.5 shrink-0">⚠</span>
      {message}
    </div>
  );
}

function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-md
        shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.97] ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2.5
        rounded-md border border-slate-200 transition-all duration-150 active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

function LinkButton({ children, danger, ...props }) {
  return (
    <button
      {...props}
      className={`text-[13px] font-semibold transition hover:underline underline-offset-2 ${danger ? 'text-rose-600 hover:text-rose-700' : 'text-[#0057E7] hover:text-[#0A66FF]'
        }`}
    >
      {children}
    </button>
  );
}

const inputClass =
  'w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 ' +
  'outline-none rounded-md px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/80">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400
              hover:text-slate-700 hover:bg-slate-100 transition text-sm"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function TagChipInput({ label, value = [], onChange, placeholder }) {
  const [draft, setDraft] = useState('');
  const addTag = () => {
    const v = draft.trim();
    if (!v || value.includes(v)) { setDraft(''); return; }
    onChange([...value, v]);
    setDraft('');
  };
  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/80 text-[12px] px-2.5 py-1 rounded-full font-medium">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-blue-500 hover:text-rose-500 transition">✕</button>
          </span>
        ))}
        {value.length === 0 && <span className="text-slate-400 text-[12px] self-center">None added yet</span>}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder={placeholder || 'Type and press enter'}
          className={inputClass}
        />
        <SecondaryButton type="button" onClick={addTag}>Add</SecondaryButton>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

function ComingSoon({ title }) {
  return (
    <div>
      <PageHeader title={title} />
      <Card>
        <EmptyState
          title="Coming soon"
          hint="This section will be wired up once the backend for it is ready."
        />
      </Card>
    </div>
  );
}

// ─── Data hooks ───────────────────────────────────────────────────────────────

function useAdminResource({ label, basePath, detailPath, supportsUpdate = true }, token) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}${basePath}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Could not load ${label} (${res.status}).`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [basePath, label, token]);

  useEffect(() => { if (token) refresh(); }, [token, refresh]);

  const save = async (payload, existingItem) => {
    if (existingItem && !supportsUpdate) throw new Error(`Updating ${label} isn't supported yet.`);
    const url = existingItem ? `${API_BASE}${detailPath(existingItem)}` : `${API_BASE}${basePath}`;

    const hasFile = Object.values(payload).some((v) => v instanceof File);

    let body;
    let headers = { Authorization: `Bearer ${token}` };

    if (hasFile) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (value instanceof File) {
          formData.append(key, value);
        } else if (key === 'cohorts' && Array.isArray(value)) {
          // Many-to-many relationship fields need each ID sent as its own
          // entry, not one JSON string, or Django rejects it.
          value.forEach((id) => formData.append('cohorts', id));
        } else if (Array.isArray(value) || typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(payload);
    }

    const res = await fetch(url, {
      method: existingItem ? 'PATCH' : 'POST',
      headers,
      body,
    });

    if (!res.ok) {
      let details = '';
      const rawText = await res.text();
      try {
        const errorData = JSON.parse(rawText);
        console.error(`${label} save failed (JSON):`, errorData);
        details = Object.entries(errorData)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
      } catch {
        console.error(`${label} save failed (raw response):`, rawText); // <-- full Django traceback lands here
        details = `HTTP ${res.status} — check browser console for full error`;
      }
      throw new Error(details || 'Save failed. Check the fields and try again.');
    }
    await refresh();
  };

  const remove = async (item) => {
    const res = await fetch(`${API_BASE}${detailPath(item)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Delete failed.');
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  return { items, loading, error, refresh, save, remove };
}

function useDashboardStats(token) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cohorts/dashboard-stats/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load dashboard stats.');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) refresh(); }, [token, refresh]);

  return { stats, loading, error, refresh };
}

// ─── Overview icons ─────────────────────────────────────────────────────────

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}
function BlogIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4h11l5 5v11H4z" />
      <path d="M15 4v5h5" />
    </svg>
  );
}
function GroupIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function GradCapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M14 9h1M14 13h1" />
    </svg>
  );
}
function CoursesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}
function CohortIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
function CheckBadgeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12l2.5 2.5 5-5" />
    </svg>
  );
}
function NewApplicantIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21c0-4 3-6 7-6" />
      <path d="M17 8v6M14 11h6" />
    </svg>
  );
}
function TutorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
      <path d="M22 10v6" />
    </svg>
  );
}

function ManagerCard({ title, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 bg-white border border-slate-200/80 rounded-md px-4 py-3.5 w-full
        hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-150 text-left"
    >
      <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200/70 flex items-center justify-center text-[#0057E7] shrink-0">
        {icon}
      </div>
      <p className="flex-1 min-w-0 text-slate-800 font-semibold text-[13.5px] truncate">{title}</p>
      <svg
        className="text-slate-300 group-hover:text-[#0057E7] group-hover:translate-x-0.5 transition-all shrink-0"
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}

function SectionLabel({ children }) {
  return <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2.5">{children}</p>;
}

function HighlightStatCard({ label, value, icon }) {
  return (
    <div className="relative overflow-hidden flex items-center justify-between bg-white border border-slate-200/80 rounded-lg pl-6 pr-5 py-5
      shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:border-blue-200 transition-all duration-200">
      <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#0057E7]" />
      <div>
        <p className="text-slate-500 font-medium text-[13px] mb-1.5">{label}</p>
        <p className="text-slate-900 font-bold text-[30px] leading-none tracking-tight">{value}</p>
      </div>
      <div className="w-11 h-11 rounded-md bg-blue-50 border border-blue-200/70 flex items-center justify-center text-[#0057E7] shrink-0">
        {icon}
      </div>
    </div>
  );
}

function OverviewStatCard({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-lg px-4 py-4
      shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:border-slate-300 transition-all duration-200">
      <div>
        <p className="text-slate-500 font-medium text-[13px] mb-1.5">{label}</p>
        <p className="text-slate-900 font-bold text-[22px] leading-none tracking-tight">{value}</p>
      </div>
      <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-300 shrink-0">
        {icon}
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ courses, locations, applications, dashboardStats, tutors, onNavigate }) {
  const pending = applications.items.filter((a) =>
    ['pending', 'awaiting_confirmation'].includes(a.payment?.status)
  ).length;

  const currentCohorts = dashboardStats.stats?.cohorts?.current ?? 0;
  const completedCohorts = dashboardStats.stats?.cohorts?.completed ?? 0;

  return (
    <div>
      <ErrorBanner message={dashboardStats.error} />

      <div className="mb-5">
        <SectionLabel>Quick actions</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ManagerCard title="Manage guests" onClick={() => onNavigate('guests')} icon={<PersonIcon />} />
          <ManagerCard title="Manage blog" onClick={() => onNavigate('blog')} icon={<BlogIcon />} />
        </div>
      </div>

      <div className="mb-5">
        <SectionLabel>At a glance</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <HighlightStatCard label="New applicants" value={pending} icon={<NewApplicantIcon />} />
          <HighlightStatCard label="Current cohorts" value={dashboardStats.loading ? '—' : currentCohorts} icon={<CohortIcon />} />
        </div>
      </div>

      <div>
        <SectionLabel>Totals</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {/* Students/Graduates show 0 until backend provides real counts */}
          <OverviewStatCard label="Students" value={0} icon={<GroupIcon />} />
          <OverviewStatCard label="Tutors" value={tutors.loading ? '—' : tutors.items.length} icon={<TutorIcon />} />
          <OverviewStatCard label="Centers" value={locations.items.length} icon={<BuildingIcon />} />
          <OverviewStatCard label="Courses" value={courses.items.length} icon={<CoursesIcon />} />
          <OverviewStatCard label="Completed cohorts" value={dashboardStats.loading ? '—' : completedCohorts} icon={<CheckBadgeIcon />} />
          <OverviewStatCard label="Graduates" value={0} icon={<GradCapIcon />} />
        </div>
      </div>
    </div>
  );
}

// ─── Courses (Syllabus) tab ────────────────────────────────────────────────────

const emptyCourse = {
  title: '', slug: '', category: 'technology', duration: '', fee: '',
  image: null, description: '', overview: '', featured: false,
  skills: [], outcomes: [], requirements: [], modules: [],
};

function CoursesTab({ courses }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCourse);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const openNew = () => { setForm(emptyCourse); setImagePreview(null); setModal('new'); setErr(''); };
  const openEdit = (c) => {
    setForm({ ...emptyCourse, ...c, image: null });
    setImagePreview(c.image ? `${API_BASE}${c.image}` : null);
    setModal(c);
    setErr('');
  };
  const close = () => setModal(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      const payload = { ...form, slug: form.slug || slugify(form.title) };
      if (!payload.image) delete payload.image;
      await courses.save(payload, modal === 'new' ? null : modal);
      close();
    }
    catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Syllabus" subtitle={`${courses.items.length} course${courses.items.length !== 1 ? 's' : ''}`}>
        <PrimaryButton onClick={openNew}>+ Add course</PrimaryButton>
      </PageHeader>
      <ErrorBanner message={courses.error} />
      {courses.loading ? <Spinner text="Loading courses…" /> : courses.items.length === 0 ? (
        <Card><EmptyState title="No courses yet" hint="Add your first course to get started." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.items.map((c) => (
            <Card key={c.id} interactive className="p-5">
              {c.image && (
                <div className="w-full h-32 rounded-md overflow-hidden mb-3 bg-slate-100">
                  <img src={`${API_BASE}${c.image}`} alt={c.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-slate-900 font-bold text-base leading-snug pr-4 tracking-tight">{c.title}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <LinkButton onClick={() => openEdit(c)}>Edit</LinkButton>
                  <span className="text-slate-300">·</span>
                  <LinkButton danger onClick={() => courses.remove(c)}>Delete</LinkButton>
                </div>
              </div>
              {c.description && (
                <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2">{c.description}</p>
              )}
              <div className="flex items-center gap-2 mb-3">
                {c.category && <Pill color="blue">{c.category}</Pill>}
                {c.duration && <span className="text-slate-400 text-xs">{c.duration}</span>}
                {!c.image && <Pill color="rose">No image</Pill>}
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-slate-900 font-black text-lg tracking-tight">{formatMoney(c.fee)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'Add new course' : 'Edit course'} onClose={close}>
          <div className="space-y-4">
            {err && <ErrorBanner message={err} />}

            <Field label="Course image">
              <div className="flex items-center gap-3">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-md object-cover border border-slate-200" />
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className={inputClass} />
              </div>
            </Field>

            <Field label="Title">
              <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Full-Stack Web Development" />
            </Field>

            <Field label="Category">
              <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="vocational">Vocational</option>
              </select>
            </Field>

            <Field label="Description">
              <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short course summary" />
            </Field>

            <Field label="Overview">
              <textarea className={inputClass} rows={3} value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} placeholder="Longer overview shown on the course page" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Duration">
                <input className={inputClass} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2 Months" />
              </Field>
              <Field label="Fee (₦)">
                <input type="number" className={inputClass} value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} placeholder="150000" />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured course
            </label>

            <TagChipInput label="Skills" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} placeholder="e.g. Python" />
            <TagChipInput label="Career outcomes" value={form.outcomes} onChange={(outcomes) => setForm({ ...form, outcomes })} placeholder="e.g. Backend Developer" />
            <TagChipInput label="Requirements" value={form.requirements} onChange={(requirements) => setForm({ ...form, requirements })} placeholder="e.g. Laptop Computer" />
            <TagChipInput label="Modules" value={form.modules} onChange={(modules) => setForm({ ...form, modules })} placeholder="e.g. Database Design" />

            <PrimaryButton className="w-full justify-center" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save course'}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Locations (Centers) tab ──────────────────────────────────────────────────

const emptyLocation = { name: '', address: '', amenities: [] };

function LocationsTab({ locations }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyLocation);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const openNew = () => { setForm(emptyLocation); setModal('new'); setErr(''); };
  const openEdit = (l) => { setForm({ ...emptyLocation, ...l }); setModal(l); setErr(''); };
  const close = () => setModal(null);

  const handleSave = async () => {
    setSaving(true); setErr('');
    try { await locations.save(form, modal === 'new' ? null : modal); close(); }
    catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Centers" subtitle={`${locations.items.length} location${locations.items.length !== 1 ? 's' : ''}`}>
        <PrimaryButton onClick={openNew}>+ Add location</PrimaryButton>
      </PageHeader>
      <ErrorBanner message={locations.error} />
      {locations.loading ? <Spinner text="Loading locations…" /> : locations.items.length === 0 ? (
        <Card><EmptyState title="No locations yet" hint="Add a study location to get started." /></Card>
      ) : (
        <div className="space-y-3">
          {locations.items.map((l) => (
            <Card key={l.id} interactive className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-900 font-bold mb-1 tracking-tight">{l.name}</p>
                  {l.address && <p className="text-slate-500 text-sm mb-3">{l.address}</p>}
                  {l.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {l.amenities.map((t) => (
                        <span key={t} className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <LinkButton onClick={() => openEdit(l)}>Edit</LinkButton>
                  <span className="text-slate-300">·</span>
                  <LinkButton danger onClick={() => locations.remove(l)}>Delete</LinkButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'Add new location' : 'Edit location'} onClose={close}>
          <div className="space-y-4">
            {err && <ErrorBanner message={err} />}
            <Field label="Name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ajah Campus" />
            </Field>
            <Field label="Address">
              <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
            </Field>
            <TagChipInput label="Amenities" value={form.amenities} onChange={(amenities) => setForm({ ...form, amenities })} placeholder="e.g. Parking" />
            <PrimaryButton className="w-full justify-center" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save location'}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Cohorts tab ──────────────────────────────────────────────────────────────

const emptyCohort = { name: '', start_date: '', end_date: '', status: 'upcoming' };

function CohortsTab({ cohorts }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCohort);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('all');

  const openNew = () => { setForm(emptyCohort); setModal('new'); setErr(''); };
  const openEdit = (c) => {
    setForm({
      name: c.name,
      start_date: c.start_date || '',
      end_date: c.end_date || '',
      status: c.status,
    });
    setModal(c);
    setErr('');
  };
  const close = () => setModal(null);

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      const payload = { ...form };
      if (!payload.end_date) delete payload.end_date;
      await cohorts.save(payload, modal === 'new' ? null : modal);
      close();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const filters = ['all', 'upcoming', 'current', 'completed'];
  const filtered = filter === 'all' ? cohorts.items : cohorts.items.filter((c) => c.status === filter);

  const statusColor = { upcoming: 'blue', current: 'emerald', completed: 'slate' };

  return (
    <div>
      <PageHeader title="Cohorts" subtitle={`${filtered.length} of ${cohorts.items.length} total`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${filter === f
                ? 'border-[#0057E7] bg-[#0057E7] text-white shadow-sm'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <PrimaryButton onClick={openNew}>+ Add cohort</PrimaryButton>
      </PageHeader>

      <ErrorBanner message={cohorts.error} />

      {cohorts.loading ? <Spinner text="Loading cohorts…" /> : filtered.length === 0 ? (
        <Card><EmptyState title="No cohorts yet" hint="Add a cohort to start assigning applicants to it." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} interactive className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-slate-900 font-bold text-base leading-snug pr-4 tracking-tight">{c.name}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <LinkButton onClick={() => openEdit(c)}>Edit</LinkButton>
                  <span className="text-slate-300">·</span>
                  <LinkButton danger onClick={() => cohorts.remove(c)}>Delete</LinkButton>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Pill color={statusColor[c.status] || 'slate'}>{c.status}</Pill>
                {c.current_stage_label && <Pill color="indigo">{c.current_stage_label}</Pill>}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Starts</p>
                  <p className="text-slate-700 font-medium">{formatDate(c.start_date) || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Ends</p>
                  <p className="text-slate-700 font-medium">{formatDate(c.end_date) || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Students</p>
                  <p className="text-slate-700 font-medium">{c.student_count ?? 0}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Next stage</p>
                  <p className="text-slate-700 font-medium">
                    {c.stage_countdown_days != null ? `${c.stage_countdown_days}d` : '—'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'Add new cohort' : 'Edit cohort'} onClose={close}>
          <div className="space-y-4">
            {err && <ErrorBanner message={err} />}

            <Field label="Name">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. January 2026 Set"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </Field>
              <Field label="End date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="upcoming">Upcoming</option>
                <option value="current">Current</option>
                <option value="completed">Completed</option>
              </select>
            </Field>

            <PrimaryButton className="w-full justify-center" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save cohort'}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Tutors tab ───────────────────────────────────────────────────────────────

const emptyTutorCreate = {
  first_name: '', last_name: '', email: '', phone_number: '', password: '',
  bio: '', courses_of_instruction: [], date_of_employment: '',
  profile_picture: null, cohorts: [],
};

const emptyTutorEdit = {
  bio: '', courses_of_instruction: [], date_of_employment: '',
  performance_rating: 0, profile_picture: null, cohorts: [],
};

function TutorsTab({ tutors, cohorts }) {
  const [modal, setModal] = useState(null); // 'new' | tutor object | null
  const [form, setForm] = useState(emptyTutorCreate);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const isNew = modal === 'new';

  const openNew = () => {
    setForm(emptyTutorCreate);
    setImagePreview(null);
    setModal('new');
    setErr('');
  };

  const openEdit = (t) => {
    setForm({
      ...emptyTutorEdit,
      bio: t.bio || '',
      courses_of_instruction: t.courses_of_instruction || [],
      date_of_employment: t.date_of_employment || '',
      performance_rating: t.performance_rating || 0,
      cohorts: t.cohorts || [],
      profile_picture: null,
    });
    setImagePreview(t.profile_picture ? `${API_BASE}${t.profile_picture}` : null);
    setModal(t);
    setErr('');
  };

  const close = () => setModal(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, profile_picture: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleCohort = (cohortId) => {
    setForm((f) => {
      const has = f.cohorts.includes(cohortId);
      return { ...f, cohorts: has ? f.cohorts.filter((id) => id !== cohortId) : [...f.cohorts, cohortId] };
    });
  };

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      const payload = { ...form };
      if (!payload.profile_picture) delete payload.profile_picture;
      if (!payload.date_of_employment) delete payload.date_of_employment;
      await tutors.save(payload, isNew ? null : modal);
      close();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const getTutorName = (t) => {
    const u = t.user_detail;
    if (!u) return 'Unnamed tutor';
    return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
  };

  return (
    <div>
      <PageHeader title="Tutors" subtitle={`${tutors.items.length} tutor${tutors.items.length !== 1 ? 's' : ''}`}>
        <PrimaryButton onClick={openNew}>+ Add tutor</PrimaryButton>
      </PageHeader>

      <ErrorBanner message={tutors.error} />

      {tutors.loading ? <Spinner text="Loading tutors…" /> : tutors.items.length === 0 ? (
        <Card><EmptyState title="No tutors yet" hint="Add your first tutor to get started." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutors.items.map((t) => (
            <Card key={t.id} interactive className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {t.profile_picture ? (
                    <img src={`${API_BASE}${t.profile_picture}`} alt={getTutorName(t)} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0057E7] flex items-center justify-center text-white text-sm font-bold">
                      {getTutorName(t).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-slate-900 font-bold text-[15px] leading-tight tracking-tight">{getTutorName(t)}</h3>
                    {t.user_detail?.email && <p className="text-slate-400 text-xs">{t.user_detail.email}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <LinkButton onClick={() => openEdit(t)}>Edit</LinkButton>
                  <span className="text-slate-300">·</span>
                  <LinkButton danger onClick={() => tutors.remove(t)}>Remove</LinkButton>
                </div>
              </div>

              {t.bio && <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2">{t.bio}</p>}

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {(t.courses_of_instruction || []).map((c) => (
                  <Pill key={c} color="blue">{c}</Pill>
                ))}
                {(!t.courses_of_instruction || t.courses_of_instruction.length === 0) && (
                  <span className="text-slate-400 text-xs italic">No courses assigned</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm pt-3 border-t border-slate-100">
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Cohorts</p>
                  <p className="text-slate-700 font-medium">{t.cohorts?.length || 0}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Rating</p>
                  <p className="text-slate-700 font-medium">{t.performance_rating || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Employed</p>
                  <p className="text-slate-700 font-medium">{formatDate(t.date_of_employment) || '—'}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={isNew ? 'Add new tutor' : `Edit ${getTutorName(modal)}`} onClose={close}>
          <div className="space-y-4">
            {err && <ErrorBanner message={err} />}

            <Field label="Profile picture">
              <div className="flex items-center gap-3">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className={inputClass} />
              </div>
            </Field>

            {isNew && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name">
                    <input className={inputClass} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="e.g. Ade" />
                  </Field>
                  <Field label="Last name">
                    <input className={inputClass} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="e.g. Bello" />
                  </Field>
                </div>
                <Field label="Email">
                  <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tutor@example.com" />
                </Field>
                <Field label="Phone number">
                  <input className={inputClass} value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="080..." />
                </Field>
                <Field label="Initial password">
                  <input type="text" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Set a password to share with the tutor" />
                </Field>
              </>
            )}

            <Field label="Bio">
              <textarea className={inputClass} rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short bio shown on their profile" />
            </Field>

            <TagChipInput
              label="Courses of instruction"
              value={form.courses_of_instruction}
              onChange={(courses_of_instruction) => setForm({ ...form, courses_of_instruction })}
              placeholder="e.g. Full-Stack Web Development"
            />

            <Field label="Date of employment">
              <input type="date" className={inputClass} value={form.date_of_employment} onChange={(e) => setForm({ ...form, date_of_employment: e.target.value })} />
            </Field>

            {!isNew && (
              <Field label="Performance rating">
                <input type="number" step="0.01" min="0" max="5" className={inputClass} value={form.performance_rating} onChange={(e) => setForm({ ...form, performance_rating: e.target.value })} />
              </Field>
            )}

            <Field label="Assigned cohorts">
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto border border-slate-200 rounded-md p-2.5">
                {cohorts.items.length === 0 && <span className="text-slate-400 text-xs">No cohorts exist yet</span>}
                {cohorts.items.map((c) => {
                  const checked = form.cohorts.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleCohort(c.id)}
                      className={`text-[12px] font-medium px-2.5 py-1 rounded-full border transition ${checked
                        ? 'border-[#0057E7] bg-[#0057E7] text-white'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </Field>

            <PrimaryButton className="w-full justify-center" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create tutor account' : 'Save changes'}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Students tab ───────────────────────────────────────────────────────────
//
// Drop this component into backstage/page.jsx (or wherever the other tab
// components like TutorsTab live). It needs the same shared UI helpers
// already defined in that file: Card, PageHeader, ErrorBanner, Spinner,
// EmptyState, Pill, inputClass, API_BASE.
//
// Usage in the page shell:
//   {tab === 'students' && <StudentsTab token={token} tutors={tutors} />}
//
// (replace the old `{tab === 'students' && <ComingSoon title="Students" />}`)

function useStudents(token) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/users/students/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load students.');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) refresh(); }, [token, refresh]);

  const assignTutor = async (studentId, tutorId) => {
    const res = await fetch(`${API_BASE}/api/users/students/${studentId}/assign-tutor/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assigned_tutor: tutorId }),
    });
    if (!res.ok) {
      const raw = await res.text();
      let details = '';
      try {
        const errorData = JSON.parse(raw);
        details = Object.entries(errorData)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ');
      } catch {
        details = `HTTP ${res.status}`;
      }
      throw new Error(details || 'Could not assign tutor.');
    }
    await refresh();
  };

  return { items, loading, error, refresh, assignTutor };
}

function getStudentName(s) {
  const full = `${s.first_name || ''} ${s.last_name || ''}`.trim();
  return full || s.email;
}

function getTutorLabel(t) {
  const u = t.user_detail;
  if (!u) return 'Unnamed tutor';
  return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
}

function StudentsTab({ token, tutors }) {
  const router = useRouter();
  const students = useStudents(token);
  const [savingId, setSavingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [filter, setFilter] = useState('all'); // all | assigned | unassigned

  const filtered = useMemo(() => {
    if (filter === 'assigned') return students.items.filter((s) => s.assigned_tutor_detail);
    if (filter === 'unassigned') return students.items.filter((s) => !s.assigned_tutor_detail);
    return students.items;
  }, [students.items, filter]);

  const handleAssign = async (studentId, tutorIdRaw) => {
    const tutorId = tutorIdRaw === '' ? null : Number(tutorIdRaw);
    setActionError('');
    setSavingId(studentId);
    try {
      await students.assignTutor(studentId, tutorId);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unassigned', label: 'Unassigned' },
    { key: 'assigned', label: 'Assigned' },
  ];

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${filtered.length} of ${students.items.length} total`}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${filter === f.key
                ? 'border-[#0057E7] bg-[#0057E7] text-white shadow-sm'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <ErrorBanner message={students.error || actionError} />

      {students.loading ? (
        <Spinner text="Loading students…" />
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="No students" hint="Nothing matches this filter yet." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  {['Student', 'Email', 'Phone', 'Tutor', ''].map((h, i) => (
                    <th
                      key={i}
                      className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const currentTutorId = s.assigned_tutor_detail?.id ?? '';
                  const isSaving = savingId === s.id;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => router.push(`/backstage/students/${s.id}`)}
                      className="border-b border-slate-100 hover:bg-slate-50/70 transition last:border-0 cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#0057E7] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                            {getStudentName(s).charAt(0).toUpperCase()}
                          </div>
                          <p className="text-slate-800 font-semibold leading-none">{getStudentName(s)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{s.email}</td>
                      <td className="px-5 py-4 text-slate-500">{s.phone_number || '—'}</td>
                      <td className="px-5 py-4">
                        {s.assigned_tutor_detail ? (
                          <Pill color="blue">{s.assigned_tutor_detail.name}</Pill>
                        ) : (
                          <Pill color="rose">Unassigned</Pill>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          className={`${inputClass} text-[12px] py-1.5 w-44 inline-block`}
                          value={currentTutorId}
                          disabled={isSaving || tutors.loading}
                          onChange={(e) => handleAssign(s.id, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {tutors.items.map((t) => (
                            <option key={t.id} value={t.id}>{getTutorLabel(t)}</option>
                          ))}
                        </select>
                        {isSaving && <span className="text-slate-400 text-[11px] ml-2">Saving…</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Applicants tab ─────────────────────────────────────────────────────────────

function ApplicationsTab({ applications, token, cohorts }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [confirmingId, setConfirmingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [actionError, setActionError] = useState('');

  const filtered = useMemo(() => {
    if (filter === 'all') return applications.items;
    return applications.items.filter((a) => a.payment?.status === filter);
  }, [applications.items, filter]);

  const filters = ['all', 'pending', 'awaiting_confirmation', 'paid', 'expired'];

  const handleMarkPaid = async (application) => {
    setActionError('');
    setConfirmingId(application.id);
    try {
      const res = await fetch(
        `${API_BASE}/api/applications/${application.id}/payments/admin-confirm/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) throw new Error('Could not confirm payment. Please try again.');
      await applications.refresh();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setConfirmingId(null);
    }
  };
  const handleAssignCohort = async (application, cohortIdRaw) => {
    setActionError('');
    setAssigningId(application.id);
    try {
      await applications.save(
        { cohort: cohortIdRaw === '' ? null : Number(cohortIdRaw) },
        application
      );
    } catch (e) {
      setActionError(e.message);
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Applicants"
        subtitle={`${filtered.length} of ${applications.items.length} total`}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${filter === f
                ? 'border-[#0057E7] bg-[#0057E7] text-white shadow-sm'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </PageHeader>

      <ErrorBanner message={applications.error || actionError} />

      {applications.loading ? <Spinner text="Loading applications…" /> : filtered.length === 0 ? (
        <Card><EmptyState title="No applications" hint="Nothing matches this filter yet." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  {['Applicant', 'Course', 'Mode', 'Fee', 'Payment', 'Cohort', 'Date', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const name = getApplicantName(a);
                  const email = getApplicantEmail(a);
                  const course = getCourseTitle(a);
                  const mode = a.mode_of_learning;
                  const date = formatDate(a.created_at);
                  const canConfirm = a.payment?.status === 'awaiting_confirmation';
                  return (
                    <tr
                      key={a.id}
                      onClick={() => router.push(`/backstage/applicant/${a.id}`)}
                      className="border-b border-slate-100 hover:bg-slate-50/70 transition last:border-0 cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {name ? (
                            <>
                              <div className="w-7 h-7 rounded-full bg-[#0057E7] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-slate-800 font-semibold leading-none mb-0.5">{name}</p>
                                {email && <p className="text-slate-400 text-[11px]">{email}</p>}
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Not available</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 max-w-[180px]">
                        {course ? <span className="truncate block">{course}</span> : <span className="text-slate-400 italic text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {mode ? <ModePill mode={mode} /> : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-800 font-bold">
                        {a.payment ? formatMoney(a.payment.confirmed_amount || a.payment.amount) : formatMoney(getCourseFee(a))}
                      </td>
                      <td className="px-5 py-4">
                        <PaymentPill payment={a.payment} />
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        {a.payment?.status === 'paid' ? (
                          <select
                            className={`${inputClass} text-[12px] py-1.5 w-40 inline-block`}
                            value={a.cohort_detail?.id ?? a.cohort ?? ''}
                            disabled={assigningId === a.id || cohorts.loading}
                            onChange={(e) => handleAssignCohort(a, e.target.value)}
                          >
                            <option value="">Unassigned</option>
                            {cohorts.items.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                        {date || '—'}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {canConfirm && (
                          <button
                            onClick={() => handleMarkPaid(a)}
                            disabled={confirmingId === a.id}
                            className="text-[12px] font-semibold text-emerald-700 hover:text-emerald-800
                              border border-emerald-300 hover:border-emerald-400 bg-emerald-50
                              px-3 py-1.5 rounded-md transition disabled:opacity-40 mr-3"
                          >
                            {confirmingId === a.id ? 'Confirming…' : 'Mark as paid'}
                          </button>
                        )}
                        <LinkButton danger onClick={() => applications.remove(a)}>Delete</LinkButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Exams tab ────────────────────────────────────────────────────────────────

const emptyExam = {
  title: '', cohort: '', course: '', exam_type: 'project',
  start_date: '', due_date: '', total_marks: 100, pass_mark: 50, instructions: '',
};

function ExamsTab({ exams, cohorts, courses }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyExam);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const openNew = () => { setForm(emptyExam); setModal('new'); setErr(''); };
  const openEdit = (e) => {
    setForm({
      ...emptyExam,
      ...e,
      cohort: e.cohort_detail?.id ?? e.cohort ?? '',
      course: e.course_detail?.id ?? e.course ?? '',
    });
    setModal(e);
    setErr('');
  };
  const close = () => setModal(null);

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      await exams.save(form, modal === 'new' ? null : modal);
      close();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const getCohortName = (e) => e.cohort_detail?.name || cohorts.items.find((c) => c.id === e.cohort)?.name || '—';
  const getCourseName = (e) => e.course_detail?.title || courses.items.find((c) => c.id === e.course)?.title || '—';

  return (
    <div>
      <PageHeader title="Exams" subtitle={`${exams.items.length} exam${exams.items.length !== 1 ? 's' : ''}`}>
        <PrimaryButton onClick={openNew}>+ Add exam</PrimaryButton>
      </PageHeader>
      <ErrorBanner message={exams.error} />
      {exams.loading ? <Spinner text="Loading exams…" /> : exams.items.length === 0 ? (
        <Card><EmptyState title="No exams yet" hint="Create an exam for a cohort to get started." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  {['Title', 'Course', 'Cohort', 'Type', 'Start', 'Due', 'Status', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exams.items.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition last:border-0">
                    <td className="px-5 py-4 text-slate-800 font-semibold">{e.title}</td>
                    <td className="px-5 py-4 text-slate-500">{getCourseName(e)}</td>
                    <td className="px-5 py-4 text-slate-500">{getCohortName(e)}</td>
                    <td className="px-5 py-4"><Pill color="indigo">{e.exam_type}</Pill></td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{formatDate(e.start_date)}</td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{formatDate(e.due_date)}</td>
                    <td className="px-5 py-4">
                      <Pill color={e.is_open ? 'emerald' : 'slate'}>{e.is_open ? 'Open' : 'Closed'}</Pill>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <LinkButton onClick={() => openEdit(e)}>Edit</LinkButton>
                      <span className="text-slate-300 mx-2">·</span>
                      <LinkButton danger onClick={() => exams.remove(e)}>Delete</LinkButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'Add new exam' : 'Edit exam'} onClose={close}>
          <div className="space-y-4">
            {err && <ErrorBanner message={err} />}
            <Field label="Title">
              <input className={inputClass} value={form.title} onChange={(ev) => setForm({ ...form, title: ev.target.value })} placeholder="e.g. Final Project — Build a Portfolio Site" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cohort">
                <select className={inputClass} value={form.cohort} onChange={(ev) => setForm({ ...form, cohort: ev.target.value })}>
                  <option value="">Select cohort</option>
                  {cohorts.items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Course">
                <select className={inputClass} value={form.course} onChange={(ev) => setForm({ ...form, course: ev.target.value })}>
                  <option value="">Select course</option>
                  {courses.items.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Exam type">
              <select className={inputClass} value={form.exam_type} onChange={(ev) => setForm({ ...form, exam_type: ev.target.value })}>
                <option value="quiz">Quiz</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final Assessment</option>
                <option value="project">Project Assessment</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date">
                <input type="date" className={inputClass} value={form.start_date} onChange={(ev) => setForm({ ...form, start_date: ev.target.value })} />
              </Field>
              <Field label="Due date">
                <input type="date" className={inputClass} value={form.due_date} onChange={(ev) => setForm({ ...form, due_date: ev.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Total marks">
                <input type="number" className={inputClass} value={form.total_marks} onChange={(ev) => setForm({ ...form, total_marks: ev.target.value })} />
              </Field>
              <Field label="Pass mark">
                <input type="number" className={inputClass} value={form.pass_mark} onChange={(ev) => setForm({ ...form, pass_mark: ev.target.value })} />
              </Field>
            </div>
            <Field label="Instructions">
              <textarea className={inputClass} rows={4} value={form.instructions} onChange={(ev) => setForm({ ...form, instructions: ev.target.value })} placeholder="Project brief / requirements shown to students" />
            </Field>
            <PrimaryButton className="w-full justify-center" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save exam'}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Results tab ──────────────────────────────────────────────────────────────

const emptyResult = { exam: '', student: '', score: '', status: 'pending', submitted_at: '', feedback: '' };

function ResultsTab({ results, exams, applications }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyResult);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('all');

  // No dedicated "list students" endpoint exists yet, so we derive the
  // student picker from applications data (deduped by student id).
  const students = useMemo(() => {
    const map = new Map();
    applications.items.forEach((a) => {
      const s = a.student_detail || a.student || a.user_detail || a.user;
      if (s && s.id) {
        const name = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email || `Student #${s.id}`;
        map.set(s.id, { id: s.id, name });
      }
    });
    return Array.from(map.values());
  }, [applications.items]);

  const openNew = () => { setForm(emptyResult); setModal('new'); setErr(''); };
  const openEdit = (r) => {
    setForm({
      ...emptyResult,
      ...r,
      exam: r.exam_detail?.id ?? r.exam ?? '',
      student: r.student_detail?.id ?? r.student ?? '',
      score: r.score ?? '',
      submitted_at: r.submitted_at ? r.submitted_at.slice(0, 10) : '',
    });
    setModal(r);
    setErr('');
  };
  const close = () => setModal(null);

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      const payload = { ...form };
      if (payload.score === '') delete payload.score;
      if (!payload.submitted_at) delete payload.submitted_at;
      await results.save(payload, modal === 'new' ? null : modal);
      close();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const filtered = filter === 'all' ? results.items : results.items.filter((r) => r.status === filter);

  const getExamTitle = (r) => r.exam_detail?.title || exams.items.find((e) => e.id === r.exam)?.title || '—';
  const getStudentName = (r) => {
    const s = r.student_detail;
    if (s) return `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email;
    return students.find((s) => s.id === r.student)?.name || '—';
  };

  const statusColor = { pending: 'slate', passed: 'emerald', failed: 'rose' };
  const filters = ['all', 'pending', 'passed', 'failed'];

  return (
    <div>
      <PageHeader title="Results" subtitle={`${filtered.length} of ${results.items.length} total`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${filter === f
                ? 'border-[#0057E7] bg-[#0057E7] text-white shadow-sm'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <PrimaryButton onClick={openNew}>+ Add result</PrimaryButton>
      </PageHeader>
      <ErrorBanner message={results.error} />
      {results.loading ? <Spinner text="Loading results…" /> : filtered.length === 0 ? (
        <Card><EmptyState title="No results yet" hint="Nothing matches this filter yet." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  {['Student', 'Exam', 'Score', 'Status', 'Submitted', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition last:border-0">
                    <td className="px-5 py-4 text-slate-800 font-semibold">{getStudentName(r)}</td>
                    <td className="px-5 py-4 text-slate-500">{getExamTitle(r)}</td>
                    <td className="px-5 py-4 text-slate-800 font-bold">{r.score ?? '—'}</td>
                    <td className="px-5 py-4"><Pill color={statusColor[r.status] || 'slate'}>{r.status}</Pill></td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{formatDate(r.submitted_at) || '—'}</td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <LinkButton onClick={() => openEdit(r)}>Edit</LinkButton>
                      <span className="text-slate-300 mx-2">·</span>
                      <LinkButton danger onClick={() => results.remove(r)}>Delete</LinkButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'Add new result' : 'Edit result'} onClose={close}>
          <div className="space-y-4">
            {err && <ErrorBanner message={err} />}
            <Field label="Exam">
              <select className={inputClass} value={form.exam} onChange={(ev) => setForm({ ...form, exam: ev.target.value })}>
                <option value="">Select exam</option>
                {exams.items.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </Field>
            <Field label="Student">
              <select className={inputClass} value={form.student} onChange={(ev) => setForm({ ...form, student: ev.target.value })}>
                <option value="">Select student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Score">
                <input type="number" className={inputClass} value={form.score} onChange={(ev) => setForm({ ...form, score: ev.target.value })} placeholder="Out of total marks" />
              </Field>
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(ev) => setForm({ ...form, status: ev.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </Field>
            </div>
            <Field label="Submitted date">
              <input type="date" className={inputClass} value={form.submitted_at} onChange={(ev) => setForm({ ...form, submitted_at: ev.target.value })} />
            </Field>
            <Field label="Feedback">
              <textarea className={inputClass} rows={3} value={form.feedback} onChange={(ev) => setForm({ ...form, feedback: ev.target.value })} placeholder="Optional feedback for the student" />
            </Field>
            <PrimaryButton className="w-full justify-center" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save result'}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Finances tab ─────────────────────────────────────────────────────────────

function FinancesTab({ applications }) {
  const [filter, setFilter] = useState('all');

  const paymentsList = useMemo(
    () => applications.items.filter((a) => a.payment),
    [applications.items]
  );

  const totals = useMemo(() => {
    let confirmed = 0, pending = 0, awaiting = 0, expiredOrFailed = 0;
    paymentsList.forEach((a) => {
      const p = a.payment;
      const amt = Number(p.confirmed_amount || p.amount || 0);
      if (p.status === 'paid') confirmed += amt;
      else if (p.status === 'pending') pending += amt;
      else if (p.status === 'awaiting_confirmation') awaiting += amt;
      else if (p.status === 'expired' || p.status === 'failed') expiredOrFailed += amt;
    });
    return { confirmed, pending, awaiting, expiredOrFailed };
  }, [paymentsList]);

  const filters = ['all', 'paid', 'pending', 'awaiting_confirmation', 'expired', 'failed'];
  const filtered = filter === 'all'
    ? paymentsList
    : paymentsList.filter((a) => a.payment.status === filter);

  const methodLabel = { paystack: 'Paystack', manual: 'Bank Transfer' };

  return (
    <div>
      <PageHeader title="Finances" subtitle={`${paymentsList.length} payment record${paymentsList.length !== 1 ? 's' : ''}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-slate-200/80 rounded-lg px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <p className="text-slate-500 font-medium text-[13px] mb-1.5">Confirmed revenue</p>
          <p className="text-emerald-600 font-bold text-[20px] leading-none tracking-tight">{formatMoney(totals.confirmed)}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-lg px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <p className="text-slate-500 font-medium text-[13px] mb-1.5">Awaiting confirmation</p>
          <p className="text-amber-600 font-bold text-[20px] leading-none tracking-tight">{formatMoney(totals.awaiting)}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-lg px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <p className="text-slate-500 font-medium text-[13px] mb-1.5">Pending</p>
          <p className="text-slate-700 font-bold text-[20px] leading-none tracking-tight">{formatMoney(totals.pending)}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-lg px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <p className="text-slate-500 font-medium text-[13px] mb-1.5">Expired / Failed</p>
          <p className="text-rose-600 font-bold text-[20px] leading-none tracking-tight">{formatMoney(totals.expiredOrFailed)}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${filter === f
              ? 'border-[#0057E7] bg-[#0057E7] text-white shadow-sm'
              : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
          >
            {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {applications.loading ? <Spinner text="Loading payments…" /> : filtered.length === 0 ? (
        <Card><EmptyState title="No payments" hint="Nothing matches this filter yet." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  {['Applicant', 'Reference', 'Method', 'Amount', 'Confirmed', 'Status', 'Date'].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const p = a.payment;
                  const name = getApplicantName(a);
                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition last:border-0">
                      <td className="px-5 py-4 text-slate-800 font-semibold">{name || '—'}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs font-mono">{p.tx_ref}</td>
                      <td className="px-5 py-4">
                        <Pill color={p.method === 'manual' ? 'indigo' : 'blue'}>
                          {methodLabel[p.method] || p.method}
                        </Pill>
                      </td>
                      <td className="px-5 py-4 text-slate-800 font-bold">{formatMoney(p.amount)}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {p.confirmed_amount ? formatMoney(p.confirmed_amount) : '—'}
                      </td>
                      <td className="px-5 py-4"><PaymentPill payment={p} /></td>
                      <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                        {formatDate(p.paid_at || p.created_at) || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
// ─── Sidebar icons ─────────────────────────────────────────────────────────────

function NavIcon({ path }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {path}
    </svg>
  );
}

const NAV = [
  { key: 'overview', label: 'Overview', icon: <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" /> },
  { key: 'cohorts', label: 'Cohorts', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></> },
  { key: 'applicants', label: 'Applicants', icon: <><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-6 7-6" /><path d="M17 8v6M14 11h6" /></> },
  { key: 'tutors', label: 'Tutors', icon: <><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /><path d="M22 10v6" /></> },
  { key: 'students', label: 'Students', icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></> },
  { key: 'staffs', label: 'Staffs', icon: <><rect x="2" y="4" width="14" height="10" rx="1" /><path d="M9 19h4M11 14v5" /></> },
  { key: 'finances', label: 'Finances', icon: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></> },
  { key: 'syllabus', label: 'Syllabus', icon: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></> },
  { key: 'exam', label: 'Exam', icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></> },
  { key: 'results', label: 'Results', icon: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></> },
  { key: 'queries', label: 'Queries', icon: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></> },
  { key: 'messages', label: 'Messages', icon: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /> },
  { key: 'postjob', label: 'Post Job', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></> },
  { key: 'centers', label: 'Centers', icon: <><path d="M3 21h18M5 21V7l7-4 7 4v14" /></> },
];

// ─── Sidebar drawer ────────────────────────────────────────────────────────────

function Sidebar({ open, onClose, tab, setTab }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        />
      )}
      <aside
        className={`fixed lg:static top-20 lg:top-0 left-0 h-[calc(100vh-5rem)] lg:h-screen w-64 z-50 flex flex-col border-r border-blue-900/40
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
                <NavIcon path={item.icon} />
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

// ─── Top bar ───────────────────────────────────────────────────────────────────

function TopBar({ onMenuClick, title, dateLabel }) {
  return (
    <header className="bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} aria-label="Menu" className="text-slate-500 hover:text-slate-700 transition-colors lg:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        </button>
        <button aria-label="Notifications" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-md p-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
        <button className="flex items-center gap-1.5 text-slate-700 font-medium text-[13px] hover:bg-slate-100 transition-colors rounded-md pl-1.5 pr-2 py-1.5 ml-0.5">
          <span className="w-6 h-6 rounded-full bg-[#0057E7] text-white text-[11px] font-bold flex items-center justify-center shrink-0">A</span>
          <span className="hidden sm:inline">Admin</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </header>
  );
}

// ─── Page shell ────────────────────────────────────────────────────────────────

export default function BackstagePage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('access');
    if (!t) { router.push('/login'); return; }
    const verifyStaff = async () => {
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
        if (!profile.is_staff) { router.push('/dashboard'); return; }
        setToken(t);
        setAuthChecked(true);
      } catch { router.push('/login'); }
    };
    verifyStaff();
  }, []);

  const courses = useAdminResource(
    { label: 'courses', basePath: '/api/courses/', detailPath: (c) => `/api/courses/${c.slug}/` },
    token
  );
  const locations = useAdminResource(
    { label: 'locations', basePath: '/api/courses/locations/', detailPath: (l) => `/api/courses/locations/${l.id}/` },
    token
  );
  const applications = useAdminResource(
    { label: 'applications', basePath: '/api/applications/', detailPath: (a) => `/api/applications/${a.id}/`, supportsUpdate: true },
    token
  );
  const cohorts = useAdminResource(
    { label: 'cohorts', basePath: '/api/cohorts/', detailPath: (c) => `/api/cohorts/${c.id}/` },
    token
  );
  const exams = useAdminResource(
    { label: 'exams', basePath: '/api/exams/', detailPath: (e) => `/api/exams/${e.id}/` },
    token
  );
  const results = useAdminResource(
    { label: 'results', basePath: '/api/results/', detailPath: (r) => `/api/results/${r.id}/` },
    token
  );
  const tutors = useAdminResource(
    { label: 'tutors', basePath: '/api/tutors/', detailPath: (t) => `/api/tutors/${t.id}/` },
    token
  );
  const dashboardStats = useDashboardStats(token);

  const handleOverviewNavigate = (target) => {
    // "Manage guests" and "Manage blog" don't have pages yet — route them
    // to placeholder tabs until those are built.
    if (target === 'guests') setTab('students');
    if (target === 'blog') setTab('postjob'); // TODO: point this at a real Blog manager once it exists
  };

  const currentLabel = NAV.find((n) => n.key === tab)?.label || 'Overview';

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-[#0057E7] animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 pt-20">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} tab={tab} setTab={setTab} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={currentLabel} dateLabel={tab === 'overview' ? 'June 2026' : null} />

        <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto pb-24">
          <div className="max-w-6xl">
            {tab === 'overview' && (
              <OverviewTab
                courses={courses}
                locations={locations}
                applications={applications}
                dashboardStats={dashboardStats}
                tutors={tutors}
                onNavigate={handleOverviewNavigate}
              />
            )}
            {tab === 'syllabus' && <CoursesTab courses={courses} />}
            {tab === 'centers' && <LocationsTab locations={locations} />}
            {tab === 'applicants' && <ApplicationsTab applications={applications} token={token} cohorts={cohorts} />}
            {tab === 'exam' && <ExamsTab exams={exams} cohorts={cohorts} courses={courses} />}
            {tab === 'results' && <ResultsTab results={results} exams={exams} applications={applications} />}

            {tab === 'cohorts' && <CohortsTab cohorts={cohorts} />}
            {tab === 'tutors' && <TutorsTab tutors={tutors} cohorts={cohorts} />}
            {tab === 'students' && <StudentsTab token={token} tutors={tutors} />}
            {tab === 'staffs' && <ComingSoon title="Staffs" />}
            {tab === 'finances' && <FinancesTab applications={applications} />}
            {tab === 'queries' && <ComingSoon title="Queries" />}
            {tab === 'messages' && <ComingSoon title="Messages" />}
            {tab === 'postjob' && <ComingSoon title="Post Job" />}
          </div>
        </div>
      </div>

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 z-30"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.47 1.29 4.93L2 22l5.29-1.39a9.9 9.9 0 004.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.79 14.02c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.84-1.23-4.7-4.1-4.84-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.08 1-2.37.24-.27.53-.34.71-.34.18 0 .35 0 .5.01.16.01.38-.06.6.46.24.57.81 1.97.88 2.11.07.14.11.3.02.49-.09.19-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.82.86.27.13.45.19.51.3.07.13.07.7-.17 1.38z" />
        </svg>
      </a>
    </div>
  );
}