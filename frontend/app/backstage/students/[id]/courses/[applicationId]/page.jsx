'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const inputClass =
  'w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 ' +
  'outline-none rounded-md px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition';

function StatCard({ label, value, sub, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-50 border-slate-100 text-slate-800',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    rose: 'bg-rose-50 border-rose-100 text-rose-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    blue: 'bg-blue-50 border-blue-100 text-[#0057E7]',
  };
  return (
    <div className={`rounded-xl border px-4 py-3.5 ${tones[tone]}`}>
      <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value ?? '—'}</p>
      {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id;
  const applicationId = params?.applicationId;

  const [token, setToken] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingCohort, setSavingCohort] = useState(false);
  const [savingTutor, setSavingTutor] = useState(false);
  const [actionError, setActionError] = useState('');

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

  const loadAll = useCallback(async (t) => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, cohortsRes, tutorsRes] = await Promise.all([
        fetch(`${API_BASE}/api/cohorts/applications/${applicationId}/analytics/`, {
          headers: { Authorization: `Bearer ${t}` },
        }),
        fetch(`${API_BASE}/api/cohorts/`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/api/tutors/`, { headers: { Authorization: `Bearer ${t}` } }),
      ]);

      if (!analyticsRes.ok) throw new Error('Could not load course details.');
      if (!cohortsRes.ok) throw new Error('Could not load cohorts.');
      if (!tutorsRes.ok) throw new Error('Could not load tutors.');

      const analyticsData = await analyticsRes.json();
      const cohortsData = await cohortsRes.json();
      const tutorsData = await tutorsRes.json();

      setData(analyticsData);
      setCohorts(Array.isArray(cohortsData) ? cohortsData : cohortsData.results || []);
      setTutors(Array.isArray(tutorsData) ? tutorsData : tutorsData.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (authChecked && token) loadAll(token);
  }, [authChecked, token, loadAll]);

  const handleAssignCohort = async (cohortIdRaw) => {
    setActionError('');
    setSavingCohort(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${applicationId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cohort: cohortIdRaw === '' ? null : Number(cohortIdRaw) }),
      });
      if (!res.ok) throw new Error('Could not assign cohort.');
      await loadAll(token);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setSavingCohort(false);
    }
  };

  const handleAssignTutor = async (tutorIdRaw) => {
    setActionError('');
    setSavingTutor(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${applicationId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tutor: tutorIdRaw === '' ? null : Number(tutorIdRaw) }),
      });
      if (!res.ok) throw new Error('Could not assign tutor.');
      await loadAll(token);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setSavingTutor(false);
    }
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-[#0057E7] animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">{!authChecked ? 'Verifying access…' : 'Loading course…'}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-200 mx-auto mb-4 flex items-center justify-center text-xl">⚠</div>
          <p className="text-slate-700 font-semibold mb-1">Couldn't load this course</p>
          <p className="text-slate-400 text-sm mb-5">{error || 'Something went wrong.'}</p>
          <button
            onClick={() => router.push(`/backstage/students/${studentId}`)}
            className="text-sm font-semibold text-[#0057E7] hover:text-[#0A66FF]"
          >
            ← Back to student
          </button>
        </div>
      </div>
    );
  }

  const { cohort, attendance, timeline } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push(`/backstage/students/${studentId}`)}
            className="w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
            aria-label="Go back"
          >
            <BackArrow />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Course details</p>
            <p className="text-slate-800 font-semibold text-sm truncate">{data.course_title || '—'}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6 sm:p-8 mb-6">
          <div
            className="absolute inset-x-0 top-0 h-24"
            style={{ background: 'linear-gradient(135deg, #0057E7 0%, #0A66FF 45%, #2E8BFF 100%)', opacity: 0.06 }}
          />
          <div className="relative">
            <h1 className="text-slate-900 font-bold text-xl sm:text-2xl tracking-tight">{data.course_title || 'Untitled course'}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {cohort?.name ? `Cohort: ${cohort.name}` : 'No cohort assigned'}
              {timeline?.current_stage_label ? ` · ${timeline.current_stage_label}` : ''}
            </p>
          </div>
        </div>

        {actionError && (
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3 mb-6">
            <span className="mt-0.5 shrink-0">⚠</span>{actionError}
          </div>
        )}

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6 sm:p-7 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">Reassign</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]">Cohort</label>
              <select
                className={inputClass}
                value={cohort?.id ?? ''}
                disabled={savingCohort}
                onChange={(e) => handleAssignCohort(e.target.value)}
              >
                <option value="">Unassigned</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]">Tutor</label>
              <select
                className={inputClass}
                defaultValue=""
                disabled={savingTutor}
                onChange={(e) => handleAssignTutor(e.target.value)}
              >
                <option value="">Unassigned</option>
                {tutors.map((t) => {
                  const u = t.user_detail;
                  const label = u ? (`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email) : 'Unnamed tutor';
                  return <option key={t.id} value={t.id}>{label}</option>;
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6 sm:p-7 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">Attendance</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Present" value={attendance?.present} tone="emerald" />
            <StatCard label="Absent" value={attendance?.absent} tone="rose" />
            <StatCard label="Late" value={attendance?.late} tone="amber" />
            <StatCard
              label="Rate"
              value={attendance?.attendance_rate != null ? `${attendance.attendance_rate}%` : '—'}
              sub={attendance?.total_sessions_held != null ? `of ${attendance.total_sessions_held} sessions` : null}
              tone="blue"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6 sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">Timeline</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Started" value={cohort?.start_date ? formatDate(cohort.start_date) : '—'} />
            <StatCard label="Days in" value={timeline?.days_since_start ?? '—'} />
            <StatCard
              label="Days remaining"
              value={timeline?.days_remaining ?? '—'}
              sub={cohort?.end_date ? `Ends ${formatDate(cohort.end_date)}` : 'No end date set'}
              tone={timeline?.days_remaining != null && timeline.days_remaining <= 7 ? 'amber' : 'slate'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}