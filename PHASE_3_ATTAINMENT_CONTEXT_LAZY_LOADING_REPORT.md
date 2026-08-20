# PHASE 3 — ATTAINMENT CONTEXT LAZY-LOADING REPORT

**Target File Modified:** `src/context/attainment.jsx`  
**Working Directory:** `/Users/rajshaikh/Desktop/dypiu-nba-attainment-frontend copy`  
**Execution Date:** August 21, 2026  
**Build Status:** `✓ built in 439ms (0 errors, 0 warnings)`

---

## 1. APIs That Previously Loaded Automatically

Prior to this refactor, `AttainmentProvider` contained an eager `useEffect` that triggered automatically on any change to `courseOfferingId`:

1. `GET /api/v1/attainment/config/{courseOfferingId}` (Attainment Configuration)
2. `GET /api/v1/reports/attainment-main/course/{courseOfferingId}` (CO Attainment)
3. `GET /api/v1/reports/course-atr/{courseOfferingId}` (Course Action Taken Report)

These requests were dispatched immediately on provider initialization or whenever selection state changed, even before the user navigated to the relevant screen or workflow step.

---

## 2. APIs Now Converted to Explicit Loaders

All attainment-related APIs are now exclusively invoked via explicit callable functions and mutators:

| Feature Area | Endpoint | Explicit Callable Functions / Aliases |
|---|---|---|
| **Attainment Config** | `GET /api/v1/attainment/config/{courseOfferingId}` | `loadAttainmentConfig(offeringId)`, `loadAttainmentSettings(offeringId)` |
| **Attainment Config** | `PUT /api/v1/attainment/config/{courseOfferingId}` | `updateCourseAttainmentConfig(config, offeringId)`, `saveAttainmentSettings(config, offeringId)` |
| **Direct Examination** | `GET /api/v1/attainment/examination/{courseOfferingId}` | `loadExaminationData(offeringId)`, `loadDirectAssessment(offeringId)`, `loadExamination(offeringId)` |
| **Direct Examination** | `POST /api/v1/attainment/examination/{courseOfferingId}` | `saveExaminationMarks(payload, offeringId)`, `saveDirectAssessment(payload, offeringId)`, `saveExamination(payload, offeringId)` |
| **Direct Examination** | `POST /api/v1/attainment/examination/{courseOfferingId}/upload` | `uploadEndSemMarks({ offeringId, file, thresholdPercentage, uploadedBy })`, `uploadDirectAssessment(...)`, `uploadExamination(...)` |
| **Indirect Survey** | `GET /api/v1/attainment/survey/{courseOfferingId}` | `loadSurveyData(offeringId)`, `loadIndirectAssessment(offeringId)`, `loadSurvey(offeringId)` |
| **Indirect Survey** | `POST /api/v1/attainment/survey/{courseOfferingId}` | `saveSurveyResponses(payload, offeringId)`, `saveIndirectAssessment(payload, offeringId)`, `saveSurvey(payload, offeringId)` |
| **Indirect Survey** | `POST /api/v1/attainment/survey/{courseOfferingId}/upload` | `uploadCourseSurvey({ offeringId, file, thresholdPercentage, uploadedBy })`, `uploadIndirectAssessment(...)`, `uploadSurvey(...)` |
| **CO Attainment** | `GET /api/v1/reports/attainment-main/course/{courseOfferingId}` | `loadCourseCoAttainment(offeringId)`, `loadCOAttainment(offeringId)`, `calculateCourseCoAttainment(offeringId)` |
| **Course ATR** | `GET /api/v1/reports/course-atr/{courseOfferingId}` | `loadCourseAtr(offeringId)`, `loadCourseATR(offeringId)` |
| **Course ATR** | `POST /api/v1/reports/course-atr` | `updateCourseAtrData(newAtrData)`, `saveCourseATR(newAtrData)` |
| **Course ATR** | `POST /api/v1/reports/course-atr/{courseOfferingId}/submit` | `submitCourseAtr(offeringId)`, `submitCourseATR(offeringId)` |
| **Programme ATR** | `GET /api/v1/atr/programme/{programmeId}?batchId=...` | `loadProgrammeAtr(programmeId, batchId)`, `loadProgrammeATR(programmeId, batchId)` |
| **Programme ATR** | `POST /api/v1/reports/programme-atr` | `updateProgrammeAtr(programmeId, data)`, `saveProgrammeATR(programmeId, data)` |
| **Programme ATR** | `POST /api/v1/reports/programme-atr/{programmeId}/batch/{batchId}/submit` | `submitProgrammeAtr(programmeId, batchId)`, `submitProgrammeATR(programmeId, batchId)` |
| **Programme Attainment**| `GET /api/v1/attainment/programme/{programmeId}/batch/{batchId}` | `loadProgrammeAttainment(programmeId, batchId)` |

---

## 3. Every `useEffect` Removed / Changed

- **Removed `useEffect` on `courseOfferingId`** (former lines 206–253):
  - Previously executed `Promise.allSettled` fetching config, CO attainment, and ATR whenever `courseOfferingId` was non-null.
  - This eager effect was completely deleted.
  - Current count of `useEffect` in `src/context/attainment.jsx`: **0**.

---

## 4. CourseOffering Scoping Verification

