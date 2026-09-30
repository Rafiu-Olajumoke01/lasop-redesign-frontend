'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const LatestBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/blog/`);
        if (!res.ok) return;
        const data = await res.json();
        setPosts((Array.isArray(data) ? data : data.results || []).slice(0, 3));
      } catch {
        // fail quietly on the homepage
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <p className="text-[#0057E7] text-[12px] font-bold uppercase tracking-[0.14em] mb-2">From the blog</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Latest from LASOP</h2>
          </div>
          <Link href="/blog" className="text-[#0057E7] text-sm font-semibold hover:text-[#0A66FF] transition">
            View all posts →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group bg-white border border-slate-200/80 rounded-xl overflow-hidden hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:border-slate-300 transition-all duration-200"
            >
              <div className="w-full h-44 bg-slate-100 overflow-hidden">
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
                <h3 className="text-slate-900 font-bold text-base leading-snug tracking-tight line-clamp-2 group-hover:text-[#0057E7] transition-colors">
                  {post.main_heading}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestBlog;