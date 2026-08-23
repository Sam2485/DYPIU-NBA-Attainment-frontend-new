# Phase 10.16 — Authoritative Frontend API Contract Specification

**Date:** 2026-08-23T12:59:00+05:30  
**Phase:** 10.16 — Final API Contract & Canonical Domain Identifier Verification  
**Repository:** DYPIU NBA Attainment Backend (`com.dypiu.nba:obe-backend`)  
**Status:** **AUTHORITATIVE MASTER FRONTEND CONTRACT (ZERO AMBIGUITY)**  

---

## Standard Response Wrapper
All successful endpoints return data wrapped in `ApiResponse<T>`:
```json
{
  "success": "boolean",
  "message": "string",
  "data": "object | array | null"
}
```

---

## 1. Authentication & Session APIs

### POST /auth/login
- **CATEGORY:** Authentication / Session
- **METHOD:** POST
- **PATH:** `/auth/login`
- **PURPOSE:** Authenticates credentials; returns JWT token or initiates 2FA OTP.
- **AUTHENTICATION:** None (Public)
- **AUTHORIZATION:** Permitted to all
- **PATH PARAMETERS:** None
- **QUERY PARAMETERS:** None
- **REQUEST BODY:**
```json
{
  "usernameOrEmail": "string",
  "password": "string"
}
```
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "message": "string",
  "data": {
    "token": "string",
    "refreshToken": "string",
    "tokenType": "string",
    "expiresIn": "number",
    "requiresOtp": "boolean",
    "loginSessionId": "string",
    "user": {
      "userId": "number",
      "username": "string",
      "email": "string",
      "role": "string",
      "schoolId": "string",
      "departmentId": "string",
      "masterProgrammeId": "string"
    }
  }
}
```
- **HTTP STATUS CODES:** `200 OK`, `400 Bad Request`, `401 Unauthorized`
- **STATE RESTRICTIONS:** None
- **AUDIT ACTION:** `LOGIN` on `USER`
- **SPECIAL NOTES:** Sets `requiresOtp: true` if two-factor auth is enabled for user.

### POST /auth/refresh-token
- **CATEGORY:** Authentication / Session
- **METHOD:** POST
- **PATH:** `/auth/refresh-token`
- **PURPOSE:** Issues a new JWT access token using a valid refresh token.
- **AUTHENTICATION:** None
- **AUTHORIZATION:** Permitted to all
- **REQUEST BODY:**
```json
{
  "refreshToken": "string"
}
```
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "message": "string",
  "data": {
    "token": "string",
    "refreshToken": "string",
    "tokenType": "string",
    "expiresIn": "number"
  }
}
```
- **HTTP STATUS CODES:** `200 OK`, `401 Unauthorized`

---

## 2. User Management APIs

### GET /users
- **CATEGORY:** User Management
- **METHOD:** GET
- **PATH:** `/users`
- **PURPOSE:** Queries academic members filtered optionally by role.
- **AUTHENTICATION:** JWT Bearer
- **AUTHORIZATION:** `ADMIN`, `IQAC`, `DIRECTOR`, `HOD`
- **QUERY PARAMETERS:** `role` (optional, string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": [
    {
      "userId": "number",
      "username": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "schoolId": "string",
      "departmentId": "string",
      "masterProgrammeId": "string",
      "department": "string",
      "programme": "string"
    }
  ]
}
```
- **HTTP STATUS CODES:** `200 OK`, `403 Forbidden`

### POST /users
- **CATEGORY:** User Management
- **METHOD:** POST
- **PATH:** `/users`
- **PURPOSE:** Creates a new academic user with assigned institutional scope.
- **AUTHENTICATION:** JWT Bearer
- **AUTHORIZATION:** `ADMIN`, `IQAC`, `DIRECTOR`, `HOD`
- **REQUEST BODY:**
```json
{
  "email": "string",
  "name": "string",
  "username": "string",
  "password": "string",
  "role": "string",
  "schoolId": "string",
  "departmentId": "string",
  "masterProgrammeId": "string"
}
```
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "message": "string",
  "data": {
    "userId": "number",
    "username": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "schoolId": "string",
    "departmentId": "string",
    "masterProgrammeId": "string"
  }
}
```
- **HTTP STATUS CODES:** `200 OK`, `400 Bad Request`, `403 Forbidden`
- **AUDIT ACTION:** `CREATE` on `USER`

