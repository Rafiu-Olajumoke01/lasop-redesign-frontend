'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Bank Account Details ──────────────────────────────────────────────────
const BANK_DETAILS = {
  accountName: 'Lagos School of Programming Ltd',
  bankName: 'Zenith Bank',
  accountNumber: '1223017613',
};

// ─── Shared UI (matches /backstage) ─────────────────────────────────────

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

function InfoRow({ title, subtitle, icon }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-md px-4 py-3.5 w-full">
      <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200/70 flex items-center justify-center text-[#0057E7] shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 font-semibold text-[13.5px] truncate">{title}</p>
        {subtitle && <p className="text-slate-400 text-[11px] truncate">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function CoursesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}
function OnlineIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M14 9h1M14 13h1" />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M16 15h2" />
    </svg>
  );
}
function DocumentIcon({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  );
}
function TutorAvatarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
      <path d="M22 10v6" />
    </svg>
  );
}
function CohortIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function ClassworkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function CapstoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a4 4 0 100-8 4 4 0 000 8z" />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    </svg>
  );
}

function NavIcon({ path }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {path}
    </svg>
  );
}

const NAV = [
  { key: 'overview', label: 'Overview', icon: <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" /> },
  { key: 'courses', label: 'My Courses', icon: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></> },
  { key: 'classwork', label: 'Classwork', icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></> },
  { key: 'assessments', label: 'Assessments', icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></> },
  { key: 'certificate', label: 'Certificate', icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></> },
  { key: 'payments', label: 'Payments', icon: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></> },
  { key: 'projects', label: 'Projects', icon: <><path d="M12 15a4 4 0 100-8 4 4 0 000 8z" /><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" /></> },
];

// ─── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar({ open, onClose, tab, setTab, onLogout }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 z-50 flex flex-col border-r border-blue-900/40
transition-transform duration-200 ease-out
${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ background: '#152035' }}
      >

        <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-blue-900/30">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.16em]">Student Panel</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors lg:hidden" aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2.5 pt-3 space-y-0.5 overflow-y-auto pb-4">
          {NAV.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); onClose(); }}
                className={`relative w-full flex items-center gap-2.5 text-[13px] px-3 py-2 rounded-md transition-all duration-150 ${active
                  ? 'bg-white text-[#0057E7] font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-white/[0.08] hover:text-white font-medium'
                  }`}
              >
                {active && <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-[#0057E7]" />}
                <NavIcon path={item.icon} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-2.5 pb-5 pt-2 border-t border-blue-900/30">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 text-[13px] font-medium text-slate-400 hover:text-white px-3 py-2 rounded-md hover:bg-white/[0.08] transition-colors mt-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Top bar ────────────────────────────────────────────────────────────────

function TopBar({ onMenuClick, title, initials }) {
  return (
    <header className="bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} aria-label="Menu" className="text-slate-500 hover:text-slate-700 transition-colors lg:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <p className="text-slate-800 font-semibold text-[14px] tracking-tight">{title}</p>
      </div>

      <div className="flex items-center gap-1">
        <button aria-label="Notifications" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-md p-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
        <span className="flex items-center gap-1.5 text-slate-700 font-medium text-[13px] pl-1.5 pr-2 py-1.5 ml-0.5">
          <span className="w-6 h-6 rounded-full bg-[#0057E7] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            {initials || '··'}
          </span>
        </span>
      </div>
    </header>
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
          className={`h-1 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-5 bg-[#0057E7]' : i < activeIndex ? 'w-1 bg-[#0057E7]/40' : 'w-1 bg-slate-200'
            }`}
        />
      ))}
    </div>
  );
}

// ─── Promo Code Box ──────────────────────────────────────────────────────

