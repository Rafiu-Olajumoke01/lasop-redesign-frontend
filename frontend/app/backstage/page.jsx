"use client";

import { useEffect, useState, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

const COLORS = {
  bg: "#071224",
  panel: "#0C1B33",
  border: "#16294A",
  accent: "#5EA2FF",
  accentSoft: "#1C3A63",
  text: "#E6EDF7",
  textDim: "#7E91AE",
  danger: "#FF6B6B",
  success: "#4ADE80",
};

const CATEGORY_CHOICES = [
  { value: "technology", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "vocational", label: "Vocational" },
];

// ---------- Small shared bits ----------

function TagInput({ label, items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  };

  const removeTag = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium mb-1.5" style={{ color: COLORS.textDim }}>
        {label}
      </label>
      <div
        className="flex flex-wrap gap-1.5 p-2 rounded-lg border min-h-[44px]"
        style={{ borderColor: COLORS.border, background: COLORS.bg }}
      >
        {items.map((item, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
            style={{ background: COLORS.accentSoft, color: COLORS.accent }}
          >
            {item}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="ml-0.5 hover:opacity-70"
              aria-label={`Remove ${item}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
            if (e.key === "Backspace" && !draft && items.length) {
              removeTag(items.length - 1);
            }
          }}
          placeholder={placeholder || "Type and press Enter"}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-1"
          style={{ color: COLORS.text }}
        />
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium mb-1.5" style={{ color: COLORS.textDim }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: "#071224",
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text,
};

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ${props.className || ""}`}
      style={{ ...inputStyle, ...(props.style || {}) }}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 resize-none"
      style={inputStyle}
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select {...props} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
      {children}
    </select>
  );
}

function Button({ variant = "primary", children, ...props }) {
  const styles = {
    primary: { background: COLORS.accent, color: "#071224" },
    ghost: { background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}` },
    danger: { background: "transparent", color: COLORS.danger, border: `1px solid ${COLORS.danger}33` },
  };
  return (
    <button
      {...props}
      className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-40"
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="p-5 rounded-xl border" style={{ background: COLORS.panel, borderColor: COLORS.border }}>
      <p className="text-xs mb-1" style={{ color: COLORS.textDim }}>
        {label}
      </p>
      <p className="text-3xl font-semibold" style={{ color: COLORS.text }}>
        {value}
      </p>
    </div>
  );
}

// ---------- Course form (create/edit) ----------

function emptyCourse() {
  return {
    title: "",
    slug: "",
    category: "technology",
    fee: "",
    duration: "",
    description: "",
    overview: "",
    featured: false,
    skills: [],
    outcomes: [],
    requirements: [],
    modules: [],
    locations: [],
    imageFile: null,
  };
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CourseForm({ initial, locations, onCancel, onSaved }) {
  const [form, setForm] = useState(initial ? { ...emptyCourse(), ...initial, imageFile: null } : emptyCourse());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleLocation = (id) => {
    setForm((f) => {
      const exists = f.locations.includes(id);
      return { ...f, locations: exists ? f.locations.filter((l) => l !== id) : [...f.locations, id] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("slug", form.slug || slugify(form.title));
    fd.append("category", form.category);
    fd.append("fee", form.fee);
    fd.append("duration", form.duration);
    fd.append("description", form.description);
    fd.append("overview", form.overview);
    fd.append("featured", form.featured);
    fd.append("skills", JSON.stringify(form.skills));
    fd.append("outcomes", JSON.stringify(form.outcomes));
    fd.append("requirements", JSON.stringify(form.requirements));
    fd.append("modules", JSON.stringify(form.modules));
    form.locations.forEach((id) => fd.append("locations", id));
    if (form.imageFile) fd.append("image", form.imageFile);

    try {
      const isEdit = Boolean(initial?.slug);
      const url = isEdit ? `${API}/api/courses/${initial.slug}/` : `${API}/api/courses/`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: fd,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(errData));
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Something went wrong saving this course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Title">
          <TextInput
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Data Analysis"
          />
        </Field>
        <Field label="Slug">
          <TextInput
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder={slugify(form.title) || "auto-generated from title"}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <Select value={form.category} onChange={(e) => update("category", e.target.value)}>
            {CATEGORY_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Duration">
          <TextInput
            required
            value={form.duration}
            onChange={(e) => update("duration", e.target.value)}
            placeholder="8 weeks"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Fee (₦)">
          <TextInput
            required
            type="number"
            step="0.01"
            value={form.fee}
            onChange={(e) => update("fee", e.target.value)}
            placeholder="150000"
          />
        </Field>
        <Field label="Course image">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => update("imageFile", e.target.files?.[0] || null)}
            className="w-full text-sm"
            style={{ color: COLORS.textDim }}
          />
        </Field>
      </div>

      <Field label="Description (short summary)">
        <TextArea
          required
          rows={2}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <Field label="Overview (full detail)">
        <TextArea rows={3} value={form.overview} onChange={(e) => update("overview", e.target.value)} />
      </Field>

      <TagInput label="Skills" items={form.skills} onChange={(v) => update("skills", v)} />
      <TagInput label="Outcomes" items={form.outcomes} onChange={(v) => update("outcomes", v)} />
      <TagInput label="Requirements" items={form.requirements} onChange={(v) => update("requirements", v)} />
      <TagInput label="Modules" items={form.modules} onChange={(v) => update("modules", v)} />

      <Field label="Locations">
        <div className="flex flex-wrap gap-2">
          {locations.length === 0 && (
            <span className="text-xs" style={{ color: COLORS.textDim }}>
              No locations yet — add one in the Locations tab.
            </span>
          )}
          {locations.map((loc) => {
            const active = form.locations.includes(loc.id);
            return (
              <button
                type="button"
                key={loc.id}
                onClick={() => toggleLocation(loc.id)}
                className="px-3 py-1.5 rounded-full text-xs border transition"
                style={{
                  borderColor: active ? COLORS.accent : COLORS.border,
                  background: active ? COLORS.accentSoft : "transparent",
                  color: active ? COLORS.accent : COLORS.textDim,
                }}
              >
                {loc.name}
              </button>
            );
          })}
        </div>
      </Field>

      <label className="flex items-center gap-2 mb-5 text-sm" style={{ color: COLORS.text }}>
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => update("featured", e.target.checked)}
        />
        Featured course
      </label>

      {error && (
        <p className="text-xs mb-3 p-2 rounded-lg" style={{ color: COLORS.danger, background: "#FF6B6B14" }}>
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-end pt-2 border-t" style={{ borderColor: COLORS.border }}>
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : initial?.slug ? "Save changes" : "Create course"}
        </Button>
      </div>
    </form>
  );
}

// ---------- Courses tab ----------

function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | course | "new"
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cRes, lRes] = await Promise.all([
        fetch(`${API}/api/courses/`),
        fetch(`${API}/api/courses/locations/`),
      ]);
      if (!cRes.ok || !lRes.ok) throw new Error("Could not load courses or locations.");
      setCourses(await cRes.json());
      setLocations(await lRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (slug) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    await fetch(`${API}/api/courses/${slug}/`, { method: "DELETE" });
    load();
  };

  if (editing) {
    return (
      <div
        className="p-6 rounded-xl border"
        style={{ background: COLORS.panel, borderColor: COLORS.border }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.text }}>
          {editing === "new" ? "New course" : `Edit “${editing.title}”`}
        </h3>
        <CourseForm
          initial={editing === "new" ? null : editing}
          locations={locations}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: COLORS.text }}>
          Courses
        </h2>
        <Button onClick={() => setEditing("new")}>+ New course</Button>
      </div>

      {loading && <p style={{ color: COLORS.textDim }}>Loading courses…</p>}
      {error && <p style={{ color: COLORS.danger }}>{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <p style={{ color: COLORS.textDim }}>No courses yet. Create the first one above.</p>
      )}

      <div className="grid gap-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between p-4 rounded-xl border"
            style={{ background: COLORS.panel, borderColor: COLORS.border }}
          >
            <div>
              <p className="font-medium" style={{ color: COLORS.text }}>
                {course.title}{" "}
                {course.featured && (
                  <span
                    className="ml-2 text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: COLORS.accentSoft, color: COLORS.accent }}
                  >
                    Featured
                  </span>
                )}
              </p>
              <p className="text-xs mt-0.5" style={{ color: COLORS.textDim }}>
                {course.category} · {course.duration} · ₦{course.fee}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(course)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => handleDelete(course.slug)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Locations tab ----------

function LocationsTab() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", address: "" });
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/courses/locations/`);
      if (!res.ok) throw new Error("Could not load locations.");
      setLocations(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({ name: "", address: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(editingId);
    const url = isEdit ? `${API}/api/courses/locations/${editingId}/` : `${API}/api/courses/locations/`;
    await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    resetForm();
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this location?")) return;
    await fetch(`${API}/api/courses/locations/${id}/`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid grid-cols-[1fr_320px] gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.text }}>
          Locations
        </h2>
        {loading && <p style={{ color: COLORS.textDim }}>Loading…</p>}
        {error && <p style={{ color: COLORS.danger }}>{error}</p>}
        <div className="grid gap-3">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="flex items-center justify-between p-4 rounded-xl border"
              style={{ background: COLORS.panel, borderColor: COLORS.border }}
            >
              <div>
                <p className="font-medium" style={{ color: COLORS.text }}>
                  {loc.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: COLORS.textDim }}>
                  {loc.address}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setForm({ name: loc.name, address: loc.address });
                    setEditingId(loc.id);
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDelete(loc.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {!loading && locations.length === 0 && (
            <p style={{ color: COLORS.textDim }}>No locations yet.</p>
          )}
        </div>
      </div>

      <div
        className="p-5 rounded-xl border self-start"
        style={{ background: COLORS.panel, borderColor: COLORS.border }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: COLORS.text }}>
          {editingId ? "Edit location" : "Add location"}
        </h3>
        <form onSubmit={handleSubmit}>
          <Field label="Name">
            <TextInput
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Lekki Campus"
            />
          </Field>
          <Field label="Address">
            <TextArea
              required
              rows={3}
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="12 Admiralty Way, Lekki Phase 1, Lagos"
            />
          </Field>
          <div className="flex gap-2 justify-end">
            {editingId && (
              <Button variant="ghost" type="button" onClick={resetForm}>
                Cancel
              </Button>
            )}
            <Button type="submit">{editingId ? "Save" : "Add"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Applications tab ----------
// Note: backend currently only exposes "my applications" for the logged-in
// student. This will show empty/error until an admin-only list-all endpoint
// is added on the backend.

function ApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/applications/`, { credentials: "include" });
        if (!res.ok) throw new Error("This endpoint currently only returns the logged-in user's own applications — an admin-wide list endpoint still needs to be added on the backend.");
        setApplications(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.text }}>
        Applications
      </h2>

      {loading && <p style={{ color: COLORS.textDim }}>Loading…</p>}
      {error && (
        <p
          className="text-sm p-3 rounded-lg"
          style={{ color: COLORS.danger, background: "#FF6B6B14" }}
        >
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: COLORS.panel }}>
                {["Student", "Course", "Mode", "Location", "Applied"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-medium text-xs"
                    style={{ color: COLORS.textDim }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td className="px-4 py-3" style={{ color: COLORS.text }}>
                    {app.student}
                  </td>
                  <td className="px-4 py-3" style={{ color: COLORS.text }}>
                    {app.course_detail?.title}
                  </td>
                  <td className="px-4 py-3" style={{ color: COLORS.textDim }}>
                    {app.mode_of_learning}
                  </td>
                  <td className="px-4 py-3" style={{ color: COLORS.textDim }}>
                    {app.location_detail?.name || "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: COLORS.textDim }}>
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center" style={{ color: COLORS.textDim }}>
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- Overview tab ----------

function OverviewTab({ goTo }) {
  const [stats, setStats] = useState({ courses: null, locations: null, applications: null });

  useEffect(() => {
    (async () => {
      try {
        const [c, l] = await Promise.all([
          fetch(`${API}/api/courses/`).then((r) => r.json()),
          fetch(`${API}/api/courses/locations/`).then((r) => r.json()),
        ]);
        setStats((s) => ({ ...s, courses: c.length, locations: l.length }));
      } catch {
        // silently leave as null — individual tabs surface their own errors
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.text }}>
        Overview
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Courses" value={stats.courses ?? "—"} />
        <StatCard label="Locations" value={stats.locations ?? "—"} />
        <StatCard label="Applications" value="—" />
      </div>
      <div className="flex gap-3">
        <Button onClick={() => goTo("courses")}>Manage courses</Button>
        <Button variant="ghost" onClick={() => goTo("locations")}>
          Manage locations
        </Button>
      </div>
    </div>
  );
}

// ---------- Shell ----------

const NAV = [
  { key: "overview", label: "Overview" },
  { key: "courses", label: "Courses" },
  { key: "locations", label: "Locations" },
  { key: "applications", label: "Applications" },
];

export default function BackstagePage() {
  const [tab, setTab] = useState("overview");

  return (
    <div
      className="min-h-screen flex"
      style={{ background: COLORS.bg, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <aside
        className="w-60 shrink-0 border-r px-4 py-6 flex flex-col"
        style={{ borderColor: COLORS.border }}
      >
        <div className="mb-8 px-2">
          <p className="text-xs uppercase tracking-wider" style={{ color: COLORS.textDim }}>
            LASOP
          </p>
          <p className="text-lg font-semibold" style={{ color: COLORS.text }}>
            Backstage
          </p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className="text-left px-3 py-2 rounded-lg text-sm transition"
              style={{
                background: tab === item.key ? COLORS.accentSoft : "transparent",
                color: tab === item.key ? COLORS.accent : COLORS.textDim,
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 max-w-5xl">
        {tab === "overview" && <OverviewTab goTo={setTab} />}
        {tab === "courses" && <CoursesTab />}
        {tab === "locations" && <LocationsTab />}
        {tab === "applications" && <ApplicationsTab />}
      </main>
    </div>
  );
}