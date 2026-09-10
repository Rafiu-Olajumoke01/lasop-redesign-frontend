'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card, Pill, EmptyState, Spinner, ErrorBanner, SecondaryButton,
  Modal, PageHeader, SectionLabel, formatDate, DAY_LABELS, STUDENT_STATUS_COLOR,
} from './Shared';
import {
  PersonIcon, BlogIcon, GroupIcon, GradCapIcon, BuildingIcon,
  CoursesIcon, CohortIcon, CheckBadgeIcon, NewApplicantIcon, TutorIcon,
} from './Icons';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Hooks ───────────────────────────────────────────────────────────────────

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

function useCohortsToday(token) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cohorts/today/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load today's cohorts.");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) refresh(); }, [token, refresh]);

  return { items, loading, error, refresh };
}

function useCohortDetail(token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (cohortId) => {
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`${API_BASE}/api/cohorts/${cohortId}/admin-detail/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load cohort details.');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { data, loading, error, load };
}

// ─── Cohorts today section ──────────────────────────────────────────────────

function CohortsTodaySection({ token, onViewCohort }) {
  const today = useCohortsToday(token);

  if (today.loading) {
    return (
      <div className="mb-6">
        <SectionLabel>Cohorts learning today</SectionLabel>
        <Card><Spinner text="Checking today's schedule…" /></Card>
      </div>
    );
  }

  if (today.error) {
    return (
      <div className="mb-6">
        <SectionLabel>Cohorts learning today</SectionLabel>
        <ErrorBanner message={today.error} />
      </div>
    );
  }

  if (today.items.length === 0) {
    return (
      <div className="mb-6">
        <SectionLabel>Cohorts learning today</SectionLabel>
        <Card><EmptyState title="No classes scheduled today" hint="Nothing on the calendar for today across any cohort." /></Card>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <SectionLabel>Cohorts learning today ({today.items.length})</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {today.items.map((s) => (
          <Card key={s.session_id} interactive className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-slate-900 font-bold text-[14px] truncate">{s.cohort_name}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {s.tutor || 'No tutor assigned'} · {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Pill color={s.attendance_taken ? 'emerald' : 'amber'}>
                {s.attendance_taken ? 'Attendance taken' : 'Not marked yet'}
              </Pill>
              <SecondaryButton onClick={() => onViewCohort(s.cohort_id)}>View</SecondaryButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Cohort detail modal ────────────────────────────────────────────────────

export function CohortDetailModal({ cohortId, token, onClose, onMessageCohort }) {
  const detail = useCohortDetail(token);

  useEffect(() => { if (cohortId) detail.load(cohortId); }, [cohortId]);

  const statusColor = { present: 'emerald', absent: 'rose', late: 'amber' };

  return (
    <Modal title={detail.data ? detail.data.name : 'Cohort details'} onClose={onClose}>
      {detail.loading && <Spinner text="Loading cohort…" />}
      {detail.error && <ErrorBanner message={detail.error} />}

      {detail.data && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            {detail.data.current_stage_label && <Pill color="indigo">{detail.data.current_stage_label}</Pill>}
            <Pill color={detail.data.today.is_learning_today ? 'emerald' : 'slate'}>
              {detail.data.today.is_learning_today ? 'Learning today' : 'Not scheduled today'}
            </Pill>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Tutor</p>
              <p className="text-slate-700 font-medium">{detail.data.tutor_name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Class days</p>
              <p className="text-slate-700 font-medium">
                {detail.data.class_days?.length
                  ? detail.data.class_days.map((d) => DAY_LABELS[d] || d).join(', ')
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Starts</p>
              <p className="text-slate-700 font-medium">{formatDate(detail.data.start_date) || '—'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Ends</p>
              <p className="text-slate-700 font-medium">{formatDate(detail.data.end_date) || '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-2">Students</p>
            <div className="grid grid-cols-4 gap-2">
              {['active', 'inactive', 'expelled', 'withdrawn'].map((key) => (
                <div key={key} className="text-center border border-slate-100 rounded-md py-2.5">
                  <p className="text-slate-900 font-bold text-lg leading-none mb-1">{detail.data.student_counts[key]}</p>
                  <Pill color={STUDENT_STATUS_COLOR[key]}>{key}</Pill>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-xs mt-2">{detail.data.student_counts.total} total</p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-2">Today</p>
            {!detail.data.today.session ? (
              <p className="text-slate-400 text-sm">No class session scheduled for today.</p>
            ) : (
              <div>
                <p className="text-slate-500 text-xs mb-1">
                  {detail.data.today.session.start_time?.slice(0, 5)}–{detail.data.today.session.end_time?.slice(0, 5)}
                </p>
                <p className="text-slate-400 text-[11px] mb-2">
                  Session created: {detail.data.today.session.created_at
                    ? new Date(detail.data.today.session.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </p>
                {detail.data.today.session.title && (
                  <p className="text-slate-900 text-sm font-semibold mb-1">
                    {detail.data.today.session.title}
                  </p>
                )}
                {detail.data.today.session.topics_covered && (
                  <p className="text-slate-700 text-sm mb-1">
                    <span className="font-semibold">Focus:</span> {detail.data.today.session.topics_covered}
                  </p>
                )}
                {detail.data.today.session.lesson_outcome && (
                  <p className="text-slate-700 text-sm mb-2">
                    <span className="font-semibold">Outcome:</span> {detail.data.today.session.lesson_outcome}
                  </p>
                )}
                {(detail.data.today.session.start_latitude || detail.data.today.session.end_latitude) && (
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {detail.data.today.session.start_latitude && (
                      <a href={`https://www.google.com/maps?q=${detail.data.today.session.start_latitude},${detail.data.today.session.start_longitude}`} target="_blank" rel="noopener noreferrer" className="text-[#0057E7] text-xs font-semibold hover:text-[#0A66FF] transition">
                        📍 Start location →
                      </a>
                    )}
                    {detail.data.today.session.end_latitude && (
                      <a href={`https://www.google.com/maps?q=${detail.data.today.session.end_latitude},${detail.data.today.session.end_longitude}`} target="_blank" rel="noopener noreferrer" className="text-[#0057E7] text-xs font-semibold hover:text-[#0A66FF] transition">
                        📍 Stop location →
                      </a>
                    )}
                  </div>
                )}

                <Pill color={detail.data.today.attendance_taken ? 'emerald' : 'amber'}>
                  {detail.data.today.attendance_taken ? 'Attendance taken' : 'Attendance not taken yet'}
                </Pill>

                {detail.data.today.roster && (
                  <div className="space-y-2 max-h-72 overflow-y-auto mt-3">
                    {detail.data.today.roster.length === 0 && (
                      <p className="text-slate-400 text-sm text-center py-4">No students enrolled in this cohort.</p>
                    )}
                    {detail.data.today.roster.map((r) => (
                      <div key={r.application_id} className="flex items-center justify-between px-3 py-2.5 border border-slate-100 rounded-md">
                        <div>
                          <p className="text-slate-800 text-sm font-medium">{r.student_name}</p>
                          <p className="text-slate-400 text-xs">{r.student_email}</p>
                        </div>
                        {r.marked ? (
                          <Pill color={statusColor[r.status] || 'slate'}>{r.status}</Pill>
                        ) : (
                          <Pill color="slate">Not marked</Pill>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <SecondaryButton
              className="w-full justify-center"
              onClick={() => {
                onMessageCohort(cohortId, detail.data.name);
                onClose();
              }}
            >
              Message cohort
            </SecondaryButton>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Stat cards ──────────────────────────────────────────────────────────────

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

// ─── Quick action card ───────────────────────────────────────────────────────

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

// ─── Overview tab (default export) ──────────────────────────────────────────

export default function OverviewTab({ courses, locations, applications, tutors, token, onNavigate, onMessageCohort }) {
  const dashboardStats = useDashboardStats(token);

  const pending = applications.items.filter((a) =>
    ['pending', 'awaiting_confirmation'].includes(a.payment?.status)
  ).length;

  const currentCohorts = dashboardStats.stats?.cohorts?.current ?? 0;
  const completedCohorts = dashboardStats.stats?.cohorts?.completed ?? 0;

  const [viewingCohortId, setViewingCohortId] = useState(null);

  return (
    <div>
      <ErrorBanner message={dashboardStats.error} />

      <CohortsTodaySection token={token} onViewCohort={setViewingCohortId} />

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
          <OverviewStatCard label="Students" value={0} icon={<GroupIcon />} />
          <OverviewStatCard label="Tutors" value={tutors.loading ? '—' : tutors.items.length} icon={<TutorIcon />} />
          <OverviewStatCard label="Centers" value={locations.items.length} icon={<BuildingIcon />} />
          <OverviewStatCard label="Courses" value={courses.items.length} icon={<CoursesIcon />} />
          <OverviewStatCard label="Completed cohorts" value={dashboardStats.loading ? '—' : completedCohorts} icon={<CheckBadgeIcon />} />
          <OverviewStatCard label="Graduates" value={0} icon={<GradCapIcon />} />
        </div>
      </div>

      {viewingCohortId && (
        <CohortDetailModal
          cohortId={viewingCohortId}
          token={token}
          onClose={() => setViewingCohortId(null)}
          onMessageCohort={onMessageCohort}
        />
      )}
    </div>
  );
}