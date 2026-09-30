'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/blog/${id}/`);
        if (!res.ok) throw new Error('This post could not be found.');
        setPost(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading post…</p>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500 text-sm">{error || 'This post could not be found.'}</p>
        <Link href="/blog" className="text-[#0057E7] text-sm font-semibold hover:text-[#0A66FF] transition">
          ← Back to blog
        </Link>
      </main>
    );
  }

  const introImages = post.intro_images || [];
  const [cover, ...restIntroImages] = introImages;

  return (
    <main className="min-h-screen bg-white">
      {cover && (
        <div className="w-full h-64 sm:h-[420px] overflow-hidden">
          <img src={cover.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link href="/blog" className="text-[#0057E7] text-sm font-semibold hover:text-[#0A66FF] transition inline-block mb-6">
          ← Back to blog
        </Link>

        <p className="text-[#0057E7] text-[12px] font-bold uppercase tracking-[0.14em] mb-3">
          {formatDate(post.date_published)}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-8">
          {post.main_heading}
        </h1>

        {post.intro_text && (
          <p className="text-slate-700 text-[16px] leading-relaxed whitespace-pre-line mb-8">
            {post.intro_text}
          </p>
        )}

        {restIntroImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
            {restIntroImages.map((img) => (
              <img
                key={img.id}
                src={img.image}
                alt=""
                className="w-full h-40 sm:h-48 object-cover rounded-lg border border-slate-200"
              />
            ))}
          </div>
        )}

        {(post.sections || []).map((section, i) => (
          (section.subheading || section.text || (section.images || []).length > 0) && (
            <div key={section.id} className="pt-10 mt-2 border-t border-slate-100 space-y-4">
              {section.subheading && (
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#0057E7] text-[13px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{section.subheading}</h2>
                </div>
              )}
              {section.text && (
                <p className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-line">
                  {section.text}
                </p>
              )}
              {(section.images || []).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {section.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.image}
                      alt=""
                      className="w-full h-36 sm:h-44 object-cover rounded-lg border border-slate-200"
                    />
                  ))}
                </div>
              )}
            </div>
          )
        ))}
      </article>
    </main>
  );
}