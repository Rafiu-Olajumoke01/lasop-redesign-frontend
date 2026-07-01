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
  return null; // null = don't show
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

// ─── Design tokens ────────────────────────────────────────────────────────────
// Dark theme: bg #0A0F1E (near-black navy), surface #111827, border #1F2937
// Accent: electric blue #3B82F6 → indigo #6366F1
// Text: primary #F1F5F9, secondary #64748B, muted #374151

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#111827] border border-[#1F2937] rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
      {action}
    </div>
  );
}

const STAT_GRADIENTS = [
  { from: '#3B82F6', to: '#6366F1' },
  { from: '#8B5CF6', to: '#A855F7' },
  { from: '#F59E0B', to: '#F97316' },
  { from: '#10B981', to: '#14B8A6' },
];

function StatCard({ label, value, accentIndex = 0 }) {
  const g = STAT_GRADIENTS[accentIndex % STAT_GRADIENTS.length];
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-[3px]"
        style={{ background: `linear-gradient(90deg, ${g.from}, ${g.to})` }}
      />
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">{label}</p>
      <p className="text-3xl font-black text-slate-100 leading-none">{value}</p>
    </div>
  );
}

function Pill({ children, color = 'slate' }) {
  const map = {
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald:'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
    slate:  'bg-slate-500/10 text-slate-400 border-slate-500/20',
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
  if (!payment) return <span className="text-slate-600 text-xs">—</span>;
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
      <div className="w-12 h-12 rounded-2xl bg-[#1F2937] mx-auto mb-4 flex items-center justify-center text-xl">
        📭
      </div>
      <p className="text-slate-300 font-semibold mb-1">{title}</p>
      {hint && <p className="text-slate-500 text-sm">{hint}</p>}
    </div>
  );
}

function Spinner({ text }) {
  return (
    <div className="py-20 text-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#1F2937] border-t-blue-500 animate-spin mx-auto mb-3" />
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl px-4 py-3 mb-5">
      <span className="mt-0.5 shrink-0">⚠</span>
      {message}
    </div>
  );
}

