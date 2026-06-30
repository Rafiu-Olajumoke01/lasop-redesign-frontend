'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const BANK_DETAILS = {
  accountName: 'Lagos School of Programming Ltd',
  bankName: 'Zenith Bank',
  accountNumber: '1223017613',
};


function PaymentTransfer({ applicationId, authToken, totalFee, onClose, onSubmitted }) {
  // step: 'choose' -> 'amount' (part only) -> 'bank_details'
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


  const formatAmountInput = (raw) => {
    const digitsOnly = raw.replace(/[^\d]/g, '');
    if (!digitsOnly) return '';
    return Number(digitsOnly).toLocaleString();
  };

  const handleAmountChange = (e) => {
    setAmount(formatAmountInput(e.target.value));
  };

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

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${API_BASE}/api/applications/${applicationId}/payments/manual/initiate/`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            payment_type: paymentType,
            amount: rawAmount(),
          }),
        }
      );
      if (!res.ok) throw new Error('Could not save payment details. Please try again.');
      await handleConfirmClicked();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
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

  const handleCopy = (field, value) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 1500);
  };

  return (
    <div className="mt-3 rounded-xl border border-[#1C2330] bg-[#0D1118] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#0E121A] border-b border-[#1C2330]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5B8CFF] inline-block" />
          <span className="text-[11px] text-[#6B7585] font-mono">payment.bank_transfer()</span>
        </div>
        <button onClick={onClose} className="text-[#5A6275] hover:text-[#E6E9EF] text-xs font-mono transition">
          ✕ close
        </button>
      </div>

      <div className="p-5">
        {error && (
          <div className="bg-[#2A1414] border border-[#501313] rounded-lg px-4 py-3 mb-4">
            <p className="text-[#F09595] text-xs font-mono">{error}</p>
          </div>
        )}

        {/* Step 1: Choose payment type */}
        {step === 'choose' && (
          <div className="space-y-3">
            <p className="text-[#8B95A7] text-xs font-mono mb-3">choose_payment_option</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleChoosePaymentType('full')}
                className="text-left bg-[#11151D] border border-[#1C2330] hover:border-[#2A4034] rounded-lg p-4 transition group"
              >
                <p className="text-[#7CFF6B] text-sm font-medium mb-1">Pay in Full</p>
                <p className="text-[#6B7585] text-xs">
                  {totalFee ? `₦${totalFee.toLocaleString()}` : 'Pay the complete course fee'}
                </p>
              </button>
              <button
                onClick={() => handleChoosePaymentType('part')}
                className="text-left bg-[#11151D] border border-[#1C2330] hover:border-[#2A3F6A] rounded-lg p-4 transition group"
              >
                <p className="text-[#5B8CFF] text-sm font-medium mb-1">Part Payment</p>
                <p className="text-[#6B7585] text-xs">Pay an amount of your choice</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Enter amount (part payment only) */}
        {step === 'amount' && (
          <div className="space-y-4">
            <div>
              <p className="text-[#8B95A7] text-xs font-mono mb-2.5">
                Type how much you want to pay in the box below
              </p>
              <div className="flex items-center bg-[#11151D] border border-[#1C2330] focus-within:border-[#2A3F6A] rounded-lg px-4 py-3 transition">
                <span className="text-[#5B8CFF] font-medium text-base mr-1.5 shrink-0">₦</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  autoFocus
                  className="bg-transparent outline-none text-[#F1F3F7] text-base font-medium w-full placeholder:text-[#3A4050]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => { setStep('choose'); setError(''); }}
                className="text-xs font-mono px-3 py-2.5 rounded-md border border-[#1C2330] text-[#6B7585] hover:text-[#E6E9EF] hover:border-[#2A2F3A] transition"
              >
                back
              </button>
              <button
                onClick={handleSubmitAmount}
                className="flex-1 bg-[#5B8CFF] hover:bg-[#7FAAFF] text-[#0B0E14] text-sm font-semibold py-2.5 rounded-lg transition"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Bank details */}
        {step === 'bank_details' && (
          <div className="space-y-4">
            <div>
              <p className="text-[#8B95A7] text-xs font-mono mb-2.5">transfer_to</p>
              <div className="bg-[#11151D] border border-[#1C2330] rounded-lg divide-y divide-[#1C2330]">
                {[
                  { label: 'Account Name', value: BANK_DETAILS.accountName, field: 'name' },
                  { label: 'Bank', value: BANK_DETAILS.bankName, field: 'bank' },
                  { label: 'Account Number', value: BANK_DETAILS.accountNumber, field: 'number' },
                ].map(({ label, value, field }) => (
                  <div key={field} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-[#6B7585] text-[11px] font-mono mb-0.5">{label}</p>
                      <p className="text-[#F1F3F7] text-sm font-medium">{value}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(field, value)}
                      className="text-[11px] font-mono text-[#5B8CFF] hover:text-[#7FAAFF] transition shrink-0 ml-3"
                    >
                      {copiedField === field ? 'copied ✓' : 'copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#11151D] border border-[#1C2330] rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-[#6B7585] text-xs font-mono">amount to pay</span>
              <span className="text-[#5B8CFF] font-medium text-sm">₦{amount || '0'}</span>
            </div>

            <p className="text-[#4A5263] text-[11px] leading-relaxed">
              Make the transfer using your bank app, then click the button below to let us know. Your payment will be reviewed and confirmed shortly after.
            </p>

            <button
              onClick={handleInitiatePayment}
              disabled={loading}
              className="w-full bg-[#7CFF6B] hover:bg-[#9AFF8C] disabled:opacity-50 text-[#0B0E14] text-sm font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'submitting...' : 'I have made payment'}
            </button>
          </div>
        )}

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