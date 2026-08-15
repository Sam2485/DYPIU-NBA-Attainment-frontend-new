import { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle2,
  Calendar,
  Archive,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Check,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Users,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import {
  getHodDepartmentSummary,
  getProgrammes,
  getBatches,
  saveBatch,
  deleteBatch,
  getStudentsByBatch,
  saveStudent,
  deleteStudent,
} from '../../api/academic';

// ── Style tokens ─────────────────────────────────────────────────────────────
const surface    = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' };
const ink        = '#0f172a';
const muted      = '#64748b';
const accent     = '#4f46e5';
const inputStyle = {
  height: '40px',
  fontSize: '13px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '0 12px',
  background: '#ffffff',
  color: ink,
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
};
const labelStyle = {
  display: 'block',
  fontSize: '11.5px',
  fontWeight: '600',
  color: muted,
  marginBottom: '5px',
};

export default function HodBatchManagement() {
  const { user } = useAuth();

  const [programmesList, setProgrammesList] = useState([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');
  const [batches, setBatches] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  const selectedProgramme =
    programmesList.find((p) => p.id === selectedProgrammeId) ||
    programmesList[0] ||
    null;

  const durationYears = selectedProgramme.durationYears || 4;

  // ── Add-form state ────────────────────────────────────────────────────────
  const [startYearInput, setStartYearInput] = useState('2025');
  const [endYearInput,   setEndYearInput]   = useState(String(2025 + durationYears));
  const [batchError,     setBatchError]     = useState('');

  // ── Delete confirm modal state for batches ──────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBatch,   setDeletingBatch]   = useState(null);

  // ── Student Roster Screen State ─────────────────────────────────────────
  const [selectedBatchForRoster, setSelectedBatchForRoster] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');

  // Student Edit / Add Modal States
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // null if adding
  const [studentPrn, setStudentPrn] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  // Student Delete Modal States
  const [showDeleteStudentModal, setShowDeleteStudentModal] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  // Load HOD department & programmes
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        let deptId = '';
        if (user?.email) {
          const summaryRes = await getHodDepartmentSummary(user.email);
          const summaryData = summaryRes?.data?.data || summaryRes?.data || summaryRes;
          if (summaryData?.deptId) {
            deptId = summaryData.deptId;
          }
        }
        const progRes = await getProgrammes('', deptId);
        const progList = progRes?.data?.data || progRes?.data || [];
        if (isMounted && Array.isArray(progList) && progList.length > 0) {
          setProgrammesList(progList);
          setSelectedProgrammeId((prev) => prev || progList[0].id);
        }
      } catch (err) {
        console.warn('Failed to load initial programmes for Batch Management:', err);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // Fetch batches for selected programme
  useEffect(() => {
    let isMounted = true;
    const fetchProgrammeBatches = async () => {
      if (!selectedProgrammeId) return;
      try {
        const res = await getBatches(selectedProgrammeId);
        const list = res?.data?.data || res?.data || [];
        if (isMounted) {
          setBatches(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.warn('Failed to fetch batches:', err);
      }
    };

    fetchProgrammeBatches();
    return () => {
      isMounted = false;
    };
  }, [selectedProgrammeId]);

  // Fetch students when a batch roster is opened
  useEffect(() => {
    let isMounted = true;
    const fetchBatchStudents = async () => {
      if (!selectedBatchForRoster?.id) return;
      try {
        const res = await getStudentsByBatch(selectedBatchForRoster.id);
        const list = res?.data?.data || res?.data || [];
        if (isMounted) {
          setStudentsList(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.warn('Failed to fetch students for batch roster:', err);
      }
    };

    fetchBatchStudents();
    return () => {
      isMounted = false;
    };
  }, [selectedBatchForRoster?.id]);

  // Auto-recalc end year when programme or start year changes
  useEffect(() => {
    const n = parseInt(startYearInput, 10);
    if (!isNaN(n) && n > 2020) setEndYearInput(String(n + durationYears));
  }, [selectedProgrammeId, durationYears, startYearInput]);

  const activeBatchesCount = batches.filter((b) => b.status === 'ACTIVE').length;

  // ── Add batch handlers ───────────────────────────────────────────────────
  const handleStartYearChange = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    setStartYearInput(v);
    if (v.length === 4) {
      const n = parseInt(v, 10);
      if (n <= 2020) { setBatchError('Start year must be greater than 2020.'); return; }
      setBatchError('');
      setEndYearInput(String(n + durationYears));
    } else { setBatchError(''); }
  };

  const handleEndYearChange = (val) => setEndYearInput(val.replace(/\D/g, '').slice(0, 4));

  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    const s = parseInt(startYearInput, 10);
    const en = parseInt(endYearInput, 10);

    if (!s || s <= 2020 || !en || en <= s) {
      setBatchError('Please enter a valid start and graduation year (Start year > 2020).');
      return;
    }

    const startAY = `${s}-${String(s + 1).slice(-2)}`;
    const endAY = `${en - 1}-${String(en).slice(-2)}`;

    const newBatchPayload = {
      programmeId: selectedProgramme.id,
      programmeCode: selectedProgramme.code,
      programmeName: selectedProgramme.name,
      durationYears,
      name: `Batch ${s}-${String(en).slice(-2)} (${selectedProgramme.code}) — AY ${startAY} to ${endAY}`,
      startYear: startAY,
      endYear: endAY,
      yearLevel: 'Year 1 (Freshmen)',
      status: 'ACTIVE',
    };

    try {
      const res = await saveBatch(newBatchPayload);
      const savedBatch = res?.data?.data || res?.data || newBatchPayload;
      setBatches((prev) => [...prev, savedBatch]);
      setToastMessage(`🎉 Created new batch: ${savedBatch.name}`);
      setBatchError('');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save batch:', err);
      setBatchError('Failed to save batch to server. Please try again.');
    }
  };

  const handleToggleBatchStatus = async (batch) => {
    const nextStatus = batch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updatedPayload = {
      ...batch,
      status: nextStatus,
    };

    try {
      const res = await saveBatch(updatedPayload);
      const savedBatch = res?.data?.data || res?.data || updatedPayload;
      setBatches((prev) => prev.map((b) => (b.id === batch.id ? savedBatch : b)));
      setToastMessage(`Status updated for ${batch.name} to ${nextStatus}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to toggle batch status:', err);
      alert('Failed to update batch status. Please try again.');
    }
  };

  const handleDeleteBatchClick = (batch) => {
    setDeletingBatch(batch);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteBatch = async () => {
    if (deletingBatch) {
      try {
        await deleteBatch(deletingBatch.id);
        setBatches((prev) => prev.filter((b) => b.id !== deletingBatch.id));
        setShowDeleteModal(false);
        setDeletingBatch(null);
        setToastMessage('🗑️ Batch deleted successfully.');
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        console.error('Failed to delete batch:', err);
        alert('Failed to delete batch from server. Please try again.');
      }
    }
  };

  // ── Student Roster Handlers ─────────────────────────────────────────────
  const filteredStudents = studentsList.filter(
    (s) =>
      s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.prn?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleOpenAddStudentModal = () => {
    setEditingStudent(null);
    setStudentPrn(`1032250${Math.floor(100 + Math.random() * 900)}`);
    setStudentName('');
    setStudentEmail('');
    setShowStudentModal(true);
  };

  const handleOpenEditStudentModal = (student) => {
    setEditingStudent(student);
    setStudentPrn(student.prn || '');
    setStudentName(student.name || '');
    setStudentEmail(student.email || '');
    setShowStudentModal(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!studentPrn.trim() || !studentName.trim() || !selectedBatchForRoster?.id) {
      alert('Please enter a valid PRN number and Student Name.');
      return;
    }

    const studentPayload = {
      ...(editingStudent ? { id: editingStudent.id } : {}),
      batchId: selectedBatchForRoster.id,
      prn: studentPrn.trim(),
      name: studentName.trim(),
      email: studentEmail.trim() || `${studentName.trim().toLowerCase().replace(/\s+/g, '.')}@dypiu.edu.in`,
      status: editingStudent?.status || 'ENROLLED',
    };

    try {
      const res = await saveStudent(studentPayload);
      const savedStd = res?.data?.data || res?.data || studentPayload;

      if (editingStudent) {
        setStudentsList((prev) => prev.map((s) => (s.id === editingStudent.id ? savedStd : s)));
        setToastMessage(`🎉 Updated student record for ${savedStd.name} (${savedStd.prn})`);
      } else {
        setStudentsList((prev) => [...prev, savedStd]);
        setToastMessage(`🎉 Student ${savedStd.name} (${savedStd.prn}) added to batch roster!`);
      }

      setShowStudentModal(false);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save student:', err);
      alert('Failed to save student to database. Please check PRN uniqueness and try again.');
    }
  };

  const handleDeleteStudentClick = (student) => {
    setDeletingStudent(student);
    setShowDeleteStudentModal(true);
  };

  const handleConfirmDeleteStudent = async () => {
    if (deletingStudent && selectedBatchForRoster) {
      try {
        await deleteStudent(deletingStudent.id);
        setStudentsList((prev) => prev.filter((s) => s.id !== deletingStudent.id));
        setShowDeleteStudentModal(false);
        setDeletingStudent(null);
        setToastMessage('🗑️ Student record removed from batch roster.');
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        console.error('Failed to delete student:', err);
        alert('Failed to delete student record. Please try again.');
      }
    }
  };

  // =========================================================================
  // RENDER SCREEN 2: BATCH STUDENT ROSTER SCREEN
  // =========================================================================
  if (selectedBatchForRoster) {
    return (
      <div style={{ display: 'grid', gap: '20px' }}>

        {/* Toast Alert */}
        {toastMessage && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1.5px solid #6ee7b7',
              color: '#065f46',
              padding: '12px 18px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)',
            }}
          >
            <CheckCircle2 size={18} style={{ color: '#059669' }} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div style={{ background: 'linear-gradient(135deg, #eff6ff, #e0f2fe)', border: '1.5px solid #bfdbfe', borderRadius: '16px', padding: '24px 28px', color: '#0f172a', boxShadow: '0 4px 14px rgba(191, 219, 254, 0.35)' }}>
          <button
            type="button"
            onClick={() => setSelectedBatchForRoster(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#1d4ed8',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              marginBottom: '16px',
              fontFamily: 'inherit',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            }}
          >
            <ArrowLeft size={14} /> Back to Batch Management
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Batch Enrolment Roster
              </span>
              <h2 style={{ margin: '8px 0 4px', fontSize: '22px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>
                {selectedBatchForRoster.programmeName || selectedProgramme.name} — {selectedBatchForRoster.name}
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                Student Permanent Registration Numbers (PRNs) & Academic Records
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddStudentModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#4f46e5',
                border: 'none',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                fontFamily: 'inherit',
              }}
            >
              <Plus size={16} /> Add Student to Batch
            </button>
          </div>
        </div>

        {/* Student Table Card */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          
          {/* Controls Bar */}
          <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} style={{ color: '#4f46e5' }} />
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                Total Students Enrolled: <strong style={{ color: '#4f46e5' }}>{studentsList.length}</strong>
              </span>
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search PRN or Student Name..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Student Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="audit-data-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                  <th style={{ width: '160px', textAlign: 'center' }}>PRN No.</th>
                  <th style={{ minWidth: '240px', textAlign: 'center' }}>Student Name</th>
                  <th style={{ minWidth: '220px', textAlign: 'center' }}>Institutional Email</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '13px' }}>
                      No students enrolled in this batch yet. Click <strong>+ Add Student</strong> to add records.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std, idx) => (
                    <tr key={std.id}>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: '900', color: '#1e293b', background: '#f1f5f9', padding: '3px 10px', borderRadius: '6px', fontSize: '12.5px', fontFamily: 'monospace' }}>
                          {std.prn}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>{std.name}</td>
                      <td style={{ textAlign: 'center', fontSize: '12.5px', color: '#475569' }}>{std.email}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase' }}>
                          {std.status || 'ENROLLED'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* EDIT STUDENT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditStudentModal(std)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '7px',
                              border: '1px solid #c7d2fe',
                              background: '#eef2ff',
                              color: '#4f46e5',
                              cursor: 'pointer',
                              display: 'grid',
                              placeItems: 'center',
                            }}
                            title="Edit student record"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* DELETE STUDENT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleDeleteStudentClick(std)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '7px',
                              border: '1px solid #fecaca',
                              background: '#fef2f2',
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'grid',
                              placeItems: 'center',
                            }}
                            title="Delete student record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── EDIT / ADD STUDENT MODAL ────────────────────────────────────────── */}
        {showStudentModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(4px)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 1000,
              padding: '16px',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: '#4f46e5' }} />
                  {editingStudent ? 'Edit Student Record' : 'Add Student to Batch'}
                </h4>
                <button type="button" onClick={() => setShowStudentModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveStudent}>
                <div style={{ padding: '20px', display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                      Permanent Registration Number (PRN) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1032250101"
                      value={studentPrn}
                      onChange={(e) => setStudentPrn(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: '700',
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aarav Sharma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                      Institutional Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. aarav.sharma@dypiu.edu.in"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setShowStudentModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: '#ffffff', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={15} /> Save Student Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── DELETE STUDENT CONFIRMATION MODAL ───────────────────────── */}
        {showDeleteStudentModal && deletingStudent && (
          <DeleteConfirmModal
            isOpen={showDeleteStudentModal}
            onClose={() => { setShowDeleteStudentModal(false); setDeletingStudent(null); }}
            onConfirm={handleConfirmDeleteStudent}
            title="Delete Student Record"
            itemName={`${deletingStudent.name} (PRN: ${deletingStudent.prn})`}
            itemType="Student Record"
          />
        )}

      </div>
    );
  }

  // =========================================================================
  // RENDER SCREEN 1: MAIN BATCH MANAGEMENT LIST
  // =========================================================================
  return (
    <div style={{ display: 'grid', gap: '20px' }}>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1.5px solid #6ee7b7',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#059669' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div style={{ ...surface, padding: '20px', background: 'linear-gradient(135deg, #f8fafc, #eef2ff)', border: '1px solid #c7d2fe' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', background: '#e0e7ff', color: accent, padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Academic Structure
            </span>
            <h2 style={{ margin: '6px 0 2px', fontSize: '18px', fontWeight: '900', color: ink }}>
              Batch Setup
            </h2>
            <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: '#64748b' }}>
              Initialize a {durationYears}-year academic batch for <strong style={{ color: accent }}>{selectedProgramme ? selectedProgramme.name : 'your programme'}</strong>. Start year must be after 2020.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { label: 'Duration',       value: `${durationYears} Years`,                   bg: '#f1f5f9', color: '#475569' },
                { label: 'Total Batches',  value: String(batches.length),                    bg: '#f1f5f9', color: '#475569' },
                { label: 'Active Batches', value: `${activeBatchesCount} / ${batches.length}`, bg: '#dcfce7',  color: '#15803d' },
              ].map((chip) => (
                <span key={chip.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: chip.bg, color: chip.color,
                  fontSize: '11px', fontWeight: '700', borderRadius: '20px',
                  padding: '3px 10px', border: '1px solid #cbd5e1',
                  letterSpacing: '0.02em',
                }}>
                  {chip.label}: <strong style={{ color: '#0f172a' }}>{chip.value}</strong>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '260px', maxWidth: '360px', flex: '1 1 260px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Programme
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedProgrammeId}
                onChange={(e) => setSelectedProgrammeId(e.target.value)}
                disabled={programmesList.length === 0}
                style={{
                  width: '100%', height: '40px', fontSize: '13px',
                  fontWeight: '700', color: '#1e293b',
                  background: '#ffffff', border: '1.5px solid rgba(255,255,255,0.8)',
                  borderRadius: '9px', padding: '0 34px 0 12px',
                  outline: 'none', appearance: 'none', cursor: programmesList.length === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                }}
              >
                {programmesList.length === 0 ? (
                  <option value="">No programmes added yet</option>
                ) : (
                  programmesList.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                  ))
                )}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Batch Form */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: ink, marginBottom: '12px' }}>Add Batch Year</div>
        <form onSubmit={handleAddBatchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label style={labelStyle}>Start Year *</label>
              <input
                type="text"
                placeholder="e.g. 2025"
                value={startYearInput}
                onChange={(e) => handleStartYearChange(e.target.value)}
                style={{ ...inputStyle, fontWeight: '700' }}
              />
            </div>
            <div>
              <label style={labelStyle}>End Year *</label>
              <input
                type="text"
                placeholder={`e.g. ${2025 + durationYears}`}
                value={endYearInput}
                onChange={(e) => handleEndYearChange(e.target.value)}
                style={{ ...inputStyle, fontWeight: '700' }}
              />
            </div>
            <button
              type="submit"
              style={{ height: '40px', padding: '0 18px', fontSize: '12.5px', fontWeight: '700', background: accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
            >
              <Plus size={14} /> Add Batch
            </button>
          </div>
          {batchError && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
              <AlertCircle size={14} /> {batchError}
            </div>
          )}
        </form>
      </div>

      {/* Batch Cards */}
      {batches.length === 0 ? (
        <div style={{ ...surface, padding: '40px', textAlign: 'center' }}>
          <Calendar size={32} style={{ color: '#94a3b8', marginBottom: '10px' }} />
          <div style={{ fontSize: '14px', fontWeight: '700', color: ink, marginBottom: '4px' }}>No batches yet</div>
          <div style={{ fontSize: '12.5px', color: muted }}>Use the form above to add the first {durationYears}-year batch for {selectedProgramme.name}.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {batches.map((batch) => {
            const isActive     = batch.status === 'ACTIVE';
            const isGraduated  = batch.status === 'GRADUATED';

            return (
              <div
                key={batch.id}
                style={{
                  ...surface,
                  padding: '16px 20px',
                  borderLeft: `4px solid ${isActive ? '#16a34a' : '#e2e8f0'}`,
                  opacity: isGraduated ? 0.8 : 1,
                  transition: 'box-shadow 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: ink, letterSpacing: '-0.01em' }}>{batch.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: muted, flexWrap: 'wrap' }}>
                      <span><Calendar size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />AY <strong style={{ color: ink }}>{batch.startYear}</strong> → <strong style={{ color: ink }}>{batch.endYear}</strong></span>
                      <span style={{ color: '#cbd5e1' }}>·</span>
                      <span>{batch.yearLevel || '—'}</span>
                      <span style={{ color: '#cbd5e1' }}>·</span>
                      <span>{batch.programmeName || selectedProgramme.name}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                    {isActive ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#15803d', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '6px', padding: '3px 10px' }}>
                        <Check size={11} /> Active
                      </span>
                    ) : isGraduated ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#475569', background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '3px 10px' }}>
                        <Archive size={11} /> Graduated
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#b45309', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '6px', padding: '3px 10px' }}>
                        Initialized
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleBatchStatus(batch)}
                      style={{
                        height: '32px', padding: '0 12px', fontSize: '12px', fontWeight: '600',
                        border: isActive ? '1px solid #fca5a5' : '1px solid #a7f3d0',
                        background: isActive ? '#fef2f2' : '#f0fdf4',
                        color: isActive ? '#dc2626' : '#16a34a',
                        borderRadius: '7px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit',
                      }}
                    >
                      {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    {/* OPEN BATCH STUDENT ROSTER */}
                    <button
                      type="button"
                      onClick={() => setSelectedBatchForRoster(batch)}
                      style={{
                        height: '32px',
                        padding: '0 14px',
                        borderRadius: '7px',
                        border: '1px solid #c7d2fe',
                        background: '#eef2ff',
                        color: accent,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '800',
                        fontSize: '12.5px',
                        fontFamily: 'inherit',
                      }}
                      title="Open Batch Student Roster"
                    >
                      View Roster <ArrowRight size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBatchClick(batch)}
                      style={{ width: '32px', height: '32px', borderRadius: '7px', border: isActive ? '1px solid #e2e8f0' : '1px solid #fecaca', background: isActive ? '#f8fafc' : '#fef2f2', color: isActive ? '#94a3b8' : '#dc2626', cursor: isActive ? 'not-allowed' : 'pointer', display: 'grid', placeItems: 'center', opacity: isActive ? 0.45 : 1 }}
                      title={isActive ? 'Deactivate before deleting' : 'Delete batch'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete batch confirm modal */}
      {showDeleteModal && deletingBatch && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeletingBatch(null); }}
          onConfirm={handleConfirmDeleteBatch}
          title="Delete Batch"
          itemName={deletingBatch.name}
          itemType="Batch Record"
        />
      )}

    </div>
  );
}
