'use client';

import { useState } from 'react';

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Card({ children, className = '', interactive = false }) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.04)]
        ${interactive ? 'hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:border-slate-300 hover:-translate-y-[1px] transition-all duration-200' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
}

function EmptyState({ title, hint }) {
  return (
    <div className="py-20 text-center">
      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 mx-auto mb-4 flex items-center justify-center text-xl">
        📭
      </div>
      <p className="text-slate-700 font-semibold mb-1">{title}</p>
      {hint && <p className="text-slate-400 text-sm">{hint}</p>}
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3 mb-5">
      <span className="mt-0.5 shrink-0">⚠</span>
      {message}
    </div>
  );
}

function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-md
        shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.97] ${className}`}
    >
      {children}
    </button>
  );
}

function LinkButton({ children, danger, ...props }) {
  return (
    <button
      {...props}
      className={`text-[13px] font-semibold transition hover:underline underline-offset-2 ${danger ? 'text-rose-600 hover:text-rose-700' : 'text-[#0057E7] hover:text-[#0A66FF]'
        }`}
    >
      {children}
    </button>
  );
}

const inputClass =
  'w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 ' +
  'outline-none rounded-md px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]">{label}</label>
      {children}
    </div>
  );
}

function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ title: "", author: "", body: "", date: today(), image: null });

export default function BlogTab() {
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
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">New post</h2>
        <input
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Title"
          className="w-full border border-slate-200 rounded-lg px-3 py-2"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
            placeholder="Author"
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          />
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          />
        </div>
        <textarea
          required
          rows={8}
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          placeholder="Write your post..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => set("image", e.target.files[0] || null)}
          className="block w-full text-sm text-slate-600"
        />
        <button type="submit" className="bg-[#0057E7] text-white rounded-lg px-4 py-2">
          Post
        </button>
      </form>

      <div className="space-y-3">
        {posts.length === 0 && (
          <p className="text-sm text-slate-500">No posts yet.</p>
        )}
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start"
          >
            {post.image && (
              <img src={post.image} alt="" className="w-24 h-24 object-cover rounded-lg" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900">{post.title}</h3>
              <p className="text-sm text-slate-500">
                {post.author} · {post.date}
              </p>
              <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">{post.body}</p>
            </div>
            <button onClick={() => remove(post.id)} className="text-sm text-red-600">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}