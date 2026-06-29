'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApplicantName(a) {
  const s = a.student_detail || a.student || a.user_detail || a.user || {};
  if (s.first_name || s.last_name) return `${s.first_name || ''} ${s.last_name || ''}`.trim();
  return s.email || a.applicant_name || a.email || '—';
}

function getApplicantEmail(a) {
  const s = a.student_detail || a.student || a.user_detail || a.user || {};
  return s.email || a.email || '—';
}

function getCourseTitle(a) {
  return a.course_detail?.title || a.course?.title || a.course_title || '—';
}

function getCourseFee(a) {
  return Number(a.course_detail?.fee ?? a.course?.fee ?? a.fee ?? 0);
}

function formatMoney(n) {
  return `₦${Number(n || 0).toLocaleString()}`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
      <h3 className="text-sm font-semibold text-slate-800 tracking-wide uppercase">{title}</h3>
      {action}
    </div>
  );
}

const STAT_ACCENTS = [
  'from-blue-500 to-indigo-500',
  'from-violet-500 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
];

function StatCard({ label, value, accentIndex = 0 }) {
  const gradient = STAT_ACCENTS[accentIndex % STAT_ACCENTS.length];
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`} />
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
      <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    paid:                  'bg-emerald-50 text-emerald-700 border border-emerald-200',
    approved:              'bg-emerald-50 text-emerald-700 border border-emerald-200',
    pending:               'bg-amber-50 text-amber-700 border border-amber-200',
    awaiting_confirmation: 'bg-amber-50 text-amber-700 border border-amber-200',
    expired:               'bg-rose-50 text-rose-700 border border-rose-200',
    rejected:              'bg-rose-50 text-rose-700 border border-rose-200',
    online:                'bg-blue-50 text-blue-700 border border-blue-200',
    physical:              'bg-slate-100 text-slate-600 border border-slate-200',
  };
  const cls = map[status] || 'bg-slate-100 text-slate-600 border border-slate-200';
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-wide ${cls}`}>
      {(status || 'unknown').replace(/_/g, ' ')}
    </span>
  );
}

function EmptyState({ title, hint }) {
  return (
    <div className="py-20 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto mb-4 flex items-center justify-center text-2xl">
        ◧
      </div>
      <p className="text-slate-700 font-semibold mb-1">{title}</p>
      {hint && <p className="text-slate-400 text-sm">{hint}</p>}
    </div>
  );
}

