'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Different endpoints may key the applicant differently (student vs student_detail vs user_detail).
// Try a few sensible fallbacks so the UI doesn't break if field names differ slightly.
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
    <div className={`bg-white border border-slate-200 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
      <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
      {action}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card className="px-5 py-4">
      <p className="text-[13px] text-slate-500 mb-1.5">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </Card>
  );
}

function Badge({ status }) {
  const map = {
    paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    awaiting_confirmation: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    expired: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    online: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    physical: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  };
  const cls = map[status] || 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  return (
    <span className={`text-[12px] font-medium px-2.5 py-1 rounded-full ${cls}`}>
      {(status || 'unknown').replace(/_/g, ' ')}
    </span>
  );
}

function EmptyState({ title, hint }) {
  return (
    <div className="py-16 text-center">
      <p className="text-slate-700 font-medium mb-1">{title}</p>
      {hint && <p className="text-slate-400 text-sm">{hint}</p>}
    </div>
  );
}

function Spinner({ text }) {
  return (
    <div className="py-16 text-center">
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3 mb-4">
      {message}
    </div>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg border border-slate-200 transition"
    >
      {children}
    </button>
  );
}

function LinkButton({ children, danger, ...props }) {
  return (
    <button
      {...props}
      className={`text-[13px] font-medium transition ${
        danger ? 'text-rose-600 hover:text-rose-700' : 'text-indigo-600 hover:text-indigo-700'
      }`}
    >
      {children}
    </button>
  );
}

const inputClass =
  'w-full bg-white border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm transition">
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// Tag-chip input for JSONField array values (e.g. topics, amenities)
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
      <label className="block text-[13px] font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[12px] px-2.5 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-slate-400 hover:text-rose-600 transition"
              aria-label={`Remove ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}
        {value.length === 0 && <span className="text-slate-400 text-[12px]">None added yet</span>}
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
    if (existingItem && !supportsUpdate) {
      throw new Error(`Updating ${label} isn't supported by the API yet.`);
    }
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
        <StatCard label="Total courses" value={courses.items.length} />
        <StatCard label="Total locations" value={locations.items.length} />
        <StatCard label="Pending payments" value={pending} />
        <StatCard label="Revenue collected" value={formatMoney(totalRevenue)} />
      </div>

      <Card>
        <CardHeader title="Recent applications" />
        <div className="p-5">
          {applications.loading ? (
            <Spinner text="Loading…" />
          ) : applications.items.length === 0 ? (
            <p className="text-slate-400 text-sm">No applications yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.items.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-slate-900 text-sm font-medium">{getApplicantName(a)}</p>
                    <p className="text-slate-500 text-[13px]">{getCourseTitle(a)}</p>
                  </div>
                  <Badge status={a.payment_status} />
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

  const openNew = () => { setForm(emptyCourse); setModal('new'); setErr(''); };
  const openEdit = (course) => { setForm({ ...emptyCourse, ...course }); setModal(course); setErr(''); };
  const close = () => setModal(null);

  const handleSave = async () => {
    setSaving(true);
    setErr('');
    try {
      await courses.save(form, modal === 'new' ? null : modal);
      close();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Courses</h2>
        <PrimaryButton onClick={openNew}>Add course</PrimaryButton>
      </div>

      <ErrorBanner message={courses.error} />

      {courses.loading ? (
        <Spinner text="Loading courses…" />
      ) : courses.items.length === 0 ? (
        <Card><EmptyState title="No courses yet" hint="Add your first course to get started." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.items.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-slate-900 font-medium">{c.title}</h3>
                <div className="flex items-center gap-3 shrink-0">
                  <LinkButton onClick={() => openEdit(c)}>Edit</LinkButton>
                  <LinkButton danger onClick={() => courses.remove(c)}>Delete</LinkButton>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge status={c.mode_of_learning} />
                <span className="text-slate-500 text-[13px]">{c.duration}</span>
              </div>
              {c.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {c.topics.map((t) => (
                    <span key={t} className="text-[12px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
              <p className="text-slate-900 font-semibold pt-3 border-t border-slate-100">{formatMoney(c.fee)}</p>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'Add course' : 'Edit course'} onClose={close}>
          <div className="space-y-4">
            {err && <p className="text-rose-600 text-sm">{err}</p>}
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
            <PrimaryButton className="w-full" onClick={handleSave} disabled={saving}>
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
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyLocation);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const openNew = () => { setForm(emptyLocation); setModal('new'); setErr(''); };
  const openEdit = (loc) => { setForm({ ...emptyLocation, ...loc }); setModal(loc); setErr(''); };
  const close = () => setModal(null);

  const handleSave = async () => {
    setSaving(true);
    setErr('');
    try {
      await locations.save(form, modal === 'new' ? null : modal);
      close();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Locations</h2>
        <PrimaryButton onClick={openNew}>Add location</PrimaryButton>
      </div>

      <ErrorBanner message={locations.error} />

      {locations.loading ? (
        <Spinner text="Loading locations…" />
      ) : locations.items.length === 0 ? (
        <Card><EmptyState title="No locations yet" hint="Add a study location to get started." /></Card>
      ) : (
        <div className="space-y-3">
          {locations.items.map((l) => (
            <Card key={l.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-slate-900 font-medium mb-0.5">{l.name}</p>
                <p className="text-slate-500 text-[13px] mb-2">{l.address}</p>
                {l.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {l.amenities.map((t) => (
                      <span key={t} className="text-[12px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <LinkButton onClick={() => openEdit(l)}>Edit</LinkButton>
                <LinkButton danger onClick={() => locations.remove(l)}>Delete</LinkButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'Add location' : 'Edit location'} onClose={close}>
          <div className="space-y-4">
            {err && <p className="text-rose-600 text-sm">{err}</p>}
            <Field label="Name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ajah Campus" />
            </Field>
            <Field label="Address">
              <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
            </Field>
            <TagChipInput label="Amenities" value={form.amenities} onChange={(amenities) => setForm({ ...form, amenities })} placeholder="e.g. Parking" />
            <PrimaryButton className="w-full" onClick={handleSave} disabled={saving}>
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
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Applications</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[13px] font-medium px-3 py-1.5 rounded-full border transition ${
                filter === f
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

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
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-slate-500 text-[12px] font-medium uppercase tracking-wide">Applicant</th>
                  <th className="px-5 py-3 text-slate-500 text-[12px] font-medium uppercase tracking-wide">Course</th>
                  <th className="px-5 py-3 text-slate-500 text-[12px] font-medium uppercase tracking-wide">Mode</th>
                  <th className="px-5 py-3 text-slate-500 text-[12px] font-medium uppercase tracking-wide">Fee</th>
                  <th className="px-5 py-3 text-slate-500 text-[12px] font-medium uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-slate-500 text-[12px] font-medium uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <p className="text-slate-900 font-medium">{getApplicantName(a)}</p>
                      <p className="text-slate-400 text-[12px]">{getApplicantEmail(a)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{getCourseTitle(a)}</td>
                    <td className="px-5 py-3.5"><Badge status={a.mode_of_learning} /></td>
                    <td className="px-5 py-3.5 text-slate-900">{formatMoney(getCourseFee(a))}</td>
                    <td className="px-5 py-3.5"><Badge status={a.payment_status} /></td>
                    <td className="px-5 py-3.5 text-slate-500 text-[13px]">{formatDate(a.created_at)}</td>
                    <td className="px-5 py-3.5 text-right">
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

// ─── Page shell ────────────────────────────────────────────────────────────────

const NAV = [
  { key: 'overview', label: 'Overview', icon: '◧' },
  { key: 'courses', label: 'Courses', icon: '▤' },
  { key: 'locations', label: 'Locations', icon: '◎' },
  { key: 'applications', label: 'Applications', icon: '▦' },
];

export default function BackstagePage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState('overview');

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
        if (!profile.is_staff) {
          router.push('/dashboard');
          return;
        }
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
    {
      label: 'applications',
      basePath: '/api/applications/',
      detailPath: (a) => `/api/applications/${a.id}/`,
      supportsUpdate: false,
    },
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
        <p className="text-slate-400 text-sm">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-200">
          <p className="text-slate-900 font-semibold text-base">LASOP</p>
          <p className="text-slate-400 text-[12px]">Admin dashboard</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition ${
                tab === item.key
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full text-sm font-medium text-slate-600 hover:bg-slate-100 px-3 py-2.5 rounded-lg transition text-left"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 px-8 py-8 max-w-5xl">
        {tab === 'overview' && <OverviewTab courses={courses} locations={locations} applications={applications} />}
        {tab === 'courses' && <CoursesTab courses={courses} />}
        {tab === 'locations' && <LocationsTab locations={locations} />}
        {tab === 'applications' && <ApplicationsTab applications={applications} />}
      </div>
    </main>
  );
}