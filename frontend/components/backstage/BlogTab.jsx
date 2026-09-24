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
const emptyForm = () => ({ title: '', author: '', body: '', date: today(), image: null });

const BlogTab = () => {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm());

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e) => {
    e.preventDefault();
    const post = {
      id: Date.now(),
      title: form.title,
      author: form.author,
      body: form.body,
      date: form.date,
      image: form.image ? URL.createObjectURL(form.image) : null,
    };
    setPosts((p) => [post, ...p]);
    setForm(emptyForm());
    e.target.reset();
  };

  const remove = (id) => setPosts((p) => p.filter((post) => post.id !== id));

  return (
    <div className="space-y-6">
      <PageHeader title="Blog" subtitle={`${posts.length} post${posts.length !== 1 ? 's' : ''}`} />

      <form
        onSubmit={submit}
        className="bg-white border border-slate-200/80 rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6 space-y-4"
      >
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] pb-4 border-b border-slate-200/80 -mx-6 px-6">
          New post
        </h3>

        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Post title"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Author">
            <input
              required
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              placeholder="Author name"
              className={inputClass}
            />
          </Field>
          <Field label="Date">
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Post">
          <textarea
            required
            rows={8}
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="Write your post..."
            className={inputClass}
          />
        </Field>

        <Field label="Cover image">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => set('image', e.target.files[0] || null)}
            className={inputClass}
          />
        </Field>

        <PrimaryButton type="submit">Publish post</PrimaryButton>
      </form>

      <div className="space-y-3">
        {posts.length === 0 && (
          <Card>
            <EmptyState title="No posts yet" hint="Posts you publish will show up here." />
          </Card>
        )}
        {posts.map((post) => (
          <Card key={post.id} interactive className="p-4 flex gap-4 items-start">
            {post.image && (
              <img src={post.image} alt="" className="w-24 h-24 object-cover rounded-md border border-slate-200" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 tracking-tight">{post.title}</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                {post.author} · {formatDate(post.date)}
              </p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3 whitespace-pre-line">
                {post.body}
              </p>
            </div>
            <LinkButton danger onClick={() => remove(post.id)}>Delete</LinkButton>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogTab;