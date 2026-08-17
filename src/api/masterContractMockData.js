/**
 * ====================================================================
 * MASTER BACKEND API CONTRACT MOCK DATA (Section 81 Compliant)
 * DYPIU NBA / OBE MANAGEMENT SYSTEM
 * ====================================================================
 * Strict contract dummy data strictly matching the master API contract specification.
 * Consistent Shared IDs across all responses:
 * school-1, dept-1, prog-1, batch-2025-29, batch-2026-30, course-1, offering-1,
 * co-1, po-1, pso-1, peo-1, user-123, user-1, student-1, catr-1, patr-2029,
 * approval-1, upload-123
 */

export const MASTER_MOCK_DATA = {
  // ── 81.1 SCHOOL APIs ──────────────────────────────────────────────────────
  schools: [
    {
      id: "school-1",
      code: "SOE",
      name: "School of Engineering",
      director: "Director Name",
      directorEmail: "director@example.com",
      estYear: "2010",
      status: "ACTIVE"
    }
  ],

  singleSchool: {
    id: "school-1",
    code: "SOE",
    name: "School of Engineering",
    director: "Director Name",
    directorEmail: "director@example.com",
    estYear: "2010",
    status: "ACTIVE"
  },

  // ── 81.2 & 81.3 DEPARTMENT APIs ──────────────────────────────────────────
  departments: [
    {
      id: "dept-1",
      schoolId: "school-1",
      code: "COMP",
      name: "Computer Engineering",
      hod: "HOD Name",
      hodEmail: "hod@example.com",
      status: "ACTIVE"
    }
  ],

  singleDepartment: {
    id: "dept-1",
    schoolId: "school-1",
    code: "COMP",
    name: "Computer Engineering",
    hod: "HOD Name",
    hodEmail: "hod@example.com",
    status: "ACTIVE"
  },

  // ── 81.4 & 81.5 PROGRAMME APIs ───────────────────────────────────────────
  programmes: [
    {
      id: "prog-1",
      departmentId: "dept-1",
      code: "BE-COMP",
      name: "Bachelor of Engineering Computer Engineering",
      durationYears: 4,
      coordinator: "PC Name",
      coordinatorEmail: "pc@example.com",
      status: "ACTIVE"
    }
  ],

  singleProgramme: {
    id: "prog-1",
    departmentId: "dept-1",
    code: "BE-COMP",
    name: "Bachelor of Engineering Computer Engineering",
    durationYears: 4,
    coordinator: "PC Name",
    coordinatorEmail: "pc@example.com",
    status: "ACTIVE"
  },

  // ── 81.6 BATCH APIs ──────────────────────────────────────────────────────
  batches: [
    {
      id: "batch-2025-29",
      programmeId: "prog-1",
      programmeCode: "BE-COMP",
      programmeName: "Computer Engineering",
      name: "2025-29",
      startYear: "2025",
      endYear: "2029",
      durationYears: 4,
      yearLevel: "1",
      status: "ACTIVE"
    },
    {
      id: "batch-2026-30",
      programmeId: "prog-1",
      programmeCode: "BE-COMP",
      programmeName: "Computer Engineering",
      name: "2026-30",
      startYear: "2026",
      endYear: "2030",
      durationYears: 4,
      yearLevel: "1",
      status: "ACTIVE"
    }
  ],

  singleBatch: {
    id: "batch-2025-29",
    programmeId: "prog-1",
    programmeCode: "BE-COMP",
    programmeName: "Computer Engineering",
    name: "2025-29",
    startYear: "2025",
    endYear: "2029",
    durationYears: 4,
    yearLevel: "1",
    status: "ACTIVE"
  },

  // ── BATCH DASHBOARD / CONTEXT API ─────────────────────────────────────────
  batchContext: {
    batch: {
      id: "batch-2025-29",
      name: "2025-29",
      programmeId: "prog-1",
      programmeName: "Computer Engineering",
      status: "ACTIVE"
    },
    programme: {
      id: "prog-1",
      code: "BE-COMP",
      name: "Computer Engineering"
    },
    department: {
      id: "dept-1",
      name: "Computer Engineering"
    },
    school: {
      id: "school-1",
      name: "School of Engineering"
    },
    statistics: {
      studentCount: 120,
      courseCount: 48,
      courseOfferingCount: 48,
      completedCourseAtrCount: 32,
      programmeAtrStatus: "DRAFT"
    }
  },

  // ── 81.7, 81.8, 81.9 COURSE APIs ─────────────────────────────────────────
  courses: [
    {
      id: "course-1",
      code: "CS301",
      name: "Data Structures",
      programmeId: "prog-1",
      semester: "3",
      coordinator: "Faculty Name",
      faculty: "Faculty Name",
      assignedFaculty: "Faculty Name",
      academicYear: "2025-26",
      status: "ACTIVE"
    }
  ],

  singleCourse: {
    id: "course-1",
    code: "CS301",
    name: "Data Structures",
    programmeId: "prog-1",
    semester: "3",
    coordinator: "Faculty Name",
    faculty: "Faculty Name",
    assignedFaculty: "Faculty Name",
    academicYear: "2025-26",
    status: "ACTIVE"
  },

  // ── 81.10, 81.11, 81.12 COURSE OFFERING APIs ─────────────────────────────
  courseOfferings: [
    {
      id: "offering-1",
      courseId: "course-1",
      batchId: "batch-2025-29",
      semester: 3,
      academicYear: "2025-26",
      course: {
        id: "course-1",
        code: "CS301",
        name: "Data Structures"
      },
      batch: {
        id: "batch-2025-29",
        name: "2025-29",
        programmeId: "prog-1",
        programmeName: "Computer Engineering"
      },
      programme: {
        id: "prog-1",
        code: "BE-COMP",
        name: "Computer Engineering"
      },
      courseCoordinatorId: "user-123",
      courseCoordinatorName: "Faculty Name",
      assignedFaculty: "Faculty Name",
      status: "ACTIVE"
    }
  ],

  singleCourseOffering: {
    id: "offering-1",
    courseId: "course-1",
    batchId: "batch-2025-29",
    semester: 3,
    academicYear: "2025-26",
    course: {
      id: "course-1",
      code: "CS301",
      name: "Data Structures"
    },
    batch: {
      id: "batch-2025-29",
      name: "2025-29",
      programmeId: "prog-1",
      programmeName: "Computer Engineering"
    },
    programme: {
      id: "prog-1",
      code: "BE-COMP",
      name: "Computer Engineering"
    },
    courseCoordinatorId: "user-123",
    courseCoordinatorName: "Faculty Name",
    assignedFaculty: "Faculty Name",
    status: "ACTIVE"
  },

  // ── COORDINATOR / USER APIs ───────────────────────────────────────────────
  programmeCoordinators: [
    {
      id: 123,
      username: "pc1",
      email: "pc@example.com",
      name: "Programme Coordinator",
      role: "PROGRAMME_COORDINATOR",
      isActive: true
    }
  ],

  facultyUsers: [
    {
      id: 124,
      email: "faculty@example.com",
      name: "Faculty Name",
      role: "FACULTY",
      isActive: true
    }
  ],

  allUsers: [
    {
      id: 123,
      username: "pc1",
      email: "pc@example.com",
      name: "Programme Coordinator",
      role: "PROGRAMME_COORDINATOR",
      isActive: true
    },
    {
      id: 124,
      email: "faculty@example.com",
      name: "Faculty Name",
      role: "FACULTY",
      isActive: true
    },
    {
      id: 125,
      email: "hod@example.com",
      name: "HOD Name",
      role: "HOD",
      isActive: true
    }
  ],

  // ── 81.21 STUDENT APIs & IMPORT ───────────────────────────────────────────
  studentsResponse: {
    batchId: "batch-2025-29",
    students: [
      {
        id: "student-1",
        batchId: "batch-2025-29",
        prn: "PRN001",
        name: "Student One",
        email: "student@example.com",
        status: "ENROLLED"
      }
    ],
    total: 120
  },

  singleStudent: {
    id: "student-1",
    batchId: "batch-2025-29",
    prn: "PRN001",
    name: "Student One",
    email: "student@example.com",
    status: "ENROLLED"
  },

  studentImportResponse: {
    batchId: "batch-2025-29",
    recordsProcessed: 120,
    recordsCreated: 118,
    recordsUpdated: 2,
    errors: []
  },

  // ── 81.16 PROGRAMME PO / PSO / PEO APIs ───────────────────────────────────
  programmeOutcomes: {
    programmeId: "prog-1",
    pos: [
      {
        id: "po-1",
        programmeId: "prog-1",
        code: "PO1",
        statement: "Engineering knowledge: Apply knowledge of mathematics, science, engineering fundamentals to solve complex engineering problems.",
        academicYear: "2025-26",
        competencies: [],
        createdAt: "2026-08-16T10:00:00Z"
      },
      {
        id: "po-2",
        programmeId: "prog-1",
        code: "PO2",
        statement: "Problem analysis: Identify, formulate, review research literature, and analyze complex engineering problems.",
        academicYear: "2025-26",
        competencies: [],
        createdAt: "2026-08-16T10:00:00Z"
      }
    ],
    psos: [
      {
        id: "pso-1",
        programmeId: "prog-1",
        code: "PSO1",
        statement: "Apply engineering principles and modern tools to develop software solutions and algorithmic systems.",
        academicYear: "2025-26",
        competencies: [],
        createdAt: "2026-08-16T10:00:00Z"
      }
    ],
    peos: [
      {
        id: "peo-1",
        programmeId: "prog-1",
        code: "PEO1",
        statement: "Demonstrate professional competence and leadership in computing and allied industries.",
        academicYear: "2025-26",
        createdAt: "2026-08-16T10:00:00Z"
      }
    ]
  },

  // ── 81.20 PROGRAMME TARGET APIs ───────────────────────────────────────────
  programmeTargets: {
    programmeId: "prog-1",
    targets: [
      {
        outcomeCode: "PO1",
        targetValue: 2.50
      },
      {
        outcomeCode: "PO2",
        targetValue: 2.30
      },
      {
        outcomeCode: "PSO1",
        targetValue: 2.50
      }
    ],
    status: "SAVED"
  },

  // ── 81.13 COURSE OUTCOME APIs ─────────────────────────────────────────────
  courseOutcomesResponse: {
    courseOfferingId: "offering-1",
    courseId: "course-1",
    batchId: "batch-2025-29",
    outcomes: [
      {
        id: "co-1",
        courseId: "course-1",
        code: "CO1",
        statement: "Understand fundamental data structures and algorithmic complexity.",
        targetLevel: 2.50
      },
      {
        id: "co-2",
        courseId: "course-1",
        code: "CO2",
        statement: "Apply tree and graph algorithms for optimization problems.",
        targetLevel: 2.40
      }
    ]
  },

  singleCourseOutcome: {
    id: "co-1",
    courseId: "course-1",
    code: "CO1",
    statement: "Understand fundamental data structures and algorithmic complexity.",
    targetLevel: 2.50
  },

  // ── 81.14 CO-PO / CO-PSO MAPPING APIs ─────────────────────────────────────
  coMappingsResponse: {
    courseOfferingId: "offering-1",
    batchId: "batch-2025-29",
    mappings: [
      {
        courseOutcomeId: "co-1",
        coCode: "CO1",
        poMappings: [
          {
            poCode: "PO1",
            mappingLevel: 3
          },
          {
            poCode: "PO2",
            mappingLevel: 2
          }
        ],
        psoMappings: [
          {
            psoCode: "PSO1",
            mappingLevel: 2
          }
        ]
      },
      {
        courseOutcomeId: "co-2",
        coCode: "CO2",
        poMappings: [
          {
            poCode: "PO1",
            mappingLevel: 2
          },
          {
            poCode: "PO2",
            mappingLevel: 3
          }
        ],
        psoMappings: [
          {
            psoCode: "PSO1",
            mappingLevel: 3
          }
        ]
      }
    ],
    status: "SAVED"
  },

  // ── 81.15 ATTAINMENT CONFIGURATION APIs ───────────────────────────────────
  attainmentConfiguration: {
    courseId: "course-1",
    courseCode: "CS301",
    courseName: "Data Structures",
    directWeight: 80.00,
    indirectWeight: 20.00,
    directThreshold: 60.00,
    indirectThreshold: 60.00,
    status: "SAVED"
  },

  // ── EVIDENCE UPLOADS ──────────────────────────────────────────────────────
  marksUploadResponse: {
    uploadId: "upload-123",
    courseOffering: {
      id: "offering-1",
      courseId: "course-1",
      batchId: "batch-2025-29",
      semester: 3
    },
    recordsProcessed: 120,
    recordsAccepted: 118,
    recordsRejected: 2,
    errors: [
      {
        row: 14,
        reason: "Student PRN not found in selected batch"
      }
    ],
    status: "PROCESSED"
  },

  surveyUploadResponse: {
    uploadId: "survey-upload-1",
    courseOfferingId: "offering-1",
    batchId: "batch-2025-29",
    recordsProcessed: 120,
    recordsAccepted: 120,
    recordsRejected: 0,
    status: "PROCESSED"
  },

  programmeSurveyResponse: {
    uploadId: "programme-survey-2029",
    programmeId: "prog-1",
    batchId: "batch-2025-29",
    surveyType: "PROGRAMME_INDIRECT",
    recordsProcessed: 120,
    poIndirectAttainment: [
      {
        poCode: "PO1",
        indirectAttainment: 2.10
      },
      {
        poCode: "PO2",
        indirectAttainment: 2.20
      }
    ],
    psoIndirectAttainment: [
      {
        psoCode: "PSO1",
        indirectAttainment: 2.20
      }
    ],
    status: "PROCESSED"
  },

  // ── COURSE ATTAINMENT MAIN API ────────────────────────────────────────────
  courseAttainment: {
    courseOffering: {
      id: "offering-1",
      courseId: "course-1",
      batchId: "batch-2025-29",
      semester: 3
    },
    course: {
      code: "CS301",
      name: "Data Structures"
    },
    batch: {
      id: "batch-2025-29",
      name: "2025-29"
    },
    configuration: {
      directWeight: 80.00,
      indirectWeight: 20.00
    },
    outcomes: [
      {
        coCode: "CO1",
        statement: "Understand fundamental data structures and algorithmic complexity.",
        targetLevel: 2.50,
        directAttainment: 2.70,
        indirectAttainment: 2.30,
        overallAttainment: 2.62,
        achievementPercentage: 104.80,
        observation: "Target Achieved"
      },
      {
        coCode: "CO2",
        statement: "Apply tree and graph algorithms for optimization problems.",
        targetLevel: 2.40,
        directAttainment: 2.50,
        indirectAttainment: 2.20,
        overallAttainment: 2.44,
        achievementPercentage: 101.67,
        observation: "Target Achieved"
      }
    ]
  },

  // ── PROGRAMME ATTAINMENT MAIN ─────────────────────────────────────────────
  programmeAttainment: {
    programme: {
      id: "prog-1",
      code: "BE-COMP",
      name: "Computer Engineering"
    },
    batch: {
      id: "batch-2025-29",
      name: "2025-29",
      startYear: "2025",
      endYear: "2029"
    },
    summary: {
      courseOfferingCount: 48,
      semesterCount: 8
    },
    averageMapping: {
      pos: [
        {
          poCode: "PO1",
          semesterValues: [
            { semester: 1, averageMapping: 2.40 },
            { semester: 2, averageMapping: 2.60 }
          ],
          overallAverage: 2.50
        },
        {
          poCode: "PO2",
          semesterValues: [
            { semester: 1, averageMapping: 2.20 },
            { semester: 2, averageMapping: 2.40 }
          ],
          overallAverage: 2.30
        }
      ],
      psos: [
        {
          psoCode: "PSO1",
          semesterValues: [
            { semester: 1, averageMapping: 2.10 }
          ],
          overallAverage: 2.10
        }
      ]
    },
    averageDirectAttainment: {
      pos: [
        {
          poCode: "PO1",
          semesterValues: [
            { semester: 1, averageAttainment: 2.20 },
            { semester: 2, averageAttainment: 2.40 }
          ],
          overallAverage: 2.30
        },
        {
          poCode: "PO2",
          semesterValues: [
            { semester: 1, averageAttainment: 2.10 },
            { semester: 2, averageAttainment: 2.30 }
          ],
          overallAverage: 2.20
        }
      ],
      psos: [
        {
          psoCode: "PSO1",
          semesterValues: [
            { semester: 1, averageAttainment: 2.10 }
          ],
          overallAverage: 2.10
        }
      ]
    },
    averageIndirectAttainment: {
      pos: [
        { poCode: "PO1", indirectAttainment: 2.40 },
        { poCode: "PO2", indirectAttainment: 2.20 }
      ],
      psos: [
        { psoCode: "PSO1", indirectAttainment: 2.20 }
      ]
    },
    overallAttainment: {
      pos: [
        {
          poCode: "PO1",
          target: 2.50,
          directAttainment: 2.30,
          indirectAttainment: 2.40,
          directWeight: 80.00,
          indirectWeight: 20.00,
          overallAttainment: 2.32,
          achievementPercentage: 92.80,
          observation: "Target Not Achieved"
        },
        {
          poCode: "PO2",
          target: 2.30,
          directAttainment: 2.20,
          indirectAttainment: 2.20,
          directWeight: 80.00,
          indirectWeight: 20.00,
          overallAttainment: 2.20,
          achievementPercentage: 95.65,
          observation: "Target Not Achieved"
        }
      ],
      psos: [
        {
          psoCode: "PSO1",
          target: 2.50,
          directAttainment: 2.10,
          indirectAttainment: 2.20,
          overallAttainment: 2.12,
          achievementPercentage: 84.80,
          observation: "Target Not Achieved"
        }
      ]
    }
  },

  // ── 81.18 COURSE ATR COMPLETE CREATE / UPDATE ─────────────────────────────
  courseAtr: {
    reportType: "COURSE_ATR",
    courseAtrId: "catr-1",
    courseOfferingId: "offering-1",
    course: {
      id: "course-1",
      code: "CS301",
      name: "Data Structures"
    },
    batch: {
      id: "batch-2025-29",
      name: "2025-29"
    },
    semester: 3,
    status: "DRAFT",
    outcomes: [
      {
        coCode: "CO1",
        outcomeCode: "CO1",
        statement: "Understand fundamental data structures and algorithmic complexity.",
        outcomeStatement: "Understand fundamental data structures and algorithmic complexity.",
        targetLevel: 2.50,
        actualScore: 2.70,
        attainmentLevel: 2.70,
        pctAchieved: 108.00,
        achievementPercentage: 108.00,
        status: "Target Achieved",
        observation: "108.00% Target Achieved",
        actions: [
          "Maintain active programming problem sets in weekly laboratory sessions.",
          "Introduce peer code review sessions for complex algorithms."
        ]
      },
      {
        coCode: "CO2",
        outcomeCode: "CO2",
        statement: "Apply tree and graph algorithms for optimization problems.",
        outcomeStatement: "Apply tree and graph algorithms for optimization problems.",
        targetLevel: 2.40,
        actualScore: 2.50,
        attainmentLevel: 2.50,
        pctAchieved: 104.17,
        achievementPercentage: 104.17,
        status: "Target Achieved",
        observation: "104.17% Target Achieved",
        actions: [
          "Organize competitive programming hackathons."
        ]
      }
    ]
  },

  // ── 81.19 PROGRAMME ATR COMPLETE CREATE ───────────────────────────────────
  programmeAtr: {
    reportType: "PROGRAMME_ATR",
    programmeAtrId: "patr-2029",
    programmeId: "prog-1",
    batchId: "batch-2025-29",
    programme: {
      id: "prog-1",
      code: "BE-COMP",
      name: "Computer Engineering"
    },
    batch: {
      id: "batch-2025-29",
      name: "2025-29",
      startYear: "2025",
      endYear: "2029"
    },
    status: "DRAFT",
    poOutcomes: [
      {
        outcomeCode: "PO1",
        outcomeStatement: "Engineering knowledge: Apply knowledge of mathematics and engineering fundamentals to solve complex engineering problems.",
        targetLevel: 2.50,
        directAttainment: 2.30,
        indirectAttainment: 2.40,
        overallAttainment: 2.32,
        attainmentLevel: 2.32,
        achievementPercentage: 92.80,
        observation: "92.80% Target Not Achieved",
        actions: [
          "Conduct remedial workshops in mathematical modeling and applied numerical algorithms.",
          "Incorporate industry-aligned hands-on laboratory modules."
        ]
      },
      {
        outcomeCode: "PO2",
        outcomeStatement: "Problem analysis: Identify, formulate, review research literature, and analyze complex engineering problems.",
        targetLevel: 2.30,
        directAttainment: 2.20,
        indirectAttainment: 2.20,
        overallAttainment: 2.20,
        attainmentLevel: 2.20,
        achievementPercentage: 95.65,
        observation: "95.65% Target Not Achieved",
        actions: [
          "Increase focus on research methodology and IEEE paper reviews in capstone courses."
        ]
      }
    ],
    psoOutcomes: [
      {
        outcomeCode: "PSO1",
        outcomeStatement: "Apply engineering principles and modern tools to develop software solutions and algorithmic systems.",
        targetLevel: 2.50,
        directAttainment: 2.10,
        indirectAttainment: 2.20,
        overallAttainment: 2.12,
        attainmentLevel: 2.12,
        achievementPercentage: 84.80,
        observation: "84.80% Target Not Achieved",
        actions: [
          "Establish mentorship programs with industry technical leads.",
          "Introduce advanced full-stack framework labs in curriculum."
        ]
      }
    ]
  },

  // ── APPROVAL APIs ─────────────────────────────────────────────────────────
  pendingApprovals: {
    approvals: [
      {
        id: "approval-1",
        type: "COURSE_ATR",
        title: "CS301 Course ATR",
        courseOfferingId: "offering-1",
        programmeId: "prog-1",
        batchId: "batch-2025-29",
        submittedBy: "Course Coordinator",
        submittedAt: "2026-08-16T10:00:00Z",
        status: "PENDING"
      }
    ]
  },

  approvalDetails: {
    id: "approval-1",
    type: "COURSE_ATR",
    status: "PENDING",
    resource: {
      courseAtrId: "catr-1",
      courseOfferingId: "offering-1",
      batchId: "batch-2025-29"
    },
    submittedBy: {
      name: "Course Coordinator",
      role: "FACULTY"
    },
    report: {
      courseCode: "CS301",
      courseName: "Data Structures",
      targetScore: 2.50,
      actualScore: 2.70
    },
    history: []
  },

  approvalHistory: {
    approvalId: "approval-1",
    history: [
      {
        action: "SUBMITTED",
        actorName: "Course Coordinator",
        actorRole: "FACULTY",
        comments: null,
        timestamp: "2026-08-16T10:00:00Z"
      },
      {
        action: "APPROVED",
        actorName: "Programme Coordinator",
        actorRole: "PROGRAMME_COORDINATOR",
        comments: "Verified and aligned with departmental outcomes",
        timestamp: "2026-08-16T10:30:00Z"
      }
    ]
  },

  // ── REPORT FILTER API ─────────────────────────────────────────────────────
  reportsFilters: {
    role: "PROGRAMME_COORDINATOR",
    programmes: [
      {
        id: "prog-1",
        name: "Computer Engineering"
      }
    ],
    batches: [
      {
        id: "batch-2025-29",
        programmeId: "prog-1",
        name: "2025-29"
      },
      {
        id: "batch-2026-30",
        programmeId: "prog-1",
        name: "2026-30"
      }
    ],
    courseOfferings: [
      {
        id: "offering-1",
        courseId: "course-1",
        batchId: "batch-2025-29",
        courseCode: "CS301",
        courseName: "Data Structures",
        semester: 3
      }
    ]
  },

  // ── COURSE REPORT LIST ────────────────────────────────────────────────────
  courseAtrList: {
    filters: {
      batchId: "batch-2025-29"
    },
    reports: [
      {
        courseAtrId: "catr-1",
        courseOfferingId: "offering-1",
        course: {
          id: "course-1",
          code: "CS301",
          name: "Data Structures"
        },
        programme: {
          id: "prog-1",
          name: "Computer Engineering"
        },
        batch: {
          id: "batch-2025-29",
          name: "2025-29"
        },
        semester: 3,
        courseCoordinator: {
          id: "user-1",
          name: "Faculty Name"
        },
        status: "APPROVED"
      }
    ]
  },

  // ── PROGRAMME ATR LIST ────────────────────────────────────────────────────
  programmeAtrList: {
    reports: [
      {
        programmeAtrId: "patr-2029",
        programme: {
          id: "prog-1",
          code: "BE-COMP",
          name: "Computer Engineering"
        },
        batch: {
          id: "batch-2025-29",
          name: "2025-29"
        },
        programmeCoordinator: {
          name: "PC Name"
        },
        status: "APPROVED"
      }
    ]
  },

  // ── BATCH REPORT SUMMARY ──────────────────────────────────────────────────
  batchSummary: {
    batch: {
      id: "batch-2025-29",
      name: "2025-29"
    },
    programme: {
      id: "prog-1",
      name: "Computer Engineering"
    },
    students: {
      total: 120
    },
    courses: {
      total: 48
    },
    courseOfferings: {
      total: 48
    },
    courseAtr: {
      draft: 2,
      submitted: 4,
      approved: 42
    },
    programmeAtr: {
      status: "DRAFT"
    }
  },

  // ── SEMESTER ATTAINMENT API ───────────────────────────────────────────────
  semestersAttainment: {
    programmeId: "prog-1",
    batchId: "batch-2025-29",
    semesters: [
      {
        semester: 1,
        courseOfferings: 6,
        averageMapping: { PO1: 2.40, PO2: 2.10, PSO1: 2.00 },
        averageDirectAttainment: { PO1: 2.20, PO2: 2.00, PSO1: 2.10 },
        averageIndirectAttainment: null,
        overallAttainment: { PO1: 2.20, PO2: 2.00, PSO1: 2.10 }
      },
      {
        semester: 2,
        courseOfferings: 6,
        averageMapping: { PO1: 2.60, PO2: 2.40, PSO1: 2.20 },
        averageDirectAttainment: { PO1: 2.40, PO2: 2.30, PSO1: 2.10 },
        averageIndirectAttainment: null,
        overallAttainment: { PO1: 2.40, PO2: 2.30, PSO1: 2.10 }
      }
    ]
  },

  // ── ATTAINMENT DATASET API ────────────────────────────────────────────────
  attainmentDataset: {
    programmeId: "prog-1",
    batchId: "batch-2025-29",
    averageMapping: {
      columns: ["PO1", "PO2", "PO3", "PSO1"],
      rows: [
        {
          semester: 1,
          PO1: 2.40,
          PO2: 2.10,
          PO3: 2.30,
          PSO1: 2.00
        }
      ]
    },
    averageDirectAttainment: {
      columns: ["PO1", "PO2", "PO3", "PSO1"],
      rows: [
        {
          semester: 1,
          PO1: 2.20,
          PO2: 2.00,
          PO3: 2.30,
          PSO1: 2.10
        }
      ]
    },
    averageIndirectAttainment: {
      PO1: 2.40,
      PO2: 2.20,
      PSO1: 2.10
    },
    overallAttainment: {
      PO1: 2.32,
      PO2: 2.04,
      PSO1: 2.10
    }
  },

  // ── ATTAINMENT MAIN REPORT ────────────────────────────────────────────────
  attainmentMainReport: {
    programme: {
      id: "prog-1",
      code: "BE-COMP",
      name: "Computer Engineering"
    },
    batch: {
      id: "batch-2025-29",
      name: "2025-29"
    },
    sections: {
      averageMapping: {
        title: "Average Mapping",
        rows: [
          { semester: 1, PO1: 2.40, PO2: 2.10, PO3: 2.30, PSO1: 2.00 }
        ]
      },
      averageDirectAttainment: {
        title: "Average Attainment (Direct)",
        rows: [
          { semester: 1, PO1: 2.20, PO2: 2.00, PO3: 2.30, PSO1: 2.10 }
        ]
      },
      averageIndirectAttainment: {
        title: "Average Attainment (Indirect)",
        rows: [
          { PO1: 2.40, PO2: 2.20, PSO1: 2.10 }
        ]
      },
      overallAttainment: {
        title: "Overall Attainment",
        rows: [
          {
            outcome: "PO1",
            target: 2.50,
            direct: 2.30,
            indirect: 2.40,
            overall: 2.32,
            percentage: 92.80,
            observation: "Target Not Achieved"
          }
        ]
      }
    }
  },

  // ── BATCH COMPARISON API ──────────────────────────────────────────────────
  batchComparison: {
    programmeId: "prog-1",
    batches: [
      {
        batchId: "batch-2024-28",
        batchName: "2024-28",
        programmeAtrStatus: "APPROVED",
        poAttainment: {
          PO1: 2.30,
          PO2: 2.40
        },
        psoAttainment: {
          PSO1: 2.10
        }
      },
      {
        batchId: "batch-2025-29",
        batchName: "2025-29",
        programmeAtrStatus: "APPROVED",
        poAttainment: {
          PO1: 2.50,
          PO2: 2.45
        }
      }
    ]
  },

  // ── REPORT EXPORT DATA ────────────────────────────────────────────────────
  programmeAtrExportData: {
    header: {
      programmeName: "Bachelor of Engineering Computer Engineering",
      programmeCode: "BE-COMP",
      batchName: "2025-29",
      departmentName: "Computer Engineering",
      schoolName: "School of Engineering"
    },
    poSection: [
      {
        code: "PO1",
        statement: "Engineering knowledge: Apply knowledge of mathematics and engineering fundamentals to solve complex engineering problems.",
        targetLevel: 2.50,
        attainmentLevel: 2.32,
        achievementPercentage: 92.80,
        observation: "92.80% Target Not Achieved",
        actions: [
          "Conduct tutorial sessions and practical laboratories in problem modeling.",
          "Incorporate online practice platforms for continuous assessment."
        ]
      }
    ],
    psoSection: [
      {
        code: "PSO1",
        statement: "Apply engineering principles and modern tools to develop software solutions and algorithmic systems.",
        targetLevel: 2.50,
        attainmentLevel: 2.10,
        achievementPercentage: 84.00,
        observation: "84.00% Target Not Achieved",
        actions: [
          "Conduct industry mentorship sessions and capstone project hackathons."
        ]
      }
    ],
    attainmentGraphs: {},
    batchComparison: {}
  },

  // ── COURSE ATR EXPORT ─────────────────────────────────────────────────────
  courseAtrExportData: {
    header: {
      courseCode: "CS301",
      courseName: "Data Structures",
      programmeName: "Computer Engineering",
      batchName: "2025-29",
      semester: 3
    },
    coSection: [
      {
        code: "CO1",
        statement: "Understand fundamental data structures and algorithmic complexity.",
        targetLevel: 2.50,
        attainmentLevel: 2.70,
        achievementPercentage: 108.00,
        observation: "108.00% Target Achieved",
        actions: [
          "Continue interactive laboratory problem solving."
        ]
      }
    ]
  },

  // ── 81.17 SETUP PROGRESS APIs ─────────────────────────────────────────────
  directorSetupProgress: {
    currentStep: 3,
    currentStepEnum: "PROGRAMME",
    completedSteps: ["school", "department"],
    pendingSteps: ["programme", "review"],
    overallStatus: "IN_PROGRESS"
  },

  hodSetupProgress: {
    currentStep: 2,
    currentStepEnum: "BATCH",
    completedSteps: ["coordinators"],
    pendingSteps: ["batch", "outcomes", "review"],
    overallStatus: "IN_PROGRESS"
  },

  programmeCoordinatorSetupProgress: {
    currentStep: 2,
    currentStepEnum: "TARGETS",
    completedSteps: ["courses"],
    pendingSteps: ["targets", "review"],
    overallStatus: "IN_PROGRESS"
  },

  // ── DASHBOARD APIs ────────────────────────────────────────────────────────
  directorDashboard: {
    school: {
      id: "school-1",
      code: "SOE",
      name: "School of Engineering",
      director: "Director Name",
      directorEmail: "director@example.com",
      estYear: "2010"
    },
    setupProgress: {
      currentStep: 3,
      completedSteps: ["school", "department"],
      pendingSteps: ["programme", "review"],
      overallStatus: "IN_PROGRESS"
    },
    statistics: {
      departments: 4,
      programmes: 10,
      activeBatches: 40
    }
  },

  hodDashboard: {
    department: {
      id: "dept-1",
      code: "COMP",
      name: "Computer Engineering",
      hod: "HOD Name",
      hodEmail: "hod@example.com"
    },
    setupProgress: {
      currentStep: 2,
      completedSteps: ["coordinators"],
      pendingSteps: ["batch", "outcomes", "review"],
      overallStatus: "IN_PROGRESS"
    },
    statistics: {
      programmes: 3,
      activeBatches: 12,
      courseOfferings: 150
    }
  },

  programmeCoordinatorDashboard: {
    programme: {
      id: "prog-1",
      code: "BE-COMP",
      name: "Computer Engineering"
    },
    setupProgress: {
      currentStep: 2,
      completedSteps: ["courses"],
      pendingSteps: ["targets", "review"],
      overallStatus: "IN_PROGRESS"
    },
    batches: [
      {
        id: "batch-2025-29",
        name: "2025-29",
        status: "ACTIVE"
      }
    ],
    statistics: {
      courses: 48,
      courseOfferings: 48,
      pendingCourseAtrApprovals: 5
    }
  },

  courseCoordinatorDashboard: {
    assignedCourseOfferings: [
      {
        id: "offering-1",
        courseId: "course-1",
        courseCode: "CS301",
        courseName: "Data Structures",
        batchId: "batch-2025-29",
        batchName: "2025-29",
        semester: 3,
        status: "ACTIVE"
      }
    ],
    pendingTasks: {
      marksUpload: 1,
      surveyUpload: 1,
      courseAtr: 1
    },
    statistics: {
      totalStudents: 120,
      cosCount: 6,
      attainmentStatus: "IN_PROGRESS"
    }
  }
};

/**
 * Standard ApiResponse builder helper conforming to master contract ApiResponse<T>
 */
export const wrapApiResponse = (data, message = "Success", success = true) => ({
  success,
  message,
  data,
});