function PromoCodeBox({ onApply, applying, appliedCode, discountPercent, promoError }) {
  const [codeInput, setCodeInput] = useState('');

  if (appliedCode) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-emerald-700 text-sm font-semibold">
            Code &ldquo;{appliedCode}&rdquo; applied ✓
          </p>
          <p className="text-emerald-600 text-xs mt-0.5">{discountPercent}% discount applied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-slate-500 text-[12px] font-medium">Promo code (optional)</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
          placeholder="e.g. LASOP15"
          className="flex-1 bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15
            rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition
            placeholder:text-slate-400 placeholder:font-normal"
        />
        <SecondaryButton
          onClick={() => onApply(codeInput)}
          disabled={applying || !codeInput.trim()}
          className="shrink-0"
        >
          {applying ? 'Applying...' : 'Apply'}
        </SecondaryButton>
      </div>
      {promoError && (
        <p className="text-rose-600 text-xs">{promoError}</p>
      )}
    </div>
  );
}

// ─── Payment Transfer Modal (Manual Bank Transfer Flow) ────────────────────
//
// Rendered via createPortal straight into document.body. Without this, the
// modal was mounting nested inside <Card interactive> in CourseCard — and
// Card's hover:-translate-y-[1px] transform makes that Card a CSS
// "containing block" for any position:fixed descendant while hovered, so
// the modal was getting trapped/squished inside the small course card
// instead of covering the screen. Same fix pattern already used in
// ApplyModal.jsx.

