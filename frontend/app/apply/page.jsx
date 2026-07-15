'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    course: '',
    mode_of_learning: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, locationsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/locations/`),
        ]);
        const coursesData = await coursesRes.json();
        const locationsData = await locationsRes.json();
        setCourses(coursesData);
        setLocations(locationsData);
      } catch (err) {
        setError('Failed to load courses');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'mode_of_learning' && value === 'online' ? { location: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('access');
    if (!token) {
      router.push('/login');
      return;
    }

    const payload = {
      course: formData.course,
      mode_of_learning: formData.mode_of_learning,
      ...(formData.mode_of_learning === 'physical' && { location: formData.location }),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          router.push('/login');
          return;
        }
        const errorMessages = Object.values(data).flat().join(' ');
        setError(errorMessages);
        return;
      }

      router.push('/student');

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
        <h1 className="text-xl font-bold text-white mb-0.5">Choose Your Course</h1>
        <p className="text-slate-400 text-xs mb-4">Select a course and your preferred mode of learning</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl px-3 py-2 mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
            className="w-full bg-[#0d1f3c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="" disabled>Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            name="mode_of_learning"
            value={formData.mode_of_learning}
            onChange={handleChange}
            required
            className="w-full bg-[#0d1f3c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="" disabled>Mode of learning</option>
            <option value="online">Online</option>
            <option value="physical">Physical</option>
          </select>

          {formData.mode_of_learning === 'physical' && (
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full bg-[#0d1f3c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="" disabled>Select a location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} — {loc.address}
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0057E7] hover:bg-[#0A66FF] text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </main>
  );
}