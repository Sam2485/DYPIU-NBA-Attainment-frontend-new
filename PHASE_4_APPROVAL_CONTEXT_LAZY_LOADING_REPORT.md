# PHASE 4 — APPROVAL CONTEXT LAZY-LOADING REPORT

**Target File Modified:** `src/context/approval.jsx`  
**Working Directory:** `/Users/rajshaikh/Desktop/dypiu-nba-attainment-frontend copy`  
**Execution Date:** August 21, 2026  
**Build Status:** `✓ built in 436ms (0 errors, 0 warnings)`

---

## 1. APIs Previously Fetched Automatically

In the legacy implementation, `ApprovalProvider` initialized an automatic `useEffect` hook watching the `role` state, attempting initial approval loading or setting status flags whenever the user or role changed. 

---

## 2. APIs Converted to Explicit Loaders / Actions

All approval and verification APIs are now completely explicit and only execute on demand when invoked by their corresponding screens or user actions:

| Operation | Backend Endpoint | Explicit Callable Context Function / Alias |
|---|---|---|
| **Director Queue** | `GET /api/v1/approvals/director?schoolId=...` | `loadDirectorApprovals(schoolId)` |
| **HOD Queue** | `GET /api/v1/approvals/hod?programmeId=...&departmentId=...` | `loadHodApprovals(programmeId, departmentId)` |
| **Verification Status** | `GET /api/v1/approvals/verification-status?key=...` | `getCourseVerification(courseOfferingId)`, `getVerificationStatus(courseOfferingId)` |
| **Component Verify/Approve** | `PUT /api/v1/approvals/verify` | `verifyStatus({ courseOfferingId, statusType, statusValue, remarksValue, verifierName })` |
| **Request Revision** | `POST /api/v1/approvals/request-revision` | `requestRevision({ courseOfferingId, statusType, remarksValue, verifierName })` |
| **Unified Status Update** | Verify / Request Revision Dispatcher | `updateCourseVerificationStatus(...)`, `reviewCourseVerification(...)` |
| **Formal Submit** | `POST /api/v1/approvals/submit` | `submitCourseVerification(payload)`, `submitApproval(payload)` |
| **Director Approve Action** | `POST /api/v1/approvals/{id}/approve` | `approveDirectorSubmission(approvalId, actorName)` |
| **HOD Approve Action** | `POST /api/v1/approvals/{id}/approve` | `approveHodSubmission(approvalId, actorName)` |
| **General Action** | `POST /api/v1/approvals/{id}/action` | `actionApproval({ approvalId, action, comments, actorName, actorRole })` |
| **List Approvals** | `GET /api/v1/approvals` | `getApprovals(params)` |
| **Approval by ID** | `GET /api/v1/approvals/{id}` | `getApprovalById(approvalId)` |
| **Approval History** | `GET /api/v1/approvals/{id}/history` | `getApprovalHistory(approvalId)` |
| **Explicit Refresh** | Context Refresher | `refreshApprovals({ schoolId, programmeId, departmentId })` |

---

## 3. Every `useEffect` Removed / Changed

- **Removed `useEffect([role])` hook** (former lines 273–324):
  - Completely deleted the mount/role effect.
  - Current count of `useEffect` in `src/context/approval.jsx`: **0**.
  - No background network requests occur when `ApprovalProvider` mounts or when global selections (`programmeId`, `batchId`, `courseId`, `courseOfferingId`, `role`) change.

---

## 4. Director Approval Loading

- `loadDirectorApprovals(schoolId)` is executed strictly when the Director Approvals screen (`DirectorApprovals.jsx`) or dashboard opens or triggers a refresh.
- Accepts an optional `schoolId` filter.
- Returns normalized approval records and updates `directorApprovals` state.

---

## 5. HOD Approval Loading

- `loadHodApprovals(programmeId, departmentId)` is called on demand by HOD approval views (`HodApprovals.jsx`).
- Supports optional scoping by `programmeId` and `departmentId`.
- Updates `hodApprovals` state with normalized approval DTOs.

---

## 6. CourseOffering Verification Loading

- Scoped strictly by `courseOfferingId` as the unique verification key (`key === courseOfferingId`).
- `getCourseVerification(courseOfferingId)` queries `GET /api/v1/approvals/verification-status?key={courseOfferingId}`.
- Results are merged into `courseVerificationStore[courseOfferingId]`.
- Master `courseId` is never used as an independent ownership key.

---

## 7. Revision Request Handling

- Triggered via `requestRevision({ courseOfferingId, statusType, remarksValue, verifierName })`.
- Dispatches `POST /api/v1/approvals/request-revision` with:
  ```json
  {
    "key": "<courseOfferingId>",
    "statusType": "...",
    "statusValue": "REVISION_REQUESTED",
    "remarksValue": "...",
    "verifierName": "..."
  }
  ```
- Backend remarks and messages are preserved and saved into `courseVerificationStore[courseOfferingId]`.
- No frontend-only dummy revision messages are synthesized.

---

## 8. Approval Status Handling

- Allowed status lifecycle values: `DRAFT`, `PENDING`, `APPROVED`, `REVISION_REQUESTED`.
- The legacy `REJECTED` state has been completely eliminated across all methods.
- Component approvals send `PUT /api/v1/approvals/verify` with `statusValue: "APPROVED"`.

---

## 9. Error Isolation Changes

- Every loader and mutator is enclosed in a dedicated `try...catch` block.
- On error:
  - Error message is stored in `error` state.
  - The function returns a safe fallback (`[]` for arrays, `null` for objects).
  - Unrelated cached approvals or working verification records are NOT wiped.
  - Render cycles do not crash due to rejected promises.

---

## 10. Dummy / Fallback Approval Data Removed

- Zero hardcoded mock approval objects, fake timestamps, or simulated success alerts exist.
- When an approval queue is empty or not yet loaded, it cleanly returns `[]`.

---

## 11. Backward Compatibility Verification

The context provides all function signatures, state names, and legacy aliases required by the frontend:
- `directorApprovals`
- `hodApprovals`
- `courseVerificationStore`
- `loading`, `error`
- `getApprovals`
- `getApprovalById`
- `getApprovalHistory`
- `submitApproval` / `submitCourseVerification`
- `loadDirectorApprovals`
- `loadHodApprovals`
- `approveDirectorSubmission`
- `approveHodSubmission`
- `actionApproval`
- `getCourseVerification` / `getVerificationStatus`
- `verifyStatus`
- `requestRevision`
- `reviewCourseVerification` / `updateCourseVerificationStatus`
- `getPendingVerificationsCount`
- `refreshApprovals`

---

## 12. Build Result

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
  dist/assets/index-CjrvZtgk.js             593.62 kB │ gzip: 102.22 kB

  ✓ built in 436ms
  ```
- **Exit Code**: 0 (Zero errors, zero warnings).

---

## 13. Remaining Issues

None. `ApprovalProvider` is fully lazy, reactive only to explicit calls, and strictly synchronized with the backend contracts.

---

NO FILES OUTSIDE src/context/approval.jsx WERE MODIFIED.
