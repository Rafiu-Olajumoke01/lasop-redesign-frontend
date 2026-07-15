'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Small local helpers (kept self-contained in this file) ───────────────

function getApplicantName(a) {
    const s = a?.student_detail || a?.student || a?.user_detail || a?.user || {};
    const full = `${s.first_name || ''} ${s.last_name || ''}`.trim();
    if (full) return full;
    if (s.email) return s.email;
    if (a?.applicant_name) return a.applicant_name;
    if (a?.email) return a.email;
    return 'Applicant';
}

function getApplicantEmail(a) {
    const s = a?.student_detail || a?.student || a?.user_detail || a?.user || {};
    return s.email || a?.email || null;
}

function getCourseTitle(a) {
    return a?.course_detail?.title || a?.course?.title || a?.course_title || null;
}

function getCourseFee(a) {
    return Number(a?.course_detail?.fee ?? a?.course?.fee ?? a?.fee ?? 0);
}

function formatMoney(n) {
    return `₦${Number(n || 0).toLocaleString()}`;
}

function formatDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(name) {
    return (name || '?').trim().charAt(0).toUpperCase();
}

const inputClass =
    'w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 ' +
    'outline-none rounded-md px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition';

function BackArrow() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    );
}

function CheckCircleIcon({ className }) {
    return (
        <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 12l2.5 2.5 5-5" />
        </svg>
    );
}

function ClockIcon({ className }) {
    return (
        <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" />
        </svg>
    );
}

