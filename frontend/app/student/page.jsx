'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Bank Account Details ──────────────────────────────────────────────────
const BANK_DETAILS = {
  accountName: 'Lagos School of Programming Ltd',
  bankName: 'Zenith Bank',
  accountNumber: '1223017613',
};

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
            i === activeIndex ? 'w-5 bg-[#5B8CFF]' : i < activeIndex ? 'w-1 bg-[#3A4A6E]' : 'w-1 bg-[#1C2330]'
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
      <div className="absolute inset-0 bg-[#05070B]/80 backdrop-blur-sm" />

      {/* Modal card */}
      <div className="relative w-full max-w-[420px] bg-[#0D1118] border border-[#232B3A] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Accent top bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#5B8CFF] via-[#7CFF6B] to-[#5B8CFF]" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4">
          <div>
            <p className="text-[#F1F3F7] text-[15px] font-semibold">Bank Transfer</p>
            <p className="text-[#5A6275] text-[11px] font-mono mt-0.5">secure · manual review</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#6B7585] hover:text-[#E6E9EF] hover:bg-[#1A2030] transition shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {step !== 'choose' && (
          <div className="px-5 sm:px-6 pb-4">
            <StepDots step={step} />
          </div>
        )}

        <div className="px-5 sm:px-6 pb-6">
          {error && (
            <div className="bg-[#2A1414] border border-[#501313] rounded-lg px-4 py-3 mb-4">
              <p className="text-[#F09595] text-xs">{error}</p>
            </div>
          )}

          {/* Step 1: Choose payment type */}
          {step === 'choose' && (
            <div className="space-y-2.5">
              <button
                onClick={() => handleChoosePaymentType('full')}
                className="w-full text-left bg-[#11151D] hover:bg-[#141925] border border-[#1C2330] hover:border-[#2A4034] rounded-xl p-4 transition flex items-center justify-between"
              >
                <div>
                  <p className="text-[#F1F3F7] text-sm font-semibold mb-1">Pay in Full</p>
                  <p className="text-[#6B7585] text-xs">
                    {totalFee ? `₦${totalFee.toLocaleString()}` : 'Complete course fee'}
                  </p>
                </div>
                <span className="w-8 h-8 rounded-full bg-[#14201A] border border-[#2A4034] flex items-center justify-center text-[#7CFF6B] shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </button>
              <button
                onClick={() => handleChoosePaymentType('part')}
                className="w-full text-left bg-[#11151D] hover:bg-[#141925] border border-[#1C2330] hover:border-[#2A3F6A] rounded-xl p-4 transition flex items-center justify-between"
              >
                <div>
                  <p className="text-[#F1F3F7] text-sm font-semibold mb-1">Part Payment</p>
                  <p className="text-[#6B7585] text-xs">Pay an amount of your choice</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-[#0E1829] border border-[#1C2B4A] flex items-center justify-center text-[#5B8CFF] shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </button>
            </div>
          )}

          {/* Step 2: Enter amount */}
          {step === 'amount' && (
            <div className="space-y-5">
              <div>
                <p className="text-[#8B95A7] text-[13px] mb-3">
                  Type how much you want to pay
                </p>
                <div className="flex items-center bg-[#11151D] border border-[#232B3A] focus-within:border-[#5B8CFF] rounded-xl px-4 py-4 transition">
                  <span className="text-[#5B8CFF] font-semibold text-xl mr-2 shrink-0">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    autoFocus
                    className="bg-transparent outline-none text-[#F1F3F7] text-xl font-semibold w-full placeholder:text-[#2A3142]"
                  />
                </div>
                {totalFee > 0 && (
                  <p className="text-[#4A5263] text-[11px] mt-2">Total course fee: ₦{totalFee.toLocaleString()}</p>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => { setStep('choose'); setError(''); }}
                  className="px-4 py-3 rounded-xl border border-[#232B3A] text-[#8B95A7] hover:text-[#E6E9EF] hover:border-[#2A2F3A] transition text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitAmount}
                  className="flex-1 bg-[#5B8CFF] hover:bg-[#7FAAFF] text-[#0B0E14] text-sm font-semibold py-3 rounded-xl transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Bank details */}
          {step === 'bank_details' && (
            <div className="space-y-4">
              <div className="bg-[#11151D] border border-[#232B3A] rounded-xl overflow-hidden">
                {[
                  { label: 'Account Name', value: BANK_DETAILS.accountName, field: 'name' },
                  { label: 'Bank', value: BANK_DETAILS.bankName, field: 'bank' },
                  { label: 'Account Number', value: BANK_DETAILS.accountNumber, field: 'number' },
                ].map(({ label, value, field }, i) => (
                  <div
                    key={field}
                    className={`flex items-center justify-between px-4 py-3.5 ${i !== 0 ? 'border-t border-[#1C2330]' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="text-[#5A6275] text-[10px] uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-[#F1F3F7] text-[15px] font-semibold truncate">{value}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(field, value)}
                      className={`text-[11px] font-medium px-2.5 py-1.5 rounded-md transition shrink-0 ml-3 ${
                        copiedField === field
                          ? 'bg-[#14201A] text-[#7CFF6B]'
                          : 'bg-[#1A2030] text-[#5B8CFF] hover:bg-[#202840]'
                      }`}
                    >
                      {copiedField === field ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-[#0E1829] to-[#0E1424] border border-[#1C2B4A] rounded-xl px-4 py-3.5 flex items-center justify-between">
                <span className="text-[#7FAAFF] text-xs">Amount to pay</span>
                <span className="text-[#F1F3F7] font-bold text-base">₦{amount || '0'}</span>
              </div>

              <p className="text-[#5A6275] text-[12px] leading-relaxed">
                Transfer this amount using your bank app, then confirm below. Your payment status will show as <span className="text-[#FFB454]">in review</span> until our team verifies it.
              </p>

              <button
                onClick={handleInitiatePayment}
                disabled={loading}
                className="w-full bg-[#7CFF6B] hover:bg-[#9AFF8C] disabled:opacity-50 text-[#0B0E14] text-sm font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
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
// ─── Payment Status Badge ───────────────────────────────────────────────────

function PaymentStatusBadge({ status, amountPaid }) {
  if (!status || status === 'not_started') return null;

  if (status === 'in_review') {
    return (
      <span className="text-[11px] px-2.5 py-1 rounded-md font-mono bg-[#1E1A0E] text-[#FFB454] border border-[#3A2E0A]">
        Payment in review
      </span>
    );
  }

  if (status === 'paid') {
    return (
      <span className="text-[11px] px-2.5 py-1 rounded-md font-mono bg-[#14201A] text-[#7CFF6B] border border-[#2A4034]">
        Paid · ₦{Number(amountPaid).toLocaleString()}
      </span>
    );
  }

  return null;
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
    <div className="bg-[#11151D] border border-[#1C2330] rounded-lg overflow-hidden hover:border-[#2A2F3A] transition mb-9">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0E121A] border-b border-[#1C2330]">
        <span className="w-[7px] h-[7px] rounded-full bg-[#FF5F57] inline-block" />
        <span className="w-[7px] h-[7px] rounded-full bg-[#FEBC2E] inline-block" />
        <span className="w-[7px] h-[7px] rounded-full bg-[#28C840] inline-block" />
        <span className="ml-1.5 text-[11px] text-[#6B7585] font-mono truncate">certificate.status</span>
      </div>

      <div className="p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
            isReady ? 'bg-[#14201A] border-[#2A4034] text-[#7CFF6B]' : 'bg-[#1C2330] border-[#232B3A] text-[#6B7585]'
          }`}>
            <DocumentIcon className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[#F1F3F7] font-medium text-sm">
              {isReady ? 'Your certificate is ready' : 'Certificate not ready yet'}
            </p>
            <p className="text-[#6B7585] text-[11px] mt-0.5">
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
            className="text-sm font-semibold px-4 py-2.5 rounded-lg bg-[#5B8CFF] hover:bg-[#7FAAFF] text-[#0B0E14] transition shrink-0"
          >
            Download certificate
          </a>
        ) : (
          <span className="text-sm font-medium px-4 py-2.5 rounded-lg border border-[#232B3A] text-[#5A6275] cursor-not-allowed shrink-0">
            Not ready
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ app, featured, token, openPayment, setOpenPayment, onRemove, onPaymentUpdate }) {
  const isOnline = app.mode_of_learning === 'online';
  const slug = (app.course_detail?.title || 'course')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const isPaymentOpen = openPayment === app.id;
  const paymentStatus = app.payment_status || 'not_started';
  const isPaid = paymentStatus === 'paid';

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
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <span className={'text-[11px] px-2.5 py-1 rounded-md font-mono ' + (isOnline ? 'bg-[#14201A] text-[#7CFF6B]' : 'bg-[#261B0E] text-[#FFB454]')}>
                {app.mode_of_learning}
              </span>
              <span className="text-[11px] text-[#6B7585]">{app.course_detail?.duration}</span>
              <PaymentStatusBadge status={paymentStatus} amountPaid={app.amount_paid} />
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
        {!isPaid && (
          <div className="mt-4 pt-3.5 border-t border-[#1C2330]">
            <button
              onClick={() => setOpenPayment(isPaymentOpen ? null : app.id)}
              className={`text-sm font-semibold px-4 py-2.5 rounded-lg transition ${
                isPaymentOpen
                  ? 'bg-transparent border border-[#2A2F3A] text-[#6B7585] hover:text-[#F09595] hover:border-[#501313]'
                  : 'bg-[#5B8CFF] hover:bg-[#7FAAFF] text-[#0B0E14]'
              }`}
            >
              {isPaymentOpen ? 'Cancel' : 'Pay Now'}
            </button>
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
      <main className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <p className="text-[#6B7585] text-sm">Loading dashboard...</p>
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
    <main className="min-h-screen bg-[#0A0C10] pt-20">
      {/* Top bar */}
      <div className="border-b border-[#1C2330] bg-[#0A0C10]">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 md:px-8 py-4 flex items-center justify-between">
          <span className="text-[#F1F3F7] font-semibold text-[15px]">LASOP</span>
          <button
            onClick={handleLogout}
            className="text-xs text-[#8B95A7] hover:text-[#E6E9EF] border border-[#2A2F3A] hover:border-[#3A4050] px-3.5 py-2 rounded-md transition"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-5 md:px-8 pt-8 sm:pt-10 pb-16">

        {/* ── Profile ── */}
        <div className="flex items-center gap-4 mb-8 sm:mb-9">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#14201A] border border-[#2A4034] flex items-center justify-center text-lg sm:text-xl font-semibold text-[#7CFF6B] shrink-0">
            {initials || '··'}
          </div>
          <div className="min-w-0">
            <h1 className="text-[#F1F3F7] font-semibold text-xl sm:text-2xl leading-tight truncate">
              {firstName} {lastName}
            </h1>
            <p className="text-[#6B7585] text-xs sm:text-sm mt-1 truncate">
              {user?.email}{user?.phone_number ? ` · ${user.phone_number}` : ''}
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1C2330] border border-[#1C2330] rounded-xl overflow-hidden mb-8 sm:mb-9">
          {[
            { label: 'Courses enrolled', value: count, accent: '#7CFF6B' },
            { label: 'Total fees', value: formattedFees, accent: '#5B8CFF' },
            { label: 'Online', value: onlineCount, accent: '#7CFF6B' },
            { label: 'Physical', value: physicalCount, accent: '#FFB454' },
          ].map(({ label, value, accent }) => (
            <div key={label} className="bg-[#0D1118] px-4 sm:px-5 py-4 sm:py-5">
              <p className="text-[#5A6275] text-[11px] sm:text-xs mb-2">{label}</p>
              <p className="text-2xl sm:text-3xl font-semibold" style={{ color: accent }}>{value}</p>
            </div>
          ))}
        </div>

        {(reviewCount > 0 || paidCount > 0) && (
          <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-9 -mt-4 flex-wrap">
            {reviewCount > 0 && (
              <span className="text-xs text-[#FFB454] bg-[#1E1A0E] border border-[#3A2E0A] rounded-full px-3 py-1.5">
                {reviewCount} payment{reviewCount > 1 ? 's' : ''} in review
              </span>
            )}
            {paidCount > 0 && (
              <span className="text-xs text-[#7CFF6B] bg-[#14201A] border border-[#2A4034] rounded-full px-3 py-1.5">
                {paidCount} paid
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="bg-[#2A1414] border border-[#501313] text-[#F09595] text-xs rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {/* ── Certificate ── */}
        <CertificateCard certificate={user?.certificate} />

        {/* ── Courses ── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-[#F1F3F7] font-semibold text-lg">
            Courses{count > 0 ? ` (${count})` : ''}
          </h2>
          <Link href="/apply" className="text-[#7CFF6B] text-sm hover:text-[#9AFF8C] transition font-medium">
            + Add course
          </Link>
        </div>

        {count === 0 ? (
          <div className="bg-[#0D1118] border border-dashed border-[#232B3A] rounded-xl p-8 sm:p-12 text-center">
            <p className="text-[#8B95A7] text-sm mb-1">No courses yet</p>
            <p className="text-[#4A5263] text-xs mb-4">Your enrolled courses will show up here.</p>
            <Link href="/apply" className="inline-block text-[#7CFF6B] text-sm hover:text-[#9AFF8C] transition border border-[#1F3326] hover:border-[#2A4034] rounded-md px-4 py-2 font-medium">
              + Add course
            </Link>
          </div>
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