# PHASE 2 — ACADEMIC CONTEXT LAZY-LOADING REPORT

**Target File Modified:** `src/context/academic.jsx`  
**Working Directory:** `/Users/rajshaikh/Desktop/dypiu-nba-attainment-frontend copy`  
**Execution Date:** August 21, 2026  
**Build Status:** `✓ built in 529ms (0 errors, 0 warnings)`

---

## 1. Executive Summary

In this refactor phase, `AcademicProvider` in `src/context/academic.jsx` was refactored from an eager auto-fetching provider into a strictly lazy-loaded provider. All broad `useEffect` cascading chains that eagerly triggered network requests on mount, programme selection, batch selection, course selection, and course-offering changes have been completely removed. All entity loading has been transformed into explicit, callable loader functions with isolated error handling (`try...catch`) so that single API failures do not wipe out unrelated working state or cause component tree crashes.

---

## 2. Every `useEffect` Removed / Changed

| Previous `useEffect` Location / Trigger | Previous Behavior (Eager Auto-Fetch) | Refactored Status | Rationale |
|---|---|---|---|
| **Mount `useEffect`** (former lines 860–920) | Automatically called `loadSchools()` on provider mount and auto-selected `firstSchool.id`. | **Removed** | Prevents arbitrary network calls during provider initialization before user/screen intent is known. Screens call `loadSchools()` explicitly when needed. |
| **Programme Change `useEffect`** (former lines 926–1019) | On any `programmeId` change, automatically dispatched parallel calls to `loadBatches({ targetProgrammeId })` and `loadCourses({ targetProgrammeId })`. | **Removed** | Prevents unsolicited cascading API calls across routes. Batch and course loading are now explicit loaders (`loadBatches`, `loadCourses`). |
| **Batch Change `useEffect`** (former lines 1025–1046) | On any `batchId` change, automatically dispatched `loadCourseOfferings(batchId)`. | **Removed** | Prevents eager course-offering requests. Screens invoke `loadCourseOfferings(batchId)` on demand. |
| **Course Coordinators `useEffect`** (former lines 1115–1134) | On any role change (`PROGRAMME_COORDINATOR`, `HOD`, `DIRECTOR`, `ADMIN`), automatically dispatched `loadCourseCoordinators()` (`GET /users?role=FACULTY`). | **Removed** | Replaced with explicit callable loader `loadCourseCoordinators()`. |
| **Programme Outcomes `useEffect`** (former lines 1222–1234) | On any `programmeId` change, automatically dispatched 4 simultaneous requests (`/pos`, `/psos`, `/peos`, `/targets`). | **Removed** | Replaced with explicit callable loaders `loadProgrammeOutcomes()` and `loadProgrammeTargets()`. |
| **Course Workflow Hydration `useEffect`** (former lines 1397–1450) | On any `courseOfferingId` change, automatically dispatched 5 simultaneous requests: `loadCourseOutcomes()`, `loadCourseMapping()`, `loadAttainmentSettings()`, `loadCOAttainment()`, `loadCourseATR()`. | **Removed** | Eliminated heavy eager waterfall. Each feature screen/hub calls its specific loader when mounted. |

---

## 3. APIs That Previously Loaded Automatically

The following 15 APIs previously executed automatically via `useEffect` chains without explicit user or screen interaction:

1. `GET /api/v1/academic/schools`
2. `GET /api/v1/academic/batches?programmeId=...`
3. `GET /api/v1/academic/courses?programmeId=...`
4. `GET /api/v1/academic/course-offerings?batchId=...`
5. `GET /api/v1/users?role=FACULTY`
6. `GET /api/v1/outcomes/programmes/{programmeId}/pos`
7. `GET /api/v1/outcomes/programmes/{programmeId}/psos`
8. `GET /api/v1/outcomes/programmes/{programmeId}/peos`
9. `GET /api/v1/academic/programmes/{programmeId}/targets`
10. `GET /api/v1/academic/course-offerings/{offeringId}/outcomes`
11. `GET /api/v1/academic/course-offerings/{offeringId}/mappings`
12. `GET /api/v1/attainment/config/{courseOfferingId}`
13. `GET /api/v1/reports/attainment-main/course/{offeringId}`
14. `GET /api/v1/reports/course-atr/{offeringId}`
15. `GET /api/v1/academic/director/setup-progress` / `hod` / `coordinator` / `course-coordinator`