---

## 3. Role-Scoped Dashboards

### GET /dashboard/director
- **CATEGORY:** Dashboard
- **METHOD:** GET
- **PATH:** `/dashboard/director`
- **PURPOSE:** Aggregates school metrics, departments, and setup progress.
- **AUTHENTICATION:** JWT Bearer
- **AUTHORIZATION:** `DIRECTOR` (assigned school), `ADMIN`, `IQAC`
- **QUERY PARAMETERS:** `schoolId` (optional, string), `directorEmail` (optional, string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": {
    "school": {
      "schoolId": "string",
      "name": "string",
      "code": "string",
      "directorName": "string",
      "directorEmail": "string"
    },
    "setupProgress": {
      "currentStep": "number",
      "overallStatus": "string"
    },
    "statistics": {
      "departments": "number",
      "programmes": "number",
      "activeBatches": "number"
    }
  }
}
```

### GET /dashboard/hod
- **CATEGORY:** Dashboard
- **METHOD:** GET
- **PATH:** `/dashboard/hod`
- **PURPOSE:** Aggregates department metrics, programmes, batches, and pending approvals.
- **AUTHENTICATION:** JWT Bearer
- **AUTHORIZATION:** `HOD` (assigned department), `ADMIN`, `IQAC`
- **QUERY PARAMETERS:** `departmentId` (optional, string), `hodEmail` (optional, string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": {
    "department": {
      "departmentId": "string",
      "name": "string",
      "code": "string",
      "hod": "string"
    },
    "statistics": {
      "programmes": "number",
      "coursesCount": "number",
      "activeBatches": "number",
      "pendingApprovalsCount": "number"
    }
  }
}
```

### GET /dashboard/programme-coordinator
- **CATEGORY:** Dashboard
- **METHOD:** GET
- **PATH:** `/dashboard/programme-coordinator`
- **PURPOSE:** Aggregates programme overview, batches, course offerings, and verification counts.
- **AUTHENTICATION:** JWT Bearer
- **AUTHORIZATION:** `PROGRAMME_COORDINATOR`, `HOD`, `DIRECTOR`, `ADMIN`
- **QUERY PARAMETERS:** `masterProgrammeId` (optional, string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": {
    "masterProgrammeId": "string",
    "programme": {
      "masterProgrammeId": "string",
      "name": "string",
      "code": "string",
      "coordinatorName": "string"
    },
    "batches": [
      {
        "programmeBatchId": "string",
        "name": "string",
        "startYear": "number",
        "endYear": "number",
        "status": "string"
      }
    ],
    "statistics": {
      "courses": "number",
      "courseOfferings": "number",
      "pendingVerifications": "number"
    }
  }
}
```

### GET /dashboard/course-coordinator
- **CATEGORY:** Dashboard
- **METHOD:** GET
- **PATH:** `/dashboard/course-coordinator`
- **PURPOSE:** Aggregates course offering workflow milestones and revision notices.
- **AUTHENTICATION:** JWT Bearer
- **AUTHORIZATION:** `COURSE_COORDINATOR`, `FACULTY`, `HOD`, `ADMIN`
- **QUERY PARAMETERS:** `programmeBatchCourseId` (optional, string), `masterCourseId` (optional, string), `programmeBatchId` (optional, string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": {
    "masterCourseId": "string",
    "programmeBatchCourseId": "string",
    "programmeBatchId": "string",
    "course": {
      "masterCourseId": "string",
      "name": "string",
      "code": "string",
      "credits": "number"
    },
    "workflowProgress": {
      "/outcomes": "boolean",
      "/co-targets": "boolean",
      "/co-mapping": "boolean",
      "/attainment-config": "boolean",
      "/marks-upload": "boolean",
      "/course-atr": "boolean"
    },
    "revisions": {
      "hasRevision": "boolean",
      "isConfigRevision": "boolean",
      "isCoRevision": "boolean",
      "isAtrRevision": "boolean"
    }
  }
}
```

