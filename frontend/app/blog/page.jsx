'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/blog/`);
        if (!res.ok) throw new Error('Could not load posts.');
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : data.results || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="mb-12">
          <p className="text-[#0057E7] text-[12px] font-bold uppercase tracking-[0.14em] mb-2">LASOP Blog</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Latest posts</h1>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm py-16 text-center">Loading posts…</p>
        ) : error ? (
          <p className="text-rose-600 text-sm py-16 text-center">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-slate-400 text-sm py-16 text-center">No posts yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group bg-white border border-slate-200/80 rounded-xl overflow-hidden hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:border-slate-300 transition-all duration-200"
              >
                <div className="w-full h-48 bg-slate-100 overflow-hidden">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">📰</div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wide mb-1.5">
                    {formatDate(post.date_published)}
                  </p>
                  <h2 className="text-slate-900 font-bold text-base leading-snug tracking-tight line-clamp-2 group-hover:text-[#0057E7] transition-colors">
                    {post.main_heading}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}