'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function GuardianGateModal({ user, token, onUserUpdate }) {
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    if (!guardianName.trim() || !guardianEmail.trim()) {
      setErr('Please fill in both guardian name and email.');
      return;
    }

    setSaving(true);
    setErr('');
    try {
      const res = await fetch(`${API_BASE}/api/users/profile/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          guardian_name: guardianName,
          guardian_email: guardianEmail,
          guardian_phone: guardianPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const firstError = Object.values(data)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : 'Could not save guardian details.');
      }
      onUserUpdate(data);
      // Modal unmounts automatically once the parent re-renders with
      // guardian_name + guardian_email now present on `user`.
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop — no onClick handler, so clicking outside does NOT close it */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-[440px] bg-white border border-slate-200 rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 pt-6 pb-5 border-b border-slate-200/80">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </div>
          <p className="text-slate-900 text-[17px] font-bold tracking-tight">One quick thing before you continue</p>
          <p className="text-slate-500 text-[13px] mt-1.5 leading-relaxed">
            We need your parent/guardian's details so we can keep them updated on your progress. Please fill this in to access your dashboard.
          </p>
        </div>

        <div className="px-6 pt-5 pb-6">
          {err && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3 mb-4">
              <span className="mt-0.5 shrink-0">⚠</span>
              {err}
            </div>
          )}

          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-slate-600 text-[12px] font-semibold mb-1.5">
                Guardian name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Mrs. Adaeze Okafor"
                className="w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-600 text-[12px] font-semibold mb-1.5">
                Guardian email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder="guardian@email.com"
                className="w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-600 text-[12px] font-semibold mb-1.5">
                Guardian phone number <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="080..."
                className="w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-40 text-white text-sm font-semibold py-3 rounded-md
              shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.98]"
          >
            {saving ? 'Saving…' : 'Save and continue'}
          </button>
        </div>
      </div>
    </div>
  );
}