---

## 4. Master Programmes & Master Courses

### GET /master-programmes
- **CATEGORY:** Master Programme
- **METHOD:** GET
- **PATH:** `/master-programmes`
- **PURPOSE:** Lists permanent academic programmes.
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": [
    {
      "masterProgrammeId": "string",
      "name": "string",
      "code": "string",
      "departmentId": "string",
      "durationYears": "number",
      "status": "string"
    }
  ]
}
```

### GET /master-programmes/{masterProgrammeId}/historical/attainment-reports
- **CATEGORY:** Historical Lookup
- **METHOD:** GET
- **PATH:** `/master-programmes/{masterProgrammeId}/historical/attainment-reports`
- **PURPOSE:** Retrieves historical batch attainment reports for a permanent degree programme.
- **PATH PARAMETERS:** `masterProgrammeId` (string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": [
    {
      "programmeBatchAttainmentReportId": "string",
      "programmeBatchId": "string",
      "batchName": "string",
      "masterProgrammeId": "string",
      "programmeName": "string",
      "status": "string",
      "overallProgrammeAttainment": "number"
    }
  ]
}
```

### GET /master-courses/{masterCourseId}/historical/attainment-reports
- **CATEGORY:** Historical Lookup
- **METHOD:** GET
- **PATH:** `/master-courses/{masterCourseId}/historical/attainment-reports`
- **PURPOSE:** Retrieves historical course attainment reports for a master course across offerings and batches.
- **PATH PARAMETERS:** `masterCourseId` (string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": [
    {
      "courseAttainmentReportId": "string",
      "programmeBatchCourseId": "string",
      "masterCourseId": "string",
      "courseCode": "string",
      "courseName": "string",
      "programmeBatchId": "string",
      "batchName": "string",
      "semester": "number",
      "status": "string",
      "overallCoAttainment": "number"
    }
  ]
}
```
### 1. POST /master-programmes                                                                  
                                                                                                  
  • Category: Academic Master Hierarchy                                                           
  • Method: POST                                                                                  
  • Path: /master-programmes                                                                      
  • Purpose: Creates a new Master Programme within a Department.                                  
  • Content-Type: application/json                                                                
                                                                                                  
  #### Request Body                                                                               
                                                                                                  
    {                                                                                             
      "departmentId": "dept-soe-cse",                                                             
      "code": "BT-CSE",                                                                           
      "name": "B.Tech Computer Science and Engineering",                                          
      "durationYears": 4,                                                                         
      "status": "ACTIVE",                                                                         
      "coordinator": "Dr. John Doe",                                                              
      "coordinatorEmail": "john.doe@dypiu.ac.in"                                                  
    }                                                                                             
                                                                                                  
   Field            │ Type   │ Required │ Default  │ Description
  ──────────────────┼────────┼──────────┼──────────┼──────────────────────────────────────────────
   departmentId     │ string │ Yes      │ —        │ Identifier of parent Department
   code             │ string │ Yes      │ —        │ Unique Programme code (e.g., BT-CSE)
   name             │ string │ Yes      │ —        │ Full name of the Master Programme
   durationYears    │ number │ No       │ 4        │ Programme duration in years
   status           │ string │ No       │ "ACTIVE" │ Status (ACTIVE / INACTIVE)
   coordinator      │ string │ No       │ null     │ Display name of assigned Programme Coordinato
   coordinatorEmail │ string │ No       │ null     │ Email of assigned Programme Coordinator
                                                                                                  
  #### Response Body (HTTP 200 OK)                                                                
                                                                                                  
    {                                                                                             
      "success": true,                                                                            
      "message": "MasterProgramme created successfully",                                          
      "data": {                                                                                   
        "masterProgrammeId": "prog-a1b2c3d4",                                                     
        "departmentId": "dept-soe-cse",                                                           
        "code": "BT-CSE",                                                                         
        "name": "B.Tech Computer Science and Engineering",                                        
        "durationYears": 4,                                                                       
        "status": "ACTIVE",                                                                       
        "departmentName": "Computer Science & Engineering",                                       
        "coordinator": "Dr. John Doe",                                                            
        "coordinatorEmail": "john.doe@dypiu.ac.in",                                               
        "createdAt": "2026-08-23T10:15:30.000Z",                                                  
        "updatedAt": "2026-08-23T10:15:30.000Z"                                                   
      }                                                                                           
    }                                                                                             
  ──────                                                                                          
  ### 2. PUT /master-programmes/{masterProgrammeId}                                               
                                                                                                  
  • Category: Academic Master Hierarchy                                                           
  • Method: PUT                                                                                   
  • Path: /master-programmes/{masterProgrammeId}                                                  
  • Purpose: Updates an existing Master Programme and synchronizes coordinator assignments.       
  • Path Parameters:                                                                              
      • masterProgrammeId (string, required) — The ID of the Master Programme to update.          
  • Content-Type: application/json                                                                
                                                                                                  
  #### Request Body                                                                               
                                                                                                  
    {                                                                                             
      "departmentId": "dept-soe-cse",                                                             
      "code": "BT-CSE",                                                                           
      "name": "B.Tech Computer Science and Engineering (AI & ML)",                                
      "durationYears": 4,                                                                         
      "status": "ACTIVE",                                                                         
      "departmentName": "Computer Science & Engineering",                                         
      "coordinator": "Dr. Jane Smith",                                                            
      "coordinatorEmail": "jane.smith@dypiu.ac.in"                                                
    }                                                                                             
                                                                                                  
   Field            │ Type            │ Required        │ Description
  ──────────────────┼─────────────────┼─────────────────┼─────────────────────────────────────────
   name             │ string          │ No              │ Updated full name of Programme
   code             │ string          │ No              │ Updated Programme code
   departmentId     │ string          │ No              │ Department ID reassignment
   durationYears    │ number          │ No              │ Updated duration
   status           │ string          │ No              │ Updated status (ACTIVE / INACTIVE)
   departmentName   │ string          │ No              │ Department display name
   coordinator      │ string          │ No              │ Name of assigned Programme Coordinator
   coordinatorEmail │ string          │ No              │ Email of assigned Programme Coordinator
                                                                                                  
  #### Response Body (HTTP 200 OK)                                                                
                                                                                                  
    {                                                                                             
      "success": true,                                                                            
      "message": "MasterProgramme updated successfully",                                          
      "data": {                                                                                   
        "masterProgrammeId": "prog-a1b2c3d4",                                                     
        "departmentId": "dept-soe-cse",                                                           
        "code": "BT-CSE",                                                                         
        "name": "B.Tech Computer Science and Engineering (AI & ML)",                              
        "durationYears": 4,                                                                       
        "status": "ACTIVE",                                                                       
        "departmentName": "Computer Science & Engineering",                                       
        "coordinator": "Dr. Jane Smith",                                                          
        "coordinatorEmail": "jane.smith@dypiu.ac.in",                                             
        "createdAt": "2026-08-23T10:15:30.000Z",                                                  
        "updatedAt": "2026-08-23T10:20:00.000Z"                                                   
      }                                                                                           
    }                                                                                             
  ──────                                                                                          
  ### 3. DELETE /master-programmes/{masterProgrammeId}                                            
                                                                                                  
  • Category: Academic Master Hierarchy                                                           
  • Method: DELETE                                                                                
  • Path: /master-programmes/{masterProgrammeId}                                                  
  • Purpose: Deletes a Master Programme.                                                          
  • Path Parameters:                                                                              
      • masterProgrammeId (string, required) — The ID of the Master Programme to delete.          
  • Content-Type: None / Empty                                                                    
                                                                                                  
  #### Request Body                                                                               
                                                                                                  
  None (No request payload)                                                                       
                                                                                                  
  #### Response Body (HTTP 200 OK)                                                                
                                                                                                  
    {                                                                                             
      "success": true,                                                                            
      "message": "MasterProgramme deleted successfully",                                          
      "data": null                                                                                
    }

---

## 5. Programme Batch Reports & ATR

### GET /programme-batches/{programmeBatchId}/reports/average-mapping
- **CATEGORY:** Programme Batch Reports
- **METHOD:** GET
- **PATH:** `/programme-batches/{programmeBatchId}/reports/average-mapping`
- **PURPOSE:** Report 1 (Semester Average Mapping Matrix). Independent data product.
- **PATH PARAMETERS:** `programmeBatchId` (string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": {
    "poMappings": [
      {
        "poCode": "string",
        "semesterAverages": [
          {
            "semester": "number",
            "value": "number"
          }
        ],
        "programmeAverageMapping": "number"
      }
    ],
    "psoMappings": [
      {
        "psoCode": "string",
        "semesterAverages": [
          {
            "semester": "number",
            "value": "number"
          }
        ],
        "programmeAverageMapping": "number"
      }
    ]
  }
}
```

