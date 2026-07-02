'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyModal({ isOpen, onClose, preselectedCourse }) {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
    course: preselectedCourse?.id || '',
    mode_of_learning: 'online',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all courses for the dropdown, only when no course is preselected
  useEffect(() => {
    if (!preselectedCourse && isOpen) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/`)
        .then((res) => res.json())
        .then((data) => setCourses(Array.isArray(data) ? data : data.results || []))
        .catch(() => setCourses([]));
    }
  }, [isOpen, preselectedCourse]);

  // Reset form + lock scroll whenever modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFormData((prev) => ({ ...prev, course: preselectedCourse?.id || '' }));
      setError('');
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, preselectedCourse]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Register the user (same endpoint as normal signup)
      const registerRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number,
          gender: formData.gender,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        const firstError = Object.values(registerData)[0];
        setError(Array.isArray(firstError) ? firstError[0] : 'Could not create account. Please check your details.');
        setLoading(false);
        return;
      }

      // Save tokens, same pattern as the login page
      localStorage.setItem('access', registerData.access);
      localStorage.setItem('refresh', registerData.refresh);

      // Step 2: Create the application, using the fresh token
      const applicationRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${registerData.access}`,
        },
        body: JSON.stringify({
          course: formData.course,
          mode_of_learning: formData.mode_of_learning,
        }),
      });

      if (!applicationRes.ok) {
        // Account was created but application failed — still send them to dashboard,
        // they're logged in and can be helped manually if needed
        router.push('/dashboard');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-[#071224] border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Apply Now</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">
            &times;
          </button>
        </div>

        {preselectedCourse && (
          <p className="text-sm text-blue-300 mb-4">
            Applying for: <span className="font-semibold">{preselectedCourse.title}</span>
          </p>
        )}

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
              placeholder="First name"
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              placeholder="Last name"
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Email address"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Create a password"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />

          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            placeholder="Phone number"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="" className="bg-[#071224]">Select gender</option>
            <option value="male" className="bg-[#071224]">Male</option>
            <option value="female" className="bg-[#071224]">Female</option>
          </select>

          {!preselectedCourse && (
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="" className="bg-[#071224]">Select a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#071224]">
                  {c.title}
                </option>
              ))}
            </select>
          )}

          <select
            name="mode_of_learning"
            value={formData.mode_of_learning}
            onChange={handleChange}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="online" className="bg-[#071224]">Online</option>
            <option value="physical" className="bg-[#071224]">Physical (in-person)</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0057E7] hover:bg-[#0A66FF] text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}