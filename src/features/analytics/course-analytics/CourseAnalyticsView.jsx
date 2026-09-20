import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { analyticsApi } from '../../../api';
import CourseAnalyticsHeader from './CourseAnalyticsHeader';
import CourseOverviewSection from './CourseOverviewSection';
import CourseOutcomeContributionSection from './CourseOutcomeContributionSection';
import CourseCoAttainmentSection from './CourseCoAttainmentSection';
import CourseBottomActionCards from './CourseBottomActionCards';
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

const skeletonItem = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s infinite ease-in-out',
  borderRadius: 10,
};

function CourseAnalyticsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ height: 160, borderRadius: 14, ...skeletonItem }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ height: 120, borderRadius: 12, ...skeletonItem }} />
        <div style={{ height: 120, borderRadius: 12, ...skeletonItem }} />
        <div style={{ height: 120, borderRadius: 12, ...skeletonItem }} />
      </div>
      <div style={{ height: 320, borderRadius: 14, ...skeletonItem }} />
      <div style={{ height: 340, borderRadius: 14, ...skeletonItem }} />
    </div>
  );
}

function sortOutcomesAscending(outcomes = []) {
  const poList = [];
  const psoList = [];
  const otherList = [];

  outcomes.forEach((item) => {
    const code = (item.code || item.outcomeCode || item.poCode || item.psoCode || '').toUpperCase();
    const type = (item.type || item.outcomeType || (code.startsWith('PSO') ? 'PSO' : 'PO')).toUpperCase();
    if (type === 'PO' || (code.startsWith('PO') && !code.startsWith('PSO'))) {
      poList.push(item);
    } else if (type === 'PSO' || code.startsWith('PSO')) {
      psoList.push(item);
    } else {
      otherList.push(item);
    }
  });

  const naturalSort = (a, b) => {
    const codeA = a.code || a.outcomeCode || a.poCode || a.psoCode || '';
    const codeB = b.code || b.outcomeCode || b.poCode || b.psoCode || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  };

  poList.sort(naturalSort);
  psoList.sort(naturalSort);
  otherList.sort(naturalSort);

  return [...poList, ...psoList, ...otherList];
}

