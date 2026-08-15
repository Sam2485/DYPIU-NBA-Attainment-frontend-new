import { useState, useEffect } from 'react';
import {
  Users,
  Edit2,
  CheckCircle2,
  UserCheck,
  BookOpen,
  X,
  Save,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getHodDepartmentSummary,
  getProgrammes,
  getUsersByRole,
  saveProgramme,
} from '../../api/academic';

const FALLBACK_FACULTY = [];

export default function HodProgrammeCoordinators() {
  const { user } = useAuth();

  const [programmesList, setProgrammesList] = useState([]);
  const [coordinatorsList, setCoordinatorsList] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingProg, setEditingProg] = useState(null);
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState('');
  const [customCoordinatorName, setCustomCoordinatorName] = useState('');
  const [customCoordinatorEmail, setCustomCoordinatorEmail] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Fetch HOD department, programmes, and registered programme coordinators
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
        if (isMounted && Array.isArray(progList)) {
          setProgrammesList(progList);
        }

        const userRes = await getUsersByRole('programme-coordinator');
        const userList = userRes?.data?.data || userRes?.data || [];
        if (isMounted && Array.isArray(userList)) {
          setCoordinatorsList(userList);
        }
      } catch (err) {
        console.warn('Failed to load initial data for Programme Coordinators screen:', err);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const availableFaculty = coordinatorsList;

  const getCoordinatorDisplayName = (coordVal, coordEmail) => {
    if (
      !coordVal ||
      coordVal === 'Pending HOD Assignment' ||
      coordVal === 'No coordinator assigned yet'
    ) {
      return null;
    }

    const match = availableFaculty.find((f) => {
      return (
        (coordEmail && f.email && f.email.toLowerCase() === coordEmail.toLowerCase()) ||
        (f.id != null && String(f.id) === String(coordVal)) ||
        (f.email && f.email.toLowerCase() === String(coordVal).toLowerCase()) ||
        (f.name && f.name.toLowerCase() === String(coordVal).toLowerCase())
      );
    });

    return match ? match.name : coordVal;
  };

  // Filter programmes for display
  const filteredProgrammes = programmesList.filter(
    (p) => {
      const dispName = getCoordinatorDisplayName(p.coordinator, p.coordinatorEmail) || '';
      const query = searchQuery.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.code && p.code.toLowerCase().includes(query)) ||
        (p.coordinator && p.coordinator.toLowerCase().includes(query)) ||
        dispName.toLowerCase().includes(query)
      );
    }
  );

  const assignedCount = programmesList.filter(
    (p) => p.coordinator && p.coordinator !== 'Pending HOD Assignment' && p.coordinator !== 'No coordinator assigned yet'
  ).length;

  const unassignedCount = programmesList.length - assignedCount;

  const handleOpenEditModal = (prog) => {
    setEditingProg(prog);
    const existingName = prog.coordinator || '';
    const match = availableFaculty.find(
      (f) =>
        f.name === existingName ||
        (f.id != null && String(f.id) === String(existingName)) ||
        (prog.coordinatorEmail && f.email && f.email.toLowerCase() === prog.coordinatorEmail.toLowerCase())
    );

    if (match) {
      setSelectedCoordinatorId(String(match.id || match.name));
      setIsCustomMode(false);
      setCustomCoordinatorName('');
      setCustomCoordinatorEmail('');
    } else if (existingName && existingName !== 'Pending HOD Assignment' && existingName !== 'No coordinator assigned yet') {
      setSelectedCoordinatorId('CUSTOM');
      setIsCustomMode(true);
      setCustomCoordinatorName(existingName);
      setCustomCoordinatorEmail(prog.coordinatorEmail || '');
    } else {
      setSelectedCoordinatorId(String(availableFaculty[0]?.id || availableFaculty[0]?.name || ''));
      setIsCustomMode(false);
      setCustomCoordinatorName('');
      setCustomCoordinatorEmail('');
    }
  };

  const handleSaveCoordinator = async () => {
    if (!editingProg) return;

    let finalName = '';
    let finalEmail = '';

    if (isCustomMode) {
      finalName = customCoordinatorName.trim();
      finalEmail = customCoordinatorEmail.trim();
    } else {
      const match = availableFaculty.find(
        (c) => String(c.id) === String(selectedCoordinatorId) || c.name === selectedCoordinatorId
      );
      if (match) {
        finalName = match.name;
        finalEmail = match.email || '';
      } else if (selectedCoordinatorId) {
        finalName = selectedCoordinatorId;
      }
    }

    if (!finalName) {
      alert('Please select or enter a valid faculty name for Programme Coordinator.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedPayload = {
        ...editingProg,
        coordinator: finalName,
        coordinatorEmail: finalEmail,
      };

      const res = await saveProgramme(updatedPayload);
      const savedProg = res?.data?.data || res?.data || updatedPayload;

      setProgrammesList((prev) => prev.map((p) => (p.id === editingProg.id ? savedProg : p)));
      setSuccessToast(`🎉 Programme Coordinator for ${editingProg.code} updated to "${finalName}"!`);
      setEditingProg(null);

      setTimeout(() => {
        setSuccessToast(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to assign programme coordinator:', err);
      alert('Failed to save coordinator assignment to backend server. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>

      {/* Toast Alert Notification */}
      {successToast && (
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
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#059669' }} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Department Programmes</span>
            <div style={{ background: '#eef2ff', color: '#4f46e5', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
              <BookOpen size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{programmesList.length}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Coordinators Assigned</span>
            <div style={{ background: '#ecfdf5', color: '#059669', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
              <UserCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#059669' }}>{assignedCount}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Pending Assignment</span>
            <div style={{ background: unassignedCount > 0 ? '#fffbeb' : '#f1f5f9', color: unassignedCount > 0 ? '#d97706' : '#64748b', width: '32px', height: '32px', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: unassignedCount > 0 ? '#d97706' : '#64748b' }}>{unassignedCount}</div>
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        
        {/* Table Header Controls */}
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
              Programme Coordinators Allocation Matrix
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              Assign and update Programme Coordinators for all degree programmes under the department.
            </p>
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search programme or coordinator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="audit-data-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Code</th>
                <th style={{ minWidth: '260px', textAlign: 'center' }}>Programme Name</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Duration</th>
                <th style={{ minWidth: '220px', textAlign: 'center' }}>Assigned Programme Coordinator</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Status</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProgrammes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '13px' }}>
                    No programmes found matching search query.
                  </td>
                </tr>
              ) : (
                filteredProgrammes.map((prog, idx) => {
                  const coordinatorDisplayName = getCoordinatorDisplayName(prog.coordinator, prog.coordinatorEmail);
                  const isAssigned = Boolean(coordinatorDisplayName);

                  return (
                    <tr key={prog.id}>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: '900', color: '#4f46e5', background: '#eef2ff', padding: '3px 10px', borderRadius: '6px', fontSize: '12px' }}>
                          {prog.code}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>{prog.name}</td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>
                        {prog.durationYears ? `${prog.durationYears} Years` : '4 Years'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isAssigned ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '8px' }}>
                            <UserCheck size={14} style={{ color: '#059669' }} />
                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                              {coordinatorDisplayName}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: '6px' }}>
                            Pending Assignment
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', background: isAssigned ? '#dcfce7' : '#fef3c7', color: isAssigned ? '#15803d' : '#92400e', padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase' }}>
                          {isAssigned ? 'Active' : 'Unassigned'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prog)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '7px',
                            border: '1px solid #c7d2fe',
                            background: '#eef2ff',
                            color: '#4f46e5',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── EDIT / ASSIGN COORDINATOR MODAL ────────────────────────────────────── */}
      {editingProg && (
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
              maxWidth: '520px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              animation: 'scaleIn 0.2s ease',
            }}
          >
            {/* Modal Header */}
            <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: '#4f46e5' }} />
                  Assign Programme Coordinator
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                  {editingProg.code} — {editingProg.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProg(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'grid', gap: '16px' }}>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                  Select Faculty Member
                </label>
                <select
                  value={isCustomMode ? 'CUSTOM' : selectedCoordinatorId}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomMode(true);
                      setSelectedCoordinatorId('CUSTOM');
                    } else {
                      setIsCustomMode(false);
                      setSelectedCoordinatorId(e.target.value);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0f172a',
                    outline: 'none',
                    fontFamily: 'inherit',
                    background: '#ffffff',
                  }}
                >
                  {availableFaculty.map((fac) => (
                    <option key={fac.id || fac.name} value={String(fac.id || fac.name)}>
                      {fac.name} {fac.email ? `(${fac.email})` : ''}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Enter Custom Faculty Name</option>
                </select>
              </div>

              {isCustomMode && (
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                      Custom Faculty Name & Designation *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Strategic Coordinator"
                      value={customCoordinatorName}
                      onChange={(e) => setCustomCoordinatorName(e.target.value)}
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
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                      Institutional Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. coordinator@dypiu.edu.in"
                      value={customCoordinatorEmail}
                      onChange={(e) => setCustomCoordinatorEmail(e.target.value)}
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
              )}

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                💡 <strong>Note:</strong> The assigned Programme Coordinator will have administrative access to set PO/PSO targets, verify course submissions, and generate batch reports.
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setEditingProg(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCoordinator}
                disabled={isSaving}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
                {isSaving ? 'Saving...' : 'Save Assignment'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