function Spinner({ text }) {
  return (
    <div className="py-20 text-center">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin mx-auto mb-3" />
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 mb-5">
      <span className="text-rose-400 mt-0.5">⚠</span>
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
        shadow-sm shadow-blue-200 transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5
        rounded-xl border border-slate-200 hover:border-slate-300 transition-all active:scale-95"
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
        danger ? 'text-rose-500 hover:text-rose-600' : 'text-blue-600 hover:text-blue-700'
      }`}
    >
      {children}
    </button>
  );
}

const inputClass =
  'w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ' +
  'outline-none rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
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
      <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-[12px] px-2.5 py-1 rounded-full font-medium">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-blue-400 hover:text-rose-500 transition" aria-label={`Remove ${tag}`}>✕</button>
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

// ─── Data hook ────────────────────────────────────────────────────────────────

function useAdminResource({ label, basePath, detailPath, supportsUpdate = true }, token) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}${basePath}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Could not load ${label} (status ${res.status}).`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [basePath, label, token]);

  useEffect(() => {
    if (token) refresh();
  }, [token, refresh]);

  const save = async (payload, existingItem) => {
    if (existingItem && !supportsUpdate) throw new Error(`Updating ${label} isn't supported by the API yet.`);
    const url = existingItem ? `${API_BASE}${detailPath(existingItem)}` : `${API_BASE}${basePath}`;
    const res = await fetch(url, {
      method: existingItem ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
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

  return { items, loading, error, refresh, save, remove, supportsUpdate };
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
        <StatCard label="Total courses"     value={courses.items.length}     accentIndex={0} />
        <StatCard label="Locations"         value={locations.items.length}   accentIndex={1} />
        <StatCard label="Pending payments"  value={pending}                  accentIndex={2} />
        <StatCard label="Revenue collected" value={formatMoney(totalRevenue)} accentIndex={3} />
      </div>

      <Card>
        <CardHeader title="Recent applications" />
        <div className="p-6">
          {applications.loading ? (
            <Spinner text="Loading applications…" />
          ) : applications.items.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No applications yet.</p>
          ) : (
            <div className="space-y-1">
              {applications.items.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500
                      flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getApplicantName(a).charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-slate-900 text-sm font-semibold leading-none mb-1">{getApplicantName(a)}</p>
                      <p className="text-slate-400 text-xs">{getCourseTitle(a)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs hidden sm:block">{formatDate(a.created_at)}</span>
                    <Badge status={a.payment_status} />
                  </div>
                </div>
              ))}
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
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCourse);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const openNew  = () => { setForm(emptyCourse); setModal('new'); setErr(''); };
  const openEdit = (c) => { setForm({ ...emptyCourse, ...c }); setModal(c); setErr(''); };
  const close    = () => setModal(null);

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      await courses.save(form, modal === 'new' ? null : modal);
      close();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Courses" subtitle={`${courses.items.length} course${courses.items.length !== 1 ? 's' : ''}`}>
        <PrimaryButton onClick={openNew}>+ Add course</PrimaryButton>
      </PageHeader>

      <ErrorBanner message={courses.error} />

      {courses.loading ? (
        <Spinner text="Loading courses…" />
      ) : courses.items.length === 0 ? (
        <Card><EmptyState title="No courses yet" hint="Add your first course to get started." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.items.map((c) => (
            <Card key={c.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-slate-900 font-bold text-base leading-snug pr-4">{c.title}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <LinkButton onClick={() => openEdit(c)}>Edit</LinkButton>
                  <span className="text-slate-200">·</span>
                  <LinkButton danger onClick={() => courses.remove(c)}>Delete</LinkButton>
                </div>
              </div>

              {c.description && (
                <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2">{c.description}</p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <Badge status={c.mode_of_learning} />
                {c.duration && (
                  <span className="text-slate-400 text-xs font-medium">{c.duration}</span>
                )}
              </div>

              {c.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.topics.map((t) => (
                    <span key={t} className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{t}</span>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
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
    try {
      await locations.save(form, modal === 'new' ? null : modal);
      close();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Locations" subtitle={`${locations.items.length} location${locations.items.length !== 1 ? 's' : ''}`}>
        <PrimaryButton onClick={openNew}>+ Add location</PrimaryButton>
      </PageHeader>

      <ErrorBanner message={locations.error} />

      {locations.loading ? (
        <Spinner text="Loading locations…" />
      ) : locations.items.length === 0 ? (
        <Card><EmptyState title="No locations yet" hint="Add a study location to get started." /></Card>
      ) : (
        <div className="space-y-3">
          {locations.items.map((l) => (
            <Card key={l.id} className="px-6 py-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">📍</span>
                    <p className="text-slate-900 font-bold">{l.name}</p>
                  </div>
                  <p className="text-slate-400 text-sm mb-3 pl-6">{l.address}</p>
                  {l.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-6">
                      {l.amenities.map((t) => (
                        <span key={t} className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-1">
                  <LinkButton onClick={() => openEdit(l)}>Edit</LinkButton>
                  <span className="text-slate-200">·</span>
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

function ApplicationsTab({ applications }) {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return applications.items;
    return applications.items.filter((a) => a.payment_status === filter);
  }, [applications.items, filter]);

  const filters = ['all', 'pending', 'awaiting_confirmation', 'paid', 'expired'];

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
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </PageHeader>

      <ErrorBanner message={applications.error} />

      {applications.loading ? (
        <Spinner text="Loading applications…" />
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="No applications" hint="Nothing matches this filter yet." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                  {['Applicant', 'Course', 'Mode', 'Fee', 'Status', 'Date', ''].map((h, i) => (
                    <th
                      key={i}
                      className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500
                          flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {getApplicantName(a).charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-slate-900 font-semibold leading-none mb-0.5">{getApplicantName(a)}</p>
                          <p className="text-slate-400 text-[11px]">{getApplicantEmail(a)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium max-w-[180px] truncate">{getCourseTitle(a)}</td>
                    <td className="px-5 py-4"><Badge status={a.mode_of_learning} /></td>
                    <td className="px-5 py-4 text-slate-900 font-bold">{formatMoney(getCourseFee(a))}</td>
                    <td className="px-5 py-4"><Badge status={a.payment_status} /></td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{formatDate(a.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <LinkButton danger onClick={() => applications.remove(a)}>Delete</LinkButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

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

// ─── Navigation icons ─────────────────────────────────────────────────────────

function IconOverview({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={active ? 'white' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={active ? 'white' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={active ? 'white' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={active ? 'white' : 'currentColor'} opacity={active ? 0.4 : 0.3} />
    </svg>
  );
}

function IconCourses({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <rect x="1" y="2" width="14" height="2" rx="1" fill={active ? 'white' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <rect x="1" y="7" width="10" height="2" rx="1" fill={active ? 'white' : 'currentColor'} opacity={active ? 0.8 : 0.5} />
      <rect x="1" y="12" width="7" height="2" rx="1" fill={active ? 'white' : 'currentColor'} opacity={active ? 0.6 : 0.4} />
    </svg>
  );
}

function IconLocations({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <circle cx="8" cy="7" r="3" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.5" opacity={active ? 1 : 0.6} />
      <path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5z" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.5" fill="none" opacity={active ? 0.8 : 0.5} />
    </svg>
  );
}

function IconApplications({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <rect x="2" y="1" width="12" height="14" rx="2" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.5" fill="none" opacity={active ? 0.8 : 0.5} />
      <rect x="5" y="5" width="6" height="1.5" rx="0.75" fill={active ? 'white' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <rect x="5" y="8" width="4" height="1.5" rx="0.75" fill={active ? 'white' : 'currentColor'} opacity={active ? 0.7 : 0.4} />
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
  const [token, setToken]           = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab]               = useState('overview');

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
      } catch {
        router.push('/login');
      }
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
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Verifying access…</p>
        </div>
      </main>
    );
  }

  const activeTab = NAV.find((n) => n.key === tab);

  return (
    <main className="min-h-screen bg-[#F0F4FA] flex">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 flex flex-col" style={{ background: '#0F1629' }}>

        {/* Logo area */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">L</span>
            </div>
            <span className="text-white font-black text-base tracking-tight">LASOP</span>
          </div>
          <p className="text-slate-500 text-[11px] font-medium tracking-wide uppercase pl-9">Admin</p>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-white/5 mb-3" />

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map((item) => {
            const isActive = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-3 text-sm px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-medium'
                }`}
              >
                <item.Icon active={isActive} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom area */}
        <div className="px-3 pb-5 mt-4">
          <div className="mx-2 h-px bg-white/5 mb-3" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-sm font-medium text-slate-500
              hover:text-rose-400 hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all text-left"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-60">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-slate-900 font-black text-lg leading-none">{activeTab?.label}</h1>
            <p className="text-slate-400 text-xs mt-0.5">LASOP admin dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
              flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 px-8 py-7 max-w-5xl w-full">
          {tab === 'overview'     && <OverviewTab courses={courses} locations={locations} applications={applications} />}
          {tab === 'courses'      && <CoursesTab courses={courses} />}
          {tab === 'locations'    && <LocationsTab locations={locations} />}
          {tab === 'applications' && <ApplicationsTab applications={applications} />}
        </div>
      </div>
    </main>
  );
}