### GET /programme-batches/{programmeBatchId}/reports/direct-attainment
- **CATEGORY:** Programme Batch Reports
- **METHOD:** GET
- **PATH:** `/programme-batches/{programmeBatchId}/reports/direct-attainment`
- **PURPOSE:** Report 2 (Programme Direct PO/PSO Attainment aggregated from Course Table 2).
- **PATH PARAMETERS:** `programmeBatchId` (string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": {
    "poDirectAttainment": [
      {
        "poCode": "string",
        "semesterDirectAttainments": [
          {
            "semester": "number",
            "value": "number"
          }
        ],
        "programmeDirectAttainment": "number"
      }
    ],
    "psoDirectAttainment": [
      {
        "psoCode": "string",
        "semesterDirectAttainments": [
          {
            "semester": "number",
            "value": "number"
          }
        ],
        "programmeDirectAttainment": "number"
      }
    ]
  }
}
```

### GET /programme-batches/{programmeBatchId}/reports/indirect-attainment
- **CATEGORY:** Programme Batch Reports
- **METHOD:** GET
- **PATH:** `/programme-batches/{programmeBatchId}/reports/indirect-attainment`
- **PURPOSE:** Report 3 (Exit Survey Indirect Attainment).
- **PATH PARAMETERS:** `programmeBatchId` (string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": {
    "poIndirectAttainment": [
      {
        "poCode": "string",
        "percentageSubstantial": "number",
        "percentageModerate": "number",
        "percentageSlight": "number",
        "weightedScore": "number",
        "indirectPercentage": "number",
        "indirectAttainmentLevel": "number"
      }
    ],
    "psoIndirectAttainment": [
      {
        "psoCode": "string",
        "percentageSubstantial": "number",
        "percentageModerate": "number",
        "percentageSlight": "number",
        "weightedScore": "number",
        "indirectPercentage": "number",
        "indirectAttainmentLevel": "number"
      }
    ]
  }
}
```

