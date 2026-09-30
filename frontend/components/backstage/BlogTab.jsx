'use client';

import { useState, useEffect } from 'react';

const formatDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Card = ({ children, className = '', interactive = false }) => (
  <div
    className={`bg-white border border-slate-200/80 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]
      ${interactive ? 'hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:border-slate-300 transition-all duration-200' : ''}
      ${className}`}
  >
    {children}
  </div>
);

const EmptyState = ({ title, hint }) => (
  <div className="py-20 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 mx-auto mb-4 flex items-center justify-center text-2xl">
      📭
    </div>
    <p className="text-slate-700 font-semibold mb-1">{title}</p>
    {hint && <p className="text-slate-400 text-sm">{hint}</p>}
  </div>
);

const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-40 text-white text-sm font-semibold px-5 py-3 rounded-lg
      shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.97] ${className}`}
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold px-4 py-2.5
      rounded-lg border-2 border-dashed border-slate-300 hover:border-[#0057E7] hover:text-[#0057E7] transition-all duration-150 ${className}`}
  >
    {children}
  </button>
);

const LinkButton = ({ children, danger, ...props }) => (
  <button
    {...props}
    className={`text-[12.5px] font-semibold transition hover:underline underline-offset-2 ${
      danger ? 'text-rose-500 hover:text-rose-600' : 'text-[#0057E7] hover:text-[#0A66FF]'
    }`}
  >
    {children}
  </button>
);

const inputClass =
  'w-full bg-white border border-slate-200 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 ' +
  'outline-none rounded-lg px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition';

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-[0.12em]">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-slate-400 mt-1.5">{hint}</p>}
  </div>
);

const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
    <div>
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
  </div>
);

const today = () => new Date().toISOString().slice(0, 10);

const emptySection = () => ({
  id: Date.now() + Math.random(),
  subheading: '',
  text: '',
  images: [],
});

const emptyForm = () => ({
  main_heading: '',
  intro_text: '',
  intro_images: [],
  date_published: today(),
  sections: [emptySection()],
});

// ─── Image picker (multi) ──────────────────────────────────────────────────

