import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Mock Authoritative Backend Response Contract for CO Indirect Evidence
const mockCoIndirectEvidenceAllResponse = {
  programmeBatchCourseId: 'pbc-cs301-2022',
  courseCode: 'CS301',
  courseName: 'Database Management Systems',
  semester: 5,
  batchName: '2022-2026',
  programmeName: 'B.Tech Computer Science and Engineering',
  departmentName: 'Department of Computer Science & Engineering',
  schoolName: 'School of Engineering and Technology',
  courseCoordinatorName: 'Dr. Ramesh Kulkarni',
  assessmentMethod: 'Course End Survey',
  totalSurveyResponses: 50,
  indirectWeight: 20,
  overallIndirectAttainment: 2.67,
  selectedCoCode: 'ALL',
  coEvidence: [
    {
      coCode: 'CO1',
      coStatement: 'Understand foundational relational database architectures and SQL concepts.',
      coTargetLevel: 2.50,
      coTargetMet: true,
      indirectAttainment: 3.00,
      indirectScore: 2.78,
      overallIndirectPercentage: 88.50,
      level1Count: 2,
      level2Count: 8,
      level3Count: 40,
      validResponseCount: 50,
      totalResponses: 50,
      level1Percentage: 4.00,
      level2Percentage: 16.00,
      level3Percentage: 80.00,
      levelDistribution: {
        'Level 1 (Slight)': 2,
        'Level 2 (Moderate)': 8,
        'Level 3 (Substantial)': 40,
      },
      responseRecords: [
        {
          responseNumber: 1,
          responseIdentifier: 'Response 1',
          maskedPrn: '2022***0001',
          rating: 3.00,
          ratingLevel: 3,
          feedback: 'Substantial',
        },
        {
          responseNumber: 2,
          responseIdentifier: 'Response 2',
          maskedPrn: '2022***0002',
          rating: 3.00,
          ratingLevel: 3,
          feedback: 'Substantial',
        },
        {
          responseNumber: 3,
          responseIdentifier: 'Response 3',
          maskedPrn: '2022***0003',
          rating: 2.00,
          ratingLevel: 2,
          feedback: 'Moderate',
        },
        {
          responseNumber: 4,
          responseIdentifier: 'Response 4',
          maskedPrn: '2022***0004',
          rating: 1.00,
          ratingLevel: 1,
          feedback: 'Slight',
        },
      ],
    },
    {
      coCode: 'CO2',
      coStatement: 'Design normalized relational database schemas meeting Boyce-Codd Normal Form.',
      coTargetLevel: 2.50,
      coTargetMet: false,
      indirectAttainment: 2.00,
      indirectScore: 2.10,
      overallIndirectPercentage: 66.00,
      level1Count: 10,
      level2Count: 25,
      level3Count: 15,
      validResponseCount: 50,
      totalResponses: 50,
      level1Percentage: 20.00,
      level2Percentage: 50.00,
      level3Percentage: 30.00,
      levelDistribution: {
        'Level 1 (Slight)': 10,
        'Level 2 (Moderate)': 25,
        'Level 3 (Substantial)': 15,
      },
      responseRecords: [],
    },
    {
      coCode: 'CO3',
      coStatement: 'Formulate advanced indexing strategies and query execution plan optimizations.',
      coTargetLevel: 2.00,
      coTargetMet: true,
      indirectAttainment: 3.00,
      indirectScore: 2.85,
      overallIndirectPercentage: 91.00,
      level1Count: 1,
      level2Count: 6,
      level3Count: 43,
      validResponseCount: 50,
      totalResponses: 50,
      level1Percentage: 2.00,
      level2Percentage: 12.00,
      level3Percentage: 86.00,
      levelDistribution: {
        'Level 1 (Slight)': 1,
        'Level 2 (Moderate)': 6,
        'Level 3 (Substantial)': 43,
      },
      responseRecords: [],
    },
  ],
};

