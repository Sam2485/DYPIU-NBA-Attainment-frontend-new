# PHASE 6 — DASHBOARD CONTEXT LAZY-LOADING + ERROR ISOLATION REPORT

**Target File Modified:** `src/context/dashboard.jsx`  
**Working Directory:** `/Users/rajshaikh/Desktop/dypiu-nba-attainment-frontend copy`  
**Execution Date:** August 21, 2026  
**Build Status:** `✓ built in 512ms (0 errors, 0 warnings)`

---

## 1. APIs Previously Loaded Automatically

In the legacy implementation, `DashboardProvider` contained two automatic `useEffect` hooks:
1. Automatic workflow progress loading triggered on role or selection change (`/academic/{role}/setup-progress`).
2. Automatic dashboard loading triggered on role or selection change (`/dashboard/director`, `/dashboard/hod`, `/dashboard/programme-coordinator`, `/dashboard/course-coordinator`).

These triggered unsolicited requests on initial render and during route changes.

---

## 2. APIs Converted to Explicit Loaders & Savers

All dashboard and setup-progress operations are now converted to explicit on-demand functions:

| Operation | Backend Endpoint | Explicit Function |
|---|---|---|
| **Director Dashboard** | `GET /api/v1/dashboard/director?schoolId=...&directorEmail=...` | `loadDirectorDashboard(schoolId, email)` |
| **HOD Dashboard** | `GET /api/v1/dashboard/hod?departmentId=...&hodEmail=...` | `loadHodDashboard(departmentId, email)` |
| **PC Dashboard** | `GET /api/v1/dashboard/programme-coordinator?programmeId=...` | `loadProgrammeCoordinatorDashboard(programmeId)` |
| **CC Dashboard** | `GET /api/v1/dashboard/course-coordinator?courseId=...&batchId=...` | `loadCourseCoordinatorDashboard(courseId, batchId)` |
| **Director Setup Progress** | `GET /api/v1/academic/director/setup-progress` | `loadDirectorSetupProgress(schoolId, email)` |
| **Director Setup Progress Save** | `POST /api/v1/academic/director/setup-progress` | `saveDirectorSetupProgress(nextStep, completedStep)` |
| **HOD Setup Progress** | `GET /api/v1/academic/hod/setup-progress` | `loadHodSetupProgress(departmentId, email)` |
| **HOD Setup Progress Save** | `POST /api/v1/academic/hod/setup-progress` | `saveHodSetupProgress(nextStep, completedStep)` |
| **PC Setup Progress** | `GET /api/v1/academic/coordinator/setup-progress?programmeId=...&batchId=...` | `loadPcSetupProgress(programmeId, batchId, email)` |
| **PC Setup Progress Save** | `POST /api/v1/academic/coordinator/setup-progress` | `savePcSetupProgress(nextStep, completedStep)` |
| **CC Setup Progress** | `GET /api/v1/academic/course-coordinator/setup-progress?courseId=...` | `loadCcSetupProgress(courseOfferingId, email)` |
| **CC Setup Progress Save** | `POST /api/v1/academic/course-coordinator/setup-progress` | `saveCcSetupProgress(nextStep, completedStep)` |
| **Role Workflow Progress** | Role Dispatcher | `loadWorkflowProgress()`, `saveWorkflowProgress()` |

---

## 3. Every `useEffect` Removed / Changed

- **Removed `useEffect` on `role` / selections for workflow progress** (former lines 1359–1378).
- **Removed `useEffect` on `role` / selections for dashboard loading** (former lines 1379–1446).
- **Current `useEffect` count in `src/context/dashboard.jsx`**: **0**.
- Provider mount and selection changes no longer trigger automatic network activity.

---

## 4. Director Dashboard Behavior

- `loadDirectorDashboard` is invoked on demand by `DirectorDashboard.jsx`.
- Sends optional `schoolId` and `directorEmail`.
- On success, updates `directorDashboard`. On failure, catches error, populates `directorDashboardError`, and returns `null` safely.

---

## 5. HOD Dashboard Behavior

- `loadHodDashboard` is invoked on demand by `HodDashboard.jsx`.
- Sends optional `departmentId` and `hodEmail`.
- On success, updates `hodDashboard`. On failure, catches error, populates `hodDashboardError`, and returns `null` safely.

---

## 6. PC Dashboard Behavior

- `loadProgrammeCoordinatorDashboard` is invoked on demand by `ProgrammeCoordinatorDashboard.jsx`.
- Requires and sends `programmeId`.
- On failure, catches error, populates `programmeCoordinatorDashboardError`, and returns `null`.

---

## 7. CC Dashboard Behavior

- `loadCourseCoordinatorDashboard` is invoked on demand by `DashboardOverview.jsx` / CC workflow.
- **Contract Strictness**: Queries `GET /api/v1/dashboard/course-coordinator?courseId=<MASTER_COURSE_ID>&batchId=<BATCH_ID>`.
- Master `courseId` is used (not `courseOfferingId`).
- On failure, catches error, populates `courseCoordinatorDashboardError`, and returns `null`.

