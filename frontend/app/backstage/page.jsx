'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

// ─── Shared UI (light theme) ────────────────────────────────────────────────

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
      {action}
    </div>
  );
}

function Pill({ children, color = 'slate' }) {
  const map = {
    blue:    'bg-blue-50 text-[#0057E7] border-blue-200',
    indigo:  'bg-indigo-50 text-indigo-700 border-indigo-200',
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose:    'bg-rose-50 text-rose-700 border-rose-200',
    slate:   'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-wide ${map[color] || map.slate}`}>
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
      <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center text-xl">
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
      className={`bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl
        shadow-sm transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5
        rounded-xl border border-slate-200 transition-all active:scale-95"
    >
      {children}
    </button>
  );
}

function LinkButton({ children, danger, ...props }) {
  return (
    <button
      {...props}
      className={`text-[13px] font-semibold transition hover:underline underline-offset-2 ${
        danger ? 'text-rose-600 hover:text-rose-700' : 'text-[#0057E7] hover:text-[#0A66FF]'
      }`}
    >
      {children}
    </button>
  );
}

const inputClass =
  'w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ' +
  'outline-none rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
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
      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-[12px] px-2.5 py-1 rounded-full font-medium">
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
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
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

// ─── Data hook ────────────────────────────────────────────────────────────────

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
    if (!res.ok) throw new Error('Save failed. Check the fields and try again.');
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

function ManagerCard({ title, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-5 hover:border-blue-300 hover:shadow-sm transition-all text-left"
    >
      <div>
        <p className="text-slate-900 font-bold text-[15px] mb-1.5">{title}</p>
        <p className="text-[#0057E7] font-extrabold text-[15px] leading-tight">
          Open<br />Manager
        </p>
      </div>
      <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-[#0057E7]">
        {icon}
      </div>
    </button>
  );
}

function OverviewStatCard({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-5 hover:border-blue-300 hover:shadow-sm transition-all">
      <div>
        <p className="text-slate-900 font-bold text-[15px] mb-2">{label}</p>
        <p className="text-blue-900 font-black text-[26px] leading-none">{value}</p>
      </div>
      <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-[#0057E7]">
        {icon}
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ courses, locations, applications, onNavigate }) {
  const pending = applications.items.filter((a) =>
    ['pending', 'awaiting_confirmation'].includes(a.payment?.status)
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-[26px] font-black text-slate-950">Overview</h1>
        <div className="flex items-center gap-2 border-2 border-slate-900 rounded-xl px-3.5 py-2 bg-slate-100 text-slate-900 font-semibold text-[13px]">
          June 2026
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <ManagerCard title="Manage guests" onClick={() => onNavigate('guests')} icon={<PersonIcon />} />
        <ManagerCard title="Manage blog" onClick={() => onNavigate('blog')} icon={<BlogIcon />} />

        {/* Placeholders below (students/staff/cohorts/graduates) show 0 until backend provides real counts */}
        <OverviewStatCard label="No of students" value={0} icon={<GroupIcon />} />
        <OverviewStatCard label="No of staffs" value={0} icon={<GradCapIcon />} />

        <OverviewStatCard label="No of centers" value={locations.items.length} icon={<BuildingIcon />} />
        <OverviewStatCard label="Courses" value={courses.items.length} icon={<CoursesIcon />} />

        <OverviewStatCard label="Current cohorts" value={0} icon={<CohortIcon />} />
        <OverviewStatCard label="Completed cohorts" value={0} icon={<CheckBadgeIcon />} />

        <OverviewStatCard label="New applicants" value={pending} icon={<NewApplicantIcon />} />
        <OverviewStatCard label="Graduates" value={0} icon={<GradCapIcon />} />
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
  const [modal, setModal]               = useState(null);
  const [form, setForm]                 = useState(emptyCourse);
  const [saving, setSaving]             = useState(false);
  const [err, setErr]                   = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const openNew  = () => { setForm(emptyCourse); setImagePreview(null); setModal('new'); setErr(''); };
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
            <Card key={c.id} className="p-5 hover:border-slate-300 transition-colors">
              {c.image && (
                <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-100">
                  <img src={`${API_BASE}${c.image}`} alt={c.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-slate-900 font-bold text-base leading-snug pr-4">{c.title}</h3>
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
                <p className="text-slate-900 font-black text-lg">{formatMoney(c.fee)}</p>
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
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
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
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(emptyLocation);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const openNew  = () => { setForm(emptyLocation); setModal('new'); setErr(''); };
  const openEdit = (l) => { setForm({ ...emptyLocation, ...l }); setModal(l); setErr(''); };
  const close    = () => setModal(null);

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
            <Card key={l.id} className="px-6 py-4 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-900 font-bold mb-1">{l.name}</p>
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

// ─── Applicants tab ─────────────────────────────────────────────────────────────

function ApplicationsTab({ applications, token }) {
  const [filter, setFilter] = useState('all');
  const [confirmingId, setConfirmingId] = useState(null);
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
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${
                filter === f
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
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  {['Applicant', 'Course', 'Mode', 'Fee', 'Payment', 'Date', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const name   = getApplicantName(a);
                  const email  = getApplicantEmail(a);
                  const course = getCourseTitle(a);
                  const mode   = a.mode_of_learning;
                  const date   = formatDate(a.created_at);
                  const canConfirm = a.payment?.status === 'awaiting_confirmation';
                  return (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition last:border-0">
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
                      <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                        {date || '—'}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {canConfirm && (
                          <button
                            onClick={() => handleMarkPaid(a)}
                            disabled={confirmingId === a.id}
                            className="text-[12px] font-semibold text-emerald-700 hover:text-emerald-800
                              border border-emerald-300 hover:border-emerald-400 bg-emerald-50
                              px-3 py-1.5 rounded-lg transition disabled:opacity-40 mr-3"
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

// ─── Sidebar icons ─────────────────────────────────────────────────────────────

function NavIcon({ path }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {path}
    </svg>
  );
}

const NAV = [
  { key: 'overview',   label: 'Overview',   icon: <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" /> },
  { key: 'cohorts',    label: 'Cohorts',     icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></> },
  { key: 'applicants', label: 'Applicants',  icon: <><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-6 7-6" /><path d="M17 8v6M14 11h6" /></> },
  { key: 'students',   label: 'Students',    icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></> },
  { key: 'staffs',     label: 'Staffs',      icon: <><rect x="2" y="4" width="14" height="10" rx="1" /><path d="M9 19h4M11 14v5" /></> },
  { key: 'finances',   label: 'Finances',    icon: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></> },
  { key: 'syllabus',   label: 'Syllabus',    icon: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></> },
  { key: 'exam',       label: 'Exam',        icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></> },
  { key: 'results',    label: 'Results',     icon: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></> },
  { key: 'queries',    label: 'Queries',     icon: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></> },
  { key: 'messages',   label: 'Messages',    icon: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /> },
  { key: 'postjob',    label: 'Post Job',    icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></> },
  { key: 'centers',    label: 'Centers',     icon: <><path d="M3 21h18M5 21V7l7-4 7 4v14" /></> },
];

// ─── Sidebar drawer ────────────────────────────────────────────────────────────

function Sidebar({ open, onClose, tab, setTab }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}
      <aside
        className={`fixed lg:static top-0 left-0 h-full lg:h-screen w-72 z-50 flex flex-col
          transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ background: 'linear-gradient(180deg, #071224 0%, #0A1A38 100%)' }}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.webp" alt="LASOP Logo" width={34} height={34} />
            <span className="text-white font-bold text-lg tracking-wide">LASOP</span>
          </div>
          <button onClick={onClose} className="text-white lg:hidden" aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 mb-4">
          <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3.5 py-2.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              placeholder="Search..."
              className="bg-transparent text-white placeholder:text-white/60 text-sm outline-none w-full"
            />
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
          {NAV.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); onClose(); }}
                className={`w-full flex items-center gap-3 text-[14px] px-3.5 py-2.5 rounded-xl transition-all font-semibold ${
                  active
                    ? 'bg-white text-[#0057E7]'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <NavIcon path={item.icon} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-6 pt-2">
          <div className="h-px bg-white/15 mb-3 mx-2" />
          <button className="w-full flex items-center gap-3 text-[14px] font-semibold text-white/80 hover:text-white px-3.5 py-2.5 rounded-xl hover:bg-white/10 transition-all">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Top bar ───────────────────────────────────────────────────────────────────

function TopBar({ onMenuClick, title }) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0057E7" strokeWidth={2.4} strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <p className="text-slate-900 font-black text-[15px] hidden sm:block">{title}</p>
      </div>

      <div className="flex items-center gap-4">
        <button aria-label="Messages" className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0057E7]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        </button>
        <button aria-label="Notifications" className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0057E7]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
        <button className="flex items-center gap-1.5 text-slate-900 font-bold text-[14px]">
          Admin
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
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
  const [token, setToken]             = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab]                 = useState('overview');
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
    { label: 'applications', basePath: '/api/applications/', detailPath: (a) => `/api/applications/${a.id}/`, supportsUpdate: false },
    token
  );

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
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} tab={tab} setTab={setTab} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={currentLabel} />

        <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto pb-24">
          <div className="max-w-6xl">
            {tab === 'overview'   && (
              <OverviewTab
                courses={courses}
                locations={locations}
                applications={applications}
                onNavigate={handleOverviewNavigate}
              />
            )}
            {tab === 'syllabus'   && <CoursesTab courses={courses} />}
            {tab === 'centers'    && <LocationsTab locations={locations} />}
            {tab === 'applicants' && <ApplicationsTab applications={applications} token={token} />}

            {tab === 'cohorts'  && <ComingSoon title="Cohorts" />}
            {tab === 'students' && <ComingSoon title="Students" />}
            {tab === 'staffs'   && <ComingSoon title="Staffs" />}
            {tab === 'finances' && <ComingSoon title="Finances" />}
            {tab === 'exam'     && <ComingSoon title="Exam" />}
            {tab === 'results'  && <ComingSoon title="Results" />}
            {tab === 'queries'  && <ComingSoon title="Queries" />}
            {tab === 'messages' && <ComingSoon title="Messages" />}
            {tab === 'postjob'  && <ComingSoon title="Post Job" />}
          </div>
        </div>
      </div>

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-5 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-black/20 hover:scale-105 transition-transform z-30"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.47 1.29 4.93L2 22l5.29-1.39a9.9 9.9 0 004.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.79 14.02c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.84-1.23-4.7-4.1-4.84-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.08 1-2.37.24-.27.53-.34.71-.34.18 0 .35 0 .5.01.16.01.38-.06.6.46.24.57.81 1.97.88 2.11.07.14.11.3.02.49-.09.19-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.82.86.27.13.45.19.51.3.07.13.07.7-.17 1.38z" />
        </svg>
      </a>
    </div>
  );
}