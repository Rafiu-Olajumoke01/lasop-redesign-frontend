'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const EXCERPT_WORDS = 30;
const SLIDE_INTERVAL = 4000; // ms

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function makeExcerpt(post) {
  const raw = post.intro_text || post.excerpt || '';
  const text = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const words = text.split(' ');
  return words.length > EXCERPT_WORDS ? words.slice(0, EXCERPT_WORDS).join(' ') + '…' : text;
}

function getAuthor(post) {
  if (typeof post.author === 'string' && post.author) return post.author;
  return (
    post.author_name ||
    post.author?.name ||
    post.author?.full_name ||
    post.author?.username ||
    'LASOP Team'
  );
}

function getImages(post) {
  const list = (post.intro_images || []).map((i) => i.image).filter(Boolean);
  if (post.cover_image && !list.includes(post.cover_image)) list.unshift(post.cover_image);
  return list;
}

const ImageSlider = ({ images, href }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_INTERVAL);
    return () => clearInterval(t);
  }, [count, paused]);

  if (count === 0) {
    return (
      <Link
        href={href}
        className="flex aspect-video w-full items-center justify-center bg-slate-100 text-4xl text-slate-300"
      >
        📰
      </Link>
    );
  }

  const go = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + dir + count) % count);
  };

  return (
    <div
      className="relative aspect-video w-full overflow-hidden bg-slate-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link href={href} className="block h-full w-full">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <img key={i} src={src} alt="" className="h-full w-full shrink-0 object-cover object-top" />
          ))}
        </div>
      </Link>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(e, -1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow transition hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => go(e, 1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow transition hover:bg-white"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

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
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0057E7]">From the blog</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Latest from LASOP</h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-[#0057E7] transition hover:text-[#0A66FF]">
            View all posts →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const href = `/blog/${post.id}`;
            const excerpt = makeExcerpt(post);

            return (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
              >
                <ImageSlider images={getImages(post)} href={href} />

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    <span className="truncate">{getAuthor(post)}</span>
                    <span>·</span>
                    <span className="shrink-0">{formatDate(post.date_published)}</span>
                  </div>

                  <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-[#0057E7]">
                    <Link href={href}>{post.main_heading}</Link>
                  </h3>

                  {excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{excerpt}</p>
                  )}

                  <Link
                    href={href}
                    className="mt-auto pt-4 text-sm font-semibold text-[#0057E7] underline-offset-2 hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LatestBlog;