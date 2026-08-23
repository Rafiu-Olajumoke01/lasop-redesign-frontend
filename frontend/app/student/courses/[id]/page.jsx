'use client';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-md
        shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.97] ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2.5
        rounded-md border border-slate-200 transition-all duration-150 active:scale-[0.97] ${className}`}
    >
      {children}
    </button>
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

// ─── Projects Section ────────────────────────────────────────────────────

function useCohortCapstoneProjects(token, courseId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !courseId) return;
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await fetch(`${API_BASE}/api/cohorts/my-cohort-capstone-projects/?course=${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Could not load this month\'s projects.');
        setItems(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, courseId]);

  return { items, loading, error };
}

function useMyClassProjects(token) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cohorts/class-projects/mine/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load your submissions.');
      setItems(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  return { items, loading, error, refresh };
}

function AttemptProjectModal({ capstoneProject, token, onClose, onSubmitted }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('capstone_project', capstoneProject.id);
      formData.append('title', title);
      formData.append('description', description);
      if (techStack) formData.append('tech_stack', techStack);
      if (repoUrl) formData.append('repo_url', repoUrl);
      if (liveUrl) formData.append('live_url', liveUrl);
      if (coverImage) formData.append('cover_image', coverImage);
      if (attachment) formData.append('attachment', attachment);

      const res = await fetch(`${API_BASE}/api/cohorts/class-projects/mine/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Could not submit your project.');
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-[480px] bg-white border border-slate-200 rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-slate-200/80">
          <div>
            <p className="text-slate-900 text-[15px] font-bold tracking-tight">Attempt Project</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{capstoneProject.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0 text-sm">✕</button>
        </div>

        <div className="px-5 sm:px-6 pt-4 pb-6 space-y-3.5">
          <ErrorBanner message={error} />

          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title"
            className="w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400" />

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What did you build?"
            className="w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400" />

          <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="Tech stack (e.g. Django, Next.js)"
            className="w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400" />

          <input type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="Repo URL (optional)"
            className="w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400" />

          <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="Live URL (optional)"
            className="w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400" />

          <div>
            <p className="text-slate-500 text-[12px] font-medium mb-1.5">Cover image (optional)</p>
            <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} className="text-sm" />
          </div>

          <div>
            <p className="text-slate-500 text-[12px] font-medium mb-1.5">Attachment (optional)</p>
            <input type="file" onChange={(e) => setAttachment(e.target.files[0])} className="text-sm" />
          </div>

          <PrimaryButton onClick={handleSubmit} disabled={loading} className="w-full justify-center mt-2">
            {loading ? 'Submitting…' : 'Submit Project'}
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CapstoneProjectCard({ capstoneProject, mySubmissions, token, onOpenAttempt }) {
  const submissionsForThis = mySubmissions.filter((s) => s.capstone_project === capstoneProject.id);

  return (
    <Card interactive className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-slate-900 font-semibold text-sm tracking-tight">{capstoneProject.title}</p>
          <p className="text-slate-400 text-[11px] mt-0.5">{capstoneProject.stage_label}</p>
        </div>
        {capstoneProject.due_date && <Pill color="blue">Due {formatDate(capstoneProject.due_date)}</Pill>}
      </div>

      {capstoneProject.description && (
        <p className="text-slate-500 text-sm leading-relaxed mt-3 pt-3 border-t border-slate-100">
          {capstoneProject.description}
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-slate-100">
        <PrimaryButton onClick={() => onOpenAttempt(capstoneProject)}>
          Attempt Project
        </PrimaryButton>
      </div>

      {submissionsForThis.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
          <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold">Your submissions</p>
          {submissionsForThis.map((s) => (
            <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-md px-3.5 py-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-slate-800 text-sm font-semibold">{s.title}</p>
                {s.tutor_rating != null ? (
                  <Pill color="emerald">Rated {s.tutor_rating}/5</Pill>
                ) : (
                  <Pill color="amber">Awaiting review</Pill>
                )}
              </div>
              {s.tutor_feedback && (
                <p className="text-slate-500 text-xs mt-1.5">{s.tutor_feedback}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ProjectsSection({ token, courseId }) {
  const briefs = useCohortCapstoneProjects(token, courseId);
  const submissions = useMyClassProjects(token);
  const [attemptingBrief, setAttemptingBrief] = useState(null);

  if (briefs.loading) {
    return <Spinner text="Loading projects…" />;
  }

  return (
    <div>
      <ErrorBanner message={briefs.error || submissions.error} />

      {briefs.items.length === 0 ? (
        <Card>
          <EmptyState title="No projects posted yet" hint="This month's project will show up here once your tutor posts one." />
        </Card>
      ) : (
        <div className="space-y-3">
          {briefs.items.map((cp) => (
            <CapstoneProjectCard
              key={cp.id}
              capstoneProject={cp}
              mySubmissions={submissions.items}
              token={token}
              onOpenAttempt={setAttemptingBrief}
            />
          ))}
        </div>
      )}

      {attemptingBrief && (
        <AttemptProjectModal
          capstoneProject={attemptingBrief}
          token={token}
          onClose={() => setAttemptingBrief(null)}
          onSubmitted={submissions.refresh}
        />
      )}
    </div>
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
        {subTab === 'projects' && <ProjectsSection token={token} courseId={courseId} />}
      </div>
    </div>
  );
}