In accordance with the authoritative contract, CourseOffering scoping is strictly enforced:
- **Attainment Configuration**: Targets `courseOfferingId` (`/attainment/config/{courseOfferingId}`).
- **Direct Examination Assessment**: Targets `courseOfferingId` (`/attainment/examination/{courseOfferingId}`).
- **Indirect Survey Assessment**: Targets `courseOfferingId` (`/attainment/survey/{courseOfferingId}`).
- **CO Attainment Calculation**: Targets `courseOfferingId` (`/reports/attainment-main/course/{courseOfferingId}`).
- **Course ATR**: Targets `courseOfferingId` (`/reports/course-atr/{courseOfferingId}`).
- **Programme ATR**: Scoped by `programmeId` + `batchId`.

Master `courseId` is never substituted for `courseOfferingId` on offering-scoped endpoints.

---

## 5. Direct Assessment Loading Behavior

- `loadExaminationData` is invoked exclusively when the Direct Assessment screen (`EndSemMarksHub.jsx`) mounts or when the user triggers a reload.
- `uploadEndSemMarks` sends `multipart/form-data` with `file`, `thresholdPercentage`, and `uploadedBy` to `POST /attainment/examination/{courseOfferingId}/upload`.
- On success, `examinationData` state is updated with `{ totalStudents, averageAttainmentLevel, coAttainmentScores, percentageAboveThreshold }`.

---

## 6. Indirect Assessment Loading Behavior

- `loadSurveyData` is invoked exclusively when the Indirect Assessment screen (`CourseEndSurveyHub.jsx`) mounts or when triggered explicitly.
- `uploadCourseSurvey` sends `multipart/form-data` with `file`, `thresholdPercentage`, and `uploadedBy` to `POST /attainment/survey/{courseOfferingId}/upload`.
- On success, `surveyData` state is updated with `{ totalResponses, averageAttainmentLevel, coAttainmentScores, percentagePositiveResponses }`.

---

## 7. CO Attainment Loading Behavior

- `loadCourseCoAttainment` is invoked on demand when the CO Attainment Engine (`COAttainmentEngine.jsx`) or reports view mounts.
- Results from `GET /reports/attainment-main/course/{courseOfferingId}` populate `courseAttainmentStore` without computing artificial fallback numbers.

---

## 8. Course ATR Loading Behavior

- `loadCourseAtr` is called explicitly when navigating to the Course ATR screen.
- `updateCourseAtrData` (`POST /reports/course-atr`) saves drafts.
- `submitCourseAtr` (`POST /reports/course-atr/{courseOfferingId}/submit`) transitions status to submitted for review and refreshes ATR state.

---

## 9. Programme ATR Loading Behavior

- `loadProgrammeAtr` is called explicitly with `(programmeId, batchId)`.
- `submitProgrammeAtr` (`POST /reports/programme-atr/{programmeId}/batch/{batchId}/submit`) records submission.

---

## 10. Error Isolation Changes

- Every loader is wrapped in a dedicated `try...catch` block.
- Any API failure (e.g. 404, 500, network error) sets `setError(err.message)` and returns `null` or empty without throwing during render.
- Failure of one API call (e.g., Direct Assessment marks missing) does **NOT** wipe or interfere with Attainment Config, Indirect Assessment, CO Attainment, or ATR data.

---

## 11. Dummy / Fallback Data Removed

- Zero hardcoded mock numbers, `Math.random()`, or fake default responses exist in `attainment.jsx`.
- When an endpoint returns `null` or is not yet loaded, the state is accurately represented as `null`.

---

## 12. Backward Compatibility Verification

The context exposes both primary function names and legacy aliases to ensure all consumer screens and hooks continue to work without code changes:
- `attainmentConfigs` / `activeAttainmentConfig` / `attainmentSettings`
- `loadAttainmentConfig` / `loadAttainmentSettings`
- `updateCourseAttainmentConfig` / `saveAttainmentSettings`
- `examinationData` / `directAssessmentData`
- `loadExaminationData` / `loadDirectAssessment` / `loadExamination`
- `saveExaminationMarks` / `saveDirectAssessment` / `saveExamination`
- `uploadEndSemMarks` / `uploadDirectAssessment` / `uploadExamination`
- `surveyData` / `indirectAssessmentData`
- `loadSurveyData` / `loadIndirectAssessment` / `loadSurvey`
- `saveSurveyResponses` / `saveIndirectAssessment` / `saveSurvey`
- `uploadCourseSurvey` / `uploadIndirectAssessment` / `uploadSurvey`
- `courseAttainmentStore` / `coAttainment`
- `loadCourseCoAttainment` / `loadCOAttainment` / `calculateCourseCoAttainment`
- `courseAtrStore` / `courseATR`
- `loadCourseAtr` / `loadCourseATR`
- `updateCourseAtrData` / `saveCourseATR`
- `submitCourseAtr` / `submitCourseATR`
- `programmeAtrStore` / `programmeATR`
- `loadProgrammeAtr` / `loadProgrammeATR`
- `updateProgrammeAtr` / `saveProgrammeATR`
- `submitProgrammeAtr` / `submitProgrammeATR`
- `defaultLevels`

---

## 13. Build Result

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
  dist/assets/index-DPCzBlZY.js             592.03 kB │ gzip: 101.94 kB

  ✓ built in 439ms
  ```
- **Exit Code**: 0 (Zero errors, zero warnings).

---

## 14. Remaining Issues

None. `AttainmentProvider` operates entirely on explicit demand with isolated error handling and zero eager loading.

---

NO FILES OUTSIDE src/context/attainment.jsx WERE MODIFIED.
