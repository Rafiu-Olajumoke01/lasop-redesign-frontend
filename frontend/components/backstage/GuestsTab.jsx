'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const inputClass =
  'w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 ' +
  'outline-none rounded-md px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition';

const labelClass = 'block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]';

const emptyForm = { name: '', email: '', phone_number: '', purpose: '' };

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const GuestsTab = ({ token }) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [activeGuest, setActiveGuest] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/guests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load guests.');
      const data = await res.json();
      setGuests(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) load(); }, [token, load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.purpose.trim()) {
      setError('Name and purpose of visit are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/guests/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Could not save guest. Check the fields and try again.');
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this guest record?')) return;
    setError('');
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/guests/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not delete guest.');
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Guests</h2>
        <p className="text-slate-400 text-sm mt-0.5">{guests.length} recorded</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3 mb-5">
          <span className="mt-0.5 shrink-0">⚠</span>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200/80 rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 mb-6"
      >
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-4">Record a visitor</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className={labelClass}>Phone number</label>
            <input
              className={inputClass}
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              placeholder="080..."
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="visitor@example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Purpose of visit</label>
            <textarea
              className={`${inputClass} resize-y min-h-[90px]`}
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="e.g. Course enquiry"
              rows={3}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-md shadow-sm transition"
        >
          {saving ? 'Saving…' : 'Add guest'}
        </button>
      </form>

      {loading ? (
        <p className="text-slate-400 text-sm py-10 text-center">Loading guests…</p>
      ) : guests.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-lg py-16 text-center">
          <p className="text-slate-700 font-semibold mb-1">No guests recorded yet</p>
          <p className="text-slate-400 text-sm">Visitors you add will show up here.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                 {['Guest ID', 'Name', 'Phone', 'Email', 'Purpose', 'Date'].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
                            <tbody>
                {guests.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition cursor-pointer"
                    onClick={() => setActiveGuest(g)}
                  >
                    <td className="px-5 py-4 text-slate-500 font-mono text-xs">{g.guest_id || '—'}</td>
                    <td className="px-5 py-4 text-slate-800 font-semibold">{g.name}</td>
                    <td className="px-5 py-4 text-slate-500">{g.phone_number || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">{g.email || '—'}</td>
                    <td className="px-5 py-4 text-slate-700 max-w-[220px]">
                      <span className="block truncate">{g.purpose}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{formatDateTime(g.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeGuest && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setActiveGuest(null)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-200 ease-out translate-x-0">
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#0057E7] uppercase tracking-[0.12em] mb-1">
                  {activeGuest.guest_id || 'Guest'}
                </p>
                <h3 className="text-lg font-bold text-slate-900">{activeGuest.name}</h3>
              </div>
              <button
                onClick={() => setActiveGuest(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none px-1"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={labelClass}>Phone</p>
                  <p className="text-sm text-slate-800">{activeGuest.phone_number || '—'}</p>
                </div>
                <div>
                  <p className={labelClass}>Email</p>
                  <p className="text-sm text-slate-800 break-all">{activeGuest.email || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className={labelClass}>Visited</p>
                  <p className="text-sm text-slate-800">{formatDateTime(activeGuest.created_at)}</p>
                </div>
              </div>

              <div>
                <p className={labelClass}>Purpose of visit</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 border border-slate-200/80 rounded-lg px-4 py-3">
                  {activeGuest.purpose}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => { handleDelete(activeGuest.id); setActiveGuest(null); }}
                className="text-[13px] font-semibold text-rose-600 hover:text-rose-700 hover:underline underline-offset-2 transition"
              >
                Delete guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestsTab;