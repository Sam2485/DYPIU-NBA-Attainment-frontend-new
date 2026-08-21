# Screen-to-API Contract Audit

**Source of truth:** `api_contract.txt` (48 documented endpoints)  
**Scope audited:** all `src/api`, `src/context`, feature screens, pages, routes, and shared UI consumers  
**Method:** static comparison of each implemented request, response consumer, and screen-generated payload against the supplied contract. No API calls or UI data were fabricated during this audit.

## Verdict

The screens are **not yet using the exact backend contract end-to-end**.

The base list, create, and update flows for the documented academic entities are substantially present. Dashboard calls, report filters/summary/list/export calls, and the base Users API are also present. However, a number of active paths either call endpoints that are absent from the supplied contract, send a different HTTP method, send screen-specific payloads rather than the documented DTOs, or render calculated/static data in place of backend response data.

Because `api_contract.txt` does not document the attainment, outcomes, students, detailed ATR, or role-specific setup endpoints currently used by the application, these areas cannot be declared correct from this contract. They require either a backend-contract extension or a frontend change to use one of the documented endpoints.

## Contract coverage at a glance

| Area | Assessment | Notes |
| --- | --- | --- |
| Academic lists and CRUD | Partial | Documented list/create/update calls exist, but screens frequently build non-contract payloads. |
| Course allocations | Partial | `/academic/courses/allocate` exists, but allocation screens use local verification state rather than this request. |
| Setup status | Not aligned | Contract specifies one `/academic/setup-status` GET/POST pair; app calls four role-specific endpoints. |
| Formal approvals | Not aligned | Several context methods use undocumented URLs, and revision uses `POST` instead of contract `PUT`. |
| Dashboard data | Partial | Four dashboard URLs exist; Director/HOD calls append undocumented email query parameters. |
| Reports | Partial | Filters, summary, ATR lists, and binary exports match. Detail/save/submit/comparison calls are outside the supplied contract; ReportsHub still contains mock values. |
| Users | Partial | List/read/create/update URLs exist. The screen's add/edit DTOs do not meet the documented request shapes; delete is undocumented. |
| Attainment, outcomes, students | Unverifiable | All related endpoints are absent from `api_contract.txt`. |

## Confirmed API-layer mismatches

### 1. Approval methods are not contract-correct

The contract supports `GET /approvals`, `GET /approvals/{id}`, `POST /approvals/submit`, `POST /approvals/{id}/action`, `GET /approvals/verification-status`, `PUT /approvals/verify`, and `PUT /approvals/request-revision`.

| Implementation | Problem | Required correction |
| --- | --- | --- |
| `src/context/approval.jsx:113` | Calls `GET /approvals/director`; no such contract endpoint. | Call `GET /approvals` with documented filters such as `status` and `role`, then filter only if the backend contract is extended. |
| `src/context/approval.jsx:144` | Calls `GET /approvals/hod`; no such contract endpoint. | Same correction: use `GET /approvals` and contract-supported query fields. |
| `src/context/approval.jsx:342` | Sends `POST /approvals/request-revision`. | Change to `PUT /approvals/request-revision`. |
| `src/context/approval.jsx:409,443` | Calls `POST /approvals/{id}/approve`; no such contract endpoint. | Use `POST /approvals/{id}/action` with `{ action: 'APPROVE', comments, actorName, actorRole }`. |
| `src/context/approval.jsx:563` | Calls `GET /approvals/{id}/history`; no such contract endpoint. | Remove/disable the history request or obtain its backend contract. |

In addition, UI code commonly stores `atrStatus`, `allocationStatus`, or other ad-hoc `statusType` names. The contract example uses `courseAtrStatus`. Each screen must use backend-approved status-type keys, not names invented by the UI.

### 2. Setup progress uses a different API family

The supplied contract documents only:

- `GET /academic/setup-status?schoolId=...|departmentId=...`
- `POST /academic/setup-status` with `schoolId`, `departmentId`, `step`, `completedStep`, and `completedSteps`.

`src/api/academic.js:185-206`, `src/context/academic.jsx`, and `src/context/dashboard.jsx` instead call role-specific routes such as `/academic/director/setup-progress`, `/academic/hod/setup-progress`, and `/academic/course-coordinator/setup-progress`. Those routes and their email/batch/course parameters are not documented. This is a blocking contract decision: either replace them with the supplied setup-status DTO or add the role-specific routes to the contract before frontend work continues.

### 3. Unsupported endpoint calls are active throughout the app

The following endpoint families are currently used but have no corresponding endpoint in `api_contract.txt`:

- Entity detail/delete: school, programme, batch, course, and course-offering detail and delete routes.
- Students and batch context routes.
- Course outcomes, mappings, programme targets/competencies, and all `/outcomes/...` routes.
- All `/attainment/...` routes.
- Detail/save/submit ATR routes, attainment-main reports, batch comparison, batch summary, and `/atr/programme/...`.
- `DELETE /users/{id}`.

This does not prove that these backend routes are invalid; it proves they are **not contract-confirmed**. They must be added to the contract with request/response examples before screens depending on them can be called exact.

### 4. Dashboard requests are only partly exact

The four documented dashboard URLs are used. However, `src/api/dashboard.js` and `src/context/academic.jsx` add `directorEmail` and `hodEmail` query parameters. The contract only specifies `schoolId` and `departmentId` respectively. Remove those extra parameters unless the backend contract is amended to support them.

### 5. Response handling does not enforce the envelope

`apiClient` returns the full `{ success, message, data }` body. The contexts usually unwrap `response.data`, which correctly reaches the payload, but none consistently checks `success === true`. A backend `{ success: false, message, data }` response can therefore be treated as an empty/valid data state. Centralize envelope handling so an unsuccessful envelope becomes a surfaced error and only `data` reaches screens.

