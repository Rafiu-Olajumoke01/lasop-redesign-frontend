"use client";

/**
 * PaymentTransfer.jsx
 *
 * Drop this into the student dashboard wherever payment is needed, e.g.:
 *   <PaymentTransfer applicationId={application.id} />
 *
 * Flow:
 *  1. On mount -> POST /payments/initiate/ -> get virtual account + 30 min timer
 *  2. Countdown runs client-side from `expires_at`
 *  3. Student clicks "I have made payment" -> POST /confirm-clicked/
 *  4. Component polls GET /payments/status/ every 5s to catch the webhook
 *     flipping status to "paid" in the background
 *  5. If timer hits 0 before payment confirmed -> show "Retry Payment" which
 *     re-runs step 1 (creates a fresh virtual account)
 *
 * Adjust API_BASE to match your actual API client / base URL setup.
 */

import { useEffect, useRef, useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentTransfer({ applicationId, authToken }) {
  const [payment, setPayment] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const pollRef = useRef(null);
  const timerRef = useRef(null);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  const initiatePayment = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/applications/${applicationId}/payments/initiate/`,
        { method: "POST", headers: authHeaders }
      );
      if (!res.ok) throw new Error("Could not start payment. Please try again.");
      const data = await res.json();
      setPayment(data);
      setSecondsLeft(data.seconds_remaining);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // initial load
  useEffect(() => {
    initiatePayment();
    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, [initiatePayment]);

  // countdown ticking
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!payment || payment.status === "paid" || payment.status === "expired") return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPayment((p) => (p ? { ...p, status: "expired" } : p));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [payment]);

  // status polling (catches webhook confirming payment in the background)
  useEffect(() => {
    if (!payment || payment.status === "paid" || payment.status === "expired") {
      clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/applications/${applicationId}/payments/status/`,
          { headers: authHeaders }
        );
        if (!res.ok) return;
        const data = await res.json();
        setPayment(data);
        setSecondsLeft(data.seconds_remaining);
      } catch {
        // silent fail, just try again next interval
      }
    }, 5000);

    return () => clearInterval(pollRef.current);
  }, [payment, applicationId]);

  const handleConfirmClicked = async () => {
    setConfirming(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/applications/${applicationId}/payments/confirm-clicked/`,
        { method: "POST", headers: authHeaders }
      );
      if (!res.ok) throw new Error("Could not confirm. Please refresh and try again.");
      const data = await res.json();
      setPayment((p) => ({ ...p, status: data.status }));
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
        Setting up your payment details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6 text-red-300">
        <p>{error}</p>
        <button
          onClick={initiatePayment}
          className="mt-4 bg-[#0057E7] hover:bg-[#0A66FF] text-white px-5 py-2 rounded-lg font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!payment) return null;

  if (payment.status === "paid") {
    return (
      <div className="bg-green-900/20 border border-green-800 rounded-2xl p-6 text-green-300">
        <h3 className="text-lg font-semibold text-white mb-1">Payment Confirmed ✅</h3>
        <p>Your payment of ₦{Number(payment.amount).toLocaleString()} has been received.</p>
      </div>
    );
  }

  if (payment.status === "expired") {
    return (
      <div className="bg-amber-900/20 border border-amber-800 rounded-2xl p-6 text-amber-200">
        <h3 className="text-lg font-semibold text-white mb-1">Payment Window Expired</h3>
        <p className="mb-4">
          Your 30-minute window to complete this transfer has ended. You can start a new one.
        </p>
        <button
          onClick={initiatePayment}
          className="bg-[#0057E7] hover:bg-[#0A66FF] text-white px-5 py-2 rounded-lg font-medium"
        >
          Retry Payment
        </button>
      </div>
    );
  }

  const isAwaiting = payment.status === "awaiting_confirmation";

  return (
    <div className="bg-[#0B1A30] border border-white/10 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Bank Transfer</h3>
        <span className="text-[#5EA2FF] font-mono text-sm bg-blue-900/30 px-3 py-1 rounded-full">
          {formatTime(secondsLeft)}
        </span>
      </div>

      <div className="bg-white/5 rounded-xl p-4 space-y-2">
        <Row label="Bank" value={payment.bank_name} />
        <Row label="Account Number" value={payment.account_number} mono />
        <Row label="Amount" value={`₦${Number(payment.amount).toLocaleString()}`} />
      </div>

      <p className="text-slate-400 text-sm">
        Transfer the exact amount above to the account shown. Once done, click the button below.
      </p>

      {isAwaiting ? (
        <div className="flex items-center gap-2 text-blue-300 text-sm">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          Verifying your payment... this updates automatically once confirmed.
        </div>
      ) : (
        <button
          onClick={handleConfirmClicked}
          disabled={confirming}
          className="w-full bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition"
        >
          {confirming ? "Confirming..." : "I have made payment"}
        </button>
      )}
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-white font-medium ${mono ? "font-mono tracking-wide" : ""}`}>
        {value}
      </span>
    </div>
  );
}