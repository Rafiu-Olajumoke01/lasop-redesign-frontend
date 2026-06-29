'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Shared bits ──────────────────────────────────────────────────────────────

function WindowChrome({ label, right }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0E121A] border-b border-[#1C2330]">
      <span className="w-[7px] h-[7px] rounded-full bg-[#FF5F57] inline-block" />
      <span className="w-[7px] h-[7px] rounded-full bg-[#FEBC2E] inline-block" />
      <span className="w-[7px] h-[7px] rounded-full bg-[#28C840] inline-block" />
      <span className="ml-1.5 text-[11px] text-[#6B7585] font-mono truncate">{label}</span>
      {right && <div className="ml-auto shrink-0">{right}</div>}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div
      className="bg-[#11151D] border border-[#1C2330] rounded-r-lg px-4 py-3.5 flex flex-col justify-center"
      style={{ borderLeftColor: accent, borderLeftWidth: 2 }}
    >
      <p className="text-[#6B7585] text-[11px] font-mono mb-1.5">{label}</p>
      <p className="text-[#F1F3F7] text-2xl font-medium">{value}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    paid: ['bg-[#14201A]', 'text-[#7CFF6B]'],
    approved: ['bg-[#14201A]', 'text-[#7CFF6B]'],
    pending: ['bg-[#261B0E]', 'text-[#FFB454]'],
    awaiting_confirmation: ['bg-[#261B0E]', 'text-[#FFB454]'],
    expired: ['bg-[#2A1414]', 'text-[#F09595]'],
    rejected: ['bg-[#2A1414]', 'text-[#F09595]'],
  };
  const [bg, text] = map[status] || ['bg-[#1C2330]', 'text-[#8B95A7]'];
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-md font-mono ${bg} ${text}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