### POST /programme-batches/{programmeBatchId}/survey/upload
- **CATEGORY:** Programme Batch Survey
- **METHOD:** POST
- **PATH:** `/programme-batches/{programmeBatchId}/survey/upload`
- **PURPOSE:** Ingests Programme Exit Survey Excel file.
- **PATH PARAMETERS:** `programmeBatchId` (string)
- **CONTENT-TYPE:** `multipart/form-data`
- **FORM DATA:** `file` (Excel), `uploadedBy` (optional, string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "message": "string",
  "data": {
    "uploadId": "string",
    "masterProgrammeId": "string",
    "programmeBatchId": "string",
    "surveyType": "string",
    "recordsProcessed": "number",
    "poAttainment": [
      {
        "poCode": "string",
        "weightedScore": "number"
      }
    ],
    "psoAttainment": [
      {
        "psoCode": "string",
        "weightedScore": "number"
      }
    ]
  }
}
```

### GET /programme-batches/{programmeBatchId}/reports/overall-attainment
- **CATEGORY:** Programme Batch Reports
- **METHOD:** GET
- **PATH:** `/programme-batches/{programmeBatchId}/reports/overall-attainment`
- **PURPOSE:** Report 4 (Overall PO/PSO Attainment: 80% Direct + 20% Indirect per PO/PSO).
- **PATH PARAMETERS:** `programmeBatchId` (string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": {
    "poOverallAttainment": [
      {
        "poCode": "string",
        "statement": "string",
        "targetLevel": "number",
        "directAttainment": "number",
        "indirectAttainment": "number",
        "finalAttainment": "number",
        "targetMet": "boolean",
        "observation": "string"
      }
    ],
    "psoOverallAttainment": [
      {
        "psoCode": "string",
        "statement": "string",
        "targetLevel": "number",
        "directAttainment": "number",
        "indirectAttainment": "number",
        "finalAttainment": "number",
        "targetMet": "boolean",
        "observation": "string"
      }
    ]
  }
}
```

