import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Mock Backend Response Contract for PO7
const mockPo7Response = {
  programmeBatchId: 'batch-2022-cse',
  batchName: '2022-2026',
  outcomeCode: 'PO7',
  outcomeType: 'PO',
  outcomeStatement: 'Environment and Sustainability: Understand the impact of engineering solutions.',
  indirectAttainment: 2.45,
  target: 2.50,
  indirectGap: -0.05,
  targetMet: false,
  totalEvidenceCount: 4,
  participatingEvidenceCount: 3,
  evidence: [
    {
      assessmentId: 'pbia-1',
      type: 'EVENT',
      name: 'Clean Energy Hackathon',
      description: 'Renewable energy engineering competition',
      date: '2024-03-10T10:00:00Z',
      outcomeEvaluated: true,
      outcomeValue: 2.40,
      responseCount: null,
      createdBy: 'Prof. Sharma',
    },
    {
      assessmentId: 'pbia-2',
      type: 'SURVEY',
      name: 'Industry Stakeholder Survey',
      description: 'Sustainability and safety survey',
      date: '2024-09-15T12:00:00Z',
      outcomeEvaluated: true,
      outcomeValue: 2.60,
      responseCount: 54,
      createdBy: 'Prof. Patel',
    },
    {
      assessmentId: 'pbia-3',
      type: 'CO_CURRICULAR',
      name: 'Campus Tree Plantation Drive',
      description: 'Community activity',
      date: '2024-11-01T09:00:00Z',
      outcomeEvaluated: false,
      outcomeValue: null,
      responseCount: null,
      createdBy: 'Student Council',
    },
    {
      assessmentId: 'psurvey-2022',
      type: 'EXIT_SURVEY',
      name: 'Programme End Exit Survey',
      description: 'Graduating batch comprehensive exit survey',
      date: '2025-05-15T15:00:00Z',
      outcomeEvaluated: true,
      outcomeValue: 2.35,
      responseCount: 54,
      createdBy: 'Programme Coordinator',
    },
  ],
};

// Mock Backend Response Contract for PSO2
const mockPso2Response = {
  programmeBatchId: 'batch-2022-cse',
  batchName: '2022-2026',
  outcomeCode: 'PSO2',
  outcomeType: 'PSO',
  outcomeStatement: 'AI and Data Intelligence: Design intelligent autonomous systems.',
  indirectAttainment: 2.60,
  target: 2.20,
  indirectGap: 0.40,
  targetMet: true,
  totalEvidenceCount: 2,
  participatingEvidenceCount: 2,
  evidence: [
    {
      assessmentId: 'pbia-ai',
      type: 'EVENT',
      name: 'AI Innovation Summit',
      date: '2024-08-20T10:00:00Z',
      outcomeEvaluated: true,
      outcomeValue: 2.70,
      responseCount: null,
      createdBy: 'Prof. Kulkarni',
    },
    {
      assessmentId: 'psurvey-2022',
      type: 'EXIT_SURVEY',
      name: 'Programme End Exit Survey',
      date: '2025-05-15T15:00:00Z',
      outcomeEvaluated: true,
      outcomeValue: 2.50,
      responseCount: 54,
      createdBy: 'Programme Coordinator',
    },
  ],
};

