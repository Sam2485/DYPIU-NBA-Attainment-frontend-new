import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { analyticsApi, attainmentApi } from '../../../api';
import CoDirectAttainmentHeader from './CoDirectAttainmentHeader';
import CoDirectSummaryCard from './CoDirectSummaryCard';
import CoDirectThresholdChart from './CoDirectThresholdChart';
import CoDirectMarksDistributionChart from './CoDirectMarksDistributionChart';
import CoDirectStudentTable from './CoDirectStudentTable';
import CoDirectAllOverview from './CoDirectAllOverview';
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

const skeletonItem = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s infinite ease-in-out',
  borderRadius: 10,
};

function CoDirectSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ height: 130, borderRadius: 14, ...skeletonItem }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 100, borderRadius: 10, ...skeletonItem }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ height: 300, borderRadius: 14, ...skeletonItem }} />
        <div style={{ height: 300, borderRadius: 14, ...skeletonItem }} />
      </div>
      <div style={{ height: 350, borderRadius: 14, ...skeletonItem }} />
    </div>
  );
}

function unwrapResponseData(res) {
  if (!res) return null;
  if (res.data !== undefined && res.data !== null) {
    if (typeof res.data === 'object' && res.data.data !== undefined && res.data.data !== null) {
      return res.data.data;
    }
    return res.data;
  }
  return res;
}