### GET /programme-batches/{programmeBatchId}/reports/attainment-main
- **CATEGORY:** Programme Batch Reports
- **METHOD:** GET
- **PATH:** `/programme-batches/{programmeBatchId}/reports/attainment-main`
- **PURPOSE:** Consolidated snapshot containing Reports 1, 2, 3, and 4.
- **PATH PARAMETERS:** `programmeBatchId` (string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": {
    "programmeBatchAttainmentReportId": "string",
    "programmeBatchId": "string",
    "batchName": "string",
    "masterProgrammeId": "string",
    "programmeName": "string",
    "programmeCode": "string",
    "status": "string",
    "overallProgrammeAttainment": "number",
    "report1AverageMappingPO": [
      {
        "poCode": "string",
        "semesterAverages": [
          {
            "semester": "number",
            "value": "number"
          }
        ],
        "programmeAverageMapping": "number"
      }
    ],
    "report1AverageMappingPSO": [
      {
        "psoCode": "string",
        "semesterAverages": [
          {
            "semester": "number",
            "value": "number"
          }
        ],
        "programmeAverageMapping": "number"
      }
    ],
    "report2DirectAttainmentPO": [
      {
        "poCode": "string",
        "semesterDirectAttainments": [
          {
            "semester": "number",
            "value": "number"
          }
        ],
        "programmeDirectAttainment": "number"
      }
    ],
    "report2DirectAttainmentPSO": [
      {
        "psoCode": "string",
        "semesterDirectAttainments": [
          {
            "semester": "number",
            "value": "number"
          }
        ],
        "programmeDirectAttainment": "number"
      }
    ],
    "report3IndirectAttainmentPO": [
      {
        "poCode": "string",
        "percentageSubstantial": "number",
        "percentageModerate": "number",
        "percentageSlight": "number",
        "weightedScore": "number",
        "indirectPercentage": "number",
        "indirectAttainmentLevel": "number"
      }
    ],
    "report3IndirectAttainmentPSO": [
      {
        "psoCode": "string",
        "percentageSubstantial": "number",
        "percentageModerate": "number",
        "percentageSlight": "number",
        "weightedScore": "number",
        "indirectPercentage": "number",
        "indirectAttainmentLevel": "number"
      }
    ],
    "report4OverallAttainmentPO": [
      {
        "poCode": "string",
        "statement": "string",
        "targetLevel": "number",
        "directAttainment": "number",
        "indirectAttainment": "number",
        "finalAttainment": "number",
        "targetMet": "boolean",
        "observation": "string"
      }
    ],
    "report4OverallAttainmentPSO": [
      {
        "psoCode": "string",
        "statement": "string",
        "targetLevel": "number",
        "directAttainment": "number",
        "indirectAttainment": "number",
        "finalAttainment": "number",
        "targetMet": "boolean",
        "observation": "string"
      }
    ],
    "submittedBy": "string",
    "submittedAt": "string",
    "approvedBy": "string",
    "approvedAt": "string"
  }
}
```

### POST /programme-batches/{programmeBatchId}/reports/finalize
- **CATEGORY:** Programme Batch Reports
- **METHOD:** POST
- **PATH:** `/programme-batches/{programmeBatchId}/reports/finalize`
- **PURPOSE:** Locks calculations into an immutable snapshot.
- **PATH PARAMETERS:** `programmeBatchId` (string)
- **RESPONSE BODY:** Returns updated `ProgrammeBatchAttainmentReportDto` in `FINALIZED` status.
- **AUDIT ACTION:** `SUBMIT` on `PROGRAMME_ATTAINMENT`

---

## 6. Programme Batch Course Reports & ATR

### GET /programme-batch-courses/{programmeBatchCourseId}/attainment-main
- **CATEGORY:** Course Attainment
- **METHOD:** GET
- **PATH:** `/programme-batch-courses/{programmeBatchCourseId}/attainment-main`
- **PURPOSE:** Computes or retrieves persisted Course Attainment Tables 1, 2, and 3.
- **PATH PARAMETERS:** `programmeBatchCourseId` (string)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": {
    "courseAttainmentReportId": "string",
    "programmeBatchCourseId": "string",
    "masterCourseId": "string",
    "courseCode": "string",
    "courseName": "string",
    "programmeBatchId": "string",
    "batchName": "string",
    "semester": "number",
    "status": "string",
    "overallCoAttainment": "number",
    "directAttainment": "number",
    "indirectAttainment": "number",
    "table1Mapping": [
      {
        "coCode": "string",
        "statement": "string",
        "poMappings": {
          "PO1": "number"
        },
        "psoMappings": {
          "PSO1": "number"
        }
      }
    ],
    "table2DirectPO": [
      {
        "poCode": "string",
        "averageMapping": "number",
        "directContribution": "number"
      }
    ],
    "table2DirectPSO": [
      {
        "psoCode": "string",
        "averageMapping": "number",
        "directContribution": "number"
      }
    ],
    "table3CoAttainments": [
      {
        "coCode": "string",
        "statement": "string",
        "targetLevel": "number",
        "directPercentage": "number",
        "directLevel": "number",
        "indirectPercentage": "number",
        "indirectScore": "number",
        "indirectLevel": "number",
        "finalAttainment": "number",
        "targetMet": "boolean",
        "observation": "string"
      }
    ],
    "submittedBy": "string"
  }
}
```