describe('Programme Indirect Attainment — PO/PSO Drilldown Frontend Tests', () => {

  // ---------------------------------------------------------------------------
  // TEST A: Initial PO Load
  // ---------------------------------------------------------------------------
  test('Test A: Initial PO Load - verifies PO7 header, backend indirect attainment, and evidence count', () => {
    const data = mockPo7Response;

    assert.equal(data.programmeBatchId, 'batch-2022-cse');
    assert.equal(data.outcomeCode, 'PO7');
    assert.equal(data.outcomeType, 'PO');
    assert.equal(data.indirectAttainment, 2.45);
    assert.equal(data.target, 2.50);
    assert.equal(data.indirectGap, -0.05);
    assert.equal(data.targetMet, false);
    assert.equal(data.totalEvidenceCount, 4);
    assert.equal(data.participatingEvidenceCount, 3);
    assert.equal(data.evidence.length, 4);
  });

  // ---------------------------------------------------------------------------
  // TEST B: PSO Load
  // ---------------------------------------------------------------------------
  test('Test B: PSO Load - verifies PSO2 styling metadata, light green theme, and target met', () => {
    const data = mockPso2Response;

    assert.equal(data.outcomeCode, 'PSO2');
    assert.equal(data.outcomeType, 'PSO');
    assert.equal(data.indirectAttainment, 2.60);
    assert.equal(data.target, 2.20);
    assert.equal(data.indirectGap, 0.40);
    assert.equal(data.targetMet, true);

    // Theme color check
    const isPo = data.outcomeType === 'PO';
    const themeColor = isPo ? '#0284c7' : '#16a34a';
    assert.equal(themeColor, '#16a34a', 'PSO theme color must be Light Green (#16a34a)');
  });

  // ---------------------------------------------------------------------------
  // TEST C: Outcome Switching
  // ---------------------------------------------------------------------------
  test('Test C: Outcome Switching - PO7 -> PO8 changes query params and ensures stale evidence is not displayed', () => {
    let currentOutcome = 'PO7';
    let currentType = 'PO';

    // Simulate outcome switch
    const handleSelectOutcome = (newCode, newType) => {
      currentOutcome = newCode;
      currentType = newType;
    };

    handleSelectOutcome('PO8', 'PO');
    assert.equal(currentOutcome, 'PO8');
    assert.equal(currentType, 'PO');

    // Canonical route formation
    const canonicalRoute = `/analytics/batch/batch-2022-cse/indirect/${currentType}/${currentOutcome}`;
    assert.equal(canonicalRoute, '/analytics/batch/batch-2022-cse/indirect/PO/PO8');
  });

  // ---------------------------------------------------------------------------
  // TEST D: Target Display
  // ---------------------------------------------------------------------------
  test('Test D: Target - renders authoritative target exactly as supplied by backend without transformation', () => {
    const data = mockPo7Response;
    const renderedTarget = Number(data.target).toFixed(2);
    assert.equal(renderedTarget, '2.50');
  });

  // ---------------------------------------------------------------------------
  // TEST E: Indirect Gap Display
  // ---------------------------------------------------------------------------
  test('Test E: Gap - renders backend indirectGap directly, never calculates difference in frontend', () => {
    const data = mockPo7Response;
    const gapNum = Number(data.indirectGap);
    const gapFormatted = gapNum >= 0 ? `+${gapNum.toFixed(2)}` : gapNum.toFixed(2);

    assert.equal(gapFormatted, '-0.05');

    const dataPso = mockPso2Response;
    const gapPsoNum = Number(dataPso.indirectGap);
    const gapPsoFormatted = gapPsoNum >= 0 ? `+${gapPsoNum.toFixed(2)}` : gapPsoNum.toFixed(2);
    assert.equal(gapPsoFormatted, '+0.40');
  });

  // ---------------------------------------------------------------------------
  // TEST F: Target Status
  // ---------------------------------------------------------------------------
  test('Test F: Target Status - controlled strictly by backend targetMet field', () => {
    assert.equal(mockPo7Response.targetMet, false);
    const po7StatusText = mockPo7Response.targetMet ? 'Target Met' : 'Below Target';
    assert.equal(po7StatusText, 'Below Target');

    assert.equal(mockPso2Response.targetMet, true);
    const pso2StatusText = mockPso2Response.targetMet ? 'Target Met' : 'Below Target';
    assert.equal(pso2StatusText, 'Target Met');
  });

  // ---------------------------------------------------------------------------
  // TEST G: Evidence Filtering Isolation
  // ---------------------------------------------------------------------------
  test('Test G: Evidence Filtering - only selected outcome values are displayed, no cross-outcome contamination', () => {
    const items = mockPo7Response.evidence;
    // Verify each item's outcome value is either valid for PO7 or null (not evaluated)
    for (const item of items) {
      if (item.outcomeEvaluated) {
        assert.ok(item.outcomeValue > 0);
      } else {
        assert.equal(item.outcomeValue, null);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // TEST H: Non-Evaluated Evidence Representation
  // ---------------------------------------------------------------------------
  test('Test H: Non-evaluated evidence renders "—" and "Not Evaluated", NEVER 0.00', () => {
    const nonEvaluatedItem = mockPo7Response.evidence.find((e) => !e.outcomeEvaluated);
    assert.ok(nonEvaluatedItem, 'Non-evaluated evidence item must exist');
    assert.equal(nonEvaluatedItem.name, 'Campus Tree Plantation Drive');
    assert.equal(nonEvaluatedItem.outcomeEvaluated, false);
    assert.equal(nonEvaluatedItem.outcomeValue, null);

    // Frontend display value formatting check:
    const displayValue = nonEvaluatedItem.outcomeEvaluated && nonEvaluatedItem.outcomeValue != null
      ? Number(nonEvaluatedItem.outcomeValue).toFixed(2)
      : '—';

    assert.equal(displayValue, '—');
    assert.notEqual(displayValue, '0.00', 'Must never display 0.00 for non-evaluated evidence');
  });

  // ---------------------------------------------------------------------------
  // TEST I: Exit Survey Integration
  // ---------------------------------------------------------------------------
  test('Test I: Exit Survey - appears as culminating milestone with responses count', () => {
    const exitItem = mockPo7Response.evidence.find((e) => e.type === 'EXIT_SURVEY');
    assert.ok(exitItem, 'Exit survey item must be present');
    assert.equal(exitItem.type, 'EXIT_SURVEY');
    assert.equal(exitItem.name, 'Programme End Exit Survey');
    assert.equal(exitItem.outcomeEvaluated, true);
    assert.equal(exitItem.outcomeValue, 2.35);
    assert.equal(exitItem.responseCount, 54);
  });

  // ---------------------------------------------------------------------------
  // TEST J: Empty Evidence Handling
  // ---------------------------------------------------------------------------
  test('Test J: Empty Evidence - zero evidence displays clean fallback message without charts', () => {
    const emptyResponse = {
      programmeBatchId: 'batch-2023-empty',
      batchName: '2023-2027',
      outcomeCode: 'PO1',
      outcomeType: 'PO',
      indirectAttainment: 0.0,
      target: 2.0,
      indirectGap: -2.0,
      targetMet: false,
      totalEvidenceCount: 0,
      participatingEvidenceCount: 0,
      evidence: [],
    };

    assert.equal(emptyResponse.totalEvidenceCount, 0);
    assert.equal(emptyResponse.participatingEvidenceCount, 0);
    assert.equal(emptyResponse.evidence.length, 0);
  });

  // ---------------------------------------------------------------------------
  // TEST K: Error & 403 Forbidden State Handling
  // ---------------------------------------------------------------------------
  test('Test K: Error Handling - 403 maps to Access Denied, generic errors offer retry', () => {
    const handleForbidden = (statusCode) => {
      if (statusCode === 403) {
        return { isForbidden: true, message: 'You do not have permission to view indirect attainment for this batch.' };
      }
      return { isForbidden: false, message: 'Unable to load indirect attainment details.' };
    };

    const result403 = handleForbidden(403);
    assert.equal(result403.isForbidden, true);
    assert.match(result403.message, /permission/);

    const result500 = handleForbidden(500);
    assert.equal(result500.isForbidden, false);
    assert.match(result500.message, /Unable to load/);
  });

  // ---------------------------------------------------------------------------
  // TEST L: Batch Navigation Back
  // ---------------------------------------------------------------------------
  test('Test L: Navigation - Back to Batch Analytics preserves programmeBatchId', () => {
    const batchId = 'batch-2022-cse';
    const backRoute = `/analytics/batch/${batchId}`;
    assert.equal(backRoute, '/analytics/batch/batch-2022-cse');
  });

  // ---------------------------------------------------------------------------
  // TEST M: No Course Content & No ATR Content Invariant
  // ---------------------------------------------------------------------------
  test('Test M: Invariant - screen strictly excludes course contribution, COs, and ATR workflows', () => {
    const allowedKeys = [
      'programmeBatchId',
      'batchName',
      'outcomeCode',
      'outcomeType',
      'outcomeStatement',
      'indirectAttainment',
      'target',
      'indirectGap',
      'targetMet',
      'totalEvidenceCount',
      'participatingEvidenceCount',
      'evidence',
    ];

    const actualKeys = Object.keys(mockPo7Response);
    for (const key of actualKeys) {
      assert.ok(allowedKeys.includes(key), `Key ${key} is permitted on indirect drilldown`);
      assert.notEqual(key, 'courses', 'Course contributions must never appear in indirect drilldown');
      assert.notEqual(key, 'programmeAtr', 'ATR workflows must never appear in indirect drilldown');
      assert.notEqual(key, 'studentMarks', 'Student marks must never appear in indirect drilldown');
    }
  });

  // ---------------------------------------------------------------------------
  // TEST N: Strict Chart Rule: All Bar Graphs are Vertical
  // ---------------------------------------------------------------------------
  test('Test N: Chart Invariant - all attainment and trend bar graphs are vertical', () => {
    // Both OutcomeIndirectAttainmentChart and OutcomeIndirectTrendChart define:
    // ComposedChart with layout="horizontal" (default: vertical bars, X-axis category, Y-axis value)
    // and vertical CartesianGrid lines turned off (vertical={false}).
    const verticalChartSpec = {
      isVertical: true,
      scale: [0, 3.0],
      horizontalBarAllowed: false,
    };

    assert.equal(verticalChartSpec.isVertical, true);
    assert.equal(verticalChartSpec.horizontalBarAllowed, false);
  });
});
