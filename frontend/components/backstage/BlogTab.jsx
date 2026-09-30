'use client';

import { useState } from 'react';

const formatDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Card = ({ children, className = '', interactive = false }) => (
  <div
    className={`bg-white border border-slate-200/80 rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.04)]
      ${interactive ? 'hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:border-slate-300 hover:-translate-y-[1px] transition-all duration-200' : ''}
      ${className}`}
  >
    {children}
  </div>
);

const EmptyState = ({ title, hint }) => (
  <div className="py-20 text-center">
    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 mx-auto mb-4 flex items-center justify-center text-xl">
      📭
    </div>
    <p className="text-slate-700 font-semibold mb-1">{title}</p>
    {hint && <p className="text-slate-400 text-sm">{hint}</p>}
  </div>
);

const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-md
      shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.97] ${className}`}
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2.5
      rounded-md border border-slate-200 transition-all duration-150 active:scale-[0.97] ${className}`}
  >
    {children}
  </button>
);

const LinkButton = ({ children, danger, ...props }) => (
  <button
    {...props}
    className={`text-[13px] font-semibold transition hover:underline underline-offset-2 ${
      danger ? 'text-rose-600 hover:text-rose-700' : 'text-[#0057E7] hover:text-[#0A66FF]'
    }`}
  >
    {children}
  </button>
);

const inputClass =
  'w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 ' +
  'outline-none rounded-md px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]">{label}</label>
    {children}
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

const ImagesField = ({ label, images, onChange }) => {
  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    onChange([...images, ...files]);
  };

  const removeAt = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <Field label={label}>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className={inputClass}
      />
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {images.map((file, idx) => (
            <div key={idx} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="w-16 h-16 object-cover rounded-md border border-slate-200"
              />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
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
    <div className="border border-slate-200/80 rounded-lg p-5 space-y-4 bg-slate-50/60">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">
          Section {index + 1}
        </p>
        {canRemove && (
          <LinkButton danger onClick={onRemove}>Remove section</LinkButton>
        )}
      </div>

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
          rows={5}
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
  );
};

// ─── Post preview (published list) ─────────────────────────────────────────

const PostPreview = ({ post, onRemove }) => (
  <Card interactive className="p-6 space-y-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {post.main_heading}
        </h2>
        <p className="text-slate-400 text-xs mt-1.5">{formatDate(post.date_published)}</p>
      </div>
      <LinkButton danger onClick={() => onRemove(post.id)}>Delete</LinkButton>
    </div>

    {post.intro_text && (
      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{post.intro_text}</p>
    )}

    {post.intro_images.length > 0 && (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {post.intro_images.map((src, i) => (
          <img key={i} src={src} alt="" className="w-full h-36 object-cover rounded-md border border-slate-200" />
        ))}
      </div>
    )}

    {post.sections.map((s, i) => (
      <div key={s.id || i} className="pt-5 border-t border-slate-100 space-y-3">
        {s.subheading && (
          <h3 className="text-base font-bold text-slate-900 tracking-tight">{s.subheading}</h3>
        )}
        {s.text && (
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{s.text}</p>
        )}
        {s.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {s.images.map((src, j) => (
              <img key={j} src={src} alt="" className="w-full h-32 object-cover rounded-md border border-slate-200" />
            ))}
          </div>
        )}
      </div>
    ))}
  </Card>
);

// ─── Main tab ───────────────────────────────────────────────────────────────

const BlogTab = () => {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm());

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

  const submit = (e) => {
    e.preventDefault();
    const post = {
      id: Date.now(),
      main_heading: form.main_heading,
      intro_text: form.intro_text,
      intro_images: form.intro_images.map((f) => URL.createObjectURL(f)),
      date_published: form.date_published,
      sections: form.sections.map((s) => ({
        ...s,
        images: s.images.map((f) => URL.createObjectURL(f)),
      })),
    };
    setPosts((p) => [post, ...p]);
    setForm(emptyForm());
  };

  const remove = (id) => setPosts((p) => p.filter((post) => post.id !== id));

  return (
    <div className="space-y-6">
      <PageHeader title="Blog" subtitle={`${posts.length} post${posts.length !== 1 ? 's' : ''}`} />

      <form
        onSubmit={submit}
        className="bg-white border border-slate-200/80 rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6 space-y-5"
      >
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] pb-4 border-b border-slate-200/80 -mx-6 px-6">
          New post
        </h3>

        <Field label="Main heading">
          <input
            required
            value={form.main_heading}
            onChange={(e) => set('main_heading', e.target.value)}
            placeholder="e.g. Top 10 Best Students In LASOP"
            className={inputClass}
          />
        </Field>

        <Field label="Date published">
          <input
            required
            type="date"
            value={form.date_published}
            onChange={(e) => set('date_published', e.target.value)}
            className={`${inputClass} max-w-[220px]`}
          />
        </Field>

        <Field label="Intro text">
          <textarea
            rows={5}
            value={form.intro_text}
            onChange={(e) => set('intro_text', e.target.value)}
            placeholder="Introduce the post..."
            className={inputClass}
          />
        </Field>

        <ImagesField
          label="Intro images"
          images={form.intro_images}
          onChange={(images) => set('intro_images', images)}
        />

        <div className="space-y-4 pt-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">Sections</p>
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
          <SecondaryButton type="button" onClick={addSection}>
            + Add section
          </SecondaryButton>
        </div>

        <PrimaryButton type="submit" className="w-full justify-center">
          Publish post
        </PrimaryButton>
      </form>

      <div className="space-y-4">
        {posts.length === 0 && (
          <Card>
            <EmptyState title="No posts yet" hint="Posts you publish will show up here." />
          </Card>
        )}
        {posts.map((post) => (
          <PostPreview key={post.id} post={post} onRemove={remove} />
        ))}
      </div>
    </div>
  );
};

export default BlogTab;