### POST /programme-batch-courses/{programmeBatchCourseId}/attainment-main/finalize
- **CATEGORY:** Course Attainment
- **METHOD:** POST
- **PATH:** `/programme-batch-courses/{programmeBatchCourseId}/attainment-main/finalize`
- **PURPOSE:** Locks Course Attainment into an immutable snapshot.
- **PATH PARAMETERS:** `programmeBatchCourseId` (string)
- **RESPONSE BODY:** Returns updated `CourseAttainmentReportDto` in `FINALIZED` status.
- **AUDIT ACTION:** `SUBMIT` on `COURSE_ATTAINMENT`

---

## 7. Governance, Approvals & Deletions

### GET /approvals
- **CATEGORY:** Approval Governance
- **METHOD:** GET
- **PATH:** `/approvals`
- **PURPOSE:** Queries approval requests filtered by status, role, or resource.
- **QUERY PARAMETERS:** `role`, `status`, `type`, `schoolId`, `masterProgrammeId`
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": [
    {
      "approvalRequestId": "string",
      "type": "string",
      "title": "string",
      "resourceId": "string",
      "masterProgrammeId": "string",
      "programmeBatchId": "string",
      "masterCourseId": "string",
      "programmeBatchCourseId": "string",
      "status": "string",
      "submittedBy": "string",
      "submittedAt": "string",
      "approvedBy": "string",
      "approvedAt": "string",
      "remarks": "string"
    }
  ]
}
```

### POST /approvals/submit
- **CATEGORY:** Approval Governance
- **METHOD:** POST
- **PATH:** `/approvals/submit`
- **REQUEST BODY:**
```json
{
  "type": "string",
  "title": "string",
  "resourceId": "string",
  "masterProgrammeId": "string",
  "programmeBatchId": "string",
  "masterCourseId": "string",
  "programmeBatchCourseId": "string",
  "details": "string"
}
```
- **RESPONSE BODY:** `ApiResponse<ApprovalRequest>`

### POST /deletion-requests
- **CATEGORY:** Deletion Governance
- **METHOD:** POST
- **PATH:** `/deletion-requests`
- **REQUEST BODY:**
```json
{
  "resourceType": "string",
  "resourceId": "string",
  "reason": "string"
}
```
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "message": "string",
  "data": {
    "deletionRequestId": "number",
    "resourceType": "string",
    "resourceId": "string",
    "requestedBy": "string",
    "status": "string"
  }
}
```