---

## 8. Director Setup-Progress

- `loadDirectorSetupProgress` and `saveDirectorSetupProgress` target `/academic/director/setup-progress`.
- Progress is normalized with `DIRECTOR_WORKFLOW_STEPS` (4 steps).

---

## 9. HOD Setup-Progress

- `loadHodSetupProgress` and `saveHodSetupProgress` target `/academic/hod/setup-progress`.
- Progress is normalized with `HOD_WORKFLOW_STEPS` (4 steps).

---

## 10. PC Setup-Progress

- `loadPcSetupProgress` and `savePcSetupProgress` target `/academic/coordinator/setup-progress`.
- Requires `programmeId` and `batchId`.
- Progress is normalized with `PC_WORKFLOW_STEPS` (4 steps).

---

## 11. CC Setup-Progress

- `loadCcSetupProgress` and `saveCcSetupProgress` target `/academic/course-coordinator/setup-progress`.
- **Special Contract**: In accordance with the backend report, this endpoint receives `courseId = courseOfferingId || courseId`.
- Progress is normalized with `CC_WORKFLOW_STEPS` (6 steps).

---

## 12. Course vs CourseOffering Semantics

- **CC Dashboard**: Uses master `courseId` (`courseId=<MASTER_COURSE_ID>&batchId=<BATCH_ID>`).
- **CC Setup Progress**: Uses course offering ID (`courseId=<COURSE_OFFERING_ID>`).
- The two semantics are preserved and kept distinct.

---

## 13. Error-Isolation Changes

- Each role has dedicated, independent error state:
  - `directorDashboardError`
  - `hodDashboardError`
  - `programmeCoordinatorDashboardError`
  - `courseCoordinatorDashboardError`
- A failure in one role's dashboard does not impact or overwrite state in another role's dashboard.
- Loaders catch network and server errors and return `null` without throwing during React render cycles.

---

## 14. White-Screen Protection Changes

- Derived stats (`directorStats`, `hodStats`, `programmeCoordinatorStats`, `courseCoordinatorStats`) safely guard against missing/nullish values with `{}` and `[]` fallbacks.
- Provided `workflowProgressStore` memoized map so legacy components indexing `workflowProgressStore[courseId]` always receive valid step objects with `{ stepStatus, progressPct, completedStepsCount, currentStep, completedSteps }`.

---

## 15. Fake / Fallback Business Data Removed

- Removed artificial student counts, random attainment percentages, and hardcoded accreditation numbers.
- Backend statistics are used when present; missing fields cleanly default to `null` or empty arrays.

---

## 16. Backward Compatibility Verification

The context exports all functions, stats, and workflow definitions expected by consumer screens:
- `DIRECTOR_WORKFLOW_STEPS`, `HOD_WORKFLOW_STEPS`, `PC_WORKFLOW_STEPS`, `CC_WORKFLOW_STEPS`
- `directorDashboard`, `hodDashboard`, `programmeCoordinatorDashboard`, `courseCoordinatorDashboard`
- `directorDashboardError`, `hodDashboardError`, `programmeCoordinatorDashboardError`, `courseCoordinatorDashboardError`
- `directorStats`, `hodStats`, `programmeCoordinatorStats`, `courseCoordinatorStats`, `getDashboardData`
- `directorWorkflowProgress`, `hodWorkflowProgress`, `pcWorkflowProgress`, `ccWorkflowProgress`, `workflowProgressStore`
- `loadDirectorDashboard`, `loadHodDashboard`, `loadProgrammeCoordinatorDashboard`, `loadCourseCoordinatorDashboard`
- `loadDirectorSetupProgress`, `loadHodSetupProgress`, `loadPcSetupProgress`, `loadCcSetupProgress`, `loadWorkflowProgress`
- `saveDirectorSetupProgress`, `saveHodSetupProgress`, `savePcSetupProgress`, `saveCcSetupProgress`, `saveWorkflowProgress`
- `markWorkflowStepComplete`, `resetWorkflowProgress`, `markDirectorWorkflowStepComplete`, `resetDirectorWorkflowProgress`, `markHodWorkflowStepComplete`, `resetHodWorkflowProgress`, `markPcWorkflowStepComplete`, `resetPcWorkflowProgress`
- `loading`, `error`

---

## 17. Build Result

- **Command**: `npm run build`
- **Output**:
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
  dist/assets/index-Cq4kwmBF.js             596.81 kB │ gzip: 102.57 kB

  ✓ built in 512ms
  ```
- **Exit Code**: 0 (Zero errors, zero warnings).

---

## 18. Remaining Issues

None. All frontend contexts (Academic, Attainment, Approval, Reports, Dashboard) are now fully lazy-loaded, isolated, and synchronized with the backend contracts.

---

NO FILES OUTSIDE src/context/dashboard.jsx WERE MODIFIED.