const ImagesField = ({ label, images, onChange, hint }) => {
  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    onChange([...images, ...files]);
  };

  const removeAt = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <Field label={label} hint={hint}>
      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-[#0057E7] hover:bg-blue-50/30 rounded-lg py-5 cursor-pointer transition-all text-slate-400 hover:text-[#0057E7]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span className="text-sm font-semibold">Add images</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </label>
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
          {images.map((file, idx) => (
            <div key={idx} className="relative group aspect-square">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="w-full h-full object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </Field>
  );
};

// ─── One section block ──────────────────────────────────────────────────────

const SectionBlock = ({ index, section, onChange, onRemove, canRemove }) => {
  const set = (key, value) => onChange({ ...section, [key]: value });

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-[#0057E7] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <p className="text-[12px] font-bold text-slate-600">Section {index + 1}</p>
        </div>
        {canRemove && <LinkButton danger onClick={onRemove}>Remove</LinkButton>}
      </div>

      <div className="p-5 space-y-4">
        <Field label="Subheading">
          <input
            value={section.subheading}
            onChange={(e) => set('subheading', e.target.value)}
            placeholder="e.g. Student 1. Ibrahim Ajadi"
            className={inputClass}
          />
        </Field>

        <Field label="Text">
          <textarea
            rows={4}
            value={section.text}
            onChange={(e) => set('text', e.target.value)}
            placeholder="Write about this section..."
            className={inputClass}
          />
        </Field>

        <ImagesField
          label="Images"
          images={section.images}
          onChange={(images) => set('images', images)}
        />
      </div>
    </div>
  );
};

// ─── Post row (compact, expands to full preview) ──────────────────────────

const PostRow = ({ post, token, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  const [full, setFull] = useState(null);
  const [loadingFull, setLoadingFull] = useState(false);

  const toggle = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (full) return;
    setLoadingFull(true);
    try {
      const res = await fetch(`${API_BASE}/api/blog/${post.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setFull(await res.json());
    } finally {
      setLoadingFull(false);
    }
  };

  return (
    <Card>
      <button onClick={toggle} className="w-full flex items-center gap-4 p-4 text-left">
        <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
          {post.cover_image ? (
            <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg">📰</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 tracking-tight truncate">{post.main_heading}</p>
          <p className="text-slate-400 text-xs mt-0.5">
            {formatDate(post.date_published)} · {post.status === 'published' ? 'Published' : 'Draft'}
          </p>
        </div>
        <svg
          className={`text-slate-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-slate-100">
          {loadingFull ? (
            <p className="text-slate-400 text-sm py-10 text-center">Loading post…</p>
          ) : full ? (
            <PostPreview post={full} onRemove={onRemove} bare />
          ) : (
            <p className="text-rose-500 text-sm py-10 text-center">Could not load this post.</p>
          )}
        </div>
      )}
    </Card>
  );
};

// ─── Post preview (published list) ─────────────────────────────────────────

const PostPreview = ({ post, onRemove, bare = false }) => {
  const introImages = post.intro_images || [];
  const [cover, ...restIntroImages] = introImages;
  const Wrapper = bare ? 'div' : Card;
  const wrapperProps = bare ? {} : { interactive: true, className: 'overflow-hidden' };

  return (
    <Wrapper {...wrapperProps}>
      {cover && (
        <div className={`w-full overflow-hidden ${bare ? 'h-56' : 'h-56 sm:h-72'}`}>
          <img src={cover.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-[#0057E7] uppercase tracking-[0.14em] mb-2">
              {formatDate(post.date_published)}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {post.main_heading}
            </h2>
          </div>
          <LinkButton danger onClick={() => onRemove(post.id)}>Delete</LinkButton>
        </div>

        {post.intro_text && (
          <p className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-line">{post.intro_text}</p>
        )}

        {restIntroImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {restIntroImages.map((img) => (
              <img key={img.id} src={img.image} alt="" className="w-full h-40 object-cover rounded-lg border border-slate-200" />
            ))}
          </div>
        )}

        {(post.sections || []).map((s, i) => (
          (s.subheading || s.text || (s.images || []).length > 0) && (
            <div key={s.id || i} className="pt-6 border-t border-slate-100 space-y-3.5">
              {s.subheading && (
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-[#0057E7] text-[12px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{s.subheading}</h3>
                </div>
              )}
              {s.text && (
                <p className="text-slate-600 text-[14.5px] leading-relaxed whitespace-pre-line pl-0.5">{s.text}</p>
              )}
              {(s.images || []).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {s.images.map((img) => (
                    <img key={img.id} src={img.image} alt="" className="w-full h-36 object-cover rounded-lg border border-slate-200" />
                  ))}
                </div>
              )}
            </div>
          )
        ))}
      </div>
    </Wrapper>
  );
};

// ─── Main tab ───────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const BlogTab = ({ token }) => {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/blog/?all=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Could not load posts.');
        setPosts(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateSection = (idx, updated) => {
    setForm((f) => {
      const sections = [...f.sections];
      sections[idx] = updated;
      return { ...f, sections };
    });
  };

  const addSection = () => {
    setForm((f) => ({ ...f, sections: [...f.sections, emptySection()] }));
  };

  const removeSection = (idx) => {
    setForm((f) => ({ ...f, sections: f.sections.filter((_, i) => i !== idx) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('main_heading', form.main_heading);
      fd.append('intro_text', form.intro_text);
      fd.append('date_published', form.date_published);
      fd.append('status', 'published');
      form.intro_images.forEach((file) => fd.append('intro_images', file));

      fd.append('section_count', form.sections.length);
      form.sections.forEach((s, i) => {
        fd.append(`sections[${i}][subheading]`, s.subheading);
        fd.append(`sections[${i}][text]`, s.text);
        s.images.forEach((file) => fd.append(`sections[${i}][images]`, file));
      });

      const res = await fetch(`${API_BASE}/api/blog/create/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        let detail = 'Could not publish post.';
        try {
          const data = await res.json();
          detail = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ') || detail;
        } catch {}
        throw new Error(detail);
      }
      const created = await res.json();
      setPosts((p) => [created, ...p]);
      setForm(emptyForm());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/blog/${id}/delete/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not delete post.');
      setPosts((p) => p.filter((post) => post.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader title="Blog" subtitle={`${posts.length} post${posts.length !== 1 ? 's' : ''}`} />

      {error && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">
          <span className="mt-0.5 shrink-0">⚠</span>
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <Card className="p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <span className="w-7 h-7 rounded-lg bg-[#0057E7] text-white flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
            <p className="text-[13px] font-bold text-slate-700">New post</p>
          </div>

          <Field label="Main heading">
            <input
              required
              value={form.main_heading}
              onChange={(e) => set('main_heading', e.target.value)}
              placeholder="e.g. Top 10 Best Students In LASOP"
              className={`${inputClass} text-base font-semibold`}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start">
            <Field label="Intro text">
              <textarea
                rows={4}
                value={form.intro_text}
                onChange={(e) => set('intro_text', e.target.value)}
                placeholder="Introduce the post..."
                className={inputClass}
              />
            </Field>
            <Field label="Date published">
              <input
                required
                type="date"
                value={form.date_published}
                onChange={(e) => set('date_published', e.target.value)}
                className={`${inputClass} sm:w-44`}
              />
            </Field>
          </div>

          <ImagesField
            label="Intro images"
            hint="First image becomes the cover photo."
            images={form.intro_images}
            onChange={(images) => set('intro_images', images)}
          />
        </Card>

        <div className="space-y-3">
          {form.sections.map((section, idx) => (
            <SectionBlock
              key={section.id}
              index={idx}
              section={section}
              onChange={(updated) => updateSection(idx, updated)}
              onRemove={() => removeSection(idx)}
              canRemove={form.sections.length > 1}
            />
          ))}
          <SecondaryButton type="button" onClick={addSection} className="w-full justify-center flex items-center gap-1.5">
            <span className="text-base leading-none">+</span> Add section
          </SecondaryButton>
        </div>

        <PrimaryButton type="submit" disabled={saving} className="w-full justify-center text-[15px]">
          {saving ? 'Publishing…' : 'Publish post'}
        </PrimaryButton>
      </form>
      <div className="space-y-3">
        {loading && (
          <p className="text-slate-400 text-sm py-10 text-center">Loading posts…</p>
        )}
        {!loading && posts.length === 0 && (
          <Card>
            <EmptyState title="No posts yet" hint="Posts you publish will show up here." />
          </Card>
        )}
        {posts.map((post) => (
          <PostRow key={post.id} post={post} token={token} onRemove={remove} />
        ))}
      </div>
    </div>
  );
};

export default BlogTab;