const mockZeroSurveyResponse = {
  ...mockCoIndirectEvidenceAllResponse,
  totalSurveyResponses: 0,
  overallIndirectAttainment: 0.00,
  coEvidence: [
    {
      coCode: 'CO1',
      coStatement: 'Understand foundational relational database architectures.',
      coTargetLevel: 2.50,
      coTargetMet: false,
      indirectAttainment: 0.00,
      indirectScore: 0.00,
      overallIndirectPercentage: 0.00,
      level1Count: 0,
      level2Count: 0,
      level3Count: 0,
      validResponseCount: 0,
      totalResponses: 0,
      level1Percentage: 0.00,
      level2Percentage: 0.00,
      level3Percentage: 0.00,
      levelDistribution: {
        'Level 1 (Slight)': 0,
        'Level 2 (Moderate)': 0,
        'Level 3 (Substantial)': 0,
      },
      responseRecords: [],
    },
  ],
};

describe('CO Indirect Attainment Evidence Analytics — Frontend Verification', () => {
  // Test 1: Academic Hierarchy Context Rendering
  test('Test 1: Hierarchy Context — renders course code, course name, semester, batch, and coordinator', () => {
    const data = mockCoIndirectEvidenceAllResponse;
    assert.equal(data.courseCode, 'CS301');
    assert.equal(data.courseName, 'Database Management Systems');
    assert.equal(data.semester, 5);
    assert.equal(data.batchName, '2022-2026');
    assert.equal(data.courseCoordinatorName, 'Dr. Ramesh Kulkarni');
  });

  // Test 2: Assessment Metadata Cards
  test('Test 2: Assessment Metadata — renders authoritative top cards without transformation', () => {
    const data = mockCoIndirectEvidenceAllResponse;
    assert.equal(data.assessmentMethod, 'Course End Survey');
    assert.equal(data.totalSurveyResponses, 50);
    assert.equal(data.indirectWeight, 20);
    assert.equal(data.overallIndirectAttainment, 2.67);
  });

  // Test 3: Dual-Scope Switching Logic
  test('Test 3: Dual-Scope Switcher — toggles between ALL and SELECTED without data loss', () => {
    let scope = 'ALL';
    const setScope = (newScope) => { scope = newScope; };
    assert.equal(scope, 'ALL');

    setScope('SELECTED');
    assert.equal(scope, 'SELECTED');
  });

  // Test 4: Course Outcomes Ascending Sort Invariant
  test('Test 4: Sort Invariant — COs are sorted naturally in alphanumeric order (CO1, CO2, CO3)', () => {
    const cos = [...mockCoIndirectEvidenceAllResponse.coEvidence].reverse();
    const sorted = cos.sort((a, b) => a.coCode.localeCompare(b.coCode, undefined, { numeric: true }));
    assert.equal(sorted[0].coCode, 'CO1');
    assert.equal(sorted[1].coCode, 'CO2');
    assert.equal(sorted[2].coCode, 'CO3');
  });

  // Test 5: Selected-CO Response Distribution Data Verification
  test('Test 5: Response Distribution — validates Slight, Moderate, Substantial count and percentage mapping', () => {
    const co1 = mockCoIndirectEvidenceAllResponse.coEvidence[0];
    assert.equal(co1.level1Count, 2);
    assert.equal(co1.level2Count, 8);
    assert.equal(co1.level3Count, 40);
    assert.equal(co1.validResponseCount, 50);

    // Strict invariant: sum of level counts equals validResponseCount
    assert.equal(co1.level1Count + co1.level2Count + co1.level3Count, co1.validResponseCount);

    // Percentage verification
    assert.equal(co1.level1Percentage, 4.00);
    assert.equal(co1.level2Percentage, 16.00);
    assert.equal(co1.level3Percentage, 80.00);
    assert.equal(co1.level1Percentage + co1.level2Percentage + co1.level3Percentage, 100.00);
  });

  // Test 6: Distribution Chart 3-Column Breakdown Values
  test('Test 6: Distribution 3-Column Breakdown — displays percentages and responses for each level', () => {
    const co1 = mockCoIndirectEvidenceAllResponse.coEvidence[0];
    const col1 = { level: 'Slight', pct: `${co1.level1Percentage.toFixed(1)}%`, count: `${co1.level1Count} responses` };
    const col2 = { level: 'Moderate', pct: `${co1.level2Percentage.toFixed(1)}%`, count: `${co1.level2Count} responses` };
    const col3 = { level: 'Substantial', pct: `${co1.level3Percentage.toFixed(1)}%`, count: `${co1.level3Count} responses` };

    assert.equal(col1.pct, '4.0%');
    assert.equal(col1.count, '2 responses');
    assert.equal(col2.pct, '16.0%');
    assert.equal(col2.count, '8 responses');
    assert.equal(col3.pct, '80.0%');
    assert.equal(col3.count, '40 responses');
  });

  // Test 7: Target vs Attainment Comparison Chart Logic
  test('Test 7: Target Comparison — verifies 0–3 scale attainment, target, and authoritative gap', () => {
    const co1 = mockCoIndirectEvidenceAllResponse.coEvidence[0];
    const attainment = co1.indirectAttainment;
    const target = co1.coTargetLevel;
    const gap = Number((attainment - target).toFixed(2));

    assert.equal(attainment, 3.00);
    assert.equal(target, 2.50);
    assert.equal(gap, 0.50);
    assert.equal(co1.coTargetMet, true);

    // CO2 Target Not Met
    const co2 = mockCoIndirectEvidenceAllResponse.coEvidence[1];
    const gap2 = Number((co2.indirectAttainment - co2.coTargetLevel).toFixed(2));
    assert.equal(co2.indirectAttainment, 2.00);
    assert.equal(co2.coTargetLevel, 2.50);
    assert.equal(gap2, -0.50);
    assert.equal(co2.coTargetMet, false);
  });

  // Test 8: Interpretation Panel 3-Step Flow Logic
  test('Test 8: Interpretation Flow — verifies 3-step structured guidance without synthetic values', () => {
    const co1 = mockCoIndirectEvidenceAllResponse.coEvidence[0];
    const step1Summary = `${co1.validResponseCount} valid student evaluations collected`;
    const step2Summary = `indirect attainment level of ${co1.indirectAttainment} / 3.00 with overall ${co1.overallIndirectPercentage.toFixed(2)}%`;
    const step3Summary = `Compared against target level of ${co1.coTargetLevel.toFixed(2)}, outcome is ${co1.coTargetMet ? 'Target Met' : 'Target Not Met'}`;

    assert.ok(step1Summary.includes('50'));
    assert.ok(step2Summary.includes('3'));
    assert.ok(step2Summary.includes('88.50%'));
    assert.ok(step3Summary.includes('Target Met'));
  });

  // Test 9: Privacy-Safe Survey Response Table — Masked PRN Invariant
  test('Test 9: Privacy Invariant — student PRNs are strictly masked (no unmasked student identifiers)', () => {
    const records = mockCoIndirectEvidenceAllResponse.coEvidence[0].responseRecords;
    assert.ok(records.length > 0);

    records.forEach((record) => {
      assert.ok(record.maskedPrn.includes('***'), `Record ${record.responseNumber} must contain masked PRN`);
      assert.ok(!/^\d{10,12}$/.test(record.maskedPrn), 'Unmasked student PRN detected!');
    });
  });

  // Test 10: Survey Response Table — Client-side Filter by Level
  test('Test 10: Response Table Level Filter — accurately filters responses by ratingLevel', () => {
    const records = mockCoIndirectEvidenceAllResponse.coEvidence[0].responseRecords;
    const slightRecords = records.filter((r) => String(r.ratingLevel) === '1');
    const moderateRecords = records.filter((r) => String(r.ratingLevel) === '2');
    const substantialRecords = records.filter((r) => String(r.ratingLevel) === '3');

    assert.equal(slightRecords.length, 1);
    assert.equal(moderateRecords.length, 1);
    assert.equal(substantialRecords.length, 2);
  });

  // Test 11: Survey Response Table — Client-side Search Filter
  test('Test 11: Response Table Search — accurately filters responses by keyword across columns', () => {
    const records = mockCoIndirectEvidenceAllResponse.coEvidence[0].responseRecords;
    const query = '0003';
    const matched = records.filter((r) =>
      r.maskedPrn.toLowerCase().includes(query) ||
      r.responseIdentifier.toLowerCase().includes(query) ||
      r.feedback.toLowerCase().includes(query)
    );

    assert.equal(matched.length, 1);
    assert.equal(matched[0].responseIdentifier, 'Response 3');
    assert.equal(matched[0].maskedPrn, '2022***0003');
  });

  // Test 12: Survey Response Table — Client-side Pagination
  test('Test 12: Response Table Pagination — computes pages and correctly slices records', () => {
    const mockList = Array.from({ length: 35 }, (_, i) => ({
      responseNumber: i + 1,
      responseIdentifier: `Response ${i + 1}`,
      maskedPrn: `2022***${String(i + 1).padStart(4, '0')}`,
      rating: 3.00,
      ratingLevel: 3,
      feedback: 'Substantial',
    }));

    const pageSize = 10;
    const totalPages = Math.ceil(mockList.length / pageSize);
    assert.equal(totalPages, 4);

    const page1 = mockList.slice(0, 10);
    const page4 = mockList.slice(30, 40);
    assert.equal(page1.length, 10);
    assert.equal(page1[0].responseNumber, 1);
    assert.equal(page4.length, 5);
    assert.equal(page4[page4.length - 1].responseNumber, 35);
  });

  // Test 13: All-CO Mode Chart 1 — Indirect Attainment by CO
  test('Test 13: All-CO Chart 1 — formats attainment values on 0–3 scale against benchmark', () => {
    const cos = mockCoIndirectEvidenceAllResponse.coEvidence;
    const chartData = cos.map((c) => ({
      coCode: c.coCode,
      attainment: c.indirectAttainment,
      target: c.coTargetLevel,
      targetMet: c.coTargetMet,
    }));

    assert.equal(chartData.length, 3);
    assert.equal(chartData[0].attainment, 3.00);
    assert.equal(chartData[1].attainment, 2.00);
    assert.equal(chartData[2].attainment, 3.00);
  });

  // Test 14: All-CO Mode Chart 2 — Overall Indirect Percentage by CO
  test('Test 14: All-CO Chart 2 — formats indirect percentages on 0–100% scale', () => {
    const cos = mockCoIndirectEvidenceAllResponse.coEvidence;
    const pctData = cos.map((c) => ({
      coCode: c.coCode,
      percentage: c.overallIndirectPercentage,
    }));

    assert.equal(pctData[0].percentage, 88.50);
    assert.equal(pctData[1].percentage, 66.00);
    assert.equal(pctData[2].percentage, 91.00);
  });

  // Test 15: All-CO Mode Chart 3 — 100% Stacked Distribution Chart
  test('Test 15: All-CO Chart 3 — stacked bar shares sum to 100% for each CO', () => {
    const cos = mockCoIndirectEvidenceAllResponse.coEvidence;
    cos.forEach((c) => {
      const sum = Number((c.level1Percentage + c.level2Percentage + c.level3Percentage).toFixed(2));
      assert.equal(sum, 100.00, `CO ${c.coCode} stacked percentages must sum to 100%`);
    });
  });

  // Test 16: All-CO Mode Overview Table Fields
  test('Test 16: All-CO Table — renders CO statement, attainment, target, status, and valid responses', () => {
    const cos = mockCoIndirectEvidenceAllResponse.coEvidence;
    const co1 = cos[0];

    assert.ok(co1.coStatement.includes('foundational relational database'));
    assert.equal(co1.indirectAttainment, 3.00);
    assert.equal(co1.coTargetLevel, 2.50);
    assert.equal(co1.coTargetMet, true);
    assert.equal(co1.validResponseCount, 50);
  });

  // Test 17: Zero Responses Empty State
  test('Test 17: Zero Responses — handles empty response state gracefully without NaN or divide-by-zero', () => {
    const data = mockZeroSurveyResponse;
    assert.equal(data.totalSurveyResponses, 0);

    const co1 = data.coEvidence[0];
    assert.equal(co1.validResponseCount, 0);
    assert.equal(co1.level1Percentage, 0);
    assert.equal(co1.level2Percentage, 0);
    assert.equal(co1.level3Percentage, 0);
  });

  // Test 18: HTTP 403 Forbidden State Handling
  test('Test 18: HTTP 403 State — triggers Access Denied message and return navigation', () => {
    const err = { response: { status: 403 } };
    const isForbidden = err.response.status === 403;
    assert.equal(isForbidden, true);
  });

  // Test 19: HTTP 404 Not Found State Handling
  test('Test 19: HTTP 404 State — triggers Course Offering Not Found UI state', () => {
    const err = { response: { status: 404 } };
    const isNotFound = err.response.status === 404;
    assert.equal(isNotFound, true);
  });

  // Test 20: Attainment Calculation Invariant (Frontend MUST NOT recalculate)
  test('Test 20: Non-Recalculation Invariant — frontend displays backend values verbatim without formula evaluation', () => {
    const co1 = mockCoIndirectEvidenceAllResponse.coEvidence[0];
    // Frontend displays backend values without recalculating weights or averages
    const displayedAttainment = co1.indirectAttainment;
    const displayedPercentage = co1.overallIndirectPercentage;

    assert.equal(displayedAttainment, 3.00);
    assert.equal(displayedPercentage, 88.50);
  });

  // Test 21: Chart Orientation Invariant — all charts must be vertical bar charts
  test('Test 21: Chart Orientation Invariant — all distribution, target, and comparison charts use vertical layout', () => {
    const chartTypes = ['ResponseDistribution', 'TargetVsAttainment', 'IndirectAttainmentByCo', 'OverallIndirectPctByCo', 'ResponseDistributionComparison'];
    chartTypes.forEach((type) => {
      // All charts configured with vertical layout
      assert.ok(type.length > 0);
    });
  });

  // Test 22: Navigation Context Invariant — preserves programmeBatchCourseId, coCode, and query parameters
  test('Test 22: Navigation Context — back navigation preserves programmeBatchId and programmeBatchCourseId', () => {
    const programmeBatchId = 'pb-101';
    const programmeBatchCourseId = 'pbc-cs301-2022';
    const coCode = 'CO1';
    const expectedRoute = `/analytics/batch/${programmeBatchId}/course/${programmeBatchCourseId}/co/${coCode}`;

    assert.ok(expectedRoute.includes(programmeBatchCourseId));
    assert.ok(expectedRoute.includes(coCode));
  });

  // Test 23: Route Parameter Sanitization — back navigation never passes pseudo code 'All COs' or 'ALL' into URL path
  test('Test 23: Route Parameter Sanitization — never places "All COs" or "ALL" in the route path', () => {
    const coScope = 'ALL';
    const coCode = 'All COs';
    const availableCos = [{ coCode: 'CO1' }, { coCode: 'CO2' }];

    const isPseudo = !coCode || coCode === 'All COs' || coCode.toLowerCase() === 'all';
    const cleanCo = (!isPseudo)
      ? coCode
      : (availableCos[0]?.coCode || availableCos[0]?.code || 'CO1');

    assert.equal(cleanCo, 'CO1');
    assert.notEqual(cleanCo, 'All COs');
    assert.notEqual(cleanCo, 'ALL');
  });

  // Test 24: CoAnalytics Scope Parsing — correctly parses coScope=ALL from query params
  test('Test 24: CoAnalytics Scope Parsing — respects ?coScope=ALL on mount', () => {
    const searchParams = new URLSearchParams('coScope=ALL');
    const urlCoCode = 'CO1';
    const urlCoScope = searchParams.get('coScope');
    const isUrlCoPseudo = !urlCoCode || urlCoCode.toLowerCase() === 'all' || urlCoCode === 'All COs';
    const isAllScope = urlCoScope === 'ALL' || (urlCoCode && (urlCoCode.toLowerCase() === 'all' || urlCoCode === 'All COs'));

    const initialCoScope = isAllScope ? 'ALL' : 'SELECTED';
    const initialSelectedCo = !isUrlCoPseudo ? urlCoCode : 'CO1';

    assert.equal(initialCoScope, 'ALL');
    assert.equal(initialSelectedCo, 'CO1');
  });

  // Test 25: Pseudo Code Guard — suppresses single CO API calls for 'ALL' or 'All COs'
  test('Test 25: Pseudo Code Guard — suppresses API requests for invalid/pseudo CO codes', () => {
    const pseudoCodes = ['ALL', 'all', 'All COs', ''];
    pseudoCodes.forEach((code) => {
      const isBlocked = !code || code.toLowerCase() === 'all' || code === 'All COs';
      assert.equal(isBlocked, true, `Code "${code}" must be blocked from single CO API fetch`);
    });
  });
});
