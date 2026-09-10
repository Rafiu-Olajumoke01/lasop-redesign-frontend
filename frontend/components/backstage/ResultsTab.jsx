'use client';

import { useState, useMemo } from 'react';
import {
  Card, EmptyState, Spinner, ErrorBanner, PrimaryButton, LinkButton,
  Field, Modal, PageHeader, Pill, inputClass, useAdminResource, formatDate,
} from './Shared';

const emptyResult = { exam: '', student: '', score: '', status: 'pending', submitted_at: '', feedback: '' };

export default function ResultsTab({ token }) {
  const results = useAdminResource(
    { label: 'results', basePath: '/api/results/', detailPath: (r) => `/api/results/${r.id}/` },
    token
  );
  const exams = useAdminResource(
    { label: 'exams', basePath: '/api/exams/', detailPath: (e) => `/api/exams/${e.id}/` },
    token
  );
  const applications = useAdminResource(
    { label: 'applications', basePath: '/api/applications/', detailPath: (a) => `/api/applications/${a.id}/` },
    token
  );

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyResult);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('all');

  const students = useMemo(() => {
    const map = new Map();
    applications.items.forEach((a) => {
      const s = a.student_detail || a.student || a.user_detail || a.user;
      if (s && s.id) {
        const name = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email || `Student #${s.id}`;
        map.set(s.id, { id: s.id, name });
      }
    });
    return Array.from(map.values());
  }, [applications.items]);

  const openNew = () => { setForm(emptyResult); setModal('new'); setErr(''); };
  const openEdit = (r) => {
    setForm({
      ...emptyResult,
      ...r,
      exam: r.exam_detail?.id ?? r.exam ?? '',
      student: r.student_detail?.id ?? r.student ?? '',
      score: r.score ?? '',
      submitted_at: r.submitted_at ? r.submitted_at.slice(0, 10) : '',
    });
    setModal(r);
    setErr('');
  };
  const close = () => setModal(null);

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      const payload = { ...form };
      if (payload.score === '') delete payload.score;
      if (!payload.submitted_at) delete payload.submitted_at;
      await results.save(payload, modal === 'new' ? null : modal);
      close();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const filtered = filter === 'all' ? results.items : results.items.filter((r) => r.status === filter);

  const getExamTitle = (r) => r.exam_detail?.title || exams.items.find((e) => e.id === r.exam)?.title || '—';
  const getStudentName = (r) => {
    const s = r.student_detail;
    if (s) return `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email;
    return students.find((s) => s.id === r.student)?.name || '—';
  };

  const statusColor = { pending: 'slate', passed: 'emerald', failed: 'rose' };
  const filters = ['all', 'pending', 'passed', 'failed'];

  return (
    <div>
      <PageHeader title="Results" subtitle={`${filtered.length} of ${results.items.length} total`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition ${filter === f
                ? 'border-[#0057E7] bg-[#0057E7] text-white shadow-sm'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <PrimaryButton onClick={openNew}>+ Add result</PrimaryButton>
      </PageHeader>
      <ErrorBanner message={results.error} />
      {results.loading ? <Spinner text="Loading results…" /> : filtered.length === 0 ? (
        <Card><EmptyState title="No results yet" hint="Nothing matches this filter yet." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  {['Student', 'Exam', 'Score', 'Status', 'Submitted', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition last:border-0">
                    <td className="px-5 py-4 text-slate-800 font-semibold">{getStudentName(r)}</td>
                    <td className="px-5 py-4 text-slate-500">{getExamTitle(r)}</td>
                    <td className="px-5 py-4 text-slate-800 font-bold">{r.score ?? '—'}</td>
                    <td className="px-5 py-4"><Pill color={statusColor[r.status] || 'slate'}>{r.status}</Pill></td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{formatDate(r.submitted_at) || '—'}</td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <LinkButton onClick={() => openEdit(r)}>Edit</LinkButton>
                      <span className="text-slate-300 mx-2">·</span>
                      <LinkButton danger onClick={() => results.remove(r)}>Delete</LinkButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'Add new result' : 'Edit result'} onClose={close}>
          <div className="space-y-4">
            {err && <ErrorBanner message={err} />}
            <Field label="Exam">
              <select className={inputClass} value={form.exam} onChange={(ev) => setForm({ ...form, exam: ev.target.value })}>
                <option value="">Select exam</option>
                {exams.items.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </Field>
            <Field label="Student">
              <select className={inputClass} value={form.student} onChange={(ev) => setForm({ ...form, student: ev.target.value })}>
                <option value="">Select student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Score">
                <input type="number" className={inputClass} value={form.score} onChange={(ev) => setForm({ ...form, score: ev.target.value })} placeholder="Out of total marks" />
              </Field>
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(ev) => setForm({ ...form, status: ev.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </Field>
            </div>
            <Field label="Submitted date">
              <input type="date" className={inputClass} value={form.submitted_at} onChange={(ev) => setForm({ ...form, submitted_at: ev.target.value })} />
            </Field>
            <Field label="Feedback">
              <textarea className={inputClass} rows={3} value={form.feedback} onChange={(ev) => setForm({ ...form, feedback: ev.target.value })} placeholder="Optional feedback for the student" />
            </Field>
            <PrimaryButton className="w-full justify-center" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save result'}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}