---

## 4. APIs That Are Now Explicit

All APIs are now exposed as explicit, on-demand callable functions returning safe data and isolating exceptions:

- `loadSchools()` -> `GET /api/v1/academic/schools`
- `loadDepartments(targetSchoolId)` -> `GET /api/v1/academic/departments`
- `loadProgrammes(targetDepartmentId)` -> `GET /api/v1/academic/programmes`
- `loadBatches({ targetProgrammeId, userEmail, targetRole })` -> `GET /api/v1/academic/batches`
- `loadCourses({ targetProgrammeId, targetBatchId })` -> `GET /api/v1/academic/courses`
- `loadCourseOfferings(targetBatchId)` -> `GET /api/v1/academic/course-offerings`
- `loadCourseOffering(offeringId)` -> `GET /api/v1/academic/course-offerings/{id}`
- `loadCourseCoordinators()` -> `GET /api/v1/users?role=FACULTY`
- `loadStudents(targetBatchId)` -> `GET /api/v1/academic/batches/{batchId}/students`
- `loadProgrammeOutcomes(targetProgrammeId)` -> `GET /api/v1/outcomes/programmes/{id}/pos`, `psos`, `peos`
- `loadProgrammeTargets(targetProgrammeId, targetBatchId)` -> `GET /api/v1/academic/programmes/{id}/targets`
- `loadCourseOutcomes(offeringId)` -> `GET /api/v1/academic/course-offerings/{id}/outcomes`
- `loadCourseMapping(offeringId)` -> `GET /api/v1/academic/course-offerings/{id}/mappings`
- `loadAttainmentSettings(offeringId)` -> `GET /api/v1/attainment/config/{offeringId}`
- `loadCOAttainment(offeringId)` -> `GET /api/v1/reports/attainment-main/course/{offeringId}`
- `loadCourseATR(offeringId)` -> `GET /api/v1/reports/course-atr/{offeringId}`
- `loadProgrammeATR(targetProgrammeId, targetBatchId)` -> `GET /api/v1/atr/programme/{id}?batchId=...`
- `loadDirectorDashboard(targetSchoolId)` -> `GET /api/v1/dashboard/director`
- `loadHodDashboard()` -> `GET /api/v1/dashboard/hod`
- `loadProgrammeCoordinatorDashboard(targetProgrammeId)` -> `GET /api/v1/dashboard/programme-coordinator`
- `loadCourseCoordinatorDashboard(targetCourseId, targetBatchId)` -> `GET /api/v1/dashboard/course-coordinator`
- `loadSetupProgress()` -> `GET /api/v1/academic/{role}/setup-progress`

---

## 5. APIs Intentionally Kept Global

- **None** were kept with mandatory automatic `useEffect` execution on startup.
- All reference collections (`schools`, `departments`, `programmes`, `batches`, `courses`) maintain centralized state inside `AcademicProvider`, but their population is triggered explicitly by the screens, navigation bars, or workflows that require them.

---

## 6. All Affected Public Context Functions and State Variables

The following complete interface is exposed from `AcademicProvider` to guarantee 100% backward compatibility with existing screens:

### Global Selection & Identifiers
- `selectedSchoolId`, `setSelectedSchoolId`, `selectedSchool`
- `programmeId`, `setProgrammeId`, `selectedProgramme`
- `batchId`, `setBatchId`, `selectedBatch`
- `courseId`, `setCourseId`, `selectedCourse`
- `courseOfferingId`, `setCourseOfferingId`, `selectedCourseOffering`, `selectCourseOffering`
- `academicYear`, `setAcademicYear`

