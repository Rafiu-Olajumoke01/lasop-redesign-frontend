'use client';

import { useState } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/users/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setStatus('idle');
        return;
      }
      setStatus('sent');
    } catch {
      setError('Network error. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6 sm:p-7">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Forgot password?</h1>
        <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

        {status === 'sent' ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
            If that email exists in our system, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">
                <span className="mt-0.5 shrink-0">⚠</span>
                {error}
              </div>
            )}
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15
                rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-40 text-white text-sm font-semibold
                px-4 py-2.5 rounded-md shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.97]"
            >
              {status === 'loading' ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <Link href="/login" className="block text-center text-[#0057E7] text-sm font-medium mt-5 hover:text-[#0A66FF] transition">
          Back to login
        </Link>
      </div>
    </div>
  );
}