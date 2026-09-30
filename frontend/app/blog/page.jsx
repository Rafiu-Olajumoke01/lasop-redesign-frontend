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
      <Link href={href} className="block aspect-video w-full bg-slate-100 flex items-center justify-center text-slate-300 text-4xl">
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
            <img
              key={i}
              src={src}
              alt=""
              className="h-full w-full shrink-0 object-cover object-top"
            />
          ))}
        </div>
      </Link>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(e, -1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white transition"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => go(e, 1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white transition"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
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

const PostCard = ({ post }) => {
  const href = `/blog/${post.id}`;
  const excerpt = makeExcerpt(post);
  const author = getAuthor(post);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <ImageSlider images={getImages(post)} href={href} />

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <span className="truncate">{author}</span>
          <span>·</span>
          <span className="shrink-0">{formatDate(post.date_published)}</span>
        </div>

        <h2 className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-[#0057E7]">
          <Link href={href}>{post.main_heading}</Link>
        </h2>

        {excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{excerpt}</p>
        )}

        <Link
          href={href}
          className="mt-auto pt-4 text-sm font-semibold text-[#0057E7] hover:underline underline-offset-2"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
};

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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-12">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0057E7]">LASOP Blog</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Latest posts</h1>
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-slate-400">Loading posts…</p>
        ) : error ? (
          <p className="py-16 text-center text-sm text-rose-600">{error}</p>
        ) : posts.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">No posts yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}