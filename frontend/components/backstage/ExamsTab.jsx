'use client';

import { useState } from 'react';
import {
  Card, EmptyState, Spinner, ErrorBanner, PrimaryButton, LinkButton,
  Field, Modal, PageHeader, Pill, inputClass, useAdminResource, formatDate,
} from './Shared';

const emptyExam = {
  title: '', cohort: '', course: '', exam_type: 'project',
  start_date: '', due_date: '', total_marks: 100, pass_mark: 50, instructions: '',
};

export default function ExamsTab({ token }) {
  const exams = useAdminResource(
    { label: 'exams', basePath: '/api/exams/', detailPath: (e) => `/api/exams/${e.id}/` },
    token
  );
  const cohorts = useAdminResource(
    { label: 'cohorts', basePath: '/api/cohorts/', detailPath: (c) => `/api/cohorts/${c.id}/` },
    token
  );
  const courses = useAdminResource(
    { label: 'courses', basePath: '/api/courses/', detailPath: (c) => `/api/courses/${c.slug}/` },
    token
  );

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyExam);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const openNew = () => { setForm(emptyExam); setModal('new'); setErr(''); };
  const openEdit = (e) => {
    setForm({
      ...emptyExam,
      ...e,
      cohort: e.cohort_detail?.id ?? e.cohort ?? '',
      course: e.course_detail?.id ?? e.course ?? '',
    });
    setModal(e);
    setErr('');
  };
  const close = () => setModal(null);

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      await exams.save(form, modal === 'new' ? null : modal);
      close();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const getCohortName = (e) => e.cohort_detail?.name || cohorts.items.find((c) => c.id === e.cohort)?.name || '—';
  const getCourseName = (e) => e.course_detail?.title || courses.items.find((c) => c.id === e.course)?.title || '—';

  return (
    <div>
      <PageHeader title="Exams" subtitle={`${exams.items.length} exam${exams.items.length !== 1 ? 's' : ''}`}>
        <PrimaryButton onClick={openNew}>+ Add exam</PrimaryButton>
      </PageHeader>
      <ErrorBanner message={exams.error} />
      {exams.loading ? <Spinner text="Loading exams…" /> : exams.items.length === 0 ? (
        <Card><EmptyState title="No exams yet" hint="Create an exam for a cohort to get started." /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                  {['Title', 'Course', 'Cohort', 'Type', 'Start', 'Due', 'Status', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exams.items.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition last:border-0">
                    <td className="px-5 py-4 text-slate-800 font-semibold">{e.title}</td>
                    <td className="px-5 py-4 text-slate-500">{getCourseName(e)}</td>
                    <td className="px-5 py-4 text-slate-500">{getCohortName(e)}</td>
                    <td className="px-5 py-4"><Pill color="indigo">{e.exam_type}</Pill></td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{formatDate(e.start_date)}</td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{formatDate(e.due_date)}</td>
                    <td className="px-5 py-4">
                      <Pill color={e.is_open ? 'emerald' : 'slate'}>{e.is_open ? 'Open' : 'Closed'}</Pill>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <LinkButton onClick={() => openEdit(e)}>Edit</LinkButton>
                      <span className="text-slate-300 mx-2">·</span>
                      <LinkButton danger onClick={() => exams.remove(e)}>Delete</LinkButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'Add new exam' : 'Edit exam'} onClose={close}>
          <div className="space-y-4">
            {err && <ErrorBanner message={err} />}
            <Field label="Title">
              <input className={inputClass} value={form.title} onChange={(ev) => setForm({ ...form, title: ev.target.value })} placeholder="e.g. Final Project — Build a Portfolio Site" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cohort">
                <select className={inputClass} value={form.cohort} onChange={(ev) => setForm({ ...form, cohort: ev.target.value })}>
                  <option value="">Select cohort</option>
                  {cohorts.items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Course">
                <select className={inputClass} value={form.course} onChange={(ev) => setForm({ ...form, course: ev.target.value })}>
                  <option value="">Select course</option>
                  {courses.items.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Exam type">
              <select className={inputClass} value={form.exam_type} onChange={(ev) => setForm({ ...form, exam_type: ev.target.value })}>
                <option value="quiz">Quiz</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final Assessment</option>
                <option value="project">Project Assessment</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date">
                <input type="date" className={inputClass} value={form.start_date} onChange={(ev) => setForm({ ...form, start_date: ev.target.value })} />
              </Field>
              <Field label="Due date">
                <input type="date" className={inputClass} value={form.due_date} onChange={(ev) => setForm({ ...form, due_date: ev.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Total marks">
                <input type="number" className={inputClass} value={form.total_marks} onChange={(ev) => setForm({ ...form, total_marks: ev.target.value })} />
              </Field>
              <Field label="Pass mark">
                <input type="number" className={inputClass} value={form.pass_mark} onChange={(ev) => setForm({ ...form, pass_mark: ev.target.value })} />
              </Field>
            </div>
            <Field label="Instructions">
              <textarea className={inputClass} rows={4} value={form.instructions} onChange={(ev) => setForm({ ...form, instructions: ev.target.value })} placeholder="Project brief / requirements shown to students" />
            </Field>
            <PrimaryButton className="w-full justify-center" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save exam'}
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}