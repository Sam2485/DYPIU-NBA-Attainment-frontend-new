import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School as SchoolIcon,
  Building2,
  GraduationCap,
  Calendar,
  BookOpen,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/user';
import { approvalsApi, dashboardApi } from '../../api';

import OperationalKpiCard from './components/OperationalKpiCard';
import OperationalDonutChart from './components/OperationalDonutChart';
import OperationalBarChart from './components/OperationalBarChart';
import OperationalScopeSelector from './components/OperationalScopeSelector';
import OperationalActionQueue from './components/OperationalActionQueue';
import OperationalWorkloadBreakdown from './components/OperationalWorkloadBreakdown';

export default function InstitutionalOperationalDashboard() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const {
    schools = [],
    departments = [],
    masterProgrammes = [],
    programmes = [],
    batches = [],
    courseOfferings = [],
    loadSchools = () => Promise.resolve([]),
    loadDepartments = () => Promise.resolve([]),
    loadMasterProgrammes = () => Promise.resolve([]),
    loadProgrammeBatches = () => Promise.resolve([]),
    loadCourseOfferings = () => Promise.resolve([]),
    loadAssignedCourseOfferings = () => Promise.resolve([]),
  } = useAcademic();

  const { users = [], refreshUsers = () => Promise.resolve([]) } = useUser();

  // Role permissions and locking
  const isIqac = role === 'IQAC' || role === 'SUPER_ADMIN';
  const isDirector = role === 'DIRECTOR';
  const isHod = role === 'HOD';
  const isPc = role === 'PROGRAMME_COORDINATOR';
  const isCc = role === 'FACULTY' || role === 'COURSE_COORDINATOR';

  // Cascading Scope State
  const [selectedSchoolId, setSelectedSchoolId] = useState(isDirector || isHod ? user?.schoolId || null : null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(isHod ? user?.departmentId || null : null);
  const [selectedMasterProgrammeId, setSelectedMasterProgrammeId] = useState(isPc ? user?.masterProgrammeId || null : null);
  const [selectedProgrammeBatchId, setSelectedProgrammeBatchId] = useState(null);

  // Operational Data State
  const [isLoading, setIsLoading] = useState(true);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [roleDashboardData, setRoleDashboardData] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);

  // Combined master programmes
  const allProgrammes = useMemo(() => {
    if (masterProgrammes && masterProgrammes.length > 0) return masterProgrammes;
    if (programmes && programmes.length > 0) return programmes;
    return [];
  }, [masterProgrammes, programmes]);

  // Initial metadata loader
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.allSettled([
        loadSchools().catch(() => []),
        loadDepartments().catch(() => []),
        loadMasterProgrammes().catch(() => []),
        refreshUsers().catch(() => []),
      ]);

      // Fetch pending approvals
      try {
        const approvalsRes = await approvalsApi.getApprovals();
        const appList = approvalsRes?.data?.data ?? approvalsRes?.data ?? [];
        setApprovalRequests(Array.isArray(appList) ? appList : []);
      } catch {
        setApprovalRequests([]);
      }

      // Role-specific operational fetch
      if (isDirector && user?.schoolId) {
        try {
          const dirRes = await dashboardApi.getDirectorDashboard(user.schoolId);
          setRoleDashboardData(dirRes?.data?.data ?? dirRes?.data ?? null);
        } catch {}
      } else if (isHod && user?.departmentId) {
        try {
          const hodRes = await dashboardApi.getHodDashboard(user.departmentId);
          setRoleDashboardData(hodRes?.data?.data ?? hodRes?.data ?? null);
        } catch {}
      } else if (isPc && user?.masterProgrammeId) {
        try {
          const pcRes = await dashboardApi.getProgrammeCoordinatorDashboard(user.masterProgrammeId);
          setRoleDashboardData(pcRes?.data?.data ?? pcRes?.data ?? null);
        } catch {}
      } else if (isCc) {
        try {
          const assigned = await loadAssignedCourseOfferings(user, selectedProgrammeBatchId);
          setAssignedCourses(Array.isArray(assigned) ? assigned : []);
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isCc,
    isDirector,
    isHod,
    isPc,
    loadAssignedCourseOfferings,
    loadDepartments,
    loadMasterProgrammes,
    loadSchools,
    refreshUsers,
    selectedProgrammeBatchId,
    user,
  ]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Scope handlers
  const handleSelectSchool = useCallback((schoolId) => {
    setSelectedSchoolId(schoolId || null);
    setSelectedDepartmentId(null);
    setSelectedMasterProgrammeId(null);
    setSelectedProgrammeBatchId(null);
    if (schoolId) {
      loadDepartments(schoolId).catch(() => {});
    }
  }, [loadDepartments]);

  const handleSelectDepartment = useCallback((deptId) => {
    setSelectedDepartmentId(deptId || null);
    setSelectedMasterProgrammeId(null);
    setSelectedProgrammeBatchId(null);
    if (deptId) {
      loadMasterProgrammes(deptId).catch(() => {});
    }
  }, [loadMasterProgrammes]);

  const handleSelectProgramme = useCallback((progId) => {
    setSelectedMasterProgrammeId(progId || null);
    setSelectedProgrammeBatchId(null);
    if (progId) {
      loadProgrammeBatches(progId).catch(() => {});
    }
  }, [loadProgrammeBatches]);

  const handleSelectBatch = useCallback((batchId) => {
    setSelectedProgrammeBatchId(batchId || null);
    if (batchId) {
      loadCourseOfferings(batchId).catch(() => {});
    }
  }, [loadCourseOfferings]);

  const handleResetScope = useCallback(() => {
    if (!isDirector && !isHod) setSelectedSchoolId(null);
    if (!isHod) setSelectedDepartmentId(null);
    if (!isPc) setSelectedMasterProgrammeId(null);
    setSelectedProgrammeBatchId(null);
  }, [isDirector, isHod, isPc]);

  // Filtered entity lists based on cascading selection
  const filteredDepartments = useMemo(() => {
    if (!selectedSchoolId) return departments;
    return departments.filter((d) => String(d.schoolId) === String(selectedSchoolId));
  }, [departments, selectedSchoolId]);

  const filteredProgrammes = useMemo(() => {
    if (!selectedDepartmentId) {
      if (selectedSchoolId) {
        const deptIds = new Set(filteredDepartments.map((d) => String(d.id || d.departmentId)));
        return allProgrammes.filter((p) => deptIds.has(String(p.departmentId)));
      }
      return allProgrammes;
    }
    return allProgrammes.filter((p) => String(p.departmentId) === String(selectedDepartmentId));
  }, [allProgrammes, filteredDepartments, selectedDepartmentId, selectedSchoolId]);

  const filteredBatches = useMemo(() => {
    if (!selectedMasterProgrammeId) return batches;
    return batches.filter(
      (b) => String(b.masterProgrammeId || b.programmeId) === String(selectedMasterProgrammeId)
    );
  }, [batches, selectedMasterProgrammeId]);

  const filteredUsers = useMemo(() => {
    if (!selectedSchoolId) return users;
    return users.filter((u) => String(u.schoolId) === String(selectedSchoolId));
  }, [selectedSchoolId, users]);

  // Scoped active counts
  const countSchools = selectedSchoolId ? 1 : schools.length;
  const countDepartments = filteredDepartments.length;
  const countProgrammes = filteredProgrammes.length;
  const countBatches = filteredBatches.length;
  const countUsers = filteredUsers.length;

  // Derive Approval & Report Workflow Counts from Authoritative Approval Requests
  const pendingApprovalsCount = useMemo(() => {
    let list = approvalRequests.filter((a) => a.status === 'PENDING');
    if (selectedSchoolId) {
      list = list.filter((a) => String(a.schoolId) === String(selectedSchoolId));
    }
    if (selectedMasterProgrammeId) {
      list = list.filter((a) => String(a.masterProgrammeId) === String(selectedMasterProgrammeId));
    }
    return list.length;
  }, [approvalRequests, selectedMasterProgrammeId, selectedSchoolId]);

  const approvedApprovalsCount = useMemo(() => {
    let list = approvalRequests.filter((a) => a.status === 'APPROVED');
    if (selectedSchoolId) {
      list = list.filter((a) => String(a.schoolId) === String(selectedSchoolId));
    }
    if (selectedMasterProgrammeId) {
      list = list.filter((a) => String(a.masterProgrammeId) === String(selectedMasterProgrammeId));
    }
    return list.length;
  }, [approvalRequests, selectedMasterProgrammeId, selectedSchoolId]);

  const revisionApprovalsCount = useMemo(() => {
    let list = approvalRequests.filter(
      (a) => a.status === 'REVISION_REQUESTED' || a.status === 'NEEDS_REVISION'
    );
    if (selectedSchoolId) {
      list = list.filter((a) => String(a.schoolId) === String(selectedSchoolId));
    }
    if (selectedMasterProgrammeId) {
      list = list.filter((a) => String(a.masterProgrammeId) === String(selectedMasterProgrammeId));
    }
    return list.length;
  }, [approvalRequests, selectedMasterProgrammeId, selectedSchoolId]);

  // Donut chart dataset (Authoritative Report & Workflow Status)
  const reportStatusDistribution = useMemo(() => {
    const approved = approvedApprovalsCount || (roleDashboardData?.statistics?.approvedReports ?? 0);
    const underReview = pendingApprovalsCount || (roleDashboardData?.statistics?.pendingApprovalsCount ?? 0);
    const revision = revisionApprovalsCount || (roleDashboardData?.statistics?.revisionCount ?? 0);
    const notSubmitted = Math.max(
      (countBatches * 2) - (approved + underReview + revision),
      0
    );

    return [
      { label: 'Approved', count: approved, color: '#10b981' },
      { label: 'Under Review', count: underReview, color: '#6366f1' },
      { label: 'Revision Required', count: revision, color: '#ef4444' },
      { label: 'Pending Submission', count: notSubmitted, color: '#f59e0b' },
    ];
  }, [
    approvedApprovalsCount,
    countBatches,
    pendingApprovalsCount,
    revisionApprovalsCount,
    roleDashboardData,
  ]);

  // Bar chart dataset: Department / Programme Workload Comparison
  const workloadComparisonData = useMemo(() => {
    if (filteredDepartments.length > 0 && !selectedDepartmentId) {
      return filteredDepartments.slice(0, 7).map((dept, idx) => {
        const deptProgs = allProgrammes.filter(
          (p) => String(p.departmentId) === String(dept.id || dept.departmentId)
        );
        const colors = ['#4f46e5', '#0284c7', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];
        return {
          label: dept.name || `Department ${idx + 1}`,
          value: deptProgs.length,
          color: colors[idx % colors.length],
          secondaryText: `${deptProgs.length} Programmes`,
        };
      });
    }

    if (filteredProgrammes.length > 0) {
      return filteredProgrammes.slice(0, 7).map((prog, idx) => {
        const progBatches = batches.filter(
          (b) => String(b.masterProgrammeId || b.programmeId) === String(prog.id || prog.masterProgrammeId)
        );
        const colors = ['#4f46e5', '#0284c7', '#7c3aed', '#059669', '#d97706'];
        return {
          label: prog.name || `Programme ${idx + 1}`,
          value: progBatches.length || 1,
          color: colors[idx % colors.length],
          secondaryText: `${progBatches.length} Batches`,
        };
      });
    }

    return [];
  }, [allProgrammes, batches, filteredDepartments, filteredProgrammes, selectedDepartmentId]);

  // Role-Aware Action Queue Items
  const actionItems = useMemo(() => {
    const items = [];

    if (pendingApprovalsCount > 0) {
      items.push({
        id: 'pending-approvals',
        title: `${pendingApprovalsCount} Reports / Frameworks Awaiting Review`,
        description: 'Submission requests pending approval at your administrative stage.',
        count: pendingApprovalsCount,
        type: 'urgent',
        path: isHod ? '/hod/approvals' : isPc ? '/coordinator-review' : isDirector ? '/director/reports' : '/hod/approvals',
        buttonLabel: 'Review Now',
      });
    }

    if (revisionApprovalsCount > 0) {
      items.push({
        id: 'revision-required',
        title: `${revisionApprovalsCount} Items Requiring Quality Revision`,
        description: 'Returned submissions requiring coordinator revisions and corrections.',
        count: revisionApprovalsCount,
        type: 'warning',
        path: isCc ? '/course-atr' : isPc ? '/coordinator-review' : '/hod/approvals',
        buttonLabel: 'View Items',
      });
    }

    if (isDirector && roleDashboardData?.statistics?.unassignedHODs > 0) {
      items.push({
        id: 'unassigned-hods',
        title: `${roleDashboardData.statistics.unassignedHODs} Departments Without Assigned HOD`,
        description: 'Assign Heads of Department to complete school organizational structure.',
        count: roleDashboardData.statistics.unassignedHODs,
        type: 'pending',
        path: '/director/department-management',
        buttonLabel: 'Assign HODs',
      });
    }

    if (isPc && (!batches || batches.length === 0)) {
      items.push({
        id: 'setup-pc',
        title: 'Initialize Programme Batch Setup',
        description: 'Define programme-batch courses and target thresholds for active cycle.',
        type: 'info',
        path: '/programme-coordinator/setup-workflow',
        buttonLabel: 'Start Setup',
      });
    }

    if (isCc && assignedCourses.length > 0) {
      items.push({
        id: 'course-assessment',
        title: `${assignedCourses.length} Assigned Course Assessment Portfolios`,
        description: 'Upload direct marks and indirect survey evidence for assigned courses.',
        count: assignedCourses.length,
        type: 'info',
        path: '/marks-upload',
        buttonLabel: 'Upload Marks',
      });
    }

    return items;
  }, [
    assignedCourses.length,
    batches,
    isCc,
    isDirector,
    isHod,
    isPc,
    pendingApprovalsCount,
    revisionApprovalsCount,
    roleDashboardData,
  ]);

  // Responsible Role Workload Breakdown Items
  const workloadItems = useMemo(() => {
    return [
      {
        role: 'DIRECTOR',
        roleLabel: 'School Director',
        label: 'Director Approvals',
        pendingCount: isDirector ? pendingApprovalsCount : Math.min(pendingApprovalsCount, 2),
        description: 'School structure, department setups & final governance review',
      },
      {
        role: 'HOD',
        roleLabel: 'Head of Department',
        label: 'Department Approvals',
        pendingCount: isHod ? pendingApprovalsCount : Math.min(pendingApprovalsCount, 4),
        description: 'PO/PSO targets, coordinator allocations & batch approvals',
      },
      {
        role: 'PROGRAMME_COORDINATOR',
        roleLabel: 'Programme Coordinator',
        label: 'Course Verifications',
        pendingCount: isPc ? pendingApprovalsCount : Math.min(pendingApprovalsCount, 5),
        description: 'CO definitions, attainment configurations & course ATR verification',
      },
      {
        role: 'COURSE_COORDINATOR',
        roleLabel: 'Course Coordinator',
        label: 'Assessment Submissions',
        pendingCount: revisionApprovalsCount,
        description: 'Direct marks upload, student survey entry & course ATR actions',
      },
    ];
  }, [isDirector, isHod, isPc, pendingApprovalsCount, revisionApprovalsCount]);

  return (
    <div className="animated-page" style={{ paddingBottom: 40 }}>
      {/* 1. Global Cascading Scope Selector */}
      <OperationalScopeSelector
        schools={schools}
        departments={filteredDepartments}
        programmes={filteredProgrammes}
        batches={filteredBatches}
        selectedSchoolId={selectedSchoolId}
        selectedDepartmentId={selectedDepartmentId}
        selectedMasterProgrammeId={selectedMasterProgrammeId}
        selectedProgrammeBatchId={selectedProgrammeBatchId}
        onSelectSchool={handleSelectSchool}
        onSelectDepartment={handleSelectDepartment}
        onSelectProgramme={handleSelectProgramme}
        onSelectBatch={handleSelectBatch}
        onReset={handleResetScope}
        isSchoolLocked={isDirector || isHod}
        isDepartmentLocked={isHod}
        isProgrammeLocked={isPc}
      />

      {/* 2. Operational Overview KPI Grid */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
            Operational Overview
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Live institutional counts and workflow metrics for selected scope
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          {isIqac && (
            <>
              <OperationalKpiCard
                title="Schools"
                value={countSchools}
                subtitle="Academic schools"
                icon={SchoolIcon}
                iconColor="#4f46e5"
                iconBg="#eef2ff"
                animationDelay={0}
                isLoading={isLoading}
                onClick={() => navigate('/admin/schools')}
              />
              <OperationalKpiCard
                title="Departments"
                value={countDepartments}
                subtitle="Active departments"
                icon={Building2}
                iconColor="#0284c7"
                iconBg="#f0f9ff"
                animationDelay={60}
                isLoading={isLoading}
                onClick={() => navigate('/director/department-management')}
              />
              <OperationalKpiCard
                title="Programmes"
                value={countProgrammes}
                subtitle="Degree programmes"
                icon={GraduationCap}
                iconColor="#7c3aed"
                iconBg="#f5f3ff"
                animationDelay={120}
                isLoading={isLoading}
                onClick={() => navigate('/director/programme-overview')}
              />
              <OperationalKpiCard
                title="Faculty & Users"
                value={countUsers}
                subtitle="Institutional members"
                icon={Users}
                iconColor="#059669"
                iconBg="#f0fdf4"
                animationDelay={180}
                isLoading={isLoading}
                onClick={() => navigate('/admin/users')}
              />
            </>
          )}

          {isDirector && (
            <>
              <OperationalKpiCard
                title="Departments"
                value={countDepartments}
                subtitle="In current school"
                icon={Building2}
                iconColor="#4f46e5"
                iconBg="#eef2ff"
                animationDelay={0}
                isLoading={isLoading}
                onClick={() => navigate('/director/department-management')}
              />
              <OperationalKpiCard
                title="Programmes"
                value={countProgrammes}
                subtitle="Active degree programmes"
                icon={GraduationCap}
                iconColor="#0284c7"
                iconBg="#f0f9ff"
                animationDelay={60}
                isLoading={isLoading}
                onClick={() => navigate('/director/programme-overview')}
              />
              <OperationalKpiCard
                title="Active Batches"
                value={countBatches}
                subtitle="Cohort cycles"
                icon={Calendar}
                iconColor="#7c3aed"
                iconBg="#f5f3ff"
                animationDelay={120}
                isLoading={isLoading}
              />
              <OperationalKpiCard
                title="Pending Approvals"
                value={pendingApprovalsCount}
                subtitle="Awaiting Director review"
                icon={ShieldCheck}
                iconColor="#d97706"
                iconBg="#fffbeb"
                badgeText={pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Action` : null}
                badgeType={pendingApprovalsCount > 0 ? 'warning' : 'success'}
                animationDelay={180}
                isLoading={isLoading}
                onClick={() => navigate('/director/reports')}
              />
            </>
          )}

          {isHod && (
            <>
              <OperationalKpiCard
                title="Programmes"
                value={countProgrammes}
                subtitle="In your department"
                icon={GraduationCap}
                iconColor="#4f46e5"
                iconBg="#eef2ff"
                animationDelay={0}
                isLoading={isLoading}
                onClick={() => navigate('/hod/batch-management')}
              />
              <OperationalKpiCard
                title="Active Batches"
                value={countBatches}
                subtitle="Graduating batches"
                icon={Calendar}
                iconColor="#0284c7"
                iconBg="#f0f9ff"
                animationDelay={60}
                isLoading={isLoading}
                onClick={() => navigate('/hod/batch-management')}
              />
              <OperationalKpiCard
                title="Pending Approvals"
                value={pendingApprovalsCount}
                subtitle="Awaiting HOD approval"
                icon={ShieldCheck}
                iconColor="#d97706"
                iconBg="#fffbeb"
                badgeText={pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Urgent` : null}
                badgeType={pendingApprovalsCount > 0 ? 'danger' : 'success'}
                animationDelay={120}
                isLoading={isLoading}
                onClick={() => navigate('/hod/approvals')}
              />
              <OperationalKpiCard
                title="Reports Approved"
                value={approvedApprovalsCount}
                subtitle="Completed reviews"
                icon={Award}
                iconColor="#059669"
                iconBg="#f0fdf4"
                animationDelay={180}
                isLoading={isLoading}
                onClick={() => navigate('/hod/reports')}
              />
            </>
          )}

          {isPc && (
            <>
              <OperationalKpiCard
                title="Programme Batches"
                value={countBatches}
                subtitle="Assigned cohorts"
                icon={Calendar}
                iconColor="#4f46e5"
                iconBg="#eef2ff"
                animationDelay={0}
                isLoading={isLoading}
                onClick={() => navigate('/programme-coordinator/manage-courses')}
              />
              <OperationalKpiCard
                title="Course Offerings"
                value={roleDashboardData?.statistics?.programmeBatchCoursesCount ?? courseOfferings.length}
                subtitle="Curriculum courses"
                icon={BookOpen}
                iconColor="#0284c7"
                iconBg="#f0f9ff"
                animationDelay={60}
                isLoading={isLoading}
                onClick={() => navigate('/programme-coordinator/manage-courses')}
              />
              <OperationalKpiCard
                title="Pending Verifications"
                value={pendingApprovalsCount}
                subtitle="Course submissions to verify"
                icon={Clock}
                iconColor="#d97706"
                iconBg="#fffbeb"
                badgeText={pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : null}
                badgeType={pendingApprovalsCount > 0 ? 'warning' : 'success'}
                animationDelay={120}
                isLoading={isLoading}
                onClick={() => navigate('/coordinator-review')}
              />
              <OperationalKpiCard
                title="Revision Requests"
                value={revisionApprovalsCount}
                subtitle="Returned for revisions"
                icon={AlertTriangle}
                iconColor="#dc2626"
                iconBg="#fef2f2"
                animationDelay={180}
                isLoading={isLoading}
                onClick={() => navigate('/coordinator-review')}
              />
            </>
          )}

          {isCc && (
            <>
              <OperationalKpiCard
                title="Assigned Courses"
                value={assignedCourses.length || 1}
                subtitle="Courses assigned to you"
                icon={BookOpen}
                iconColor="#4f46e5"
                iconBg="#eef2ff"
                animationDelay={0}
                isLoading={isLoading}
              />
              <OperationalKpiCard
                title="Direct Assessment"
                value={assignedCourses.length > 0 ? 'Active' : 'Pending'}
                subtitle="End-sem marks upload"
                icon={TrendingUp}
                iconColor="#0284c7"
                iconBg="#f0f9ff"
                animationDelay={60}
                isLoading={isLoading}
                onClick={() => navigate('/marks-upload')}
              />
              <OperationalKpiCard
                title="Course ATR"
                value={revisionApprovalsCount > 0 ? `${revisionApprovalsCount} Revision` : 'In Progress'}
                subtitle="Corrective action report"
                icon={FileText}
                iconColor="#7c3aed"
                iconBg="#f5f3ff"
                animationDelay={120}
                isLoading={isLoading}
                onClick={() => navigate('/course-atr')}
              />
              <OperationalKpiCard
                title="Verification Status"
                value={pendingApprovalsCount > 0 ? 'Under Review' : 'Verified'}
                subtitle="Coordinator review status"
                icon={CheckCircle2}
                iconColor="#059669"
                iconBg="#f0fdf4"
                animationDelay={180}
                isLoading={isLoading}
                onClick={() => navigate('/reports')}
              />
            </>
          )}
        </div>
      </div>

      {/* 3. Visual Workflow Charts Section (Donut Chart + Comparison Bar Chart) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <OperationalDonutChart
          title="Workflow Status Distribution"
          subtitle="Real-time submission and approval states across scope"
          data={reportStatusDistribution}
          totalLabel="Total Items"
          onSliceClick={(slice) => {
            if (slice.label === 'Under Review') {
              if (isHod) navigate('/hod/approvals');
              else if (isPc) navigate('/coordinator-review');
              else if (isDirector) navigate('/director/reports');
            } else if (slice.label === 'Revision Required') {
              if (isCc) navigate('/course-atr');
              else if (isPc) navigate('/coordinator-review');
            }
          }}
        />

        <OperationalBarChart
          title={
            filteredDepartments.length > 0 && !selectedDepartmentId
              ? 'Programmes by Department'
              : 'Batches by Programme'
          }
          subtitle="Workload and organizational distribution"
          data={workloadComparisonData}
          valueLabel={
            filteredDepartments.length > 0 && !selectedDepartmentId ? 'Programmes' : 'Batches'
          }
          onBarClick={(item) => {
            if (filteredDepartments.length > 0 && !selectedDepartmentId) {
              const matchedDept = departments.find((d) => d.name === item.label);
              if (matchedDept) handleSelectDepartment(matchedDept.id || matchedDept.departmentId);
            }
          }}
        />
      </div>

      {/* 4. Action Required Section */}
      <div style={{ marginBottom: 24 }}>
        <OperationalActionQueue
          actions={actionItems}
          emptyMessage="No pending reviews or revision requests for your current scope."
        />
      </div>

      {/* 5. Workload Concentration ("Who Needs to Act?") */}
      <div style={{ marginBottom: 12 }}>
        <OperationalWorkloadBreakdown workloadItems={workloadItems} />
      </div>
    </div>
  );
}
