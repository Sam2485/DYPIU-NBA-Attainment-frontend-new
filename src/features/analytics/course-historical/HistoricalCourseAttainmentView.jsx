import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import CourseContextSummaryCard from './CourseContextSummaryCard';
import CourseHistoricalAttainmentChart from './CourseHistoricalAttainmentChart';
import CourseDirectVsIndirectChart from './CourseDirectVsIndirectChart';
import CourseOutcomeHeatmapMatrix from './CourseOutcomeHeatmapMatrix';
import SelectedCoHistoricalSection from './SelectedCoHistoricalSection';
import { ArrowLeft, GitCompare, RefreshCw, AlertCircle, Compass, GraduationCap } from 'lucide-react';
import { ScreenLoadingState } from '../../../components/common/ScreenState';

export default function HistoricalCourseAttainmentView() {
  const { programmeBatchCourseId: paramCourseId, programmeBatchId: paramBatchId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '';

  // Resolve originating course offering ID from route or searchParams
  const courseOfferingId =
    paramCourseId ||
    searchParams.get('programmeBatchCourseId') ||
    searchParams.get('courseOfferingId') ||
    '';

  const batchId =
    paramBatchId ||
    searchParams.get('programmeBatchId') ||
    '';

  const initialCoCode = searchParams.get('coCode') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedCoCode, setSelectedCoCode] = useState(initialCoCode || 'CO1');

  const fetchHistoricalData = useCallback(async () => {
    if (!courseOfferingId) {
      setLoading(false);
      setError('No Course Offering identifier (programmeBatchCourseId) was provided.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await analyticsApi.getHistoricalCourseAttainment({
        programmeBatchCourseId: courseOfferingId,
      });

      const payload = res?.data ?? res;
      if (payload) {
        setData(payload);
        if (payload.courseOutcomes && payload.courseOutcomes.length > 0) {
          setSelectedCoCode((prev) =>
            payload.courseOutcomes.includes(prev) ? prev : payload.courseOutcomes[0]
          );
        }
      } else {
        setError('No historical course attainment data returned from server.');
      }
    } catch (err) {
      console.error('[HistoricalCourseAttainmentView] Error fetching data:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch historical course attainment. Please verify your permissions.'
      );
    } finally {
      setLoading(false);
    }
  }, [courseOfferingId]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  const handleBack = () => {
    const targetBatchId = batchId || data?.currentBatchId;
    if (targetBatchId && courseOfferingId) {
      navigate(`${basePath}/analytics/batch/${targetBatchId}/course/${courseOfferingId}`);
    } else if (targetBatchId) {
      navigate(`${basePath}/analytics/batch/${targetBatchId}`);
    } else {
      navigate(-1);
    }
  };

  const handleCompare = () => {
    navigate(`${basePath}/analytics/compare-courses?programmeBatchCourseId1=${courseOfferingId}`);
  };

  if (loading) {
    return <ScreenLoadingState message="Loading historical course attainment..." />;
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #fee2e2',
            borderRadius: 14,
            padding: 32,
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <AlertCircle size={40} color="#dc2626" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
            Unable to Load Historical Course Attainment
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', maxWidth: 480, margin: '0 auto 20px auto' }}>
            {error || 'The requested course offering could not be found or you do not have permission.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={15} />
              <span>Go Back</span>
            </button>
            <button
              type="button"
              onClick={fetchHistoricalData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#0284c7',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={15} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    courseCode,
    courseName,
    programmeName,
    currentProgrammeBatchCourseId,
    currentBatchId,
    currentBatchName,
    currentBatchStatus,
    directWeight,
    indirectWeight,
    batches = [],
    courseOutcomes = [],
    coDataPoints = [],
  } = data;

  // Locate the originating/current course batch summary
  const currentBatchSummary =
    batches.find((b) => b.programmeBatchCourseId === currentProgrammeBatchCourseId) ||
    batches.find((b) => b.programmeBatchId === currentBatchId) ||
    batches[batches.length - 1];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 20px 48px 20px' }}>
      {/* 1. Header Card with Breadcrumb, Title & Action */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 24px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          marginBottom: 24,
        }}
      >
        {/* Navigation Actions & Breadcrumbs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Course Analytics</span>
            </button>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em' }}>
              ANALYTICS / COURSE / HISTORICAL ATTAINMENT
            </span>
          </div>

          {/* Action: Compare Course Performance Button */}
          <button
            type="button"
            onClick={handleCompare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.borderColor = '#0284c7';
              e.currentTarget.style.color = '#0284c7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#0f172a';
            }}
          >
            <GitCompare size={15} color="#0284c7" />
            <span>Compare Course Performance</span>
          </button>
        </div>

        {/* Course Identity & Current Batch Context */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Historical Course Attainment
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 8px 0', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0284c7' }}>
              {courseCode} — {courseName}
            </span>

            {/* Current Batch Indicator Badge */}
            {currentBatchName && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#166534',
                }}
              >
                <Compass size={13} color="#16a34a" />
                <span>Current Batch: {currentBatchName}</span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: currentBatchStatus === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                    color: currentBatchStatus === 'ACTIVE' ? '#15803d' : '#475569',
                    border: `1px solid ${currentBatchStatus === 'ACTIVE' ? '#86efac' : '#cbd5e1'}`,
                  }}
                >
                  {currentBatchStatus || 'ACTIVE'}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 12.5, color: '#64748b', flexWrap: 'wrap' }}>
            {programmeName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <GraduationCap size={14} color="#94a3b8" />
                <span>{programmeName}</span>
              </div>
            )}
            <div>
              <span>{batches.length} Course Instances across Batches (Active & Concluded)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Course Context Summary Card */}
      <CourseContextSummaryCard data={data} currentBatchSummary={currentBatchSummary} />

      {/* 3. Main Visual: Course Attainment Across Batches (Vertical Stacked Bar) */}
      <CourseHistoricalAttainmentChart
        batches={batches}
        currentBatchId={currentBatchId}
        directWeight={directWeight != null ? Number(directWeight) : 70}
        indirectWeight={indirectWeight != null ? Number(indirectWeight) : 30}
      />

      {/* 4. Direct vs Indirect Historical Analysis (Vertical Grouped Bar) */}
      <CourseDirectVsIndirectChart batches={batches} />

      {/* 5. CO Attainment Across Batches (Heatmap Matrix) */}
      <CourseOutcomeHeatmapMatrix
        batches={batches}
        courseOutcomes={courseOutcomes}
        coDataPoints={coDataPoints}
        selectedCoCode={selectedCoCode}
        onSelectCo={(code) => setSelectedCoCode(code)}
      />

      {/* 6. Selected CO Historical Detail (Vertical Stacked Bar & Numerical Table) */}
      <SelectedCoHistoricalSection
        selectedCoCode={selectedCoCode}
        courseOutcomes={courseOutcomes}
        onSelectCo={(code) => setSelectedCoCode(code)}
        batches={batches}
        coDataPoints={coDataPoints}
        currentBatchId={currentBatchId}
        directWeight={directWeight != null ? Number(directWeight) : 70}
        indirectWeight={indirectWeight != null ? Number(indirectWeight) : 30}
      />
    </div>
  );
}
