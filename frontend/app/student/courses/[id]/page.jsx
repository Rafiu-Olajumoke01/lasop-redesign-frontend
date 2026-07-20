'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Shared UI (matches /student dashboard) ────────────────────────────────

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

function Pill({ children, color = 'slate' }) {
  const map = {
    blue: 'bg-blue-50 text-[#0057E7] border-blue-200/80',
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

function EmptyState({ title, hint }) {
  return (
    <div className="py-14 text-center">
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

function SectionLabel({ children }) {
  return <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2.5">{children}</p>;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(t) {
  if (!t) return '';
  // t comes in as "HH:MM:SS" — trim seconds for display
  return t.slice(0, 5);
}

// ─── Class Session Card ─────────────────────────────────────────────────────

function ClassSessionCard({ session, status }) {
  const statusPill = {
    today: <Pill color="emerald">Today</Pill>,
    future: <Pill color="blue">Upcoming</Pill>,
    completed: <Pill color="slate">Completed</Pill>,
  };

  // topics_covered may be multi-line — split for cleaner display
  const topicsList = (session.topics_covered || '')
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <Card interactive className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-slate-900 font-bold text-sm tracking-tight">
            {topicsList[0] || 'Class session'}
          </p>
          <p className="text-slate-400 text-[11px] mt-1">
            {formatDate(session.date)} · {formatTime(session.start_time)}–{formatTime(session.end_time)}
          </p>
        </div>
        {statusPill[status]}
      </div>

      {topicsList.length > 1 && (
        <ul className="text-slate-600 text-sm space-y-1 mt-3 pt-3 border-t border-slate-100 list-disc list-inside">
          {topicsList.slice(1).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ─── Classes Section ─────────────────────────────────────────────────────────

function ClassesSection({ classes }) {
  const { today, future, completed } = classes;
  const hasAny = today.length + future.length + completed.length > 0;

  if (!hasAny) {
    return <Card><EmptyState title="No classes yet" hint="Your tutor hasn't posted any classes for this course yet." /></Card>;
  }

  return (
    <div className="space-y-7">
      {today.length > 0 && (
        <div>
          <SectionLabel>Today&apos;s Class</SectionLabel>
          <div className="space-y-3">
            {today.map((s) => <ClassSessionCard key={s.id} session={s} status="today" />)}
          </div>
        </div>
      )}

      {future.length > 0 && (
        <div>
          <SectionLabel>Future Classes</SectionLabel>
          <div className="space-y-3">
            {future.map((s) => <ClassSessionCard key={s.id} session={s} status="future" />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <SectionLabel>Completed Classes</SectionLabel>
          <div className="space-y-3">
            {completed.map((s) => <ClassSessionCard key={s.id} session={s} status="completed" />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Projects Section (placeholder — backend not built yet) ───────────────

function ProjectsSection() {
  return (
    <Card>
      <EmptyState
        title="Projects coming soon"
        hint="This month's project and your Capstone project will show up here once we build that piece."
      />
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [token, setToken] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [classes, setClasses] = useState({ today: [], future: [], completed: [] });
  const [subTab, setSubTab] = useState('classes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('access');
    if (!t) { router.push('/login'); return; }
    setToken(t);

    const fetchData = async () => {
      try {
        const [appsRes, classesRes] = await Promise.all([
          fetch(`${API_BASE}/api/applications/`, { headers: { Authorization: `Bearer ${t}` } }),
          fetch(`${API_BASE}/api/cohorts/my-classes/?course=${courseId}`, { headers: { Authorization: `Bearer ${t}` } }),
        ]);

        if (appsRes.status === 401 || classesRes.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          router.push('/login');
          return;
        }

        const apps = await appsRes.json();
        const thisApp = apps.find((a) => String(a.course) === String(courseId));
        setCourseTitle(thisApp?.course_detail?.title || 'Course');

        const classesData = await classesRes.json();
        setClasses(classesData);
      } catch {
        setError('Could not load this course.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner text="Loading course…" />
      </div>
    );
  }

  const subTabs = ['classes', 'projects'];
  const totalClasses = classes.today.length + classes.future.length + classes.completed.length;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4 sm:px-6 lg:px-10 py-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/student" className="text-[#0057E7] text-sm font-semibold hover:text-[#0A66FF] transition inline-flex items-center gap-1.5 mb-5">
          ← Back to dashboard
        </Link>

        <ErrorBanner message={error} />

        <PageHeader
          title={courseTitle}
          subtitle={subTab === 'classes' ? `${totalClasses} class${totalClasses !== 1 ? 'es' : ''}` : undefined}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            {subTabs.map((t) => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition capitalize ${
                  subTab === t
                    ? 'border-[#0057E7] bg-[#0057E7] text-white shadow-sm'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </PageHeader>

        {subTab === 'classes' && <ClassesSection classes={classes} />}
        {subTab === 'projects' && <ProjectsSection />}
      </div>
    </div>
  );
}