export default function CourseAnalyticsView() {
  const { programmeBatchId, programmeBatchCourseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlOutcomeType = searchParams.get('outcomeType') || 'PO';
  const urlOutcomeCode = searchParams.get('outcomeCode') || null;

  const [data, setData] = useState(null);
  const [availableOutcomes, setAvailableOutcomes] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [outcomeScope, setOutcomeScope] = useState(urlOutcomeCode ? 'SELECTED' : 'ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // Fetch batch catalog for course switching and complete outcome list
  useEffect(() => {
    if (!programmeBatchId) return;
    let isMounted = true;

    analyticsApi
      .getBatchOverview(programmeBatchId)
      .then((res) => {
        if (!isMounted) return;
        const payload = res?.data ?? res;
        if (payload) {
          // Aggregate outcomes
          const poList = (payload.poHealth || []).map((p) => ({
            code: p.poCode,
            type: 'PO',
            statement: p.poStatement,
          }));
          const psoList = (payload.psoHealth || []).map((p) => ({
            code: p.psoCode,
            type: 'PSO',
            statement: p.psoStatement,
          }));
          setAvailableOutcomes(sortOutcomesAscending([...poList, ...psoList]));

          // Collect courses in this batch
          if (payload.courses) {
            setAvailableCourses(payload.courses);
          }
        }
      })
      .catch((err) => {
        console.warn('[CourseAnalyticsView] Batch overview fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [programmeBatchId]);

  // Fetch Course Analytics data
  const fetchCourseAnalytics = useCallback(async () => {
    if (!programmeBatchCourseId) {
      setError('No Course identifier provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsForbidden(false);

    try {
      const res = await analyticsApi.getCourseAnalytics({
        programmeBatchCourseId,
        outcomeCode: urlOutcomeCode,
        outcomeType: urlOutcomeType,
      });

      const payload = res?.data ?? res;
      if (payload) {
        setData(payload);
      } else {
        setError('Course analytics details are currently unavailable.');
      }
    } catch (err) {
      console.error('[CourseAnalyticsView] Error loading course analytics:', err);
      if (err?.response?.status === 403) {
        setIsForbidden(true);
        setError('You do not have permission to view analytics for this course.');
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Unable to load course analytics details.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [programmeBatchCourseId, urlOutcomeCode, urlOutcomeType]);

  useEffect(() => {
    fetchCourseAnalytics();
  }, [fetchCourseAnalytics]);

  // Handle changing outcome from dropdown: update query params without full reload
  const handleSelectOutcome = (newCode, newType) => {
    setOutcomeScope('SELECTED');
    setSearchParams({
      outcomeType: newType || 'PO',
      outcomeCode: newCode,
    });
  };

  // Handle switching course
  const handleSelectCourse = (newCourseId) => {
    if (!newCourseId || newCourseId === programmeBatchCourseId) return;
    const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '';
    const query = urlOutcomeCode
      ? `?outcomeType=${urlOutcomeType}&outcomeCode=${urlOutcomeCode}`
      : '';
    navigate(`${basePath}/analytics/batch/${programmeBatchId}/course/${newCourseId}${query}`);
  };

  if (loading) {
    return <CourseAnalyticsSkeleton />;
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
          {isForbidden ? 'Access Denied' : 'Unable to load course analytics'}
        </h2>

        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
          {error}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {!isForbidden && (
            <button
              type="button"
              onClick={fetchCourseAnalytics}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 8,
                background: '#0284c7',
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
              navigate(`${basePath}/analytics/batch/${programmeBatchId}`);
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
            <span>Back to Batch Analytics</span>
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Prepare combined outcomes list for selector (strictly sorted ascending)
  const catalogOutcomes = sortOutcomesAscending(
    availableOutcomes.length > 0
      ? availableOutcomes
      : (data.outcomes || []).map((o) => ({
          code: o.outcomeCode,
          type: o.outcomeType,
          statement: o.outcomeStatement,
        }))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Header with Breadcrumbs, Course Context, and Dropdowns */}
      <CourseAnalyticsHeader
        programmeBatchId={programmeBatchId}
        programmeBatchCourseId={programmeBatchCourseId}
        batchName={data.batchName}
        programmeName={data.programmeName}
        schoolName={data.schoolName}
        courseCode={data.courseCode}
        courseName={data.courseName}
        semester={data.semester}
        courseCoordinator={data.courseCoordinator}
        courseCoordinatorEmail={data.courseCoordinatorEmail}
        outcomeCode={urlOutcomeCode}
        outcomeType={urlOutcomeType}
        outcomeScope={outcomeScope}
        onScopeChange={setOutcomeScope}
        onSelectOutcome={handleSelectOutcome}
        availableOutcomes={catalogOutcomes}
        availableCourses={availableCourses}
        onSelectCourse={handleSelectCourse}
      />

      {/* 2. Course Overview: Overall, Direct, Indirect (ZERO course target) */}
      <CourseOverviewSection
        overallCourseAttainment={data.overallCourseAttainment}
        directAttainment={data.directAttainment}
        indirectAttainment={data.indirectAttainment}
        directWeight={data.directWeight}
        indirectWeight={data.indirectWeight}
        directThreshold={data.directThreshold}
        indirectThreshold={data.indirectThreshold}
        attainmentStatus={data.attainmentStatus}
      />

      {/* 3. Course Contribution to PO/PSO (Single or All/PO/PSO vertical chart) */}
      <CourseOutcomeContributionSection
        outcomeScope={outcomeScope}
        selectedOutcome={data.selectedOutcome}
        outcomes={data.outcomes || []}
        poContributions={data.poContributions || []}
        psoContributions={data.psoContributions || []}
        overallCourseAttainment={data.overallCourseAttainment}
        onSelectOutcome={handleSelectOutcome}
      />

      {/* 4. Course Outcomes (CO) Attainment Chart and Table with drilldown */}
      <CourseCoAttainmentSection
        courseOutcomes={data.courseOutcomes || []}
        programmeBatchId={programmeBatchId}
        programmeBatchCourseId={programmeBatchCourseId}
        outcomeCode={urlOutcomeCode}
        outcomeType={urlOutcomeType}
      />

      {/* 5. Bottom Investigation & Action Cards: Course ATR + Historical Analysis (Side-by-Side) */}
      <CourseBottomActionCards
        programmeBatchId={programmeBatchId}
        programmeBatchCourseId={programmeBatchCourseId}
        courseCode={data.courseCode}
        courseName={data.courseName}
        batchName={data.batchName}
        courseAtrAvailable={data.courseAtrAvailable}
        courseAtrStatus={data.courseAtrStatus}
      />
    </div>
  );
}