## Confirmed screen-level data mismatches

### Academic and setup screens

| Screen | Evidence | Contract conflict |
| --- | --- | --- |
| `DirectorSetupWorkflow.jsx` | Creates IDs with `Date.now()` and creates department/programme objects locally (`:121`, `:176`). | Backend owns returned IDs; Department creation requires `schoolId` and `status`; Programme creation requires `degree`, `coordinatorEmail`, and `status`. The screen also sends school `estYear`, which is not in the contract. |
| `HodCourseManagement.jsx` | Creates a course with `semester: 'Sem I'` and coordinator/faculty fields (`:63-72`). | Contract course DTO requires numeric `semester`, numeric `credits`, and `status`; it does not accept course-level coordinator/faculty. Coordinator assignment belongs to a course offering/allocation. |
| `AcademicSetup.jsx` | Same generated course ID/string semester/coordinator pattern (`:85-90`). | Same course DTO conflict. Allocation submission only updates local verification state and never calls `POST /academic/courses/allocate`. |
| `HodBatchManagement.jsx` | Uses a fallback programme ID and random student PRN (`:62`, `:149`). | Student APIs are not in contract. Batch creation/update must use `name`, `programmeId`, numeric years, `academicYear`, and `status`; the screen flow must be verified against that exact DTO. |
| `ProgrammeCoordinatorSetupWorkflow.jsx` | Generates course IDs and local allocation/target statuses. | Uses the same non-contract course shape and does not establish the documented allocation request. |

### Approval and ATR screens

| Screen | Evidence | Contract conflict |
| --- | --- | --- |
| `CourseATR.jsx` | Builds ATR data from local COs and a hardcoded previous batch (`:106`). | Contract only provides ATR report-list responses, not this saved local shape or history data. |
| `ProgrammeATR.jsx` | Contains hardcoded `prevCycleActions` (`:40`) and local verification updates. | Not represented by the provided programme-ATR report response, which has `programme`, `batch`, and one `atr` object. |
| `ATRReportsNavHub.jsx` | Uses `COURSE_PROG_SEEDS` and `crs-1` fallback (`:7-76`). | Values are synthetic rather than `GET /reports/summary` / `GET /reports/programme-atrs` data. |
| `HodApprovals.jsx` | Uses `Math.random()` to generate actual attainment (`:289-294`). | Deterministic backend attainment must be shown; random data is never acceptable in an approval view. |
| `DirectorApprovals.jsx` | Presents alert-driven approval/revision actions. | Must use the documented formal approval `action` endpoint and refresh the contract list. |

### Reports and users

| Screen | Evidence | Contract conflict |
| --- | --- | --- |
| `ReportsHub.jsx` | Has `DEFAULT_BATCHES`, `SEMESTER_GROUPS`, static numbers, and `Math.random()` keys/attainment values (`:26-75`, `:209`, `:1018+`). | It must render `reports/filters`, `reports/summary`, `course-atrs`, and `programme-atrs` directly. Never fall back to fabricated batches/attainment. |
| `UserManagement.jsx` | Add flow only supplies name/email/role/department/programme (`:9-18`); inline edit resends UI-only fields. | `POST /users` requires `username`, `password`, `schoolId`, `departmentId`, and `programmeId` as applicable. `PUT /users/{id}` must send the documented editable fields, not display labels or `status`. |
| `DirectorReports.jsx`, `HodReports.jsx` | Exports are alert-only. | Wire to documented `exportExcel` / `exportPdf` with actual contract filters and blob download handling. |

## What is already structurally usable

- Entity normalizers in `src/context/academic.jsx` preserve all documented fields for schools, departments, programmes, batches, courses, offerings, and users.
- The four documented dashboard endpoint paths exist in `src/api/dashboard.js`.
- `src/api/reports.js` has correct paths for filters, summary, course-ATR list, programme-ATR list, Excel export, and PDF export.
- `src/api/users.js` contains the four documented non-delete user methods.
- The providers are composed correctly in `src/context/index.jsx`; the remaining issue is contract mapping, not provider availability.

## Recommended implementation order

1. **Freeze and clarify the backend contract.** Add missing DTOs/endpoints for attainment, outcomes, students, ATR detail/save/submit, deletions, and role-specific progress—or explicitly remove those frontend flows. Do not guess response shapes.
2. **Make one envelope utility.** Return only `data` when `success` is true and throw an error using `message` otherwise. Replace the duplicated unwrappers in all contexts.
3. **Fix approval and setup routes first.** They contain confirmed wrong HTTP methods/routes and govern workflow state.
4. **Introduce request mappers per documented entity.** Convert form state to the exact request DTO and only merge returned `data` into state. In particular: numeric course semester/credits, batch academic year/status, user IDs/password, and offering allocation payloads.
5. **Wire academic setup screens in dependency order.** Schools → departments → programmes → batches → courses → offerings/allocations. Fetch dependent select options from their list endpoints; do not use names or generated IDs as foreign keys.
6. **Replace every fallback seed/mock/random value.** Use loading, empty, and error states when the relevant endpoint is not available. Prioritize `ReportsHub`, `HodApprovals`, both ATR screens, and setup workflows.
7. **Wire dashboards and reports to their exact response objects.** Render fields from each documented `data` object rather than recomputing or filling missing values. Remove Director/HOD email query parameters unless documented.
8. **Add contract fixture tests.** For each documented endpoint, test request serialization and a representative envelope response against the context/screen mapper. Add a guard that flags every API path not present in the contract.

## Definition of done

The integration is ready only when every screen action maps to a documented endpoint, sends the documented request JSON, reads fields directly from the documented `data` JSON, contains no fabricated business data, and has a fixture test for success, empty data, and failure envelopes.
