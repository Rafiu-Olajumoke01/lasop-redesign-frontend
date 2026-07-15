'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Bank Account Details ──────────────────────────────────────────────────
const BANK_DETAILS = {
  accountName: 'Lagos School of Programming Ltd',
  bankName: 'Zenith Bank',
  accountNumber: '1223017613',
};

// ─── Shared UI (matches /backstage) ────────────────────────────────────────

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

function ModePill({ mode }) {
  if (!mode) return null;
  return <Pill color={mode === 'online' ? 'blue' : 'slate'}>{mode}</Pill>;
}

function PaymentStatusBadge({ status, amountPaid }) {
  if (!status || status === 'not_started') return null;
  if (status === 'in_review') return <Pill color="amber">Payment in review</Pill>;
  if (status === 'paid') return <Pill color="emerald">{`Paid · ₦${Number(amountPaid).toLocaleString()}`}</Pill>;
  return null;
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

function OverviewStatCard({ label, value, accent = '#0057E7' }) {
  return (
    <div className="bg-white px-4 sm:px-5 py-4 sm:py-5">
      <p className="text-slate-500 text-[11px] sm:text-xs mb-2 font-medium">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: accent }}>{value}</p>
    </div>
  );
}

// ─── Step Indicator ─────────────────────────────────────────────────────────