### POST /deletion-requests/{deletionRequestId}/execute
- **CATEGORY:** Deletion Governance
- **METHOD:** POST
- **PATH:** `/deletion-requests/{deletionRequestId}/execute`
- **REQUEST BODY:**
```json
{
  "password": "string"
}
```
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "message": "string",
  "data": {
    "deletionRequestId": "number",
    "status": "string"
  }
}
```

---

## 8. Audit Trail & System Health

### GET /audit-logs
- **CATEGORY:** Centralized Audit Logging
- **METHOD:** GET
- **PATH:** `/audit-logs`
- **PURPOSE:** Paginated query over immutable audit logs.
- **AUTHENTICATION:** JWT Bearer
- **AUTHORIZATION:** `ADMIN`, `IQAC` only.
- **QUERY PARAMETERS:** `actorId`, `actorRole`, `action`, `resourceType`, `resourceId`, `success`, `from`, `to`, `page`, `size`
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "data": {
    "content": [
      {
        "auditLogId": "number",
        "actorId": "string",
        "actorName": "string",
        "actorRole": "string",
        "action": "string",
        "resourceType": "string",
        "resourceId": "string",
        "oldStatus": "string",
        "newStatus": "string",
        "remarks": "string",
        "ipAddress": "string",
        "createdAt": "string",
        "success": "boolean"
      }
    ],
    "page": "number",
    "size": "number",
    "totalElements": "number",
    "totalPages": "number",
    "last": "boolean"
  }
}
```

### GET /health
- **CATEGORY:** System Health
- **METHOD:** GET
- **PATH:** `/health`
- **PURPOSE:** System health and database connectivity probe.
- **AUTHENTICATION:** None (Public)
- **RESPONSE BODY:**
```json
{
  "success": "boolean",
  "message": "string",
  "data": {
    "status": "string",
    "system": "string",
    "javaVersion": "string",
    "springBoot": "string",
    "database": "string",
    "migrationEngine": "string"
  }
}
```
