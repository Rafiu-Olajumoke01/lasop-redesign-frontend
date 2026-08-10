'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function initials(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function getStudentName(s) {
  const full = `${s?.first_name || ''} ${s?.last_name || ''}`.trim();
  return full || s?.email || 'Student';
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFileName(url) {
  if (!url) return '';
  try {
    const clean = url.split('?')[0];
    return decodeURIComponent(clean.split('/').pop());
  } catch {
    return 'certificate file';
  }
}

function formatMoney(n) {
  return `₦${Number(n || 0).toLocaleString()}`;
}

function getCourseTitle(a) {
  return a.course_detail?.title || a.course?.title || a.course_title || null;
}

function getCourseFee(a) {
  return Number(a.course_detail?.fee ?? a.course?.fee ?? a.fee ?? 0);
}

function getTutorLabel(t) {
  const u = t.user_detail;
  if (!u) return 'Unnamed tutor';
  return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
}

const inputClass =
  'w-full bg-white border border-slate-300 focus:border-[#0057E7] focus:ring-2 focus:ring-[#0057E7]/15 ' +
  'outline-none rounded-md px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition';

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function DocumentIcon({ className }) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  );
}

function UploadCloudIcon({ className }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 16l-4-4-4 4" />
      <path d="M12 12v9" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}

function CheckCircleIcon({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12l2.5 2.5 5-5" />
    </svg>
  );
}