### Entities & Loaders
- `schools`, `loadSchools`, `createSchool`, `addSchool`, `updateSchool`
- `departments`, `loadDepartments`, `createDepartment`, `addDepartment`, `updateDepartment`, `deleteDepartment`
- `programmes`, `masterProgrammes`, `allMasterProgrammes`, `loadProgrammes`, `createProgramme`, `addProgramme`, `updateProgramme`, `deleteProgramme`
- `batches`, `loadBatches`, `createBatch`, `addBatch`, `updateBatch`, `deleteBatch`
- `courses`, `availableCourses`, `loadCourses`, `createCourse`, `addCourse`, `updateCourse`, `deleteCourse`
- `courseOfferings`, `availableCourseOfferings`, `loadCourseOfferings`, `loadCourseOffering`, `addCourseOffering`, `createCourseOffering`, `updateCourseOffering`, `assignCourseCoordinator`
- `courseCoordinators`, `facultyList`, `loadCourseCoordinators`
- `students`, `setStudents`, `loadStudents`, `createStudent`, `deleteStudent`

### Outcomes, Mapping & Attainment
- `activePOs`, `activePSOs`, `activePEOs`, `poPsoTargets`, `loadProgrammeOutcomes`, `loadProgrammeTargets`, `updatePoPsoTargets`, `saveProgrammeTargets`
- `activeCOs`, `coTargets`, `loadCourseOutcomes`, `updateCourseCOs`
- `coMapping`, `loadCourseMapping`, `updateCourseMapping`
- `attainmentSettings`, `loadAttainmentSettings`, `updateAttainmentSettings`
- `coAttainment`, `loadCOAttainment`
- `programmeATR`, `setProgrammeATR`, `loadProgrammeATR`
- `courseATR`, `loadCourseATR`

### Dashboards & Setup Progress
- `directorDashboard`, `loadDirectorDashboard`
- `hodDashboard`, `loadHodDashboard`
- `programmeCoordinatorDashboard`, `loadProgrammeCoordinatorDashboard`
- `courseCoordinatorDashboard`, `loadCourseCoordinatorDashboard`
- `setupProgress`, `loadSetupProgress`, `saveSetupProgress`

---

## 7. Consumer Compatibility Analysis

1. **Course vs CourseOffering Architecture**:
   - Master course endpoints continue to use `courseId` (e.g. `/academic/courses`, `/dashboard/course-coordinator`).
   - Offering-scoped endpoints strictly receive `courseOfferingId` (e.g. `/academic/course-offerings/{id}`, `/academic/course-offerings/{id}/outcomes`, `/academic/course-offerings/{id}/mappings`, `/attainment/config/{id}`).
2. **Error Isolation**:
   - Every loader is wrapped in a `try...catch` block. If an API request fails (e.g. 404/500), it logs a warning, sets its respective slice to empty/null, and returns safely without crashing provider rendering or wiping unrelated selections.
3. **No Dummy/Fallback Data**:
   - Zero hardcoded mock objects, `Math.random()`, or fake arrays exist in `academic.jsx`.

---

## 8. Build Validation

- **Command**: `npm run build`
- **Result**:
  ```
  vite v8.2.0 building client environment for production...
  transforming...✓ 1938 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                             1.18 kB │ gzip:   0.53 kB
  dist/assets/index-Bv7qA5-f.css             11.29 kB │ gzip:   2.98 kB
  dist/assets/rolldown-runtime-hePW80VL.js    0.71 kB │ gzip:   0.42 kB
  dist/assets/vendor-Du268pLq.js              3.55 kB │ gzip:   1.57 kB
  dist/assets/vendor-axios-DhiQ7QLW.js       47.13 kB │ gzip:  17.88 kB
  dist/assets/vendor-react-DmG9GWBW.js      239.68 kB │ gzip:  76.88 kB
  dist/assets/vendor-xlsx-CI0oAJXo.js       282.25 kB │ gzip:  94.10 kB
  dist/assets/index-B40Vzff5.js             589.91 kB │ gzip: 101.68 kB

  ✓ built in 529ms
  ```
- **Exit Code**: 0 (Zero errors, zero warnings).

---

## 9. Remaining Issues

- No remaining issues in `src/context/academic.jsx`.
- Strict boundary respected: no files outside `src/context/academic.jsx` were altered.