function sortCosAscending(cos = []) {
  return [...cos].sort((a, b) => {
    const codeA = a.coCode || a.code || '';
    const codeB = b.coCode || b.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

export default function CoDirectAttainmentView() {
  const { programmeBatchId, programmeBatchCourseId, coCode: urlCoCode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlOutcomeType = searchParams.get('outcomeType') || 'PO';
  const urlOutcomeCode = searchParams.get('outcomeCode') || null;
  const initialScope = searchParams.get('coScope') || (urlCoCode && urlCoCode.toLowerCase() !== 'all' ? 'SELECTED' : 'ALL');

  const [coScope, setCoScope] = useState(initialScope);
  const [selectedCoCode, setSelectedCoCode] = useState(
    urlCoCode && urlCoCode.toLowerCase() !== 'all' ? urlCoCode.toUpperCase() : 'CO1'
  );

  const [coData, setCoData] = useState(null);
  const [studentEvidenceData, setStudentEvidenceData] = useState(null);
  const [studentTableRows, setStudentTableRows] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [availableCos, setAvailableCos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // 1. Initial Course Analytics load to discover all COs and context
  useEffect(() => {
    if (!programmeBatchCourseId) return;

    let isMounted = true;
    analyticsApi
      .getCourseAnalytics({ programmeBatchCourseId })
      .then((res) => {
        if (!isMounted) return;
        const data = unwrapResponseData(res);
        if (data) {
          setCourseData(data);
          const rawCos = data.courseOutcomes || [];
          const sorted = sortCosAscending(rawCos);
          setAvailableCos(sorted);
          if (sorted.length > 0 && (!selectedCoCode || selectedCoCode === 'CO1')) {
            const firstCode = sorted[0].coCode || sorted[0].code;
            if (urlCoCode && sorted.some((c) => (c.coCode || c.code) === urlCoCode.toUpperCase())) {
              setSelectedCoCode(urlCoCode.toUpperCase());
            } else if (firstCode) {
              setSelectedCoCode(firstCode);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load course analytics overview in CoDirectAttainmentView:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [programmeBatchCourseId, urlCoCode]);

  // 2. Fetch Detailed Direct Data for Selected CO or All CO
  const fetchDirectData = useCallback(async () => {
    if (!programmeBatchCourseId) return;

    setLoading(true);
    setError(null);
    setIsForbidden(false);

    try {
      if (coScope === 'ALL') {
        const courseRes = await analyticsApi.getCourseAnalytics({ programmeBatchCourseId });
        const cData = unwrapResponseData(courseRes);
        setCourseData(cData);
        if (cData?.courseOutcomes) {
          setAvailableCos(sortCosAscending(cData.courseOutcomes));
        }
      } else {
        const targetCo = (selectedCoCode || 'CO1').toUpperCase();

        const [coRes, evidenceRes, examRes] = await Promise.allSettled([
          analyticsApi.getCoAnalytics({
            programmeBatchCourseId,
            coCode: targetCo,
          }),
          analyticsApi.getStudentEvidence({
            programmeBatchCourseId,
            coCode: targetCo,
          }),
          attainmentApi.getExaminationAttainment(programmeBatchCourseId),
        ]);

        // Process CO Analytics
        if (coRes.status === 'fulfilled') {
          setCoData(unwrapResponseData(coRes.value));
        } else {
          const status = coRes.reason?.response?.status;
          if (status === 403) {
            setIsForbidden(true);
            return;
          }
          console.warn('CO analytics fetch failed:', coRes.reason);
        }

        // Process Student Evidence
        let evidencePayload = null;
        if (evidenceRes.status === 'fulfilled') {
          evidencePayload = unwrapResponseData(evidenceRes.value);
          setStudentEvidenceData(evidencePayload);
        } else {
          console.warn('Student evidence fetch failed:', evidenceRes.reason);
        }

        // Process Full Examination Marks Table
        let rows = [];
        if (examRes.status === 'fulfilled') {
          const examPayload = unwrapResponseData(examRes.value);
          const studentMarks = examPayload?.studentMarks || [];
          const coMaxMarks = examPayload?.coMaxMarks || {};
          const coThresholdMarks = examPayload?.coThresholdMarks || {};

          if (studentMarks.length > 0) {
            const maxM = coMaxMarks[targetCo] != null ? Number(coMaxMarks[targetCo]) : 100;
            const threshM = coThresholdMarks[targetCo] != null ? Number(coThresholdMarks[targetCo]) : null;

            rows = studentMarks
              .map((s, idx) => {
                const markVal = s.coMarks?.[targetCo] != null ? Number(s.coMarks[targetCo]) : null;
                const pct = markVal != null && maxM > 0 ? (markVal / maxM) * 100 : null;
                const isMet = markVal != null && threshM != null ? markVal >= threshM : false;

                return {
                  id: s.prn || `std-${idx}`,
                  prn: s.prn,
                  studentName: s.studentName,
                  marksObtained: markVal,
                  maxMarks: maxM,
                  percentage: pct,
                  thresholdMarks: threshM,
                  thresholdMet: isMet,
                };
              })
              .filter((r) => r.marksObtained != null);
          }
        }

        // Fallback to studentEvidence studentRecords if exam marks table was empty
        if (rows.length === 0 && evidencePayload?.studentRecords?.length > 0) {
          rows = evidencePayload.studentRecords.map((r, idx) => ({
            id: r.studentIdentifier || `std-${idx}`,
            prn: r.maskedPrn,
            studentName: r.studentIdentifier,
            marksObtained: r.marksObtained,
            maxMarks: r.maxMarks,
            percentage: r.percentage,
            thresholdMarks: null,
            thresholdMet: r.thresholdMet,
          }));
        }

        setStudentTableRows(rows);
      }
    } catch (err) {
      console.error('Failed to load CO Direct Attainment evidence:', err);
      const status = err?.response?.status;
      if (status === 403) {
        setIsForbidden(true);
      } else {
        setError(err.message || 'Unable to load direct assessment evidence for this Course Outcome.');
      }
    } finally {
      setLoading(false);
    }
  }, [programmeBatchCourseId, coScope, selectedCoCode]);

  useEffect(() => {
    fetchDirectData();
  }, [fetchDirectData]);

  const handleCoScopeChange = (newScope) => {
    setCoScope(newScope);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('coScope', newScope);
    setSearchParams(newParams, { replace: true });
  };

  const handleSelectCo = (newCoCode) => {
    const code = newCoCode.toUpperCase();
    setSelectedCoCode(code);
    setCoScope('SELECTED');
    const newParams = new URLSearchParams(searchParams);
    newParams.set('coScope', 'SELECTED');
    setSearchParams(newParams, { replace: true });
  };

  if (isForbidden) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #fee2e2',
          padding: 40,
          textAlign: 'center',
          maxWidth: 600,
          margin: '40px auto',
        }}
      >
        <ShieldAlert size={48} style={{ color: '#dc2626', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#991b1b', marginBottom: 8 }}>
          Access Denied
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
          You do not have authorization to inspect direct assessment student marks for this course offering.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} />
          <span>Return to Previous Screen</span>
        </button>
      </div>
    );
  }

  if (loading && !coData && !courseData) {
    return <CoDirectSkeleton />;
  }

  if (error && !coData && !courseData) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #fecaca',
          padding: 40,
          textAlign: 'center',
          maxWidth: 600,
          margin: '40px auto',
        }}
      >
        <AlertCircle size={48} style={{ color: '#dc2626', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#991b1b', marginBottom: 8 }}>
          Unable to Load Student Evidence
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
          {error}
        </p>
        <button
          type="button"
          onClick={fetchDirectData}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const activeCourse = courseData || coData;
  const directEvidenceSummary = coData?.directEvidenceSummary;

  const evaluatedStudents = directEvidenceSummary?.evaluatedStudents ?? studentEvidenceData?.totalStudentsEvaluated ?? null;
  const totalStudents = directEvidenceSummary?.totalStudents ?? studentEvidenceData?.totalStudentsEvaluated ?? null;
  const thresholdVal = directEvidenceSummary?.threshold ?? studentEvidenceData?.configuredThresholdPercentage ?? 60;
  const studentsMeeting = directEvidenceSummary?.studentsMeetingThreshold ?? studentEvidenceData?.studentsMeetingThreshold ?? 0;
  const studentsBelow = studentEvidenceData?.studentsBelowThreshold != null
    ? studentEvidenceData.studentsBelowThreshold
    : (evaluatedStudents != null ? Math.max(0, evaluatedStudents - studentsMeeting) : 0);
  const passingPct = directEvidenceSummary?.directPercentage ?? studentEvidenceData?.attainmentRatePercentage ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Header & Context */}
      <CoDirectAttainmentHeader
        programmeBatchId={programmeBatchId}
        programmeBatchCourseId={programmeBatchCourseId}
        batchName={activeCourse?.batchName}
        programmeName={activeCourse?.programmeName}
        courseCode={activeCourse?.courseCode}
        courseName={activeCourse?.courseName}
        semester={activeCourse?.semester}
        courseCoordinator={activeCourse?.courseCoordinator || activeCourse?.courseCoordinatorName}
        coCode={coScope === 'SELECTED' ? selectedCoCode : 'All COs'}
        coStatement={coScope === 'SELECTED' ? coData?.coStatement : 'All Course Outcomes Direct Attainment Overview'}
        coScope={coScope}
        onCoScopeChange={handleCoScopeChange}
        onSelectCo={handleSelectCo}
        availableCos={availableCos}
        outcomeCode={urlOutcomeCode}
        outcomeType={urlOutcomeType}
      />

      {/* 2. Body based on Scope */}
      {coScope === 'ALL' ? (
        <CoDirectAllOverview
          courseOutcomes={courseData?.courseOutcomes || availableCos}
          onSelectCo={handleSelectCo}
        />
      ) : (
        <>
          {/* Summary Metric Cards */}
          <CoDirectSummaryCard
            coCode={selectedCoCode}
            directAttainment={coData?.directAttainment}
            directLevel={directEvidenceSummary?.directLevel}
            target={coData?.target}
            targetMet={coData?.targetMet}
            totalStudents={totalStudents}
            evaluatedStudents={evaluatedStudents}
            studentsMeetingThreshold={studentsMeeting}
            studentsBelowThreshold={studentsBelow}
            threshold={thresholdVal}
            passingPercentage={passingPct}
            directWeight={coData?.directWeight || 80}
          />

          {/* Visualizations: Threshold Comparison & Marks Distribution */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: 24,
            }}
          >
            {/* Chart 1: Students vs Direct Threshold (Vertical Bar Chart) */}
            <CoDirectThresholdChart
              studentsMeetingThreshold={studentsMeeting}
              studentsBelowThreshold={studentsBelow}
              thresholdPercentage={thresholdVal}
              coCode={selectedCoCode}
            />

            {/* Chart 2: Marks Distribution (Vertical Bar Chart) */}
            <CoDirectMarksDistributionChart
              scoreDistribution={studentEvidenceData?.scoreDistribution}
              coCode={selectedCoCode}
              classAveragePercentage={studentEvidenceData?.classAveragePercentage}
              highestPercentage={studentEvidenceData?.highestPercentage}
              lowestPercentage={studentEvidenceData?.lowestPercentage}
            />
          </div>

          {/* Detailed Student Evidence Table */}
          <CoDirectStudentTable
            students={studentTableRows}
            coCode={selectedCoCode}
            thresholdPercentage={thresholdVal}
          />
        </>
      )}
    </div>
  );
}
