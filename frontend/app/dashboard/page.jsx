'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, applicationsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.status === 401 || applicationsRes.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          router.push('/login');
          return;
        }

        const profileData = await profileRes.json();
        const applicationsData = await applicationsRes.json();
        setUser(profileData);
        setApplications(applicationsData);
      } catch (err) {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRemoveCourse = async (id) => {
    const token = localStorage.getItem('access');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setApplications((prev) => prev.filter((app) => app.id !== id));
      }
    } catch (err) {
      setError('Failed to remove course');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <p className="text-[#6B7585] text-sm font-mono animate-pulse">
          loading_dashboard...
        </p>
      </main>
    );
  }

  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`;
  const onlineCount = applications.filter((a) => a.mode_of_learning === 'online').length;
  const physicalCount = applications.filter((a) => a.mode_of_learning === 'physical').length;
  const count = applications.length;
  const totalFees = applications.reduce((sum, a) => sum + (Number(a.course_detail?.fee) || 0), 0);

  const RADIUS = 54;
  const STROKE = 16;
  const CIRC = 2 * Math.PI * RADIUS;
  const onlinePct = count > 0 ? onlineCount / count : 0;
  const physicalPct = count > 0 ? physicalCount / count : 0;
  const onlineDash = CIRC * onlinePct;
  const physicalDash = CIRC * physicalPct;

  const slugify = (title) =>
    (title || 'course')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

  const CourseCard = ({ app, featured }) => {
    const isOnline = app.mode_of_learning === 'online';
    const slug = slugify(app.course_detail?.title);

    return (
      <div
        className={
          'bg-[#11151D] border border-[#1C2330] rounded-lg overflow-hidden hover:border-[#2A2F3A] transition group ' +
          (featured ? 'md:col-span-2' : '')
        }
      >
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0E121A] border-b border-[#1C2330]">
          <span className="w-[7px] h-[7px] rounded-full bg-[#FF5F57] inline-block" />
          <span className="w-[7px] h-[7px] rounded-full bg-[#FEBC2E] inline-block" />
          <span className="w-[7px] h-[7px] rounded-full bg-[#28C840] inline-block" />
          <span className="ml-1.5 text-[11px] text-[#6B7585] font-mono truncate">
            {slug}.course
          </span>
          <button
            onClick={() => handleRemoveCourse(app.id)}
            aria-label="Remove course"
            className="ml-auto text-[11px] text-[#5A6275] hover:text-[#F09595] transition shrink-0 opacity-60 group-hover:opacity-100"
          >
            remove()
          </button>
        </div>

        <div className={featured ? 'p-5 md:p-6' : 'p-4'}>
          <div className={featured ? 'flex items-start justify-between gap-6 flex-wrap' : ''}>
            <div className={featured ? 'flex-1 min-w-[220px]' : ''}>
              <h3
                className={
                  'text-[#F1F3F7] font-medium leading-snug mb-2.5 ' +
                  (featured ? 'text-base' : 'text-sm')
                }
              >
                {app.course_detail?.title}
              </h3>

              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className={
                    'text-[11px] px-2.5 py-1 rounded-md font-mono ' +
                    (isOnline ? 'bg-[#14201A] text-[#7CFF6B]' : 'bg-[#261B0E] text-[#FFB454]')
                  }
                >
                  {app.mode_of_learning}
                </span>
                <span className="text-[11px] text-[#6B7585]">
                  {app.course_detail?.duration}
                </span>
              </div>

              {app.location_detail && (
                <p className="text-[11px] text-[#6B7585] mb-2.5">
                  {app.location_detail.name} — {app.location_detail.address}
                </p>
              )}
            </div>

            <div
              className={
                featured
                  ? 'flex flex-col items-end justify-between gap-2 shrink-0'
                  : 'flex items-center justify-between pt-2.5 border-t border-[#1C2330] mt-0'
              }
            >
              <p className={'text-[#5B8CFF] font-medium ' + (featured ? 'text-lg' : 'text-sm')}>
                ₦{Number(app.course_detail?.fee).toLocaleString()}
              </p>
              <p className="text-[#6B7585] text-[11px]">
                {new Date(app.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#0B0E14]">
      <div className="border-b border-[#1C2330] bg-[#0E121A]">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#7CFF6B] inline-block" />
            <span className="text-xs text-[#8B95A7] font-mono tracking-wide">lasop / dashboard</span>
          </div>
          <span className="text-xs text-[#5B8CFF] font-mono hidden sm:inline">~/student/session</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-12 pb-16">
        <div className="flex items-center justify-between bg-[#11151D] border border-[#1C2330] rounded-xl px-6 py-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-md bg-[#14201A] border border-[#2A4034] flex items-center justify-center font-mono text-base font-medium text-[#7CFF6B] shrink-0">
              {initials || '··'}
            </div>
            <div>
              <p className="text-[#F1F3F7] font-medium text-lg leading-tight">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[#6B7585] text-xs font-mono mt-1">
                {user?.email}{user?.phone_number ? ` · ${user.phone_number}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-[#8B95A7] hover:text-[#E6E9EF] border border-[#2A2F3A] hover:border-[#3A4050] px-4 py-2.5 rounded-md transition shrink-0"
          >
            Log out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 mb-8 items-stretch">
          <div className="bg-[#11151D] border border-[#1C2330] rounded-xl p-6 flex items-center gap-6 justify-center lg:justify-start">
            <div className="relative w-[140px] h-[140px] shrink-0">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#1C2330" strokeWidth={STROKE} />
                {count > 0 && (
                  <>
                    <circle
                      cx="70" cy="70" r={RADIUS} fill="none" stroke="#7CFF6B"
                      strokeWidth={STROKE}
                      strokeDasharray={`${onlineDash} ${CIRC - onlineDash}`}
                      strokeLinecap="butt"
                    />
                    <circle
                      cx="70" cy="70" r={RADIUS} fill="none" stroke="#FFB454"
                      strokeWidth={STROKE}
                      strokeDasharray={`${physicalDash} ${CIRC - physicalDash}`}
                      strokeDashoffset={-onlineDash}
                      strokeLinecap="butt"
                    />
                  </>
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[#F1F3F7] text-2xl font-medium">{count}</span>
                <span className="text-[#6B7585] text-[10px] font-mono">enrolled</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[#8B95A7] text-xs font-mono mb-1">learning_mode.split()</p>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#7CFF6B] inline-block shrink-0" />
                <span className="text-[#E6E9EF] text-sm">{onlineCount} online</span>
                <span className="text-[#6B7585] text-xs font-mono">
                  {count > 0 ? Math.round(onlinePct * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FFB454] inline-block shrink-0" />
                <span className="text-[#E6E9EF] text-sm">{physicalCount} physical</span>
                <span className="text-[#6B7585] text-xs font-mono">
                  {count > 0 ? Math.round(physicalPct * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#11151D] border border-[#1C2330] border-l-2 border-l-[#7CFF6B] rounded-r-lg px-4 py-3.5 flex flex-col justify-center">
              <p className="text-[#6B7585] text-[11px] font-mono mb-1.5">enrolled.length</p>
              <p className="text-[#F1F3F7] text-2xl font-medium">{count}</p>
            </div>
            <div className="bg-[#11151D] border border-[#1C2330] border-l-2 border-l-[#5B8CFF] rounded-r-lg px-4 py-3.5 flex flex-col justify-center">
              <p className="text-[#6B7585] text-[11px] font-mono mb-1.5">total_fees.sum()</p>
              <p className="text-[#F1F3F7] text-2xl font-medium">
                ₦{totalFees >= 1000000 ? `${(totalFees / 1000000).toFixed(1)}M` : totalFees.toLocaleString()}
              </p>
            </div>
            <div className="bg-[#11151D] border border-[#1C2330] border-l-2 border-l-[#7CFF6B] rounded-r-lg px-4 py-3.5 flex flex-col justify-center">
              <p className="text-[#6B7585] text-[11px] font-mono mb-1.5">mode === online</p>
              <p className="text-[#F1F3F7] text-2xl font-medium">{onlineCount}</p>
            </div>
            <div className="bg-[#11151D] border border-[#1C2330] border-l-2 border-l-[#FFB454] rounded-r-lg px-4 py-3.5 flex flex-col justify-center">
              <p className="text-[#6B7585] text-[11px] font-mono mb-1.5">mode === physical</p>
              <p className="text-[#F1F3F7] text-2xl font-medium">{physicalCount}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#2A1414] border border-[#501313] text-[#F09595] text-xs rounded-lg px-4 py-3 mb-5 font-mono">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[#F1F3F7] font-medium text-[15px]">My courses</h2>
          <Link href="/apply" className="text-[#7CFF6B] text-xs font-mono hover:text-[#9AFF8C] transition">
            + add_course()
          </Link>
        </div>

        {count === 0 ? (
          <div className="bg-[#11151D] border border-dashed border-[#2A2F3A] rounded-xl p-12 text-center">
            <p className="text-[#6B7585] text-sm font-mono mb-2">applications.length === 0</p>
            <p className="text-[#4A5263] text-xs mb-4">No courses yet — your enrolled courses will show up here.</p>
            <Link
              href="/apply"
              className="inline-block text-[#7CFF6B] text-sm font-mono hover:text-[#9AFF8C] transition border border-[#1F3326] hover:border-[#2A4034] rounded-md px-4 py-2"
            >
              + add_course()
            </Link>
          </div>
        ) : count === 1 ? (
          <CourseCard app={applications[0]} featured />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {applications.map((app, i) => (
              <CourseCard
                key={app.id}
                app={app}
                featured={count % 2 !== 0 && i === count - 1}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}