function EmptyState({ text, hint }) {
  return (
    <div className="bg-[#11151D] border border-dashed border-[#2A2F3A] rounded-xl p-12 text-center">
      <p className="text-[#6B7585] text-sm font-mono mb-2">{text}</p>
      {hint && <p className="text-[#4A5263] text-xs">{hint}</p>}
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
      <label className="block text-[11px] text-[#6B7585] font-mono mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 bg-[#0E1829] border border-[#1C2B4A] text-[#7FAAFF] text-[11px] font-mono px-2.5 py-1 rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-[#5A6275] hover:text-[#F09595] transition"
              aria-label={`Remove ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span className="text-[#4A5263] text-[11px] font-mono">none added yet</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(); }
          }}
          placeholder={placeholder || 'Type and press enter'}
          className="flex-1 bg-[#0D1118] border border-[#1C2330] focus:border-[#5B8CFF] outline-none rounded-md px-3 py-2 text-sm text-[#E6E9EF] placeholder:text-[#4A5263] transition"
        />
        <button
          type="button"
          onClick={addTag}
          className="text-xs font-mono px-3 py-2 rounded-md border border-[#1C2B4A] text-[#5B8CFF] hover:border-[#2A3F6A] hover:text-[#7FAAFF] transition"
        >
          add()
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] text-[#6B7585] font-mono mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-[#0D1118] border border-[#1C2330] focus:border-[#5B8CFF] outline-none rounded-md px-3 py-2 text-sm text-[#E6E9EF] placeholder:text-[#4A5263] transition';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#11151D] border border-[#1C2330] rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <WindowChrome
          label={title}
          right={
            <button onClick={onClose} className="text-[#5A6275] hover:text-[#E6E9EF] text-xs font-mono transition">
              ✕ close
            </button>
          }
        />
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full bg-[#5B8CFF] hover:bg-[#7FAAFF] disabled:opacity-40 text-[#0B0E14] text-sm font-semibold py-2.5 rounded-lg transition"
    >
      {children}
    </button>
  );
}

function GhostButton({ children, danger, ...props }) {
  return (
    <button
      {...props}
      className={`text-xs font-mono px-3 py-2 rounded-md border transition ${
        danger
          ? 'text-[#F09595] border-[#501313] hover:border-[#6A1A1A] hover:bg-[#2A1414]'
          : 'text-[#5B8CFF] border-[#1C2B4A] hover:border-[#2A3F6A] hover:text-[#7FAAFF]'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Data hook ────────────────────────────────────────────────────────────────

// basePath: list/create endpoint. detailPath(item): detail endpoint for an existing item.
// supportsUpdate: whether the detail view accepts PATCH (applications only supports DELETE).
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
      if (!res.ok) throw new Error(`Could not load ${label}.`);
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

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ courses, locations, applications }) {
  const totalRevenue = applications.items
    .filter((a) => a.payment_status === 'paid')
    .reduce((sum, a) => sum + (Number(a.course_detail?.fee) || 0), 0);

  const pending = applications.items.filter((a) =>
    ['pending', 'awaiting_confirmation'].includes(a.payment_status)
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="courses.length" value={courses.items.length} accent="#5B8CFF" />
        <StatCard label="locations.length" value={locations.items.length} accent="#FFB454" />
        <StatCard label="applications.pending" value={pending} accent="#FFB454" />
        <StatCard
          label="revenue.paid()"
          value={`₦${totalRevenue >= 1000000 ? `${(totalRevenue / 1000000).toFixed(1)}M` : totalRevenue.toLocaleString()}`}
          accent="#7CFF6B"
        />
      </div>

      <div className="bg-[#11151D] border border-[#1C2330] rounded-xl overflow-hidden">
        <WindowChrome label="recent_applications.tail(5)" />
        <div className="p-5">
          {applications.items.length === 0 ? (
            <p className="text-[#4A5263] text-xs">No applications yet.</p>
          ) : (
            <div className="space-y-2.5">
              {applications.items.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between border-b border-[#1C2330] last:border-0 pb-2.5 last:pb-0"
                >
                  <div>
                    <p className="text-[#E6E9EF] text-sm">{a.applicant_name || a.user_detail?.email}</p>
                    <p className="text-[#6B7585] text-[11px] font-mono">{a.course_detail?.title}</p>
                  </div>
                  <StatusPill status={a.payment_status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Courses tab ──────────────────────────────────────────────────────────────

const emptyCourse = { title: '', description: '', duration: '', fee: '', mode_of_learning: 'online', topics: [] };

function CoursesTab({ courses }) {
  const [modal, setModal] = useState(null); // null | 'new' | course object
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
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[#F1F3F7] font-medium text-[15px]">Courses</h2>
        <button onClick={openNew} className="text-[#7CFF6B] text-xs font-mono hover:text-[#9AFF8C] transition">
          + add_course()
        </button>
      </div>

      {courses.error && (
        <div className="bg-[#2A1414] border border-[#501313] text-[#F09595] text-xs rounded-lg px-4 py-3 mb-4 font-mono">
          {courses.error}
        </div>
      )}

      {courses.loading ? (
        <p className="text-[#6B7585] text-sm font-mono animate-pulse">loading_courses...</p>
      ) : courses.items.length === 0 ? (
        <EmptyState text="courses.length === 0" hint="Add your first course to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {courses.items.map((c) => (
            <div key={c.id} className="bg-[#11151D] border border-[#1C2330] rounded-lg overflow-hidden hover:border-[#2A2F3A] transition">
              <WindowChrome
                label={`${(c.title || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '_')}.course`}
                right={
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(c)} className="text-[11px] text-[#5B8CFF] hover:text-[#7FAAFF] font-mono transition">
                      edit()
                    </button>
                    <button onClick={() => courses.remove(c)} className="text-[11px] text-[#5A6275] hover:text-[#F09595] font-mono transition">
                      remove()
                    </button>
                  </div>
                }
              />
              <div className="p-4">
                <h3 className="text-[#F1F3F7] font-medium text-sm mb-2.5">{c.title}</h3>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className={`text-[11px] px-2.5 py-1 rounded-md font-mono ${c.mode_of_learning === 'online' ? 'bg-[#14201A] text-[#7CFF6B]' : 'bg-[#261B0E] text-[#FFB454]'}`}>
                    {c.mode_of_learning}
                  </span>
                  <span className="text-[11px] text-[#6B7585]">{c.duration}</span>
                </div>
                {c.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {c.topics.map((t) => (
                      <span key={t} className="text-[10px] bg-[#0E1829] text-[#7FAAFF] font-mono px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[#5B8CFF] font-medium text-sm pt-2.5 border-t border-[#1C2330]">
                  ₦{Number(c.fee || 0).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'course.create()' : 'course.update()'} onClose={close}>
          <div className="space-y-4">
            {err && <p className="text-[#F09595] text-xs font-mono">{err}</p>}
            <Field label="title">
              <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Full-Stack Web Development" />
            </Field>
            <Field label="description">
              <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short course summary" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="duration">
                <input className={inputClass} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 12 weeks" />
              </Field>
              <Field label="fee (₦)">
                <input type="number" className={inputClass} value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} placeholder="150000" />
              </Field>
            </div>
            <Field label="mode_of_learning">
              <select className={inputClass} value={form.mode_of_learning} onChange={(e) => setForm({ ...form, mode_of_learning: e.target.value })}>
                <option value="online">online</option>
                <option value="physical">physical</option>
              </select>
            </Field>
            <TagChipInput label="topics" value={form.topics} onChange={(topics) => setForm({ ...form, topics })} placeholder="e.g. React, add and press enter" />
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? 'saving...' : 'Save course'}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Locations tab ────────────────────────────────────────────────────────────

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
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[#F1F3F7] font-medium text-[15px]">Locations</h2>
        <button onClick={openNew} className="text-[#7CFF6B] text-xs font-mono hover:text-[#9AFF8C] transition">
          + add_location()
        </button>
      </div>

      {locations.error && (
        <div className="bg-[#2A1414] border border-[#501313] text-[#F09595] text-xs rounded-lg px-4 py-3 mb-4 font-mono">
          {locations.error}
        </div>
      )}

      {locations.loading ? (
        <p className="text-[#6B7585] text-sm font-mono animate-pulse">loading_locations...</p>
      ) : locations.items.length === 0 ? (
        <EmptyState text="locations.length === 0" hint="Add a study location to get started." />
      ) : (
        <div className="space-y-3">
          {locations.items.map((l) => (
            <div key={l.id} className="bg-[#11151D] border border-[#1C2330] rounded-lg px-5 py-4 flex items-center justify-between hover:border-[#2A2F3A] transition">
              <div>
                <p className="text-[#F1F3F7] font-medium text-sm mb-1">{l.name}</p>
                <p className="text-[#6B7585] text-[11px] font-mono mb-1.5">{l.address}</p>
                {l.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {l.amenities.map((t) => (
                      <span key={t} className="text-[10px] bg-[#0E1829] text-[#7FAAFF] font-mono px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => openEdit(l)} className="text-[11px] text-[#5B8CFF] hover:text-[#7FAAFF] font-mono transition">
                  edit()
                </button>
                <button onClick={() => locations.remove(l)} className="text-[11px] text-[#5A6275] hover:text-[#F09595] font-mono transition">
                  remove()
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'location.create()' : 'location.update()'} onClose={close}>
          <div className="space-y-4">
            {err && <p className="text-[#F09595] text-xs font-mono">{err}</p>}
            <Field label="name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ajah Campus" />
            </Field>
            <Field label="address">
              <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
            </Field>
            <TagChipInput label="amenities" value={form.amenities} onChange={(amenities) => setForm({ ...form, amenities })} placeholder="e.g. Parking, add and press enter" />
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? 'saving...' : 'Save location'}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Applications tab ─────────────────────────────────────────────────────────

function ApplicationsTab({ applications }) {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return applications.items;
    return applications.items.filter((a) => a.payment_status === filter);
  }, [applications.items, filter]);

  const filters = ['all', 'pending', 'awaiting_confirmation', 'paid', 'expired'];

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5 flex-wrap gap-3">
        <h2 className="text-[#F1F3F7] font-medium text-[15px]">Applications</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] font-mono px-2.5 py-1.5 rounded-md border transition ${
                filter === f
                  ? 'border-[#2A3F6A] text-[#7FAAFF] bg-[#0E1829]'
                  : 'border-[#1C2330] text-[#6B7585] hover:border-[#2A2F3A] hover:text-[#8B95A7]'
              }`}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {applications.error && (
        <div className="bg-[#2A1414] border border-[#501313] text-[#F09595] text-xs rounded-lg px-4 py-3 mb-4 font-mono">
          {applications.error}
        </div>
      )}

      {applications.loading ? (
        <p className="text-[#6B7585] text-sm font-mono animate-pulse">loading_applications...</p>
      ) : filtered.length === 0 ? (
        <EmptyState text="applications.length === 0" hint="Nothing matches this filter yet." />
      ) : (
        <div className="bg-[#11151D] border border-[#1C2330] rounded-xl overflow-hidden">
          <WindowChrome label="applications.table()" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1C2330] text-left">
                  <th className="px-4 py-3 text-[#6B7585] text-[11px] font-mono font-normal">applicant</th>
                  <th className="px-4 py-3 text-[#6B7585] text-[11px] font-mono font-normal">course</th>
                  <th className="px-4 py-3 text-[#6B7585] text-[11px] font-mono font-normal">mode</th>
                  <th className="px-4 py-3 text-[#6B7585] text-[11px] font-mono font-normal">fee</th>
                  <th className="px-4 py-3 text-[#6B7585] text-[11px] font-mono font-normal">status</th>
                  <th className="px-4 py-3 text-[#6B7585] text-[11px] font-mono font-normal">date</th>
                  <th className="px-4 py-3 text-[#6B7585] text-[11px] font-mono font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-[#1C2330] last:border-0 hover:bg-[#0E121A] transition">
                    <td className="px-4 py-3 text-[#E6E9EF]">{a.applicant_name || a.user_detail?.email}</td>
                    <td className="px-4 py-3 text-[#8B95A7] text-[13px]">{a.course_detail?.title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${a.mode_of_learning === 'online' ? 'bg-[#14201A] text-[#7CFF6B]' : 'bg-[#261B0E] text-[#FFB454]'}`}>
                        {a.mode_of_learning}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5B8CFF]">₦{Number(a.course_detail?.fee || 0).toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusPill status={a.payment_status} /></td>
                    <td className="px-4 py-3 text-[#6B7585] text-[11px] font-mono">
                      {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => applications.remove(a)}
                        className="text-[11px] text-[#5A6275] hover:text-[#F09595] font-mono transition"
                      >
                        remove()
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'courses', label: 'Courses' },
  { key: 'locations', label: 'Locations' },
  { key: 'applications', label: 'Applications' },
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
    {
      label: 'locations',
      basePath: '/api/courses/locations/',
      detailPath: (l) => `/api/courses/locations/${l.id}/`,
    },
    token
  );
  const applications = useAdminResource(
    {
      label: 'applications',
      basePath: '/api/applications/',
      detailPath: (a) => `/api/applications/${a.id}/`,
      supportsUpdate: false, // API only exposes delete on the detail route
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
      <main className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <p className="text-[#6B7585] text-sm font-mono animate-pulse">loading_backstage...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0E14]">
      <div className="border-b border-[#1C2330] bg-[#0E121A]">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#5B8CFF] inline-block" />
            <span className="text-xs text-[#8B95A7] font-mono tracking-wide">lasop / backstage</span>
          </div>
          <button onClick={handleLogout} className="text-xs text-[#8B95A7] hover:text-[#E6E9EF] font-mono transition">
            log_out()
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-8 pb-16">
        <div className="flex items-center gap-1.5 mb-8 border-b border-[#1C2330] overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm font-mono px-4 py-2.5 -mb-px border-b-2 transition whitespace-nowrap ${
                tab === t.key
                  ? 'border-[#5B8CFF] text-[#F1F3F7]'
                  : 'border-transparent text-[#6B7585] hover:text-[#8B95A7]'
              }`}
            >
              {t.label.toLowerCase()}()
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab courses={courses} locations={locations} applications={applications} />}
        {tab === 'courses' && <CoursesTab courses={courses} />}
        {tab === 'locations' && <LocationsTab locations={locations} />}
        {tab === 'applications' && <ApplicationsTab applications={applications} />}
      </div>
    </main>
  );
}