function ModePill({ mode }) {
  if (!mode) return null;
  return (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-wide bg-blue-50 text-[#0057E7] border-blue-200/80">
      {mode}
    </span>
  );
}

function PaymentPill({ payment }) {
  if (!payment) return <span className="text-slate-400 text-xs">—</span>;
  const map = {
    pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600 border-slate-200/80' },
    awaiting_confirmation: { label: 'In review', color: 'bg-amber-50 text-amber-700 border-amber-200/80' },
    paid: { label: 'Paid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' },
    expired: { label: 'Expired', color: 'bg-rose-50 text-rose-700 border-rose-200/80' },
    failed: { label: 'Failed', color: 'bg-rose-50 text-rose-700 border-rose-200/80' },
  };
  const cfg = map[payment.status] || { label: payment.status, color: 'bg-slate-100 text-slate-600 border-slate-200/80' };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-wide ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── Certificate panel ──────────────────────────────────────────────────────

function CertificatePanel({ studentId, certificate, token, onUploaded }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [issuedDate, setIssuedDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [replacing, setReplacing] = useState(false);
  const fileInputRef = useRef(null);

  const hasCertificate = !!certificate;
  const showForm = !hasCertificate || replacing;

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Choose a file first.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (issuedDate) formData.append('issued_date', issuedDate);

      const res = await fetch(`${API_BASE}/api/certificate/upload/${studentId}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const raw = await res.text();
        let details = '';
        try {
          const errorData = JSON.parse(raw);
          details = Object.entries(errorData)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ');
        } catch {
          details = `HTTP ${res.status}`;
        }
        throw new Error(details || 'Upload failed.');
      }

      const data = await res.json();
      onUploaded(data);
      setFile(null);
      setIssuedDate('');
      setReplacing(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const tone = uploading
    ? { ring: 'ring-[#0057E7]/20', border: 'border-[#0057E7]/40', bg: 'bg-blue-50/60', bar: 'bg-[#0057E7]', text: 'text-[#0057E7]' }
    : hasCertificate && !showForm
      ? { ring: 'ring-emerald-500/15', border: 'border-emerald-200', bg: 'bg-emerald-50/50', bar: 'bg-emerald-500', text: 'text-emerald-700' }
      : { ring: 'ring-slate-500/10', border: 'border-slate-200', bg: 'bg-white', text: 'text-slate-500' };

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${tone.border} ${tone.bg} shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ${tone.ring} transition-colors duration-300`}>
      {tone.bar && <span className={`absolute left-0 top-0 bottom-0 w-1 ${tone.bar}`} />}
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-1">Certificate</p>
            <h3 className="text-slate-900 font-bold text-lg tracking-tight">
              {hasCertificate && !showForm ? 'Ready to download' : hasCertificate ? 'Replace certificate' : 'Not uploaded yet'}
            </h3>
          </div>
          {hasCertificate && !showForm && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              Ready
            </span>
          )}
        </div>

        {hasCertificate && !showForm && (
          <div>
            <div className="flex items-center gap-3 bg-white border border-emerald-200/70 rounded-xl px-4 py-3.5 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <DocumentIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-800 font-semibold text-sm truncate">{formatFileName(certificate.file)}</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {certificate.issued_date ? `Issued ${formatDate(certificate.issued_date)}` : `Uploaded ${formatDate(certificate.uploaded_at)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={certificate.file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-[#0057E7] hover:bg-[#0A66FF] text-white text-sm font-semibold px-4 py-2.5 rounded-md shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.97]"
              >
                Download certificate
              </a>
              <button
                onClick={() => setReplacing(true)}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 px-4 py-2.5 rounded-md border border-slate-200 hover:border-slate-300 transition"
              >
                Replace
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div>
            {replacing && (
              <button
                onClick={() => { setReplacing(false); setFile(null); setError(''); }}
                className="text-[12px] font-semibold text-slate-400 hover:text-slate-600 mb-3 inline-flex items-center gap-1"
              >
                <BackArrow /> Cancel
              </button>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-[13px] rounded-lg px-3.5 py-2.5 mb-4">
                <span className="mt-0.5 shrink-0">⚠</span>{error}
              </div>
            )}

            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex flex-col items-center justify-center text-center gap-2 rounded-xl border-2 border-dashed
                px-4 py-8 cursor-pointer transition-colors duration-150
                ${dragOver ? 'border-[#0057E7] bg-blue-50/60' : 'border-slate-300 hover:border-slate-400 bg-white'}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${file ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                {file ? <DocumentIcon className="w-5 h-5" /> : <UploadCloudIcon className="w-5 h-5" />}
              </div>
              {file ? (
                <div>
                  <p className="text-slate-800 font-semibold text-sm">{file.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">Click to choose a different file</p>
                </div>
              ) : (
                <div>
                  <p className="text-slate-700 font-semibold text-sm">Drop a file here, or click to browse</p>
                  <p className="text-slate-400 text-xs mt-0.5">PDF, PNG, or JPG</p>
                </div>
              )}
            </label>

            <div className="mt-4">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]">
                Issue date <span className="text-slate-300 normal-case font-medium">(optional)</span>
              </label>
              <input
                type="date"
                className={inputClass}
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="w-full mt-5 bg-[#0057E7] hover:bg-[#0A66FF] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-md shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.97]"
            >
              {uploading ? 'Uploading…' : hasCertificate ? 'Save new certificate' : 'Upload certificate'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Course applications panel ─────────────────────────────────────────────

function CourseApplicationsPanel({ studentId, token }) {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [assigningCohortId, setAssigningCohortId] = useState(null);
  const [assigningTutorId, setAssigningTutorId] = useState(null);
  const [actionError, setActionError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [appsRes, cohortsRes, tutorsRes] = await Promise.all([
        fetch(`${API_BASE}/api/applications/grouped/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/cohorts/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/tutors/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!appsRes.ok) throw new Error('Could not load course applications.');
      if (!cohortsRes.ok) throw new Error('Could not load cohorts.');
      if (!tutorsRes.ok) throw new Error('Could not load tutors.');

      const appsData = await appsRes.json();
      const cohortsData = await cohortsRes.json();
      const tutorsData = await tutorsRes.json();

      const group = (Array.isArray(appsData) ? appsData : []).find(
        (g) => Number(g.student.id) === Number(studentId)
      );

      setApplications(group ? group.courses : []);
      setCohorts(Array.isArray(cohortsData) ? cohortsData : cohortsData.results || []);
      setTutors(Array.isArray(tutorsData) ? tutorsData : tutorsData.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [studentId, token]);

  useEffect(() => { if (token) loadAll(); }, [token, loadAll]);

  const handleAssignCohort = async (application, cohortIdRaw) => {
    setActionError('');
    setAssigningCohortId(application.id);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${application.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cohort: cohortIdRaw === '' ? null : Number(cohortIdRaw) }),
      });
      if (!res.ok) throw new Error('Could not assign cohort.');
      await loadAll();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setAssigningCohortId(null);
    }
  };

  const handleAssignTutor = async (application, tutorIdRaw) => {
    setActionError('');
    setAssigningTutorId(application.id);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${application.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tutor: tutorIdRaw === '' ? null : Number(tutorIdRaw) }),
      });
      if (!res.ok) throw new Error('Could not assign tutor.');
      await loadAll();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setAssigningTutorId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="px-6 sm:px-7 py-5 border-b border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-1">Course applications</p>
        <h3 className="text-slate-900 font-bold text-lg tracking-tight">
          {loading ? 'Loading…' : `${applications.length} course${applications.length !== 1 ? 's' : ''} applied`}
        </h3>
      </div>

      {error && (
        <div className="px-6 sm:px-7 pt-4">
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">
            <span className="mt-0.5 shrink-0">⚠</span>{error}
          </div>
        </div>
      )}

      {actionError && (
        <div className="px-6 sm:px-7 pt-4">
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">
            <span className="mt-0.5 shrink-0">⚠</span>{actionError}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#0057E7] animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading course applications…</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-slate-700 font-semibold mb-1">No course applications yet</p>
          <p className="text-slate-400 text-sm">This student hasn't applied to any course.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {applications.map((a) => {
            const isOpen = openId === a.id;
            const course = getCourseTitle(a);
            const total = getCourseFee(a);
            const paid = a.amount_paid;
            return (
              <div key={a.id}>
                <div className="w-full flex items-center justify-between px-6 sm:px-7 py-4 hover:bg-slate-50/70 transition">
                  <button
                    onClick={() => setOpenId(isOpen ? null : a.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-slate-800 font-semibold text-sm truncate">{course || '—'}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <ModePill mode={a.mode_of_learning} />
                      <PaymentPill payment={a.payment} />
                    </div>
                  </button>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/backstage/students/${studentId}/courses/${a.id}`);
                      }}
                      className="text-[12px] font-semibold text-[#0057E7] hover:text-[#0A66FF] transition hover:underline underline-offset-2"
                    >
                      View full details
                    </button>
                    <button onClick={() => setOpenId(isOpen ? null : a.id)} aria-label="Toggle details">
                      <ChevronIcon open={isOpen} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-6 sm:px-7 pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-3.5">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Fees</p>
                        <p className="text-slate-700 text-sm">Total: {formatMoney(total)}</p>
                        <p className="text-slate-700 text-sm">Paid: {paid ? formatMoney(paid) : '—'}</p>
                        <p className="text-slate-700 text-sm">Bal: {paid ? formatMoney(total - Number(paid)) : formatMoney(total)}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-3.5">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Applied</p>
                        <p className="text-slate-700 text-sm">{formatDate(a.created_at) || '—'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]">Cohort</label>
                        <select
                          className={inputClass}
                          value={a.cohort_detail?.id ?? a.cohort ?? ''}
                          disabled={assigningCohortId === a.id}
                          onChange={(e) => handleAssignCohort(a, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {cohorts.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-[0.1em]">Tutor</label>
                        <select
                          className={inputClass}
                          value={a.tutor_detail?.id ?? a.tutor ?? ''}
                          disabled={assigningTutorId === a.id}
                          onChange={(e) => handleAssignTutor(a, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {tutors.map((t) => (
                            <option key={t.id} value={t.id}>{getTutorLabel(t)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Info row ───────────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-slate-400 text-[13px] font-medium">{label}</span>
      <span className="text-slate-800 text-[13.5px] font-semibold text-right">{value || '—'}</span>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id;

  const [token, setToken] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('access');
    if (!t) { router.push('/login'); return; }
    const verifyStaff = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/profile/`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          router.push('/login');
          return;
        }
        const profile = await res.json();
        if (!profile.is_staff) { router.push('/dashboard'); return; }
        setToken(t);
        setAuthChecked(true);
      } catch { router.push('/login'); }
    };
    verifyStaff();
  }, []);

  const fetchStudent = useCallback(async (t) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/users/students/${studentId}/`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error('Could not load this student.');
      const data = await res.json();
      setStudent(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (authChecked && token) fetchStudent(token);
  }, [authChecked, token, fetchStudent]);

  const handleUploaded = (certificateData) => {
    setStudent((prev) => ({ ...prev, certificate: certificateData }));
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-[#0057E7] animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">{!authChecked ? 'Verifying access…' : 'Loading student…'}</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-200 mx-auto mb-4 flex items-center justify-center text-xl">⚠</div>
          <p className="text-slate-700 font-semibold mb-1">Couldn't load this student</p>
          <p className="text-slate-400 text-sm mb-5">{error || 'Something went wrong.'}</p>
          <button
            onClick={() => router.push('/backstage')}
            className="text-sm font-semibold text-[#0057E7] hover:text-[#0A66FF]"
          >
            ← Back to Backstage
          </button>
        </div>
      </div>
    );
  }

  const name = getStudentName(student);
  const tutorName = student.assigned_tutor_detail?.name;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
            aria-label="Go back"
          >
            <BackArrow />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Student profile</p>
            <p className="text-slate-800 font-semibold text-sm truncate">{name}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6 sm:p-8 mb-6">
          <div
            className="absolute inset-x-0 top-0 h-24"
            style={{ background: 'linear-gradient(135deg, #0057E7 0%, #0A66FF 45%, #2E8BFF 100%)', opacity: 0.06 }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #0057E7, #2E8BFF)' }}
            >
              {initials(name)}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-slate-900 font-bold text-xl sm:text-2xl tracking-tight truncate">{name}</h1>
              <p className="text-slate-400 text-sm mt-0.5 truncate">{student.email}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {tutorName ? (
                  <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-wide bg-blue-50 text-[#0057E7] border-blue-200/80">
                    Tutor: {tutorName}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-wide bg-rose-50 text-rose-700 border-rose-200/80">
                    No tutor assigned
                  </span>
                )}
                {student.certificate ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-wide bg-emerald-50 text-emerald-700 border-emerald-200/80">
                    <CheckCircleIcon className="w-3 h-3" /> Certificate ready
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border tracking-wide bg-slate-100 text-slate-500 border-slate-200/80">
                    Certificate not ready
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6 sm:p-7 h-fit">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">Details</p>
            <InfoRow label="Full name" value={name} />
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Phone" value={student.phone_number} />
            <InfoRow label="Gender" value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : null} />
            <InfoRow label="Assigned tutor" value={tutorName} />
          </div>

          <div className="lg:col-span-3">
            <CertificatePanel
              studentId={studentId}
              certificate={student.certificate}
              token={token}
              onUploaded={handleUploaded}
            />
          </div>
        </div>

        <CourseApplicationsPanel studentId={studentId} token={token} />
      </div>
    </div>
  );
}