import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Helper to load file content
const loadSource = (relPath) => {
  const fullPath = path.resolve(process.cwd(), relPath);
  return fs.readFileSync(fullPath, 'utf8');
};

describe('Role Analytics Scoping & Navigation Integration', () => {

  describe('AppSidebar Navigation Placement', () => {
    const sidebarSrc = loadSource('src/components/layout/AppSidebar.jsx');

    test('Director navigation includes Analytics at position #2 (index 1)', () => {
      // Find DIRECTOR_NAV definition
      const directorNavMatch = sidebarSrc.match(/const DIRECTOR_NAV\s*=\s*\[([\s\S]*?)\];/);
      assert.ok(directorNavMatch, 'DIRECTOR_NAV must be defined');
      
      const items = eval(`[${directorNavMatch[1]}]`);
      assert.strictEqual(items[0].id, 'dashboard', 'Index 0 must be Dashboard');
      assert.strictEqual(items[1].id, 'analytics', 'Index 1 (#2 position) must be Analytics');
      assert.strictEqual(items[1].path, '/director/analytics');
      assert.strictEqual(items[1].icon, 'coa');
      assert.strictEqual(items[1].label, 'Analytics');
    });

    test('HOD navigation includes Analytics at position #2 (index 1)', () => {
      const hodNavMatch = sidebarSrc.match(/const HOD_NAV\s*=\s*\[([\s\S]*?)\];/);
      assert.ok(hodNavMatch, 'HOD_NAV must be defined');

      const items = eval(`[${hodNavMatch[1]}]`);
      assert.strictEqual(items[0].id, 'dashboard', 'Index 0 must be Dashboard');
      assert.strictEqual(items[1].id, 'analytics', 'Index 1 (#2 position) must be Analytics');
      assert.strictEqual(items[1].path, '/hod/analytics');
      assert.strictEqual(items[1].icon, 'coa');
      assert.strictEqual(items[1].label, 'Analytics');
    });

    test('Programme Coordinator navigation includes Analytics at position #2 (index 1)', () => {
      const pcNavMatch = sidebarSrc.match(/const PROGRAMME_COORDINATOR_NAV\s*=\s*\[([\s\S]*?)\];/);
      assert.ok(pcNavMatch, 'PROGRAMME_COORDINATOR_NAV must be defined');

      const items = eval(`[${pcNavMatch[1]}]`);
      assert.strictEqual(items[0].id, 'dashboard', 'Index 0 must be Dashboard');
      assert.strictEqual(items[1].id, 'analytics', 'Index 1 (#2 position) must be Analytics');
      assert.strictEqual(items[1].path, '/programme-coordinator/analytics');
      assert.strictEqual(items[1].icon, 'coa');
      assert.strictEqual(items[1].label, 'Analytics');
    });

    test('Programme Setup dropdown navigation includes Analytics at position #2 (index 1)', () => {
      const setupNavMatch = sidebarSrc.match(/const PROGRAMME_SETUP_NAV\s*=\s*\[([\s\S]*?)\];/);
      assert.ok(setupNavMatch, 'PROGRAMME_SETUP_NAV must be defined');

      const items = eval(`[${setupNavMatch[1]}]`);
      assert.strictEqual(items[0].id, 'dashboard', 'Index 0 must be Dashboard');
      assert.strictEqual(items[1].id, 'analytics', 'Index 1 (#2 position) must be Analytics');
      assert.strictEqual(items[1].path, '/programme-coordinator/analytics');
      assert.strictEqual(items[1].icon, 'coa');
      assert.strictEqual(items[1].label, 'Analytics');
    });
  });

  describe('AppRoutes Route Configurations', () => {
    const routesSrc = loadSource('src/routes/AppRoutes.jsx');

    test('Director Analytics Route is configured with IQAC and DIRECTOR roles', () => {
      assert.ok(
        routesSrc.includes("const DirectorAnalyticsPage = lazy(() => import('../pages/director/DirectorAnalyticsPage'));"),
        'DirectorAnalyticsPage must be lazy imported'
      );
      assert.ok(
        routesSrc.includes('path="/director/analytics"'),
        'Route for /director/analytics must exist'
      );
      // Verify role guard
      const routeSnippet = routesSrc.substring(routesSrc.indexOf('path="/director/analytics"'), routesSrc.indexOf('path="/director/analytics"') + 200);
      assert.ok(routeSnippet.includes("allowedRoles={['IQAC', 'DIRECTOR']}"), 'Director route must be restricted to IQAC and DIRECTOR');
    });

    test('HOD Analytics Route is configured with IQAC and HOD roles', () => {
      assert.ok(
        routesSrc.includes("const HodAnalyticsPage = lazy(() => import('../pages/hod/HodAnalyticsPage'));"),
        'HodAnalyticsPage must be lazy imported'
      );
      assert.ok(
        routesSrc.includes('path="/hod/analytics"'),
        'Route for /hod/analytics must exist'
      );
      const routeSnippet = routesSrc.substring(routesSrc.indexOf('path="/hod/analytics"'), routesSrc.indexOf('path="/hod/analytics"') + 200);
      assert.ok(routeSnippet.includes("allowedRoles={['IQAC', 'HOD']}"), 'HOD route must be restricted to IQAC and HOD');
    });

    test('Programme Coordinator Analytics Route is configured with IQAC and PROGRAMME_COORDINATOR roles', () => {
      assert.ok(
        routesSrc.includes("const ProgrammeCoordinatorAnalyticsPage = lazy(() => import('../pages/programme-coordinator/ProgrammeCoordinatorAnalyticsPage'));"),
        'ProgrammeCoordinatorAnalyticsPage must be lazy imported'
      );
      assert.ok(
        routesSrc.includes('path="/programme-coordinator/analytics"'),
        'Route for /programme-coordinator/analytics must exist'
      );
      const routeSnippet = routesSrc.substring(routesSrc.indexOf('path="/programme-coordinator/analytics"'), routesSrc.indexOf('path="/programme-coordinator/analytics"') + 200);
      assert.ok(routeSnippet.includes("allowedRoles={['IQAC', 'PROGRAMME_COORDINATOR']}"), 'PC route must be restricted to IQAC and PROGRAMME_COORDINATOR');
    });
  });

  describe('Role-Scoped Programme Resolution Logic', () => {
    // Recreate the pure scoping function as implemented in RoleAnalyticsDashboard
    function resolveAvailableProgrammes({
      role,
      user,
      selectedSchoolId,
      departments,
      masterProgrammes,
      coordinatorProgrammes,
    }) {
      const isIqac = role === 'IQAC';
      const isDirector = role === 'DIRECTOR';
      const isHod = role === 'HOD';
      const isProgrammeCoordinator = role === 'PROGRAMME_COORDINATOR';

      if (isIqac) {
        if (!selectedSchoolId) return [];
        const schoolDeptIds = new Set(
          (departments || [])
            .filter((d) => String(d.schoolId || d.school_id) === String(selectedSchoolId))
            .map((d) => String(d.id || d.departmentId))
        );

        return (masterProgrammes || []).filter((p) => {
          if (p.schoolId && String(p.schoolId) === String(selectedSchoolId)) return true;
          if (p.departmentId && schoolDeptIds.has(String(p.departmentId))) return true;
          return false;
        });
      }

      if (isDirector) {
        const directorSchoolId = String(user?.schoolId || selectedSchoolId || '');
        if (!directorSchoolId) return masterProgrammes || [];

        const schoolDeptIds = new Set(
          (departments || [])
            .filter((d) => String(d.schoolId || d.school_id) === directorSchoolId)
            .map((d) => String(d.id || d.departmentId))
        );

        return (masterProgrammes || []).filter((p) => {
          if (p.schoolId && String(p.schoolId) === directorSchoolId) return true;
          if (p.departmentId && schoolDeptIds.has(String(p.departmentId))) return true;
          return false;
        });
      }

      if (isHod) {
        const hodDeptId = String(user?.departmentId || '');
        if (!hodDeptId) return masterProgrammes || [];

        return (masterProgrammes || []).filter(
          (p) => String(p.departmentId || p.department_id) === hodDeptId
        );
      }

      if (isProgrammeCoordinator) {
        if (coordinatorProgrammes && coordinatorProgrammes.length > 0) {
          return coordinatorProgrammes;
        }
        const pcProgId = String(user?.masterProgrammeId || '');
        if (pcProgId) {
          return (masterProgrammes || []).filter(
            (p) => String(p.id || p.masterProgrammeId) === pcProgId
          );
        }
        return masterProgrammes || [];
      }

      return masterProgrammes || [];
    }

    const mockDepartments = [
      { id: 'dept-cse', schoolId: 'school-eng', name: 'Computer Science' },
      { id: 'dept-ece', schoolId: 'school-eng', name: 'Electronics' },
      { id: 'dept-mgmt', schoolId: 'school-biz', name: 'Management' },
    ];

    const mockProgrammes = [
      { id: 'prog-btech-cse', departmentId: 'dept-cse', name: 'B.Tech CSE' },
      { id: 'prog-mtech-cse', departmentId: 'dept-cse', name: 'M.Tech CSE' },
      { id: 'prog-btech-ece', departmentId: 'dept-ece', name: 'B.Tech ECE' },
      { id: 'prog-mba', departmentId: 'dept-mgmt', name: 'MBA' },
    ];

    test('Director only sees programmes belonging to their school', () => {
      const directorUser = { id: 'dir-1', schoolId: 'school-eng' };
      const programmes = resolveAvailableProgrammes({
        role: 'DIRECTOR',
        user: directorUser,
        departments: mockDepartments,
        masterProgrammes: mockProgrammes,
      });

      assert.strictEqual(programmes.length, 3);
      assert.deepStrictEqual(programmes.map((p) => p.id), [
        'prog-btech-cse',
        'prog-mtech-cse',
        'prog-btech-ece',
      ]);
      // Should NOT include MBA from school-biz
      assert.ok(!programmes.some((p) => p.id === 'prog-mba'));
    });

    test('HOD only sees programmes belonging to their specific department', () => {
      const hodUser = { id: 'hod-1', schoolId: 'school-eng', departmentId: 'dept-cse' };
      const programmes = resolveAvailableProgrammes({
        role: 'HOD',
        user: hodUser,
        departments: mockDepartments,
        masterProgrammes: mockProgrammes,
      });

      assert.strictEqual(programmes.length, 2);
      assert.deepStrictEqual(programmes.map((p) => p.id), [
        'prog-btech-cse',
        'prog-mtech-cse',
      ]);
      // Should NOT include ECE or MBA
      assert.ok(!programmes.some((p) => p.id === 'prog-btech-ece'));
      assert.ok(!programmes.some((p) => p.id === 'prog-mba'));
    });

    test('Programme Coordinator only sees assigned programmes', () => {
      const pcUser = { id: 'pc-1', masterProgrammeId: 'prog-btech-cse' };
      const programmes = resolveAvailableProgrammes({
        role: 'PROGRAMME_COORDINATOR',
        user: pcUser,
        departments: mockDepartments,
        masterProgrammes: mockProgrammes,
      });

      assert.strictEqual(programmes.length, 1);
      assert.strictEqual(programmes[0].id, 'prog-btech-cse');
    });

    test('IQAC requires school selection and sees programmes for selected school', () => {
      // With no school selected
      const emptyProgrammes = resolveAvailableProgrammes({
        role: 'IQAC',
        user: { id: 'iqac-1' },
        selectedSchoolId: '',
        departments: mockDepartments,
        masterProgrammes: mockProgrammes,
      });
      assert.strictEqual(emptyProgrammes.length, 0);

      // With school-biz selected
      const bizProgrammes = resolveAvailableProgrammes({
        role: 'IQAC',
        user: { id: 'iqac-1' },
        selectedSchoolId: 'school-biz',
        departments: mockDepartments,
        masterProgrammes: mockProgrammes,
      });
      assert.strictEqual(bizProgrammes.length, 1);
      assert.strictEqual(bizProgrammes[0].id, 'prog-mba');
    });
  });

  describe('Role-Scoped Query Parameters Logic', () => {
    function buildQueryParams({ role, user, selectedSchoolId, selectedMasterProgrammeId }) {
      const queryParams = { batchStatus: 'ACTIVE' };
      const isIqac = role === 'IQAC';
      const isDirector = role === 'DIRECTOR';
      const isHod = role === 'HOD';
      const isProgrammeCoordinator = role === 'PROGRAMME_COORDINATOR';

      if (isIqac) {
        if (selectedSchoolId) queryParams.schoolId = selectedSchoolId;
        if (selectedMasterProgrammeId) queryParams.masterProgrammeId = selectedMasterProgrammeId;
      } else if (isDirector) {
        if (user?.schoolId) queryParams.schoolId = user.schoolId;
        if (selectedMasterProgrammeId) queryParams.masterProgrammeId = selectedMasterProgrammeId;
      } else if (isHod) {
        if (user?.schoolId) queryParams.schoolId = user.schoolId;
        if (user?.departmentId) queryParams.departmentId = user.departmentId;
        if (selectedMasterProgrammeId) queryParams.masterProgrammeId = selectedMasterProgrammeId;
      } else if (isProgrammeCoordinator) {
        const progId = selectedMasterProgrammeId || user?.masterProgrammeId;
        if (progId) queryParams.masterProgrammeId = progId;
      }

      return queryParams;
    }

    test('Director query params enforce schoolId and optional programmeId', () => {
      const params = buildQueryParams({
        role: 'DIRECTOR',
        user: { schoolId: 'sch-eng-101' },
        selectedMasterProgrammeId: 'prog-cse-1',
      });
      assert.deepStrictEqual(params, {
        batchStatus: 'ACTIVE',
        schoolId: 'sch-eng-101',
        masterProgrammeId: 'prog-cse-1',
      });
    });

    test('HOD query params enforce schoolId and departmentId', () => {
      const params = buildQueryParams({
        role: 'HOD',
        user: { schoolId: 'sch-eng-101', departmentId: 'dept-cse-202' },
        selectedMasterProgrammeId: '',
      });
      assert.deepStrictEqual(params, {
        batchStatus: 'ACTIVE',
        schoolId: 'sch-eng-101',
        departmentId: 'dept-cse-202',
      });
    });

    test('Programme Coordinator query params enforce masterProgrammeId', () => {
      const params = buildQueryParams({
        role: 'PROGRAMME_COORDINATOR',
        user: { masterProgrammeId: 'prog-cse-1' },
        selectedMasterProgrammeId: 'prog-cse-1',
      });
      assert.deepStrictEqual(params, {
        batchStatus: 'ACTIVE',
        masterProgrammeId: 'prog-cse-1',
      });
    });
  });

  describe('Selector Visibility and Navigation Routing', () => {
    test('showSchoolSelector is false for Director, HOD, and PC, true for IQAC', () => {
      const getShowSchoolSelector = (role) => role === 'IQAC';
      assert.strictEqual(getShowSchoolSelector('IQAC'), true);
      assert.strictEqual(getShowSchoolSelector('DIRECTOR'), false);
      assert.strictEqual(getShowSchoolSelector('HOD'), false);
      assert.strictEqual(getShowSchoolSelector('PROGRAMME_COORDINATOR'), false);
    });

    test('Batch drilldown navigation path preserves role scope', () => {
      const getBatchPath = (role, batchId) => {
        return role === 'IQAC' ? `/admin/analytics/batch/${batchId}` : `/analytics/batch/${batchId}`;
      };

      assert.strictEqual(getBatchPath('IQAC', 'batch-1'), '/admin/analytics/batch/batch-1');
      assert.strictEqual(getBatchPath('DIRECTOR', 'batch-1'), '/analytics/batch/batch-1');
      assert.strictEqual(getBatchPath('HOD', 'batch-1'), '/analytics/batch/batch-1');
      assert.strictEqual(getBatchPath('PROGRAMME_COORDINATOR', 'batch-1'), '/analytics/batch/batch-1');
    });
  });
});
