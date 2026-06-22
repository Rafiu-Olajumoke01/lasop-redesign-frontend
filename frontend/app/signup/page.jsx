'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        const errorMessages = Object.values(data).flat().join(' ');
        setError(errorMessages);
        return;
      }

      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      router.push('/apply');

    } catch (err) {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen bg-[#071224] flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6">
        <h1 className="text-xl font-bold text-white mb-0.5">Create an Account</h1>
        <p className="text-slate-400 text-xs mb-4">Join LASOP and start learning today</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl px-3 py-2 mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              placeholder="First name"
            />
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              placeholder="Last name"
            />
          </div>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            placeholder="Email address"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              placeholder="Phone number"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full bg-[#0d1f3c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="" disabled>Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            placeholder="Password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0057E7] hover:bg-[#0A66FF] text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}