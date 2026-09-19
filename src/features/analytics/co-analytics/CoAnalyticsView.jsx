import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import CoAnalyticsHeader from './CoAnalyticsHeader';
import CoSummaryCard from './CoSummaryCard';
import CoDirectVsIndirectSection from './CoDirectVsIndirectSection';
import CoOutcomeMappingCard from './CoOutcomeMappingCard';
import CourseEndSurveyModal from './CourseEndSurveyModal';
import StudentEvidenceModal from '../components/StudentEvidenceModal';
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

const skeletonItem = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s infinite ease-in-out',
  borderRadius: 10,
};

function CoAnalyticsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ height: 150, borderRadius: 14, ...skeletonItem }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={{ height: 110, borderRadius: 12, ...skeletonItem }} />
        <div style={{ height: 110, borderRadius: 12, ...skeletonItem }} />
        <div style={{ height: 110, borderRadius: 12, ...skeletonItem }} />
        <div style={{ height: 110, borderRadius: 12, ...skeletonItem }} />
      </div>
      <div style={{ height: 320, borderRadius: 14, ...skeletonItem }} />
      <div style={{ height: 180, borderRadius: 14, ...skeletonItem }} />
    </div>
  );
}

export default function CoAnalyticsView() {
  const { programmeBatchId, programmeBatchCourseId, coCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const outcomeType = searchParams.get('outcomeType') || 'PO';
  const outcomeCode = searchParams.get('outcomeCode') || null;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // Modals state
  const [isStudentEvidenceOpen, setIsStudentEvidenceOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  const fetchCoAnalytics = useCallback(async () => {
    if (!programmeBatchCourseId || !coCode) {
      setError('Course identifier or CO code is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsForbidden(false);

    try {
      const res = await analyticsApi.getCoAnalytics({
        programmeBatchCourseId,
        coCode,
      });

      const payload = res?.data ?? res;
      if (payload) {
        setData(payload);
      } else {
        setError('CO analytics details are currently unavailable.');
      }
    } catch (err) {
      console.error('[CoAnalyticsView] Error fetching CO analytics:', err);
      if (err?.response?.status === 403) {
        setIsForbidden(true);
        setError('You do not have permission to view analytics for this Course Outcome.');
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Unable to load CO analytics details.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [programmeBatchCourseId, coCode]);

  useEffect(() => {
    fetchCoAnalytics();
  }, [fetchCoAnalytics]);

  if (loading) {
    return <CoAnalyticsSkeleton />;
  }

  if (error || isForbidden) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #fee2e2',
          borderRadius: 14,
          padding: '40px 24px',
          textAlign: 'center',
          maxWidth: 520,
          margin: '40px auto',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          {isForbidden ? (
            <ShieldAlert size={26} color="#dc2626" />
          ) : (
            <AlertCircle size={26} color="#dc2626" />
          )}
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
          {isForbidden ? 'Access Denied' : 'Unable to load CO analytics'}
        </h2>

        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
          {error}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {!isForbidden && (
            <button
              type="button"
              onClick={fetchCoAnalytics}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 8,
                background: '#7c3aed',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '';
              const query = outcomeCode
                ? `?outcomeType=${outcomeType}&outcomeCode=${outcomeCode}`
                : '';
              navigate(`${basePath}/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}${query}`);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Course Analytics</span>
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Header with Breadcrumbs, Course & CO Context */}
      <CoAnalyticsHeader
        programmeBatchId={programmeBatchId}
        programmeBatchCourseId={programmeBatchCourseId}
        batchName={data.batchName}
        programmeName={data.programmeName}
        courseCode={data.courseCode}
        courseName={data.courseName}
        semester={data.semester}
        courseCoordinator={data.courseCoordinator}
        coCode={data.coCode}
        coStatement={data.coStatement}
        outcomeCode={outcomeCode}
        outcomeType={outcomeType}
      />

      {/* 2. Top Summary Metric Cards */}
      <CoSummaryCard
        coCode={data.coCode}
        target={data.target}
        targetMet={data.targetMet}
        directAttainment={data.directAttainment}
        indirectAttainment={data.indirectAttainment}
        overallAttainment={data.overallAttainment}
        directWeight={data.directWeight}
        indirectWeight={data.indirectWeight}
        observation={data.observation}
      />

      {/* 3. Direct vs Indirect Breakdown (VERTICAL Chart & Details) */}
      <CoDirectVsIndirectSection
        directAttainment={data.directAttainment}
        indirectAttainment={data.indirectAttainment}
        target={data.target}
        directEvidenceSummary={data.directEvidenceSummary}
        indirectEvidenceSummary={data.indirectEvidenceSummary}
        directWeight={data.directWeight}
        indirectWeight={data.indirectWeight}
        onOpenStudentEvidence={() => setIsStudentEvidenceOpen(true)}
        onOpenSurvey={() => setIsSurveyModalOpen(true)}
      />

      {/* 4. PO / PSO Mappings Card */}
      <CoOutcomeMappingCard
        coCode={data.coCode}
        poMappings={data.poMappings}
        psoMappings={data.psoMappings}
        programmeBatchId={programmeBatchId}
      />

      {/* 5. Student Performance Evidence Modal (Drilldown) */}
      <StudentEvidenceModal
        isOpen={isStudentEvidenceOpen}
        onClose={() => setIsStudentEvidenceOpen(false)}
        programmeBatchCourseId={programmeBatchCourseId}
        coCode={data.coCode}
        coDetails={{
          coCode: data.coCode,
          statement: data.coStatement,
        }}
      />

      {/* 6. Course-End Survey Modal (Drilldown) */}
      <CourseEndSurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        coCode={data.coCode}
        coStatement={data.coStatement}
        indirectEvidence={data.indirectEvidenceSummary}
        courseCode={data.courseCode}
        courseName={data.courseName}
      />
    </div>
  );
}
