'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Payment Transfer ─────────────────────────────────────────────────────────

function PaymentTransfer({ applicationId, authToken, userEmail, onClose }) {
  const [payment, setPayment] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [paystackLoading, setPaystackLoading] = useState(false);

  const pollRef = useRef(null);
  const timerRef = useRef(null);

  const getAuthHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  }), [authToken]);

  const initiatePayment = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${API_BASE}/api/applications/${applicationId}/payments/initiate/`,
        { method: 'POST', headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error('Could not start payment. Please try again.');
      const data = await res.json();
      setPayment(data);
      setSecondsLeft(data.seconds_remaining);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [applicationId, authToken, getAuthHeaders]);

  useEffect(() => {
    initiatePayment();
    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, [initiatePayment]);

  // Countdown timer
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!payment || payment.status === 'paid' || payment.status === 'expired') return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPayment((p) => (p ? { ...p, status: 'expired' } : p));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [payment]);

  // Poll for payment status every 5 seconds
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!payment || payment.status === 'paid' || payment.status === 'expired') return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/applications/${applicationId}/payments/status/`,
          { headers: getAuthHeaders() }
        );
        if (!res.ok) return;
        const data = await res.json();
        setPayment(data);
        setSecondsLeft(data.seconds_remaining);
      } catch {}
    }, 5000);

    return () => clearInterval(pollRef.current);
  }, [payment, applicationId, authToken, getAuthHeaders]);

  const openPaystackPopup = () => {
    if (!payment?.authorization_url) return;

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: Math.round(parseFloat(payment.amount) * 100), // kobo
      ref: payment.id,
      currency: 'NGN',
      onClose: () => {
        setPaystackLoading(false);
      },
      callback: (response) => {
        // Payment done — flip to awaiting_confirmation and let polling confirm it
        setPaystackLoading(false);
        setPayment((p) => ({ ...p, status: 'awaiting_confirmation' }));
      },
    });

    setPaystackLoading(true);
    handler.openIframe();
  };

  const handleConfirmClicked = async () => {
    setConfirming(true);
    setError('');
    try {
      const res = await fetch(
        `${API_BASE}/api/applications/${applicationId}/payments/confirm-clicked/`,
        { method: 'POST', headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error('Could not confirm. Please refresh and try again.');
      const data = await res.json();
      setPayment((p) => ({ ...p, status: data.status }));
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const urgency = secondsLeft < 300;

  return (
    <div className="mt-3 rounded-xl border border-[#1C2330] bg-[#0D1118] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#0E121A] border-b border-[#1C2330]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5B8CFF] inline-block" />
          <span className="text-[11px] text-[#6B7585] font-mono">payment.initiate()</span>
        </div>
        <button onClick={onClose} className="text-[#5A6275] hover:text-[#E6E9EF] text-xs font-mono transition">
          ✕ close
        </button>
      </div>

      <div className="p-5">
        {loading && (
          <p className="text-[#6B7585] text-sm font-mono animate-pulse">initializing_payment...</p>
        )}

        {error && (
          <div className="bg-[#2A1414] border border-[#501313] rounded-lg px-4 py-3 mb-3">
            <p className="text-[#F09595] text-xs font-mono mb-2">{error}</p>
            <button onClick={initiatePayment} className="text-xs text-[#5B8CFF] font-mono hover:text-[#7FAAFF] transition">
              retry()
            </button>
          </div>
        )}

        {!loading && !error && payment && (
          <>
            {payment.status === 'paid' && (
              <div className="bg-[#14201A] border border-[#2A4034] rounded-lg px-4 py-4 text-center">
                <p className="text-[#7CFF6B] font-mono text-sm mb-1">payment.status === "paid" ✓</p>
                <p className="text-[#8B95A7] text-xs">₦{Number(payment.amount).toLocaleString()} received and confirmed.</p>
              </div>
            )}

            {payment.status === 'expired' && (
              <div className="bg-[#1E1A0E] border border-[#3A2E0A] rounded-lg px-4 py-4">
                <p className="text-[#FFB454] font-mono text-sm mb-1">session.expired()</p>
                <p className="text-[#8B95A7] text-xs mb-3">Your 30-minute window ended. Start a new one to continue.</p>
                <button
                  onClick={initiatePayment}
                  className="text-xs text-[#5B8CFF] font-mono hover:text-[#7FAAFF] transition border border-[#1C2B4A] hover:border-[#2A3F6A] px-3 py-1.5 rounded-md"
                >
                  new_session()
                </button>
              </div>
            )}

            {!['paid', 'expired'].includes(payment.status) && (
              <div className="space-y-4">
                {/* Timer */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#6B7585] font-mono">session.expires_in</span>
                  <span className={`font-mono text-sm px-3 py-1 rounded-md ${urgency ? 'text-[#F09595] bg-[#2A1414] border border-[#501313]' : 'text-[#7CFF6B] bg-[#14201A] border border-[#2A4034]'}`}>
                    {formatTime(secondsLeft)}
                  </span>
                </div>
                <div className="w-full h-[3px] bg-[#1C2330] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${urgency ? 'bg-[#F09595]' : 'bg-[#5B8CFF]'}`}
                    style={{ width: `${(secondsLeft / 1800) * 100}%` }}
                  />
                </div>

                {/* Amount */}
                <div className="bg-[#11151D] border border-[#1C2330] rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-[#6B7585] text-xs font-mono">amount</span>
                  <span className="text-[#5B8CFF] font-medium text-sm">₦{Number(payment.amount).toLocaleString()}</span>
                </div>

                <p className="text-[#4A5263] text-[11px]">
                  Click below to pay securely. A payment popup will open right here on this page.
                </p>

                {/* Paystack inline popup button */}
                {payment.status !== 'awaiting_confirmation' && (
                  <button
                    onClick={openPaystackPopup}
                    disabled={paystackLoading}
                    className="w-full bg-[#5B8CFF] hover:bg-[#7FAAFF] disabled:opacity-40 text-[#0B0E14] text-sm font-semibold py-3 rounded-lg transition"
                  >
                    {paystackLoading ? 'opening payment...' : 'Pay Now'}
                  </button>
                )}

                {/* Verifying state */}
                {payment.status === 'awaiting_confirmation' ? (
                  <div className="flex items-center gap-2.5 bg-[#0E1829] border border-[#1C2B4A] rounded-lg px-4 py-3">
                    <span className="w-2 h-2 rounded-full bg-[#5B8CFF] animate-pulse shrink-0" />
                    <p className="text-[#7FAAFF] text-xs font-mono">verifying... updates automatically when confirmed.</p>
                  </div>
                ) : (
                  <button
                    onClick={handleConfirmClicked}
                    disabled={confirming}
                    className="w-full bg-transparent hover:bg-[#11151D] disabled:opacity-40 text-[#6B7585] hover:text-[#E6E9EF] text-xs font-mono py-2.5 rounded-lg border border-[#1C2330] hover:border-[#2A2F3A] transition"
                  >
                    {confirming ? 'confirming...' : 'I have completed payment'}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ app, featured, token, userEmail, openPayment, setOpenPayment, onRemove }) {
  const isOnline = app.mode_of_learning === 'online';
  const slug = (app.course_detail?.title || 'course')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const isPaymentOpen = openPayment === app.id;

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
        <span className="ml-1.5 text-[11px] text-[#6B7585] font-mono truncate">{slug}.course</span>
        <button
          onClick={() => onRemove(app.id)}
          aria-label="Remove course"
          className="ml-auto text-[11px] text-[#5A6275] hover:text-[#F09595] transition shrink-0 opacity-60 group-hover:opacity-100"
        >
          remove()
        </button>
      </div>

      <div className={featured ? 'p-5 md:p-6' : 'p-4'}>
        <div className={featured ? 'flex items-start justify-between gap-6 flex-wrap' : ''}>
          <div className={featured ? 'flex-1 min-w-[220px]' : ''}>
            <h3 className={'text-[#F1F3F7] font-medium leading-snug mb-2.5 ' + (featured ? 'text-base' : 'text-sm')}>
              {app.course_detail?.title}
            </h3>
            <div className="flex items-center gap-2 mb-2.5">
              <span className={'text-[11px] px-2.5 py-1 rounded-md font-mono ' + (isOnline ? 'bg-[#14201A] text-[#7CFF6B]' : 'bg-[#261B0E] text-[#FFB454]')}>
                {app.mode_of_learning}
              </span>
              <span className="text-[11px] text-[#6B7585]">{app.course_detail?.duration}</span>
            </div>
            {app.location_detail && (
              <p className="text-[11px] text-[#6B7585] mb-2.5">
                {app.location_detail.name} — {app.location_detail.address}
              </p>
            )}
          </div>

          <div className={featured ? 'flex flex-col items-end justify-between gap-2 shrink-0' : 'flex items-center justify-between pt-2.5 border-t border-[#1C2330] mt-0'}>
            <p className={'text-[#5B8CFF] font-medium ' + (featured ? 'text-lg' : 'text-sm')}>
              ₦{Number(app.course_detail?.fee).toLocaleString()}
            </p>
            <p className="text-[#6B7585] text-[11px]">
              {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Pay button */}
        <div className="mt-4 pt-3.5 border-t border-[#1C2330]">
          <button
            onClick={() => setOpenPayment(isPaymentOpen ? null : app.id)}
            className={`text-xs font-mono px-3 py-2 rounded-md border transition ${
              isPaymentOpen
                ? 'text-[#6B7585] border-[#2A2F3A] hover:text-[#F09595] hover:border-[#501313]'
                : 'text-[#5B8CFF] border-[#1C2B4A] hover:border-[#2A3F6A] hover:text-[#7FAAFF]'
            }`}
          >
            {isPaymentOpen ? 'cancel_payment()' : 'pay_now()'}
          </button>
        </div>

        {isPaymentOpen && (
          <PaymentTransfer
            applicationId={app.id}
            authToken={token}
            userEmail={userEmail}
            onClose={() => setOpenPayment(null)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openPayment, setOpenPayment] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('access');
    if (!t) { router.push('/login'); return; }
    setToken(t);

    const fetchData = async () => {
      try {
        const [profileRes, applicationsRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/profile/`, { headers: { Authorization: `Bearer ${t}` } }),
          fetch(`${API_BASE}/api/applications/`, { headers: { Authorization: `Bearer ${t}` } }),
        ]);
        if (profileRes.status === 401 || applicationsRes.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          router.push('/login');
          return;
        }
        setUser(await profileRes.json());
        setApplications(await applicationsRes.json());
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRemoveCourse = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
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
        <p className="text-[#6B7585] text-sm font-mono animate-pulse">loading_dashboard...</p>
      </main>
    );
  }

  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`;
  const onlineCount = applications.filter((a) => a.mode_of_learning === 'online').length;
  const physicalCount = applications.filter((a) => a.mode_of_learning === 'physical').length;
  const count = applications.length;
  const totalFees = applications.reduce((sum, a) => sum + (Number(a.course_detail?.fee) || 0), 0);

  const RADIUS = 54, STROKE = 16, CIRC = 2 * Math.PI * RADIUS;
  const onlinePct = count > 0 ? onlineCount / count : 0;
  const physicalPct = count > 0 ? physicalCount / count : 0;
  const onlineDash = CIRC * onlinePct;
  const physicalDash = CIRC * physicalPct;

  return (
    <>
      {/* Load Paystack inline script once for the whole page */}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

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
          {/* Profile */}
          <div className="flex items-center justify-between bg-[#11151D] border border-[#1C2330] rounded-xl px-6 py-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-md bg-[#14201A] border border-[#2A4034] flex items-center justify-center font-mono text-base font-medium text-[#7CFF6B] shrink-0">
                {initials || '··'}
              </div>
              <div>
                <p className="text-[#F1F3F7] font-medium text-lg leading-tight">{user?.first_name} {user?.last_name}</p>
                <p className="text-[#6B7585] text-xs font-mono mt-1">
                  {user?.email}{user?.phone_number ? ` · ${user.phone_number}` : ''}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-xs text-[#8B95A7] hover:text-[#E6E9EF] border border-[#2A2F3A] hover:border-[#3A4050] px-4 py-2.5 rounded-md transition shrink-0">
              Log out
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 mb-8 items-stretch">
            <div className="bg-[#11151D] border border-[#1C2330] rounded-xl p-6 flex items-center gap-6 justify-center lg:justify-start">
              <div className="relative w-[140px] h-[140px] shrink-0">
                <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                  <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#1C2330" strokeWidth={STROKE} />
                  {count > 0 && (
                    <>
                      <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#7CFF6B" strokeWidth={STROKE}
                        strokeDasharray={`${onlineDash} ${CIRC - onlineDash}`} strokeLinecap="butt" />
                      <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#FFB454" strokeWidth={STROKE}
                        strokeDasharray={`${physicalDash} ${CIRC - physicalDash}`}
                        strokeDashoffset={-onlineDash} strokeLinecap="butt" />
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
                  <span className="text-[#6B7585] text-xs font-mono">{count > 0 ? Math.round(onlinePct * 100) : 0}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#FFB454] inline-block shrink-0" />
                  <span className="text-[#E6E9EF] text-sm">{physicalCount} physical</span>
                  <span className="text-[#6B7585] text-xs font-mono">{count > 0 ? Math.round(physicalPct * 100) : 0}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'enrolled.length', value: count, accent: '#7CFF6B' },
                { label: 'total_fees.sum()', value: `₦${totalFees >= 1000000 ? `${(totalFees / 1000000).toFixed(1)}M` : totalFees.toLocaleString()}`, accent: '#5B8CFF' },
                { label: 'mode === online', value: onlineCount, accent: '#7CFF6B' },
                { label: 'mode === physical', value: physicalCount, accent: '#FFB454' },
              ].map(({ label, value, accent }) => (
                <div key={label} className="bg-[#11151D] border border-[#1C2330] rounded-r-lg px-4 py-3.5 flex flex-col justify-center"
                  style={{ borderLeftColor: accent, borderLeftWidth: 2 }}>
                  <p className="text-[#6B7585] text-[11px] font-mono mb-1.5">{label}</p>
                  <p className="text-[#F1F3F7] text-2xl font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-[#2A1414] border border-[#501313] text-[#F09595] text-xs rounded-lg px-4 py-3 mb-5 font-mono">
              {error}
            </div>
          )}

          {/* Courses */}
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
              <Link href="/apply" className="inline-block text-[#7CFF6B] text-sm font-mono hover:text-[#9AFF8C] transition border border-[#1F3326] hover:border-[#2A4034] rounded-md px-4 py-2">
                + add_course()
              </Link>
            </div>
          ) : count === 1 ? (
            <CourseCard
              app={applications[0]}
              featured
              token={token}
              userEmail={user?.email}
              openPayment={openPayment}
              setOpenPayment={setOpenPayment}
              onRemove={handleRemoveCourse}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {applications.map((app, i) => (
                <CourseCard
                  key={app.id}
                  app={app}
                  featured={count % 2 !== 0 && i === count - 1}
                  token={token}
                  userEmail={user?.email}
                  openPayment={openPayment}
                  setOpenPayment={setOpenPayment}
                  onRemove={handleRemoveCourse}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}