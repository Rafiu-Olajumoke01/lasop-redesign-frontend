'use client';

import { useState } from 'react';
import {
  Card, EmptyState, Spinner, ErrorBanner, PrimaryButton, LinkButton,
  Field, Modal, PageHeader, Pill, inputClass, useAdminResource,
  formatDate, DAY_LABELS,
} from './Shared';
import { CohortsTodaySection, CohortDetailModal } from './OverviewTab';

const emptyCohort = { name: '', start_date: '', end_date: '', status: 'upcoming', class_days: [] };

export default function CohortsTab({ token, onMessageCohort }) {
  const cohorts = useAdminResource(
    { label: 'cohorts', basePath: '/api/cohorts/', detailPath: (c) => `/api/cohorts/${c.id}/` },
    token
  );

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCohort);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewingCohortId, setViewingCohortId] = useState(null);

  const openNew = () => { setForm(emptyCohort); setModal('new'); setErr(''); };
  const openEdit = (c) => {
    setForm({
      name: c.name,
      start_date: c.start_date || '',
      end_date: c.end_date || '',
      status: c.status,
      class_days: c.class_days || [],
    });
    setModal(c);
    setErr('');
  };
  const close = () => setModal(null);

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      const payload = { ...form };
      if (!payload.end_date) delete payload.end_date;
      await cohorts.save(payload, modal === 'new' ? null : modal);
      close();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const filters = ['all', 'upcoming', 'current', 'completed'];
  const filtered = filter === 'all' ? cohorts.items : cohorts.items.filter((c) => c.status === filter);

  const statusColor = { upcoming: 'blue', current: 'emerald', completed: 'slate' };

  return (
    <div>
      <CohortsTodaySection token={token} onViewCohort={setViewingCohortId} />

      <PageHeader title="Cohorts" subtitle={`${filtered.length} of ${cohorts.items.length} total`}>
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
        <PrimaryButton onClick={openNew}>+ Add cohort</PrimaryButton>
      </PageHeader>

      <ErrorBanner message={cohorts.error} />

      {cohorts.loading ? <Spinner text="Loading cohorts…" /> : filtered.length === 0 ? (
        <Card><EmptyState title="No cohorts yet" hint="Add a cohort to start assigning applicants to it." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} interactive className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-slate-900 font-bold text-base leading-snug pr-4 tracking-tight">{c.name}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <LinkButton onClick={() => setViewingCohortId(c.id)}>View Cohort</LinkButton>
                  <span className="text-slate-300">·</span>
                  <LinkButton onClick={() => openEdit(c)}>Edit</LinkButton>
                  <span className="text-slate-300">·</span>
                  <LinkButton danger onClick={() => cohorts.remove(c)}>Delete</LinkButton>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Pill color={statusColor[c.status] || 'slate'}>{c.status}</Pill>
                {c.current_stage_label && <Pill color="indigo">{c.current_stage_label}</Pill>}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Starts</p>
                  <p className="text-slate-700 font-medium">{formatDate(c.start_date) || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Ends</p>
                  <p className="text-slate-700 font-medium">{formatDate(c.end_date) || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Students</p>
                  <p className="text-slate-700 font-medium">{c.student_count ?? 0}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mb-0.5">Next stage</p>
                  <p className="text-slate-700 font-medium">
                    {c.stage_countdown_days != null ? `${c.stage_countdown_days}d` : '—'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'new' ? 'Add new cohort' : 'Edit cohort'} onClose={close}>
          <div className="space-y-4">
            {err && <ErrorBanner message={err} />}

            <Field label="Name">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. January 2026 Set"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </Field>
              <Field label="End date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Class days">
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(DAY_LABELS).map(([code, label]) => {
                  const checked = form.class_days.includes(code);
                  return (
                    <button
                      type="button"
                      key={code}
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          class_days: checked
                            ? f.class_days.filter((d) => d !== code)
                            : [...f.class_days, code],
                        }));
                      }}
                      className={`text-[12px] font-medium px-2.5 py-1 rounded-full border transition ${checked
                        ? 'border-[#0057E7] bg-[#0057E7] text-white'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <PrimaryButton className="w-full justify-center" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save cohort'}
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {viewingCohortId && (
        <CohortDetailModal
          cohortId={viewingCohortId}
          token={token}
          onClose={() => setViewingCohortId(null)}
          onMessageCohort={onMessageCohort}
        />
      )}
    </div>
  );
}