function Pill({ children, color = 'slate' }) {
    const map = {
        blue: 'bg-blue-50 text-[#0057E7] border-blue-200/80',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
        slate: 'bg-slate-100 text-slate-600 border-slate-200/80',
    };
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-wide leading-none ${map[color] || map.slate}`}>
            {children}
        </span>
    );
}

const paymentStatusMap = {
    pending: { label: 'Pending', color: 'slate' },
    awaiting_confirmation: { label: 'In review', color: 'amber' },
    paid: { label: 'Paid', color: 'emerald' },
    expired: { label: 'Expired', color: 'rose' },
    failed: { label: 'Failed', color: 'rose' },
};

// ─── Payment panel ──────────────────────────────────────────────────────────

function PaymentPanel({ applicationId, payment, token, onConfirmed }) {
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState('');

    const status = payment?.status;
    const canConfirm = status === 'awaiting_confirmation';
    const isPaid = status === 'paid';

    const handleConfirm = async () => {
        setConfirming(true);
        setError('');
        try {
            const res = await fetch(
                `${API_BASE}/api/applications/${applicationId}/payments/admin-confirm/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({}),
                }
            );
            if (!res.ok) throw new Error('Could not confirm payment. Please try again.');
            const updated = await res.json().catch(() => null);
            onConfirmed(updated);
        } catch (e) {
            setError(e.message);
        } finally {
            setConfirming(false);
        }
    };

    const tone = isPaid
        ? { border: 'border-emerald-200', bg: 'bg-emerald-50/50', bar: 'bg-emerald-500' }
        : canConfirm
            ? { border: 'border-amber-200', bg: 'bg-amber-50/50', bar: 'bg-amber-500' }
            : { border: 'border-slate-200', bg: 'bg-white', bar: null };

    return (
        <div className={`relative overflow-hidden rounded-2xl border ${tone.border} ${tone.bg} shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors duration-300`}>
            {tone.bar && <span className={`absolute left-0 top-0 bottom-0 w-1 ${tone.bar}`} />}
            <div className="p-6 sm:p-7">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-1">Payment</p>
                        <h3 className="text-slate-900 font-bold text-lg tracking-tight">
                            {isPaid ? 'Payment confirmed' : canConfirm ? 'Awaiting your confirmation' : payment ? 'Payment pending' : 'No payment record'}
                        </h3>
                    </div>
                    {payment && (
                        <Pill color={paymentStatusMap[status]?.color || 'slate'}>
                            {isPaid && <CheckCircleIcon className="w-3.5 h-3.5" />}
                            {paymentStatusMap[status]?.label || status}
                        </Pill>
                    )}
                </div>

                {error && (
                    <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-[13px] rounded-lg px-3.5 py-2.5 mb-4">
                        <span className="mt-0.5 shrink-0">⚠</span>{error}
                    </div>
                )}

                {payment ? (
                    <div className="space-y-2.5 mb-5">
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-400 text-[13px] font-medium">Method</span>
                            <span className="text-slate-800 text-[13.5px] font-semibold">
                                {payment.method === 'manual' ? 'Bank Transfer' : payment.method === 'paystack' ? 'Paystack' : payment.method || '—'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-400 text-[13px] font-medium">Reference</span>
                            <span className="text-slate-800 text-[13px] font-mono">{payment.tx_ref || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-400 text-[13px] font-medium">Amount</span>
                            <span className="text-slate-800 text-[13.5px] font-bold">{formatMoney(payment.amount)}</span>
                        </div>
                        {payment.confirmed_amount && (
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-400 text-[13px] font-medium">Confirmed amount</span>
                                <span className="text-slate-800 text-[13.5px] font-bold">{formatMoney(payment.confirmed_amount)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between py-2">
                            <span className="text-slate-400 text-[13px] font-medium">Date</span>
                            <span className="text-slate-800 text-[13.5px] font-semibold">{formatDate(payment.paid_at || payment.created_at) || '—'}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm mb-5">This applicant has no payment record yet.</p>
                )}

                {canConfirm && (
                    <>
                        <div className="flex items-start gap-2.5 bg-white border border-amber-200/70 rounded-xl px-4 py-3 mb-4">
                            <ClockIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-slate-600 text-[13px] leading-relaxed">
                                Confirm with finance that this payment was truly received before approving.
                            </p>
                        </div>
                        <button
                            onClick={handleConfirm}
                            disabled={confirming}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-md shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.97]"
                        >
                            {confirming ? 'Confirming…' : 'Confirm payment received'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Info row ───────────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <span className="text-slate-400 text-[13px] font-medium">{label}</span>
            <span className="text-slate-800 text-[13.5px] font-semibold text-right">{value || '—'}</span>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ApplicantDetailPage() {
    const router = useRouter();
    const params = useParams();
    const applicationId = params?.id;

    const [token, setToken] = useState('');
    const [authChecked, setAuthChecked] = useState(false);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const fetchApplication = useCallback(async (t) => {
        setLoading(true); setError('');
        try {
            const res = await fetch(`${API_BASE}/api/applications/${applicationId}/`, {
                headers: { Authorization: `Bearer ${t}` },
            });
            if (!res.ok) throw new Error('Could not load this applicant.');
            const data = await res.json();
            setApplication(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    useEffect(() => {
        if (authChecked && token) fetchApplication(token);
    }, [authChecked, token, fetchApplication]);

    const handleConfirmed = () => {
        fetchApplication(token);
    };

    if (!authChecked || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-[#0057E7] animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">{!authChecked ? 'Verifying access…' : 'Loading applicant…'}</p>
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="text-center max-w-sm">
                    <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-200 mx-auto mb-4 flex items-center justify-center text-xl">⚠</div>
                    <p className="text-slate-700 font-semibold mb-1">Couldn't load this applicant</p>
                    <p className="text-slate-400 text-sm mb-5">{error || 'Something went wrong.'}</p>
                    <button
                        onClick={() => router.push('/backstage')}
                        className="text-sm font-semibold text-[#0057E7] hover:text-[#0A66FF]"
                    >
                        ← Back to Backstage
                    </button>
                </div>
            </div>
        );
    }

    const name = getApplicantName(application);
    const email = getApplicantEmail(application);
    const course = getCourseTitle(application);
    const fee = application.payment
        ? (application.payment.confirmed_amount || application.payment.amount)
        : getCourseFee(application);
    const status = application.payment?.status;
    const cohortName = application.cohort_detail?.name;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/85 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
                        aria-label="Go back"
                    >
                        <BackArrow />
                    </button>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Applicant profile</p>
                        <p className="text-slate-800 font-semibold text-sm truncate">{name}</p>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
                {/* Hero */}
                <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6 sm:p-8 mb-6">
                    <div
                        className="absolute inset-x-0 top-0 h-24"
                        style={{ background: 'linear-gradient(135deg, #0057E7 0%, #0A66FF 45%, #2E8BFF 100%)', opacity: 0.06 }}
                    />
                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #0057E7, #2E8BFF)' }}
                        >
                            {initials(name)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-slate-900 font-bold text-xl sm:text-2xl tracking-tight truncate">{name}</h1>
                            <p className="text-slate-400 text-sm mt-0.5 truncate">{email}</p>
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {course && <Pill color="blue">{course}</Pill>}
                                {application.mode_of_learning && <Pill color="slate">{application.mode_of_learning}</Pill>}
                                {status && (
                                    <Pill color={paymentStatusMap[status]?.color || 'slate'}>
                                        {paymentStatusMap[status]?.label || status}
                                    </Pill>
                                )}
                                {cohortName && <Pill color="indigo">Cohort: {cohortName}</Pill>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two-column body */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6 sm:p-7 h-fit">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">Application details</p>
                        <InfoRow label="Full name" value={name} />
                        <InfoRow label="Email" value={email} />
                        <InfoRow label="Course" value={course} />
                        <InfoRow label="Mode of learning" value={application.mode_of_learning} />
                        <InfoRow label="Course fee" value={formatMoney(fee)} />
                        <InfoRow label="Cohort" value={cohortName} />
                        <InfoRow label="Applied on" value={formatDate(application.created_at)} />
                    </div>

                    <div className="lg:col-span-3">
                        <PaymentPanel
                            applicationId={applicationId}
                            payment={application.payment}
                            token={token}
                            onConfirmed={handleConfirmed}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}