function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
        disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl
        shadow-lg shadow-blue-900/40 transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-[#1F2937] hover:bg-[#374151] text-slate-300 text-sm font-medium px-4 py-2.5
        rounded-xl border border-[#374151] hover:border-[#4B5563] transition-all active:scale-95"
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
        danger ? 'text-rose-400 hover:text-rose-300' : 'text-blue-400 hover:text-blue-300'
      }`}
    >
      {children}
    </button>
  );
}

const inputClass =
  'w-full bg-[#0A0F1E] border border-[#1F2937] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ' +
  'outline-none rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 transition';

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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1F2937]">
          <h3 className="text-base font-bold text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500
              hover:text-slate-200 hover:bg-[#1F2937] transition text-sm"
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
          <span key={tag} className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[12px] px-2.5 py-1 rounded-full font-medium">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-blue-500 hover:text-rose-400 transition">✕</button>
          </span>
        ))}
        {value.length === 0 && <span className="text-slate-600 text-[12px] self-center">None added yet</span>}
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
        <h2 className="text-xl font-black text-slate-100">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
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
      // Multipart so the actual file bytes travel with the request.
      // Do NOT set Content-Type manually — the browser sets the correct
      // multipart boundary automatically.
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

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({ courses, locations, applications }) {
  const totalRevenue = applications.items
    .filter((a) => a.payment_status === 'paid')
    .reduce((sum, a) => sum + getCourseFee(a), 0);

  const pending = applications.items.filter((a) =>
    ['pending', 'awaiting_confirmation'].includes(a.payment_status)
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Courses"           value={courses.items.length}      accentIndex={0} />
        <StatCard label="Locations"         value={locations.items.length}    accentIndex={1} />
        <StatCard label="Pending payments"  value={pending}                   accentIndex={2} />
        <StatCard label="Revenue collected" value={formatMoney(totalRevenue)} accentIndex={3} />
      </div>

      <Card>
        <CardHeader title="Recent applications" />
        <div className="p-2">
          {applications.loading ? (
            <Spinner text="Loading…" />
          ) : applications.items.length === 0 ? (
            <EmptyState title="No applications yet" />
          ) : (
            <div>
              {applications.items.slice(0, 5).map((a) => {
                const name    = getApplicantName(a);
                const course  = getCourseTitle(a);
                const date    = formatDate(a.created_at);
                const mode    = a.mode_of_learning;
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#1F2937] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Only show avatar if we actually have a name */}
                      {name && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600
                          flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        {name && <p className="text-slate-200 text-sm font-semibold leading-none mb-1 truncate">{name}</p>}
                        {course && <p className="text-slate-500 text-xs truncate">{course}</p>}
                        {!name && !course && <p className="text-slate-600 text-xs italic">No details available</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {date && <span className="text-slate-600 text-xs hidden sm:block">{date}</span>}
                      {mode && <ModePill mode={mode} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Courses ──────────────────────────────────────────────────────────────────

const emptyCourse = { title: '', description: '', duration: '', fee: '', mode_of_learning: 'online', topics: [] };

function CoursesTab({ courses }) {
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(emptyCourse);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const openNew  = () => { setForm(emptyCourse); setModal('new'); setErr(''); };
  const openEdit = (c) => { setForm({ ...emptyCourse, ...c }); setModal(c); setErr(''); };
  const close    = () => setModal(null);

  const handleSave = async () => {
    setSaving(true); setErr('');
    try { await courses.save(form, modal === 'new' ? null : modal); close(); }
    catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Courses" subtitle={`${courses.items.length} course${courses.items.length !== 1 ? 's' : ''}`}>
        <PrimaryButton onClick={openNew}>+ Add course</PrimaryButton>
      </PageHeader>
      <ErrorBanner message={courses.error} />
      {courses.loading ? <Spinner text="Loading courses…" /> : courses.items.length === 0 ? (
        <Card><EmptyState title="No courses yet" hint="Add your first course to get started." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.items.map((c) => (
            <Card key={c.id} className="p-5 hover:border-[#374151] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-slate-100 font-bold text-base leading-snug pr-4">{c.title}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <LinkButton onClick={() => openEdit(c)}>Edit</LinkButton>
                  <span className="text-[#374151]">·</span>
                  <LinkButton danger onClick={() => courses.remove(c)}>Delete</LinkButton>
                </div>
              </div>
              {c.description && (
                <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2">{c.description}</p>
              )}
              <div className="flex items-center gap-2 mb-3">
                {c.mode_of_learning && <ModePill mode={c.mode_of_learning} />}
                {c.duration && <span className="text-slate-500 text-xs">{c.duration}</span>}
              </div>
              {c.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.topics.map((t) => (
                    <span key={t} className="text-[11px] bg-[#1F2937] text-slate-400 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
              <div className="pt-3 border-t border-[#1F2937]">
                <p className="text-slate-100 font-black text-lg">{formatMoney(c.fee)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'Add new course' : 'Edit course'} onClose={close}>
          <div className="space-y-4">
            {err && <ErrorBanner message={err} />}
            <Field label="Title">
              <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Full-Stack Web Development" />
            </Field>
            <Field label="Description">
              <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short course summary" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Duration">
                <input className={inputClass} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 12 weeks" />
              </Field>
              <Field label="Fee (₦)">
                <input type="number" className={inputClass} value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} placeholder="150000" />
              </Field>
            </div>
            <Field label="Mode of learning">
              <select className={inputClass} value={form.mode_of_learning} onChange={(e) => setForm({ ...form, mode_of_learning: e.target.value })}>
                <option value="online">Online</option>
                <option value="physical">Physical</option>
              </select>
            </Field>
            <TagChipInput label="Topics" value={form.topics} onChange={(topics) => setForm({ ...form, topics })} placeholder="e.g. React" />
            <PrimaryButton className="w-full justify-center" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save course'}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Locations ────────────────────────────────────────────────────────────────

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
      <PageHeader title="Locations" subtitle={`${locations.items.length} location${locations.items.length !== 1 ? 's' : ''}`}>
        <PrimaryButton onClick={openNew}>+ Add location</PrimaryButton>
      </PageHeader>
      <ErrorBanner message={locations.error} />
      {locations.loading ? <Spinner text="Loading locations…" /> : locations.items.length === 0 ? (
        <Card><EmptyState title="No locations yet" hint="Add a study location to get started." /></Card>
      ) : (
        <div className="space-y-3">
          {locations.items.map((l) => (
            <Card key={l.id} className="px-6 py-4 hover:border-[#374151] transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-100 font-bold mb-1">{l.name}</p>
                  {l.address && <p className="text-slate-500 text-sm mb-3">{l.address}</p>}
                  {l.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {l.amenities.map((t) => (
                        <span key={t} className="text-[11px] bg-[#1F2937] text-slate-400 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <LinkButton onClick={() => openEdit(l)}>Edit</LinkButton>
                  <span className="text-[#374151]">·</span>
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

// ─── Applications ─────────────────────────────────────────────────────────────

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
        title="Applications"
        subtitle={`${filtered.length} of ${applications.items.length} total`}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${
                filter === f
                  ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'border-[#1F2937] text-slate-500 hover:border-[#374151] hover:text-slate-300'
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
                <tr className="border-b border-[#1F2937] bg-[#0A0F1E]/60 text-left">
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
                    <tr key={a.id} className="border-b border-[#1F2937]/50 hover:bg-[#1F2937]/40 transition last:border-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {name ? (
                            <>
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600
                                flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-slate-200 font-semibold leading-none mb-0.5">{name}</p>
                                {email && <p className="text-slate-500 text-[11px]">{email}</p>}
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-600 text-xs italic">Not available</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400 max-w-[180px]">
                        {course ? <span className="truncate block">{course}</span> : <span className="text-slate-600 italic text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {mode ? <ModePill mode={mode} /> : <span className="text-slate-600 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-200 font-bold">
                        {a.payment ? formatMoney(a.payment.confirmed_amount || a.payment.amount) : formatMoney(getCourseFee(a))}
                      </td>
                      <td className="px-5 py-4">
                        <PaymentPill payment={a.payment} />
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {date || '—'}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {canConfirm && (
                          <button
                            onClick={() => handleMarkPaid(a)}
                            disabled={confirmingId === a.id}
                            className="text-[12px] font-semibold text-emerald-400 hover:text-emerald-300
                              border border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/10
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

// ─── Nav icons ────────────────────────────────────────────────────────────────

function IconOverview({ active }) {
  const c = active ? 'white' : '#64748B';
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" fill={c} opacity={active ? 1 : 0.7} />
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" fill={c} opacity={active ? 0.7 : 0.5} />
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" fill={c} opacity={active ? 0.7 : 0.5} />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" fill={c} opacity={active ? 0.4 : 0.3} />
    </svg>
  );
}

function IconCourses({ active }) {
  const c = active ? 'white' : '#64748B';
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
      <rect x="1" y="2" width="13" height="2" rx="1" fill={c} opacity={active ? 1 : 0.7} />
      <rect x="1" y="6.5" width="9" height="2" rx="1" fill={c} opacity={active ? 0.7 : 0.5} />
      <rect x="1" y="11" width="6" height="2" rx="1" fill={c} opacity={active ? 0.5 : 0.35} />
    </svg>
  );
}

function IconLocations({ active }) {
  const c = active ? 'white' : '#64748B';
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
      <path d="M7.5 1C5.01 1 3 3.01 3 5.5c0 3.75 4.5 8.5 4.5 8.5S12 9.25 12 5.5C12 3.01 9.99 1 7.5 1z" stroke={c} strokeWidth="1.4" fill="none" opacity={active ? 0.9 : 0.6} />
      <circle cx="7.5" cy="5.5" r="1.5" fill={c} opacity={active ? 1 : 0.7} />
    </svg>
  );
}

function IconApplications({ active }) {
  const c = active ? 'white' : '#64748B';
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
      <rect x="2" y="1" width="11" height="13" rx="2" stroke={c} strokeWidth="1.4" fill="none" opacity={active ? 0.8 : 0.5} />
      <rect x="4.5" y="4.5" width="6" height="1.5" rx="0.75" fill={c} opacity={active ? 1 : 0.6} />
      <rect x="4.5" y="7.5" width="4" height="1.5" rx="0.75" fill={c} opacity={active ? 0.7 : 0.4} />
    </svg>
  );
}

const NAV = [
  { key: 'overview',     label: 'Overview',     Icon: IconOverview },
  { key: 'courses',      label: 'Courses',       Icon: IconCourses },
  { key: 'locations',    label: 'Locations',     Icon: IconLocations },
  { key: 'applications', label: 'Applications',  Icon: IconApplications },
];

// ─── Page shell ────────────────────────────────────────────────────────────────

export default function BackstagePage() {
  const router = useRouter();
  const [token, setToken]             = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab]                 = useState('overview');

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

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    router.push('/login');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0F1E' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#1F2937] border-t-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    // Full-screen dark shell — intentionally no outer layout wrapper
    <div className="min-h-screen flex" style={{ background: '#0A0F1E' }}>

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className="w-56 shrink-0 flex flex-col border-r"
        style={{ background: '#080D1A', borderColor: '#1F2937' }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <span className="text-white text-xs font-black">L</span>
            </div>
            <span className="text-slate-100 font-black text-base tracking-tight">LASOP</span>
          </div>
          <p className="text-slate-600 text-[10px] font-bold tracking-widest uppercase pl-9">Admin Panel</p>
        </div>

        <div className="mx-5 h-px mb-3" style={{ background: '#1F2937' }} />

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-3 text-sm px-3 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'text-white font-semibold shadow-lg shadow-blue-900/30'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 font-medium'
                }`}
                style={active ? { background: 'linear-gradient(135deg, #2563EB, #4F46E5)' } : {}}
              >
                <item.Icon active={active} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 mt-4">
          <div className="mx-2 h-px mb-3" style={{ background: '#1F2937' }} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-sm font-medium text-slate-600
              hover:text-rose-400 hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all text-left"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
              <path d="M5.5 2H3a1 1 0 00-1 1v9a1 1 0 001 1h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M9.5 10l3-2.5L9.5 5M12.5 7.5H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Topbar */}
        <header
          className="shrink-0 px-8 py-4 flex items-center justify-between border-b"
          style={{ background: '#080D1A', borderColor: '#1F2937' }}
        >
          <div>
            <p className="text-slate-100 font-black text-lg leading-none">
              {NAV.find((n) => n.key === tab)?.label}
            </p>
            <p className="text-slate-600 text-[11px] mt-0.5 font-medium uppercase tracking-wide">LASOP admin</p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
          >
            A
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-8 py-7 overflow-y-auto">
          <div className="max-w-5xl">
            {tab === 'overview'     && <OverviewTab courses={courses} locations={locations} applications={applications} />}
            {tab === 'courses'      && <CoursesTab courses={courses} />}
            {tab === 'locations'    && <LocationsTab locations={locations} />}
            {tab === 'applications' && <ApplicationsTab applications={applications} token={token} />}
          </div>
        </div>
      </div>
    </div>
  );
}