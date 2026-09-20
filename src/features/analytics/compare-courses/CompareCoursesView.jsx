import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import CourseComparisonSlotSelector from './CourseComparisonSlotSelector';
import CourseOverallComparisonChart from './CourseOverallComparisonChart';
import CourseDirectIndirectComparisonCharts from './CourseDirectIndirectComparisonCharts';
import CourseCoComparisonChart from './CourseCoComparisonChart';
import CourseCoComparisonTable from './CourseCoComparisonTable';
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  GitCompare,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Calendar,
  Layers,
} from 'lucide-react';

const formatNum = (val) => (val !== null && val !== undefined ? Number(val).toFixed(2) : '—');

export default function CompareCoursesView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const paramC1 =
    searchParams.get('programmeBatchCourseId1') ||
    searchParams.get('c1') ||
    searchParams.get('programmeBatchCourseId') ||
    '';
  const paramC2 =
    searchParams.get('programmeBatchCourseId2') ||
    searchParams.get('c2') ||
    '';

  const [slot1, setSlot1] = useState(null);
  const [slot2, setSlot2] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(true);
  const lastFetchedPairRef = useRef('');

  // Fetch comparison from backend
  const fetchComparison = useCallback(async (id1, id2) => {
    if (!id1 || !id2) return;
    if (id1 === id2) {
      setError('Cannot compare a course offering to itself. Please select two different course offerings.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await analyticsApi.compareCourses({
        programmeBatchCourseId1: id1,
        programmeBatchCourseId2: id2,
      });

      const payload = res?.data?.data ?? res?.data ?? res;
      if (payload) {
        setComparisonData(payload);
        if (payload.course1) {
          setSlot1(payload.course1);
        }
        if (payload.course2) {
          setSlot2(payload.course2);
        }
        setIsSelectorOpen(false); // collapse selector once comparison data is loaded
      } else {
        setError('No comparison data returned from server.');
      }
    } catch (err) {
      console.error('[CompareCoursesView] Comparison error:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch course comparison data. Please verify your permissions.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Pre-fill Slot 1 if paramC1 is provided or from location state
  useEffect(() => {
    if (paramC1 && paramC2) {
      const pairKey = `${paramC1}::${paramC2}`;
      if (lastFetchedPairRef.current !== pairKey) {
        lastFetchedPairRef.current = pairKey;
        fetchComparison(paramC1, paramC2);
      }
      return;
    }
    lastFetchedPairRef.current = '';

    // Check if slot 1 passed via router state
    if (location.state?.slot1Course) {
      setSlot1((prev) => prev || location.state.slot1Course);
      return;
    }

    // Otherwise if paramC1 is provided in URL, load its metadata
    if (paramC1) {
      analyticsApi
        .getHistoricalCourseAttainment({ programmeBatchCourseId: paramC1 })
        .then((res) => {
          const payload = res?.data?.data ?? res?.data ?? res;
          if (payload) {
            setSlot1((prev) => prev || {
              programmeBatchCourseId: payload.currentProgrammeBatchCourseId || payload.course?.programmeBatchCourseId || paramC1,
              programmeBatchId: payload.currentBatchId || payload.course?.programmeBatchId,
              batchName: payload.currentBatchName || payload.course?.batchName,
              masterProgrammeId: payload.masterProgrammeId || payload.course?.masterProgrammeId,
              programmeName: payload.programmeName || payload.course?.programmeName,
              courseCode: payload.courseCode || payload.course?.courseCode,
              courseName: payload.courseName || payload.course?.courseName,
              semester: payload.currentSemester || payload.course?.semester,
              batchStatus: payload.currentBatchStatus || payload.course?.batchStatus || 'ACTIVE',
            });
          }
        })
        .catch((err) => {
          console.warn('[CompareCoursesView] Could not load course for Slot 1:', err);
        });
    }
  }, [paramC1, paramC2, fetchComparison, location.state]);

  const handleAddSlot = (slotOrNumber, maybeSlotData) => {
    if (typeof slotOrNumber === 'number') {
      if (slotOrNumber === 1) {
        setSlot1(maybeSlotData);
      } else if (slotOrNumber === 2) {
        setSlot2(maybeSlotData);
      }
    } else {
      const slotData = slotOrNumber;
      if (!slot1) {
        setSlot1(slotData);
      } else if (!slot2) {
        setSlot2(slotData);
      }
    }
  };

  const handleRemoveSlot = (slotNumber) => {
    if (slotNumber === 1) {
      setSlot1(null);
    } else if (slotNumber === 2) {
      setSlot2(null);
    }
    setComparisonData(null);
    setIsSelectorOpen(true);
    lastFetchedPairRef.current = '';
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (slotNumber === 1) {
          next.delete('programmeBatchCourseId1');
          next.delete('c1');
          next.delete('programmeBatchCourseId');
        } else {
          next.delete('programmeBatchCourseId2');
          next.delete('c2');
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleCompareClick = () => {
    if (!slot1 || !slot2) return;
    const id1 = slot1.programmeBatchCourseId || slot1.id;
    const id2 = slot2.programmeBatchCourseId || slot2.id;
    if (id1 === id2) {
      setError('Cannot compare a course offering to itself. Please select two different course offerings.');
      return;
    }
    lastFetchedPairRef.current = `${id1}::${id2}`;
    setSearchParams(
      { programmeBatchCourseId1: id1, programmeBatchCourseId2: id2 },
      { replace: true }
    );
    fetchComparison(id1, id2);
  };

  const handleBack = () => {
    const returnCourse = slot1 || comparisonData?.course1;
    if (returnCourse?.programmeBatchId && returnCourse?.programmeBatchCourseId) {
      navigate(`/analytics/batch/${returnCourse.programmeBatchId}/course/${returnCourse.programmeBatchCourseId}`);
    } else if (returnCourse?.programmeBatchCourseId) {
      navigate(`/analytics/course/${returnCourse.programmeBatchCourseId}`);
    } else {
      navigate(-1);
    }
  };

  const course1Meta = comparisonData?.course1 || slot1;
  const course2Meta = comparisonData?.course2 || slot2;
  const coComparisons = comparisonData?.coComparisons || [];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Navigation & Breadcrumbs */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#94a3b8';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em' }}>
              ANALYTICS / COURSES / COMPARE COURSE PERFORMANCE
            </span>
          </div>

          {comparisonData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  const id1 = course1Meta?.programmeBatchCourseId || course1Meta?.id;
                  const id2 = course2Meta?.programmeBatchCourseId || course2Meta?.id;
                  if (id1 && id2) fetchComparison(id1, id2);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
              >
                <GitCompare size={14} color="#4f46e5" />
                <span>{isSelectorOpen ? 'Hide Course Selectors' : 'Change Courses'}</span>
                {isSelectorOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Compare Course Performance
          </h1>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Direct, Indirect &amp; Course Outcome Level Attainment Comparison
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#b91c1c',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>{error}</div>
        </div>
      )}

      {/* Slot Selector Panel */}
      {isSelectorOpen && (
        <div style={{ marginBottom: 24 }}>
          <CourseComparisonSlotSelector
            slot1={slot1}
            slot2={slot2}
            onAddSlot={handleAddSlot}
            onRemoveSlot={handleRemoveSlot}
            onCompare={handleCompareClick}
            isLoading={loading}
          />
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: '3px solid #e2e8f0',
              borderTopColor: '#4f46e5',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px auto',
            }}
          />
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
            Loading course comparison analytics...
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Aggregating authoritative attainment data and aligning Course Outcomes
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {!loading && comparisonData && course1Meta && course2Meta && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Side-by-Side Metadata Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
            {/* Course 1 Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 14,
                border: '1px solid #e0e7ff',
                padding: '20px',
                boxShadow: '0 1px 4px rgba(79, 70, 229, 0.06)',
                borderTop: '4px solid #4f46e5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#4f46e5',
                    background: '#eef2ff',
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}
                >
                  Course 1 (Reference)
                </span>
                {course1Meta.batchStatus && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: course1Meta.batchStatus === 'COMPLETED' ? '#15803d' : '#0369a1',
                      background: course1Meta.batchStatus === 'COMPLETED' ? '#f0fdf4' : '#f0f9ff',
                      padding: '3px 8px',
                      borderRadius: 4,
                      border: `1px solid ${course1Meta.batchStatus === 'COMPLETED' ? '#bbf7d0' : '#bae6fd'}`,
                    }}
                  >
                    {course1Meta.batchStatus}
                  </span>
                )}
              </div>

              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                {course1Meta.courseCode} — {course1Meta.courseName}
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8, fontSize: 12, color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} />
                  <strong>{course1Meta.batchName}</strong>
                </span>
                {course1Meta.semester && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Layers size={13} />
                    Semester {course1Meta.semester}
                  </span>
                )}
                {course1Meta.programmeName && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <GraduationCap size={13} />
                    {course1Meta.programmeName}
                  </span>
                )}
              </div>

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Overall Attainment</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#4f46e5' }}>
                    {formatNum(course1Meta.overallCourseAttainment)}{' '}
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>/ 3.00</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 11.5, color: '#475569' }}>
                  <div>Direct: <strong>{formatNum(course1Meta.directAttainment)}</strong></div>
                  <div>Indirect: <strong>{formatNum(course1Meta.indirectAttainment)}</strong></div>
                </div>
              </div>
            </div>

            {/* Course 2 Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 14,
                border: '1px solid #bae6fd',
                padding: '20px',
                boxShadow: '0 1px 4px rgba(2, 132, 199, 0.06)',
                borderTop: '4px solid #0284c7',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#0284c7',
                    background: '#f0f9ff',
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}
                >
                  Course 2 (Comparison)
                </span>
                {course2Meta.batchStatus && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: course2Meta.batchStatus === 'COMPLETED' ? '#15803d' : '#0369a1',
                      background: course2Meta.batchStatus === 'COMPLETED' ? '#f0fdf4' : '#f0f9ff',
                      padding: '3px 8px',
                      borderRadius: 4,
                      border: `1px solid ${course2Meta.batchStatus === 'COMPLETED' ? '#bbf7d0' : '#bae6fd'}`,
                    }}
                  >
                    {course2Meta.batchStatus}
                  </span>
                )}
              </div>

              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                {course2Meta.courseCode} — {course2Meta.courseName}
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8, fontSize: 12, color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} />
                  <strong>{course2Meta.batchName}</strong>
                </span>
                {course2Meta.semester && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Layers size={13} />
                    Semester {course2Meta.semester}
                  </span>
                )}
                {course2Meta.programmeName && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <GraduationCap size={13} />
                    {course2Meta.programmeName}
                  </span>
                )}
              </div>

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Overall Attainment</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0284c7' }}>
                    {formatNum(course2Meta.overallCourseAttainment)}{' '}
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>/ 3.00</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 11.5, color: '#475569' }}>
                  <div>Direct: <strong>{formatNum(course2Meta.directAttainment)}</strong></div>
                  <div>Indirect: <strong>{formatNum(course2Meta.indirectAttainment)}</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Attainment Vertical Bar Chart */}
          <CourseOverallComparisonChart course1={course1Meta} course2={course2Meta} />

          {/* Direct & Indirect Vertical Bar Charts */}
          <CourseDirectIndirectComparisonCharts course1={course1Meta} course2={course2Meta} />

          {/* CO-by-CO Grouped Vertical Bar Chart */}
          <CourseCoComparisonChart coComparisons={coComparisons} course1={course1Meta} course2={course2Meta} />

          {/* CO-by-CO Detailed Matrix Table */}
          <CourseCoComparisonTable coComparisons={coComparisons} course1={course1Meta} course2={course2Meta} />
        </div>
      )}

      {/* Empty State when no comparison data yet */}
      {!loading && !comparisonData && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '2px dashed #cbd5e1',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#4f46e5',
            }}
          >
            <GitCompare size={26} />
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Select Two Course Offerings to Compare
          </h3>
          <p style={{ margin: 0, fontSize: 13, maxWidth: 500, marginInline: 'auto' }}>
            Choose a reference course and a comparison course using the selector above, then click{' '}
            <strong>Compare Selected Courses</strong> to view side-by-side vertical attainment charts and CO matrices.
          </p>
        </div>
      )}
    </div>
  );
}