function PaymentTransfer({ applicationId, authToken, totalFee, onClose, onSubmitted }) {
  const [step, setStep] = useState('choose');
  const [paymentType, setPaymentType] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [mounted, setMounted] = useState(false);

  // Promo code state
  const [appliedCode, setAppliedCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');

  const getAuthHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  }), [authToken]);

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
          body: JSON.stringify({
            payment_type: paymentType,
            amount: rawAmount(),
            ...(appliedCode ? { promo_code: appliedCode } : {}),
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

  // Apply promo code: re-hits initiate/ with the code, backend recalculates amount
  const handleApplyPromo = async (code) => {
    setApplyingPromo(true);
    setPromoError('');
    try {
      const res = await fetch(
        `${API_BASE}/api/applications/${applicationId}/payments/manual/initiate/`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            payment_type: paymentType,
            amount: rawAmount(),
            promo_code: code,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.detail || 'Invalid or inactive promo code.');
        return;
      }
      // Backend returns the corrected amount (discounted, for full payment)
      setAmount(Number(data.amount).toLocaleString());
      setAppliedCode(data.promo_code);
      setDiscountPercent(data.discount_percent);
    } catch (err) {
      setPromoError('Could not apply code. Please try again.');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleCopy = (field, value) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 1500);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-[420px] bg-white border border-slate-200 rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden max-h-[90vh] overflow-y-auto">
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

          {step === 'bank_details' && (
            <div className="space-y-4">
              {/* Promo code — only offered for full payment, since discount applies to the course fee */}
              {paymentType === 'full' && (
                <PromoCodeBox
                  onApply={handleApplyPromo}
                  applying={applyingPromo}
                  appliedCode={appliedCode}
                  discountPercent={discountPercent}
                  promoError={promoError}
                />
              )}

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
                      className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition shrink-0 ml-3 ${copiedField === field
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
    </div>,
    document.body
  );
}

// ─── Certificate Card ──────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = Number(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
}

function CertificateCard({ certificate }) {
  const isReady = !!certificate;

  return (
    <Card interactive className="p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${isReady ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-300'
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

// ─── Assigned Tutor Card ────────────────────────────────────────────────────

function AssignedTutorCard({ tutor }) {
  const hasTutor = !!tutor;

  return (
    <Card interactive className="p-4 sm:p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${hasTutor ? 'bg-blue-50 border-blue-200 text-[#0057E7]' : 'bg-slate-50 border-slate-200 text-slate-300'
        }`}>
        <TutorAvatarIcon />
      </div>
      <div className="min-w-0">
        <p className="text-slate-400 text-[11px] uppercase tracking-wide font-bold mb-0.5">Assigned Tutor</p>
        <p className="text-slate-900 font-semibold text-sm tracking-tight">
          {hasTutor ? tutor.name : 'Not assigned yet'}
        </p>
      </div>
    </Card>
  );
}

// ─── Assigned Cohorts Section ───────────────────────────────────────────────

function AssignedCohortsSection({ applications }) {
  const withCohort = applications.filter((a) => a.cohort_detail);

  return (
    <div className="mb-5">
      <SectionLabel>Assigned Cohorts</SectionLabel>
      {withCohort.length === 0 ? (
        <Card>
          <EmptyState title="No cohort assigned yet" hint="You'll see it here once you're placed in one." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {withCohort.map((a) => (
            <InfoRow
              key={a.id}
              title={a.cohort_detail?.name}
              subtitle={a.course_detail?.title}
              icon={<CohortIcon />}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Today's Class Section ──────────────────────────────────────────────────

function useTodayClasses(token, applications) {
  const appsWithCourse = applications.filter((a) => a.course);
  const courseKey = appsWithCourse.map((a) => a.course).join(',');

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || appsWithCourse.length === 0) { setLoading(false); return; }

    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const responses = await Promise.all(
          appsWithCourse.map((app) =>
            fetch(`${API_BASE}/api/cohorts/my-classes/?course=${app.course}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => (r.ok ? r.json() : { today: [] }))
          )
        );
        const todaySessions = responses.flatMap((r, i) =>
          (r.today || []).map((s) => ({ ...s, course_title: appsWithCourse[i]?.course_detail?.title }))
        );
        setSessions(todaySessions);
      } catch {
        setError("Could not load today's classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, courseKey]);

  return { sessions, loading, error };
}

function TodayClassCard({ session }) {
  return (
    <Card interactive className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-slate-900 font-semibold text-sm tracking-tight truncate">
            {session.title || session.course_title || session.cohort_name}
          </p>
          <p className="text-slate-400 text-[11px] mt-0.5">{session.cohort_name}</p>
        </div>
        <Pill color="blue">{formatTime(session.start_time)} – {formatTime(session.end_time)}</Pill>
      </div>
      {session.topics_covered && (
        <p className="text-slate-500 text-sm leading-relaxed mt-3 pt-3 border-t border-slate-100">
          {session.topics_covered}
        </p>
      )}
      {session.lesson_outcome && (
        <p className="text-slate-400 text-xs leading-relaxed mt-2 italic">
          By the end: {session.lesson_outcome}
        </p>
      )}
    </Card>
  );
}

function TodayClassSection({ token, applications }) {
  const { sessions, loading, error } = useTodayClasses(token, applications);

  return (
    <div className="mb-5">
      <SectionLabel>Today&rsquo;s Class</SectionLabel>
      {loading ? (
        <Card className="p-6"><Spinner text="Loading today's classes…" /></Card>
      ) : error ? (
        <ErrorBanner message={error} />
      ) : sessions.length === 0 ? (
        <Card><EmptyState title="No class today" hint="Check back on your next class day." /></Card>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((s) => <TodayClassCard key={s.id} session={s} />)}
        </div>
      )}
    </div>
  );
}

// ─── Capstone Projects Section ──────────────────────────────────────────────

function useCapstoneProjects(token, applications) {
  const appsWithCourse = applications.filter((a) => a.course);
  const courseKey = appsWithCourse.map((a) => a.course).join(',');

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || appsWithCourse.length === 0) { setLoading(false); return; }

    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const responses = await Promise.all(
          appsWithCourse.map((app) =>
            fetch(`${API_BASE}/api/cohorts/my-capstone-projects/?course=${app.course}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => (r.ok ? r.json() : []))
          )
        );
        const allProjects = responses.flatMap((r, i) =>
          (r || []).map((p) => ({ ...p, course_title: appsWithCourse[i]?.course_detail?.title }))
        );
        setProjects(allProjects);
      } catch {
        setError('Could not load capstone projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, courseKey]);

  return { projects, loading, error };
}

function CapstoneProjectCard({ project }) {
  return (
    <Card interactive className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-slate-900 font-semibold text-sm tracking-tight truncate">
            {project.title}
          </p>
          <p className="text-slate-400 text-[11px] mt-0.5">{project.cohort_name}</p>
        </div>
        <Pill color="blue">{project.stage_label}</Pill>
      </div>
      {project.description && (
        <p className="text-slate-500 text-sm leading-relaxed mt-3 pt-3 border-t border-slate-100">
          {project.description}
        </p>
      )}
      <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100 flex-wrap">
        {project.due_date && (
          <p className="text-slate-400 text-xs">Due {formatDate(project.due_date)}</p>
        )}
        {project.attachment && (
          <a
            href={project.attachment}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0057E7] text-xs font-semibold hover:text-[#0A66FF] transition"
          >
            View attachment →
          </a>
        )}
      </div>
    </Card>
  );
}

function CapstoneProjectsSection({ token, applications }) {
  const { projects, loading, error } = useCapstoneProjects(token, applications);

  return (
    <div className="mb-5">
      <SectionLabel>Capstone Projects</SectionLabel>
      {loading ? (
        <Card className="p-6"><Spinner text="Loading capstone projects…" /></Card>
      ) : error ? (
        <ErrorBanner message={error} />
      ) : projects.length === 0 ? (
        <Card><EmptyState title="No capstone projects yet" hint="Your tutor's posted projects will show up here." /></Card>
      ) : (
        <div className="space-y-2.5">
          {projects.map((p) => <CapstoneProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ app, featured, token, openPayment, setOpenPayment, onRemove, onPaymentUpdate }) {
  const isPaymentOpen = openPayment === app.id;
  const paymentStatus = app.payment_status || 'not_started';
  const isPaid = paymentStatus === 'paid';
  const canPay = paymentStatus === 'not_started';

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

      {canPay && (
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

      <div className="mt-4 pt-3.5 border-t border-slate-100">
        <Link
          href={`/student/courses/${app.course}`}
          className="text-[#0057E7] text-sm font-semibold hover:text-[#0A66FF] transition inline-flex items-center gap-1"
        >
          View classes & projects →
        </Link>
      </div>

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

// ─── Pay Now (Overview) ─────────────────────────────────────────────────────

function PayNowCard({ app, token, openPayment, setOpenPayment, onPaymentUpdate }) {
  const isPaymentOpen = openPayment === app.id;

  return (
    <Card interactive className="p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border bg-amber-50 border-amber-200 text-amber-600">
          <WalletIcon />
        </div>
        <div className="min-w-0">
          <p className="text-slate-900 font-semibold text-sm tracking-tight truncate">{app.course_detail?.title}</p>
          <p className="text-slate-400 text-[11px] mt-0.5">
            ₦{Number(app.course_detail?.fee).toLocaleString()} · Payment pending
          </p>
        </div>
      </div>

      {isPaymentOpen ? (
        <SecondaryButton onClick={() => setOpenPayment(null)} className="shrink-0">
          Cancel
        </SecondaryButton>
      ) : (
        <PrimaryButton onClick={() => setOpenPayment(app.id)} className="shrink-0">
          Pay Now
        </PrimaryButton>
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

function PayNowSection({ applications, token, openPayment, setOpenPayment, onPaymentUpdate }) {
  const unpaidApps = applications.filter(
    (a) => !a.payment_status || a.payment_status === 'not_started'
  );

  if (unpaidApps.length === 0) return null;

  return (
    <div className="mb-5">
      <SectionLabel>Complete your payment</SectionLabel>
      <div className="space-y-2.5">
        {unpaidApps.map((app) => (
          <PayNowCard
            key={app.id}
            app={app}
            token={token}
            openPayment={openPayment}
            setOpenPayment={setOpenPayment}
            onPaymentUpdate={onPaymentUpdate}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Overview tab ───────────────────────────────────────────────────────────

function OverviewTab({ user, applications, token, openPayment, setOpenPayment, onNavigate, onPaymentUpdate }) {
  const count = applications.length;
  const onlineCount = applications.filter((a) => a.mode_of_learning === 'online').length;
  const physicalCount = applications.filter((a) => a.mode_of_learning === 'physical').length;
  const totalFees = applications.reduce((sum, a) => sum + (Number(a.course_detail?.fee) || 0), 0);
  const paidCount = applications.filter((a) => a.payment_status === 'paid').length;
  const reviewCount = applications.filter((a) => a.payment_status === 'in_review').length;
  const formattedFees = totalFees >= 1000000
    ? `₦${(totalFees / 1000000).toFixed(1)}M`
    : `₦${totalFees.toLocaleString()}`;

  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`;

  return (
    <div>
      <div className="flex items-center gap-4 mb-7">
        <div className="w-14 h-14 rounded-full bg-[#0057E7] flex items-center justify-center text-lg font-bold text-white shrink-0">
          {initials || '··'}
        </div>
        <div className="min-w-0">
          <h1 className="text-slate-900 font-bold text-xl leading-tight tracking-tight truncate">
            {firstName} {lastName}
          </h1>
          <p className="text-slate-400 text-sm mt-1 truncate">
            {user?.email}{user?.phone_number ? ` · ${user.phone_number}` : ''}
          </p>
        </div>
      </div>

      {(reviewCount > 0 || paidCount > 0) && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {reviewCount > 0 && <Pill color="amber">{reviewCount} payment{reviewCount > 1 ? 's' : ''} in review</Pill>}
          {paidCount > 0 && <Pill color="emerald">{paidCount} paid</Pill>}
        </div>
      )}

      <PayNowSection
        applications={applications}
        token={token}
        openPayment={openPayment}
        setOpenPayment={setOpenPayment}
        onPaymentUpdate={onPaymentUpdate}
      />

      <div className="mb-5">
        <AssignedTutorCard tutor={user?.assigned_tutor_detail} />
      </div>

      <AssignedCohortsSection applications={applications} />

      <div className="mb-5">
        <SectionLabel>Quick actions</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ManagerCard title="View my courses" onClick={() => onNavigate('courses')} icon={<CoursesIcon />} />
          <ManagerCard title="Check my certificate" onClick={() => onNavigate('certificate')} icon={<DocumentIcon className="w-4 h-4" />} />
        </div>
      </div>

      <TodayClassSection token={token} applications={applications} />

      <CapstoneProjectsSection token={token} applications={applications} />

      <div className="mb-5">
        <SectionLabel>At a glance</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <HighlightStatCard label="Courses enrolled" value={count} icon={<CoursesIcon />} />
          <HighlightStatCard label="Total fees" value={formattedFees} icon={<WalletIcon />} />
        </div>
      </div>

      <div>
        <SectionLabel>Breakdown</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
          <OverviewStatCard label="Online" value={onlineCount} icon={<OnlineIcon />} />
          <OverviewStatCard label="Physical" value={physicalCount} icon={<BuildingIcon />} />
          <OverviewStatCard label="Paid" value={paidCount} icon={<WalletIcon />} />
        </div>
      </div>
    </div>
  );
}

// ─── Courses tab ────────────────────────────────────────────────────────────

function CoursesTab({ applications, token, openPayment, setOpenPayment, onRemove, onPaymentUpdate }) {
  const count = applications.length;

  return (
    <div>
      <PageHeader title="My Courses" subtitle={count > 0 ? `${count} enrolled` : undefined}>
        <Link href="/apply">
          <PrimaryButton>+ Add course</PrimaryButton>
        </Link>
      </PageHeader>

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
          onRemove={onRemove}
          onPaymentUpdate={onPaymentUpdate}
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
              onRemove={onRemove}
              onPaymentUpdate={onPaymentUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Certificate tab ─────────────────────────────────────────────────────────

function CertificateTab({ certificate }) {
  return (
    <div>
      <PageHeader title="Certificate" />
      <CertificateCard certificate={certificate} />
    </div>
  );
}

// ─── Payments tab ────────────────────────────────────────────────────────────

function PaymentsTab({ applications }) {
  const withPayments = applications.filter((a) => a.payment_status && a.payment_status !== 'not_started');

  return (
    <div>
      <PageHeader title="Payments" subtitle={`${withPayments.length} record${withPayments.length !== 1 ? 's' : ''}`} />
      {withPayments.length === 0 ? (
        <Card><EmptyState title="No payment activity yet" hint="Payments you make will show up here." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  {['Course', 'Mode', 'Fee', 'Status', 'Date'].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withPayments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4 text-slate-800 font-semibold">{a.course_detail?.title}</td>
                    <td className="px-5 py-4"><ModePill mode={a.mode_of_learning} /></td>
                    <td className="px-5 py-4 text-slate-800 font-bold">₦{Number(a.course_detail?.fee).toLocaleString()}</td>
                    <td className="px-5 py-4"><PaymentStatusBadge status={a.payment_status} amountPaid={a.amount_paid} /></td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Classwork tab ────────────────────────────────────────────────────────────

function useClasswork(token, cohortIds) {
  const [classwork, setClasswork] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cohortKey = cohortIds.join(',');

  useEffect(() => {
    if (!token || cohortIds.length === 0) { setLoading(false); return; }

    const fetchAll = async () => {
      setLoading(true); setError('');
      try {
        const examResponses = await Promise.all(
          cohortIds.map((id) =>
            fetch(`${API_BASE}/api/exams/?cohort=${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => (r.ok ? r.json() : []))
          )
        );
        const allExams = examResponses.flat();

        const resultsRes = await fetch(`${API_BASE}/api/results/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allResults = resultsRes.ok ? await resultsRes.json() : [];

        setClasswork(allExams);
        setResults(allResults);
      } catch {
        setError('Could not load classwork.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, cohortKey]);

  const merged = useMemo(() => {
    return classwork.map((cw) => {
      const result = results.find((r) => r.exam === cw.id);
      return { ...cw, result: result || null };
    });
  }, [classwork, results]);

  return { items: merged, loading, error };
}

function ClassworkStatusPill({ item }) {
  if (item.result?.status === 'passed') return <Pill color="emerald">Passed{item.result.score != null ? ` · ${item.result.score}/${item.total_marks}` : ''}</Pill>;
  if (item.result?.status === 'failed') return <Pill color="rose">Failed{item.result.score != null ? ` · ${item.result.score}/${item.total_marks}` : ''}</Pill>;
  if (!item.is_open) return <Pill color="slate">Closed</Pill>;
  return <Pill color="amber">Pending</Pill>;
}

function ClassworkTab({ token, cohortIds }) {
  const classwork = useClasswork(token, cohortIds);
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return classwork.items;
    if (filter === 'pending') return classwork.items.filter((i) => !i.result || i.result.status === 'pending');
    if (filter === 'passed') return classwork.items.filter((i) => i.result?.status === 'passed');
    if (filter === 'failed') return classwork.items.filter((i) => i.result?.status === 'failed');
    return classwork.items;
  }, [classwork.items, filter]);

  const filters = ['all', 'pending', 'passed', 'failed'];

  if (cohortIds.length === 0) {
    return (
      <div>
        <PageHeader title="Classwork" />
        <Card><EmptyState title="No cohort assigned yet" hint="Classwork will show up here once you're placed in a cohort." /></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Classwork" subtitle={`${filtered.length} of ${classwork.items.length} total`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${filter === f
                ? 'border-[#0057E7] bg-[#0057E7] text-white shadow-sm'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </PageHeader>

      <ErrorBanner message={classwork.error} />

      {classwork.loading ? (
        <Spinner text="Loading classwork…" />
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="No classwork yet" hint="Nothing matches this filter yet." /></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} interactive className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="text-slate-900 font-bold text-sm tracking-tight">{item.title}</h3>
                    <Pill color="indigo">{item.exam_type}</Pill>
                  </div>
                  <p className="text-slate-400 text-xs">{item.course_title}</p>
                </div>
                <ClassworkStatusPill item={item} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mt-4 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Due date</p>
                  <p className="text-slate-700 font-medium">{formatDate(item.due_date) || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Pass mark</p>
                  <p className="text-slate-700 font-medium">{item.pass_mark}/{item.total_marks}</p>
                </div>
              </div>

              {item.instructions && (
                <p className="text-slate-500 text-sm leading-relaxed mt-3 pt-3 border-t border-slate-100">{item.instructions}</p>
              )}

              {item.result?.feedback && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-1">Feedback</p>
                  <p className="text-slate-600 text-sm">{item.result.feedback}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Assessments tab ─────────────────────────────────────────────────────

function useStudentAssessments(token) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cohorts/assessments/mine/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load your assessments.');
      setAssessments(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const respond = async (assessmentId, text) => {
    const res = await fetch(`${API_BASE}/api/cohorts/assessments/${assessmentId}/respond/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ student_response: text }),
    });
    if (!res.ok) throw new Error('Could not save your response.');
    await refresh();
  };

  return { assessments, loading, error, refresh, respond };
}

function useStudentProjects(token) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cohorts/projects/mine/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not load your projects.');
      setProjects(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const createProject = async (formData) => {
    const res = await fetch(`${API_BASE}/api/cohorts/projects/mine/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets it for FormData
      body: formData,
    });
    if (!res.ok) throw new Error('Could not save your project.');
    await refresh();
  };

  const submitProject = async (projectId) => {
    const res = await fetch(`${API_BASE}/api/cohorts/projects/mine/${projectId}/submit/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Could not submit your project.');
    await refresh();
  };

  return { projects, loading, error, refresh, createProject, submitProject };
}

function AssessmentCard({ assessment, onRespond }) {
  const [responseText, setResponseText] = useState(assessment.student_response || '');
  const [editing, setEditing] = useState(!assessment.student_response);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const handleSave = async () => {
    setSaving(true); setSaveErr('');
    try {
      await onRespond(assessment.id, responseText.trim());
      setEditing(false);
    } catch (e) {
      setSaveErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card interactive className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold">
          {assessment.author_name}
        </p>
        <p className="text-slate-400 text-[11px]">{formatDate(assessment.created_at)}</p>
      </div>
      <p className="text-slate-800 text-sm leading-relaxed">{assessment.content}</p>

      <div className="mt-4 pt-3.5 border-t border-slate-100">
        {editing ? (
          <div className="space-y-2.5">
            {saveErr && <ErrorBanner message={saveErr} />}
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={3}
              placeholder="Optional — reply to your tutor here…"
              className="w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15
                rounded-lg px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400"
            />
            <div className="flex items-center gap-2">
              <PrimaryButton onClick={handleSave} disabled={saving || !responseText.trim()}>
                {saving ? 'Saving…' : 'Send response'}
              </PrimaryButton>
              {assessment.student_response && (
                <SecondaryButton onClick={() => { setEditing(false); setResponseText(assessment.student_response); }}>
                  Cancel
                </SecondaryButton>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-1">Your response</p>
            <p className="text-slate-600 text-sm mb-2.5">{assessment.student_response}</p>
            <button
              onClick={() => setEditing(true)}
              className="text-[#0057E7] text-xs font-semibold hover:text-[#0A66FF] transition"
            >
              Edit response
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

function ProjectCard({ project, onSubmit }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(project.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card interactive className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-slate-900 font-semibold text-sm tracking-tight truncate">
            {project.title}
          </p>
          {project.project_type && (
            <p className="text-slate-400 text-[11px] mt-0.5 capitalize">{project.project_type}</p>
          )}
          {project.tech_stack && (
            <p className="text-slate-400 text-[11px] mt-0.5">{project.tech_stack}</p>
          )}
        </div>
        <Pill color={project.status === 'submitted' ? 'emerald' : 'slate'}>
          {project.status === 'submitted' ? 'Submitted' : 'Draft'}
        </Pill>
      </div>

      {project.description && (
        <p className="text-slate-500 text-sm leading-relaxed mt-3 pt-3 border-t border-slate-100">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100 flex-wrap">
        <div className="flex items-center gap-4">
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
              className="text-[#0057E7] text-xs font-semibold hover:text-[#0A66FF] transition">
              Code →
            </a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer"
              className="text-[#0057E7] text-xs font-semibold hover:text-[#0A66FF] transition">
              Live →
            </a>
          )}
        </div>

        {project.status === 'draft' && (
          <SecondaryButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit'}
          </SecondaryButton>
        )}
      </div>
    </Card>
  );
}

function ProjectsTab({ token }) {
  const { projects, loading, error, refresh, submitProject } = useStudentProjects(token);
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <PageHeader title="Projects" subtitle={projects.length > 0 ? `${projects.length} total` : undefined}>
        <PrimaryButton onClick={() => setShowModal(true)}>+ New Project</PrimaryButton>
      </PageHeader>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner text="Loading your projects…" />
      ) : projects.length === 0 ? (
        <Card><EmptyState title="No projects yet" hint="Post your first project to show it off." /></Card>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onSubmit={submitProject} />
          ))}
        </div>
      )}

      {showModal && (
        <NewProjectModal
          token={token}
          onClose={() => setShowModal(false)}
          onCreated={refresh}
        />
      )}
    </div>
  );
}

function NewProjectModal({ token, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState('capstone');
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
      formData.append('title', title);
      formData.append('project_type', projectType);
      formData.append('description', description);
      if (techStack) formData.append('tech_stack', techStack);
      if (repoUrl) formData.append('repo_url', repoUrl);
      if (liveUrl) formData.append('live_url', liveUrl);
      if (coverImage) formData.append('cover_image', coverImage);
      if (attachment) formData.append('attachment', attachment);

      const res = await fetch(`${API_BASE}/api/cohorts/projects/mine/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Could not save your project.');
      onCreated();
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
          <p className="text-slate-900 text-[15px] font-bold tracking-tight">New Project</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0 text-sm">✕</button>
        </div>

        <div className="px-5 sm:px-6 pt-4 pb-6 space-y-3.5">
          <ErrorBanner message={error} />

          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title"
            className="w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400" />

          <div>
            <p className="text-slate-500 text-[12px] font-medium mb-1.5">Project type</p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="project_type"
                  value="capstone"
                  checked={projectType === 'capstone'}
                  onChange={() => setProjectType('capstone')}
                  className="accent-[#0057E7]"
                />
                Capstone
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="project_type"
                  value="monthly"
                  checked={projectType === 'monthly'}
                  onChange={() => setProjectType('monthly')}
                  className="accent-[#0057E7]"
                />
                Monthly
              </label>
            </div>
          </div>

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
            {loading ? 'Saving…' : 'Save Project'}
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body
  );
}

function AssessmentsTab({ token }) {
  const { assessments, loading, error, respond } = useStudentAssessments(token);

  return (
    <div>
      <PageHeader title="Assessments" subtitle={assessments.length > 0 ? `${assessments.length} total` : undefined} />
      <ErrorBanner message={error} />
      {loading ? (
        <Spinner text="Loading your assessments…" />
      ) : assessments.length === 0 ? (
        <Card><EmptyState title="No assessments yet" hint="Feedback from your tutor will show up here." /></Card>
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => (
            <AssessmentCard key={a.id} assessment={a} onRespond={respond} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page shell ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openPayment, setOpenPayment] = useState(null);
  const [token, setToken] = useState('');
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`;
  const currentLabel = NAV.find((n) => n.key === tab)?.label || 'Overview';

  const cohortIds = useMemo(
    () => [...new Set(applications.map((a) => a.cohort_detail?.id).filter(Boolean))],
    [applications]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner text="Loading dashboard…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} tab={tab} setTab={setTab} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={currentLabel} initials={initials} />

        <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto pb-24">
          <div className="max-w-5xl">
            <ErrorBanner message={error} />

            {tab === 'overview' && (
              <OverviewTab
                user={user}
                applications={applications}
                token={token}
                openPayment={openPayment}
                setOpenPayment={setOpenPayment}
                onNavigate={setTab}
                onPaymentUpdate={handlePaymentUpdate}
              />
            )}
            {tab === 'courses' && (
              <CoursesTab
                applications={applications}
                token={token}
                openPayment={openPayment}
                setOpenPayment={setOpenPayment}
                onRemove={handleRemoveCourse}
                onPaymentUpdate={handlePaymentUpdate}
              />
            )}
            {tab === 'classwork' && <ClassworkTab token={token} cohortIds={cohortIds} />}
            {tab === 'assessments' && <AssessmentsTab token={token} />}
            {tab === 'certificate' && <CertificateTab certificate={user?.certificate} />}
            {tab === 'projects' && <ProjectsTab token={token} />}
            {tab === 'payments' && <PaymentsTab applications={applications} />}
          </div>
        </div>
      </div>
    </div>
  );
}