function StepDots({ step }) {
  const steps = ['choose', 'amount', 'bank_details'];
  const activeIndex = steps.indexOf(step);
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <span
          key={s}
          className={`h-1 rounded-full transition-all duration-300 ${
            i === activeIndex ? 'w-5 bg-[#0057E7]' : i < activeIndex ? 'w-1 bg-[#0057E7]/40' : 'w-1 bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Payment Transfer Modal (Manual Bank Transfer Flow) ────────────────────

function PaymentTransfer({ applicationId, authToken, totalFee, onClose, onSubmitted }) {
  const [step, setStep] = useState('choose');
  const [paymentType, setPaymentType] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const getAuthHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  }), [authToken]);

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const formatAmountInput = (raw) => {
    const digitsOnly = raw.replace(/[^\d]/g, '');
    if (!digitsOnly) return '';
    return Number(digitsOnly).toLocaleString();
  };

  const handleAmountChange = (e) => setAmount(formatAmountInput(e.target.value));
  const rawAmount = () => Number(amount.replace(/,/g, '')) || 0;

  const handleChoosePaymentType = (type) => {
    setPaymentType(type);
    setError('');
    if (type === 'full') {
      setAmount(totalFee ? totalFee.toLocaleString() : '');
      setStep('bank_details');
    } else {
      setStep('amount');
    }
  };

  const handleSubmitAmount = () => {
    if (rawAmount() <= 0) {
      setError('Please enter an amount greater than ₦0');
      return;
    }
    setError('');
    setStep('bank_details');
  };

  const handleConfirmClicked = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/applications/${applicationId}/payments/manual/confirm-clicked/`,
        { method: 'POST', headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error('Could not confirm. Please refresh and try again.');
      onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${API_BASE}/api/applications/${applicationId}/payments/manual/initiate/`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ payment_type: paymentType, amount: rawAmount() }),
        }
      );
      if (!res.ok) throw new Error('Could not save payment details. Please try again.');
      await handleConfirmClicked();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCopy = (field, value) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Modal card */}
      <div className="relative w-full max-w-[420px] bg-white border border-slate-200 rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-slate-200/80">
          <div>
            <p className="text-slate-900 text-[15px] font-bold tracking-tight">Bank Transfer</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Secure · manual review</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0 text-sm"
          >
            ✕
          </button>
        </div>

        {step !== 'choose' && (
          <div className="px-5 sm:px-6 pt-4">
            <StepDots step={step} />
          </div>
        )}

        <div className="px-5 sm:px-6 pt-4 pb-6">
          <ErrorBanner message={error} />

          {/* Step 1: Choose payment type */}
          {step === 'choose' && (
            <div className="space-y-2.5">
              <button
                onClick={() => handleChoosePaymentType('full')}
                className="w-full text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-lg p-4 transition flex items-center justify-between"
              >
                <div>
                  <p className="text-slate-900 text-sm font-semibold mb-1">Pay in Full</p>
                  <p className="text-slate-400 text-xs">
                    {totalFee ? `₦${totalFee.toLocaleString()}` : 'Complete course fee'}
                  </p>
                </div>
                <span className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </button>
              <button
                onClick={() => handleChoosePaymentType('part')}
                className="w-full text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-lg p-4 transition flex items-center justify-between"
              >
                <div>
                  <p className="text-slate-900 text-sm font-semibold mb-1">Part Payment</p>
                  <p className="text-slate-400 text-xs">Pay an amount of your choice</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0057E7] shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </button>
            </div>
          )}

          {/* Step 2: Enter amount */}
          {step === 'amount' && (
            <div className="space-y-5">
              <div>
                <p className="text-slate-500 text-[13px] mb-3">
                  Type how much you want to pay
                </p>
                <div className="flex items-center bg-white border border-slate-300 focus-within:border-[#0057E7] focus-within:ring-2 focus-within:ring-[#0057E7]/15 rounded-lg px-4 py-4 transition">
                  <span className="text-[#0057E7] font-semibold text-xl mr-2 shrink-0">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    autoFocus
                    className="bg-transparent outline-none text-slate-900 text-xl font-semibold w-full placeholder:text-slate-300"
                  />
                </div>
                {totalFee > 0 && (
                  <p className="text-slate-400 text-[11px] mt-2">Total course fee: ₦{totalFee.toLocaleString()}</p>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <SecondaryButton onClick={() => { setStep('choose'); setError(''); }}>
                  Back
                </SecondaryButton>
                <PrimaryButton className="flex-1 justify-center" onClick={handleSubmitAmount}>
                  Continue
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* Step 3: Bank details */}
          {step === 'bank_details' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                {[
                  { label: 'Account Name', value: BANK_DETAILS.accountName, field: 'name' },
                  { label: 'Bank', value: BANK_DETAILS.bankName, field: 'bank' },
                  { label: 'Account Number', value: BANK_DETAILS.accountNumber, field: 'number' },
                ].map(({ label, value, field }, i) => (
                  <div
                    key={field}
                    className={`flex items-center justify-between px-4 py-3.5 ${i !== 0 ? 'border-t border-slate-200' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wide mb-1 font-bold">{label}</p>
                      <p className="text-slate-900 text-[15px] font-semibold truncate">{value}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(field, value)}
                      className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition shrink-0 ml-3 ${
                        copiedField === field
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-[#0057E7] hover:bg-blue-100'
                      }`}
                    >
                      {copiedField === field ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200/80 rounded-lg px-4 py-3.5 flex items-center justify-between">
                <span className="text-[#0057E7] text-xs font-medium">Amount to pay</span>
                <span className="text-slate-900 font-bold text-base">₦{amount || '0'}</span>
              </div>

              <p className="text-slate-500 text-[12px] leading-relaxed">
                Transfer this amount using your bank app, then confirm below. Your payment status will show as <span className="text-amber-600 font-medium">in review</span> until our team verifies it.
              </p>

              <button
                onClick={handleInitiatePayment}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold py-3.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                {loading ? (
                  'Submitting...'
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 8L6 11.5L12.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    I have made payment
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Certificate Card ──────────────────────────────────────────────────────

function DocumentIcon({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  );
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CertificateCard({ certificate }) {
  const isReady = !!certificate;

  return (
    <Card interactive className="mb-9 p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
          isReady ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-300'
        }`}>
          <DocumentIcon className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-slate-900 font-semibold text-sm tracking-tight">
            {isReady ? 'Your certificate is ready' : 'Certificate not ready yet'}
          </p>
          <p className="text-slate-400 text-[11px] mt-0.5">
            {isReady
              ? certificate.issued_date
                ? `Issued ${formatDate(certificate.issued_date)}`
                : `Uploaded ${formatDate(certificate.uploaded_at)}`
              : "We'll notify you once it's uploaded."}
          </p>
        </div>
      </div>

      {isReady ? (
        <a
          href={certificate.file}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold px-4 py-2.5 rounded-md bg-[#0057E7] hover:bg-[#0A66FF] text-white transition shrink-0 shadow-sm hover:shadow-md active:scale-[0.97]"
        >
          Download certificate
        </a>
      ) : (
        <span className="text-sm font-medium px-4 py-2.5 rounded-md border border-slate-200 text-slate-400 cursor-not-allowed shrink-0">
          Not ready
        </span>
      )}
    </Card>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ app, featured, token, openPayment, setOpenPayment, onRemove, onPaymentUpdate }) {
  const isOnline = app.mode_of_learning === 'online';
  const isPaymentOpen = openPayment === app.id;
  const paymentStatus = app.payment_status || 'not_started';
  const isPaid = paymentStatus === 'paid';

  return (
    <Card interactive className={featured ? 'md:col-span-2 p-5 md:p-6' : 'p-4'}>
      <div className={featured ? 'flex items-start justify-between gap-6 flex-wrap' : ''}>
        <div className={featured ? 'flex-1 min-w-[220px]' : ''}>
          <div className="flex items-start justify-between gap-3">
            <h3 className={'text-slate-900 font-bold leading-snug mb-2.5 tracking-tight ' + (featured ? 'text-base' : 'text-sm')}>
              {app.course_detail?.title}
            </h3>
            {!featured && (
              <button
                onClick={() => onRemove(app.id)}
                aria-label="Remove course"
                className="text-[11px] text-slate-300 hover:text-rose-500 transition shrink-0"
              >
                Remove
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <ModePill mode={app.mode_of_learning} />
            <span className="text-[11px] text-slate-400">{app.course_detail?.duration}</span>
            <PaymentStatusBadge status={paymentStatus} amountPaid={app.amount_paid} />
          </div>
          {app.location_detail && (
            <p className="text-[11px] text-slate-400 mb-2.5">
              {app.location_detail.name} — {app.location_detail.address}
            </p>
          )}
        </div>

        <div className={featured ? 'flex flex-col items-end justify-between gap-2 shrink-0' : 'flex items-center justify-between pt-2.5 border-t border-slate-100 mt-3 w-full'}>
          <p className={'text-[#0057E7] font-bold ' + (featured ? 'text-lg' : 'text-sm')}>
            ₦{Number(app.course_detail?.fee).toLocaleString()}
          </p>
          <p className="text-slate-400 text-[11px]">
            {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {featured && (
        <button
          onClick={() => onRemove(app.id)}
          className="text-[11px] text-slate-300 hover:text-rose-500 transition mt-3"
        >
          Remove course
        </button>
      )}

      {/* Pay button */}
      {!isPaid && (
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          {isPaymentOpen ? (
            <SecondaryButton onClick={() => setOpenPayment(null)} className="text-slate-500">
              Cancel
            </SecondaryButton>
          ) : (
            <PrimaryButton onClick={() => setOpenPayment(app.id)}>
              Pay Now
            </PrimaryButton>
          )}
        </div>
      )}

      {isPaymentOpen && (
        <PaymentTransfer
          applicationId={app.id}
          authToken={token}
          totalFee={Number(app.course_detail?.fee) || 0}
          onClose={() => setOpenPayment(null)}
          onSubmitted={() => {
            onPaymentUpdate(app.id, 'in_review');
            setOpenPayment(null);
          }}
        />
      )}
    </Card>
  );
}

// ─── Top bar ────────────────────────────────────────────────────────────────

function TopBar({ onLogout }) {
  return (
    <div className="border-b border-slate-200 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-5 md:px-8 py-4 flex items-center justify-between">
        <span className="text-slate-900 font-bold text-[15px] tracking-tight">LASOP</span>
        <button
          onClick={onLogout}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 bg-white px-3.5 py-2 rounded-md transition"
        >
          Log out
        </button>
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

  const handlePaymentUpdate = (applicationId, newStatus, amountPaid) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? { ...a, payment_status: newStatus, ...(amountPaid !== undefined ? { amount_paid: amountPaid } : {}) }
          : a
      )
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner text="Loading dashboard…" />
      </main>
    );
  }

  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`;
  const onlineCount = applications.filter((a) => a.mode_of_learning === 'online').length;
  const physicalCount = applications.filter((a) => a.mode_of_learning === 'physical').length;
  const count = applications.length;
  const totalFees = applications.reduce((sum, a) => sum + (Number(a.course_detail?.fee) || 0), 0);
  const paidCount = applications.filter((a) => a.payment_status === 'paid').length;
  const reviewCount = applications.filter((a) => a.payment_status === 'in_review').length;

  const formattedFees = totalFees >= 1000000
    ? `₦${(totalFees / 1000000).toFixed(1)}M`
    : `₦${totalFees.toLocaleString()}`;

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <TopBar onLogout={handleLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-5 md:px-8 pt-8 sm:pt-10 pb-16">

        {/* ── Profile ── */}
        <div className="flex items-center gap-4 mb-8 sm:mb-9">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0057E7] flex items-center justify-center text-lg sm:text-xl font-bold text-white shrink-0">
            {initials || '··'}
          </div>
          <div className="min-w-0">
            <h1 className="text-slate-900 font-bold text-xl sm:text-2xl leading-tight tracking-tight truncate">
              {firstName} {lastName}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 truncate">
              {user?.email}{user?.phone_number ? ` · ${user.phone_number}` : ''}
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <Card className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200/80 mb-8 sm:mb-9 overflow-hidden">
          <OverviewStatCard label="Courses enrolled" value={count} accent="#0057E7" />
          <OverviewStatCard label="Total fees" value={formattedFees} accent="#0057E7" />
          <OverviewStatCard label="Online" value={onlineCount} accent="#059669" />
          <OverviewStatCard label="Physical" value={physicalCount} accent="#D97706" />
        </Card>

        {(reviewCount > 0 || paidCount > 0) && (
          <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-9 flex-wrap">
            {reviewCount > 0 && (
              <Pill color="amber">{reviewCount} payment{reviewCount > 1 ? 's' : ''} in review</Pill>
            )}
            {paidCount > 0 && (
              <Pill color="emerald">{paidCount} paid</Pill>
            )}
          </div>
        )}

        <ErrorBanner message={error} />

        {/* ── Certificate ── */}
        <CertificateCard certificate={user?.certificate} />

        {/* ── Courses ── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-slate-900 font-bold text-lg tracking-tight">
            Courses{count > 0 ? ` (${count})` : ''}
          </h2>
          <Link href="/apply" className="text-[#0057E7] text-sm hover:text-[#0A66FF] transition font-semibold">
            + Add course
          </Link>
        </div>

        {count === 0 ? (
          <Card className="border-dashed">
            <EmptyState title="No courses yet" hint="Your enrolled courses will show up here." />
            <div className="text-center pb-8 -mt-4">
              <Link href="/apply" className="inline-block text-[#0057E7] text-sm hover:text-[#0A66FF] transition border border-blue-200 hover:border-blue-300 bg-blue-50 rounded-md px-4 py-2 font-semibold">
                + Add course
              </Link>
            </div>
          </Card>
        ) : count === 1 ? (
          <CourseCard
            app={applications[0]}
            featured
            token={token}
            openPayment={openPayment}
            setOpenPayment={setOpenPayment}
            onRemove={handleRemoveCourse}
            onPaymentUpdate={handlePaymentUpdate}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {applications.map((app, i) => (
              <CourseCard
                key={app.id}
                app={app}
                featured={count % 2 !== 0 && i === count - 1}
                token={token}
                openPayment={openPayment}
                setOpenPayment={setOpenPayment}
                onRemove={handleRemoveCourse}
                onPaymentUpdate={handlePaymentUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}