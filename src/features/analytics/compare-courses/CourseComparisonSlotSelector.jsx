import React, { useState, useEffect } from 'react';
import { academicApi } from '../../../api';
import { Trash2, GitCompare, AlertCircle, Plus } from 'lucide-react';

const selectStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: 12.5,
  fontWeight: 600,
  outline: 'none',
  cursor: 'pointer',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 4,
};

export default function CourseComparisonSlotSelector({
  slot1,
  slot2,
  onAddSlot,
  onRemoveSlot,
  onCompare,
  isLoading = false,
}) {
  const [programmes, setProgrammes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const [loadingProgrammes, setLoadingProgrammes] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Load all Master Programmes
  useEffect(() => {
    setLoadingProgrammes(true);
    academicApi
      .getMasterProgrammes()
      .then((res) => {
        const payload = res?.data?.data ?? res?.data ?? res;
        const list = Array.isArray(payload) ? payload : (payload?.content || []);
        setProgrammes(list);
        if (list.length > 0) {
          setSelectedProgrammeId((prev) => prev || list[0].id);
        }
      })
      .catch((err) => {
        console.error('[CourseComparisonSlotSelector] Error loading programmes:', err);
      })
      .finally(() => {
        setLoadingProgrammes(false);
      });
  }, []);

  // Load Batches when selectedProgrammeId changes
  useEffect(() => {
    if (!selectedProgrammeId) {
      setBatches([]);
      setSelectedBatchId('');
      return;
    }

    setLoadingBatches(true);
    setSelectedBatchId('');
    academicApi
      .getBatches({ masterProgrammeId: selectedProgrammeId, status: 'ALL' })
      .then((res) => {
        const payload = res?.data?.data ?? res?.data ?? res;
        const list = Array.isArray(payload) ? payload : (payload?.content || []);
        const sorted = [...list].sort((a, b) => (b.startYear || 0) - (a.startYear || 0));
        setBatches(sorted);
        if (sorted.length > 0) {
          setSelectedBatchId(sorted[0].id);
        }
      })
      .catch((err) => {
        console.error('[CourseComparisonSlotSelector] Error loading batches:', err);
      })
      .finally(() => {
        setLoadingBatches(false);
      });
  }, [selectedProgrammeId]);

  // Load Courses when selectedBatchId changes
  useEffect(() => {
    if (!selectedBatchId) {
      setCourses([]);
      setSelectedCourseId('');
      return;
    }

    setLoadingCourses(true);
    setSelectedCourseId('');
    academicApi
      .getCourseOfferings(selectedBatchId)
      .then((res) => {
        const payload = res?.data?.data ?? res?.data ?? res;
        const list = Array.isArray(payload) ? payload : (payload?.content || []);
        setCourses(list);
        if (list.length > 0) {
          // Default to first course not already selected
          const available = list.find(
            (c) => (c.programmeBatchCourseId || c.id) !== slot1?.programmeBatchCourseId &&
                   (c.programmeBatchCourseId || c.id) !== slot2?.programmeBatchCourseId
          );
          setSelectedCourseId(available ? (available.programmeBatchCourseId || available.id) : (list[0].programmeBatchCourseId || list[0].id));
        }
      })
      .catch((err) => {
        console.error('[CourseComparisonSlotSelector] Error loading courses:', err);
      })
      .finally(() => {
        setLoadingCourses(false);
      });
  }, [selectedBatchId, slot1, slot2]);

  const handleAssignToSlot = (slotNumber) => {
    if (!selectedCourseId) return;

    const courseObj = courses.find((c) => (c.programmeBatchCourseId || c.id) === selectedCourseId);
    const batchObj = batches.find((b) => b.id === selectedBatchId);
    const progObj = programmes.find((p) => p.id === selectedProgrammeId);

    const slotPayload = {
      programmeBatchCourseId: selectedCourseId,
      programmeBatchId: selectedBatchId,
      batchName: batchObj?.name || `Batch ${batchObj?.startYear}-${batchObj?.endYear}`,
      startYear: batchObj?.startYear,
      endYear: batchObj?.endYear,
      batchStatus: batchObj?.status || 'ACTIVE',
      masterProgrammeId: selectedProgrammeId,
      programmeName: progObj?.name || 'Programme',
      courseCode: courseObj?.courseCode || courseObj?.code || 'COURSE',
      courseName: courseObj?.courseName || courseObj?.name || 'Course',
      semester: courseObj?.semester,
    };

    onAddSlot(slotNumber, slotPayload);
  };

  const isSameCourseSelected =
    slot1 && slot2 && slot1.programmeBatchCourseId === slot2.programmeBatchCourseId;
  const canCompare = slot1 && slot2 && !isSameCourseSelected && !isLoading;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '22px 24px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        marginBottom: 24,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Select Courses to Compare
        </h3>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Choose any two course offerings across active or completed batches to evaluate side-by-side.
        </span>
      </div>

      {/* Slots Display (Course A and Course B) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Slot 1 */}
        <div
          style={{
            border: slot1 ? '2px solid #0284c7' : '2px dashed #cbd5e1',
            borderRadius: 12,
            padding: '16px 18px',
            background: slot1 ? '#f0f9ff' : '#f8fafc',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', letterSpacing: '0.05em' }}>
              COURSE 1 (SLOT A)
            </span>
            {slot1 && (
              <button
                type="button"
                onClick={() => onRemoveSlot(1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            )}
          </div>

          {slot1 ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 4,
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: 11.5,
                    fontWeight: 800,
                  }}
                >
                  {slot1.courseCode}
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  {slot1.courseName}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#475569', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div><strong>Programme:</strong> {slot1.programmeName}</div>
                <div><strong>Batch:</strong> {slot1.batchName} {slot1.semester ? `• Semester ${slot1.semester}` : ''}</div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 12.5 }}>
              No course assigned to Slot 1. Select a course below and click <strong>"Assign to Course 1"</strong>.
            </div>
          )}
        </div>

        {/* Slot 2 */}
        <div
          style={{
            border: slot2 ? '2px solid #8b5cf6' : '2px dashed #cbd5e1',
            borderRadius: 12,
            padding: '16px 18px',
            background: slot2 ? '#f5f3ff' : '#f8fafc',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.05em' }}>
              COURSE 2 (SLOT B)
            </span>
            {slot2 && (
              <button
                type="button"
                onClick={() => onRemoveSlot(2)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            )}
          </div>

          {slot2 ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 4,
                    background: '#8b5cf6',
                    color: '#ffffff',
                    fontSize: 11.5,
                    fontWeight: 800,
                  }}
                >
                  {slot2.courseCode}
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  {slot2.courseName}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#475569', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div><strong>Programme:</strong> {slot2.programmeName}</div>
                <div><strong>Batch:</strong> {slot2.batchName} {slot2.semester ? `• Semester ${slot2.semester}` : ''}</div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 12.5 }}>
              No course assigned to Slot 2. Select a course below and click <strong>"Assign to Course 2"</strong>.
            </div>
          )}
        </div>
      </div>

      {/* Validation Message */}
      {isSameCourseSelected && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            color: '#991b1b',
            fontSize: 12.5,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          <AlertCircle size={16} color="#dc2626" />
          <span>Cannot compare a course offering with itself. Please select two different course offerings.</span>
        </div>
      )}

      {/* Selector Controls (Programme -> Batch -> Course Offering) */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '16px 18px',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
            marginBottom: 14,
          }}
        >
          {/* Programme Dropdown */}
          <div>
            <label style={labelStyle}>1. Master Programme</label>
            <select
              style={selectStyle}
              value={selectedProgrammeId}
              onChange={(e) => setSelectedProgrammeId(e.target.value)}
              disabled={loadingProgrammes}
            >
              {loadingProgrammes ? (
                <option>Loading programmes...</option>
              ) : (
                programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code || p.degreeAwarded || 'Prog'})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Batch Dropdown */}
          <div>
            <label style={labelStyle}>2. Programme Batch</label>
            <select
              style={selectStyle}
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              disabled={loadingBatches || batches.length === 0}
            >
              {loadingBatches ? (
                <option>Loading batches...</option>
              ) : batches.length === 0 ? (
                <option>No batches found</option>
              ) : (
                batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name || `Batch ${b.startYear}-${b.endYear}`} ({b.status || 'ACTIVE'})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Course Offering Dropdown */}
          <div>
            <label style={labelStyle}>3. Course Offering</label>
            <select
              style={selectStyle}
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              disabled={loadingCourses || courses.length === 0}
            >
              {loadingCourses ? (
                <option>Loading courses...</option>
              ) : courses.length === 0 ? (
                <option>No courses found in batch</option>
              ) : (
                courses.map((c) => (
                  <option key={c.programmeBatchCourseId || c.id} value={c.programmeBatchCourseId || c.id}>
                    {c.courseCode || c.code} - {c.courseName || c.name} {c.semester ? `(Sem ${c.semester})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Slot Assignment Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleAssignToSlot(1)}
            disabled={!selectedCourseId}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: selectedCourseId ? 'pointer' : 'not-allowed',
              opacity: selectedCourseId ? 1 : 0.6,
            }}
          >
            <Plus size={14} />
            <span>Assign to Course 1 (Slot A)</span>
          </button>

          <button
            type="button"
            onClick={() => handleAssignToSlot(2)}
            disabled={!selectedCourseId}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: selectedCourseId ? 'pointer' : 'not-allowed',
              opacity: selectedCourseId ? 1 : 0.6,
            }}
          >
            <Plus size={14} />
            <span>Assign to Course 2 (Slot B)</span>
          </button>
        </div>
      </div>

      {/* Execute Comparison Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => onCompare(slot1?.programmeBatchCourseId, slot2?.programmeBatchCourseId)}
          disabled={!canCompare}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: canCompare ? '#0f172a' : '#94a3b8',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 22px',
            fontSize: 13,
            fontWeight: 800,
            cursor: canCompare ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s ease',
          }}
        >
          <GitCompare size={16} />
          <span>{isLoading ? 'Comparing...' : 'Compare Course Performance'}</span>
        </button>
      </div>
    </div>
  );
}
