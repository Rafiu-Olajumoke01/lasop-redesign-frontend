'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Edit these ─────────────────────────────────────────────────────────────
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // e.g. ca-pub-1234567890123456
const ADSENSE_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;     // your ad unit's slot ID
const WHATSAPP_NUMBER = '234XXXXXXXXXX'; // no + or spaces
const APPLY_LINK = '/apply';
const COURSES_LINK = '/courses';
const COURSES = [
  'Fullstack Web Development',
  'Frontend Web Development',
  'Backend Web Development',
  'Data Science',
  'Data Analytics',
];
const SLIDE_INTERVAL = 5000; // ms
// ────────────────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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

function readingTime(post) {
  const text = [post.intro_text, ...(post.sections || []).map((s) => s.text)]
    .filter(Boolean)
    .join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── Image slider ───────────────────────────────────────────────────────────

const ImageSlider = ({ images }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_INTERVAL);
    return () => clearInterval(t);
  }, [count, paused]);

  if (count === 0) return null;

  const go = (dir) => setIndex((i) => (i + dir + count) % count);

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <img key={i} src={src} alt="" className="h-full w-full shrink-0 object-cover object-top" />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-slate-700 shadow transition hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-slate-700 shadow transition hover:bg-white"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
          <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>
  );
};

// ─── Sidebar ads ────────────────────────────────────────────────────────────

const AdSenseSlot = ({ id }) => {
  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [id]);

  if (!ADSENSE_CLIENT || !ADSENSE_SLOT) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
        Advertisement
      </p>
      <Script
        async
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      />
      <ins
        key={id}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

const EnrolAd = () => (
  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0057E7] to-[#0A66FF] p-6 text-white shadow-sm">
    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
    <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10" />
    <div className="relative">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-100">Now enrolling</p>
      <h3 className="text-xl font-extrabold leading-tight tracking-tight">Learn tech skills with LASOP</h3>
      <p className="mt-2 text-sm leading-relaxed text-blue-50/90">
        Practical, mentor-led training that gets you job ready.
      </p>
      <Link
        href={APPLY_LINK}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#0057E7] shadow-sm transition hover:shadow-md active:scale-[0.97]"
      >
        Enrol now →
      </Link>
    </div>
  </div>
);

const CoursesAd = () => (
  <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
    <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0057E7]">Our courses</p>
    <h3 className="mb-4 text-base font-bold tracking-tight text-slate-900">Pick your path</h3>
    <ul className="space-y-2.5">
      {COURSES.map((c) => (
        <li key={c} className="flex items-center gap-2.5 text-sm text-slate-600">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0057E7]" />
          {c}
        </li>
      ))}
    </ul>
    <Link
      href={COURSES_LINK}
      className="mt-5 inline-block text-sm font-semibold text-[#0057E7] underline-offset-2 hover:underline"
    >
      See all courses →
    </Link>
  </div>
);

const WhatsAppAd = () => (
  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
    <h3 className="text-base font-bold tracking-tight text-slate-900">Have questions?</h3>
    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
      Talk to our team on WhatsApp and we will help you choose the right course.
    </p>
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.97]"
    >
      Chat on WhatsApp
    </a>
  </div>
);

const Sidebar = ({ postId }) => (
  <aside className="space-y-5 self-start lg:sticky lg:top-24">
    <AdSenseSlot id={postId} />
    <EnrolAd />
    <CoursesAd />
    <WhatsAppAd />
  </aside>
);

// ─── Page ───────────────────────────────────────────────────────────────────

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
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading post…</p>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-sm text-slate-500">{error || 'This post could not be found.'}</p>
        <Link href="/blog" className="text-sm font-semibold text-[#0057E7] transition hover:text-[#0A66FF]">
          ← Back to blog
        </Link>
      </main>
    );
  }

  const images = (post.intro_images || []).map((i) => i.image).filter(Boolean);
  if (post.cover_image && !images.includes(post.cover_image)) images.unshift(post.cover_image);

  const author = getAuthor(post);
  const initial = author.trim().charAt(0).toUpperCase();
  const minutes = readingTime(post);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/blog"
          className="mb-6 inline-block text-sm font-semibold text-[#0057E7] transition hover:text-[#0A66FF]"
        >
          ← Back to blog
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-8">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0057E7]">LASOP Blog</p>
            <h1 className="mb-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl">
              {post.main_heading}
            </h1>

            <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#0057E7]">
                {initial}
              </span>
              <div className="text-sm">
                <p className="font-semibold text-slate-900">{author}</p>
                <p className="text-slate-400">
                  {formatDate(post.date_published)} · {minutes} min read
                </p>
              </div>
            </div>

            <ImageSlider images={images} />

            {post.intro_text && (
              <p className="mt-6 whitespace-pre-line text-[16px] leading-relaxed text-slate-700">
                {post.intro_text}
              </p>
            )}

            {(post.sections || []).map(
              (section, i) =>
                (section.subheading || section.text || (section.images || []).length > 0) && (
                  <div key={section.id || i} className="mt-10 space-y-4 border-t border-slate-100 pt-10">
                    {section.subheading && (
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[13px] font-bold text-[#0057E7]">
                          {i + 1}
                        </span>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">{section.subheading}</h2>
                      </div>
                    )}
                    {section.text && (
                      <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-700">
                        {section.text}
                      </p>
                    )}
                    {(section.images || []).length > 0 && (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {section.images.map((img) => (
                          <img
                            key={img.id}
                            src={img.image}
                            alt=""
                            className="h-36 w-full rounded-lg border border-slate-200 object-cover sm:h-44"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
            )}
          </article>

          <Sidebar postId={post.id} />
        </div>
      </div>
    </main>
  );
}