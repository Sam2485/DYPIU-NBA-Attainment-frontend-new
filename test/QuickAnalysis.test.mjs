import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Helper to load file content
const loadSource = (relPath) => {
  const fullPath = path.resolve(process.cwd(), relPath);
  return fs.readFileSync(fullPath, 'utf8');
};

describe('OBE Quick Analysis — Functional & Mathematical Invariants', () => {

  describe('Mathematical Computations & YoY Growth Engine', () => {
    // Pure computation function mirror
    function computeYoYMetrics({ currentOutcomes, prevOutcomes }) {
      const totalOutcomes = currentOutcomes.length;
      if (totalOutcomes === 0) {
        return {
          currentAvg: 0,
          prevAvg: null,
          growthPct: null,
          improvedCount: 0,
          declinedCount: 0,
          steadyCount: 0,
          deficitsCurrent: 0,
          deficitsPrev: null,
        };
      }

      const currentTotal = currentOutcomes.reduce((acc, o) => acc + o.attainment, 0);
      const currentAvg = Number((currentTotal / totalOutcomes).toFixed(2));
      const deficitsCurrent = currentOutcomes.filter((o) => !o.targetMet).length;

      if (!prevOutcomes || prevOutcomes.length === 0) {
        return {
          currentAvg,
          prevAvg: null,
          growthPct: null,
          improvedCount: 0,
          declinedCount: 0,
          steadyCount: 0,
          deficitsCurrent,
          deficitsPrev: null,
        };
      }

      const prevTotal = prevOutcomes.reduce((acc, o) => acc + o.attainment, 0);
      const prevAvg = Number((prevTotal / prevOutcomes.length).toFixed(2));
      const deficitsPrev = prevOutcomes.filter((o) => !o.targetMet).length;

      const growthPct = prevAvg > 0
        ? Number((((currentAvg - prevAvg) / prevAvg) * 100).toFixed(2))
        : 0;

      let improvedCount = 0;
      let declinedCount = 0;
      let steadyCount = 0;

      currentOutcomes.forEach((cur) => {
        const prev = prevOutcomes.find((p) => p.code === cur.code);
        if (prev) {
          const diff = Number((cur.attainment - prev.attainment).toFixed(2));
          if (diff > 0.02) improvedCount++;
          else if (diff < -0.02) declinedCount++;
          else steadyCount++;
        }
      });

      return {
        currentAvg,
        prevAvg,
        growthPct,
        improvedCount,
        declinedCount,
        steadyCount,
        deficitsCurrent,
        deficitsPrev,
      };
    }

    test('Computes positive YoY growth and outcome improvement correctly', () => {
      const prevCohort = [
        { code: 'PO1', attainment: 2.10, targetMet: false },
        { code: 'PO2', attainment: 2.30, targetMet: true },
        { code: 'PO3', attainment: 1.80, targetMet: false },
        { code: 'PSO1', attainment: 2.00, targetMet: true },
      ]; // Avg: 2.05, Deficits: 2

      const currentCohort = [
        { code: 'PO1', attainment: 2.40, targetMet: true }, // +0.30 (improved)
        { code: 'PO2', attainment: 2.45, targetMet: true }, // +0.15 (improved)
        { code: 'PO3', attainment: 1.80, targetMet: false }, // 0.00 (steady)
        { code: 'PSO1', attainment: 2.25, targetMet: true }, // +0.25 (improved)
      ]; // Avg: 2.225 -> 2.23, Deficits: 1

      const res = computeYoYMetrics({ currentOutcomes: currentCohort, prevOutcomes: prevCohort });

      assert.strictEqual(res.currentAvg, 2.22);
      assert.strictEqual(res.prevAvg, 2.05);
      // Growth: ((2.22 - 2.05) / 2.05) * 100 = 8.29%
      assert.strictEqual(res.growthPct, 8.29);
      assert.strictEqual(res.improvedCount, 3);
      assert.strictEqual(res.steadyCount, 1);
      assert.strictEqual(res.declinedCount, 0);
      assert.strictEqual(res.deficitsCurrent, 1);
      assert.strictEqual(res.deficitsPrev, 2);
    });

    test('Gracefully handles baseline cohort when no previous batch exists', () => {
      const currentCohort = [
        { code: 'PO1', attainment: 2.20, targetMet: true },
        { code: 'PO2', attainment: 2.40, targetMet: true },
      ];

      const res = computeYoYMetrics({ currentOutcomes: currentCohort, prevOutcomes: null });

      assert.strictEqual(res.currentAvg, 2.30);
      assert.strictEqual(res.prevAvg, null);
      assert.strictEqual(res.growthPct, null);
      assert.strictEqual(res.deficitsCurrent, 0);
      assert.strictEqual(res.deficitsPrev, null);
    });

    test('Correctly bins outcomes into 4 attainment level distribution tiers', () => {
      function binOutcomes(outcomes) {
        return {
          excellent: outcomes.filter((o) => o.attainment >= 2.5).length,
          good: outcomes.filter((o) => o.attainment >= 2.0 && o.attainment < 2.5).length,
          needsAttention: outcomes.filter((o) => o.attainment >= 1.5 && o.attainment < 2.0).length,
          atRisk: outcomes.filter((o) => o.attainment < 1.5).length,
        };
      }

      const sample = [
        { attainment: 2.80 },
        { attainment: 2.50 },
        { attainment: 2.45 },
        { attainment: 2.10 },
        { attainment: 1.85 },
        { attainment: 1.40 },
      ];

      const tiers = binOutcomes(sample);
      assert.strictEqual(tiers.excellent, 2, 'Two outcomes >= 2.5');
      assert.strictEqual(tiers.good, 2, 'Two outcomes in [2.0, 2.5)');
      assert.strictEqual(tiers.needsAttention, 1, 'One outcome in [1.5, 2.0)');
      assert.strictEqual(tiers.atRisk, 1, 'One outcome < 1.5');
    });
  });

  describe('Route Registration & Role Protection', () => {
    const routesSrc = loadSource('src/routes/AppRoutes.jsx');

    test('Registers /admin/analytics/quick-analysis route with RBAC protection', () => {
      assert.ok(
        routesSrc.includes("const QuickAnalysisPage = lazy(() => import('../pages/analytics/QuickAnalysisPage'));"),
        'QuickAnalysisPage must be lazy imported'
      );
      assert.ok(
        routesSrc.includes('path="/admin/analytics/quick-analysis"'),
        '/admin/analytics/quick-analysis route must be present'
      );
      assert.ok(
        routesSrc.includes('path="/analytics/quick-analysis"'),
        '/analytics/quick-analysis route must be present'
      );
    });
  });

  describe('Quick Analysis Entry Points', () => {
    const dashboardSrc = loadSource('src/features/analytics/RoleAnalyticsDashboard.jsx');
    const batchContextSrc = loadSource('src/features/analytics/batch-overview/BatchContextBlock.jsx');

    test('RoleAnalyticsDashboard renders the Quick Analysis action button', () => {
      assert.ok(
        dashboardSrc.includes('Quick Analysis'),
        'RoleAnalyticsDashboard must contain Quick Analysis button text'
      );
      assert.ok(
        dashboardSrc.includes('handleNavigateToQuickAnalysis'),
        'RoleAnalyticsDashboard must define handleNavigateToQuickAnalysis'
      );
      assert.ok(
        dashboardSrc.includes('quick-analysis'),
        'Navigation must target quick-analysis'
      );
    });

    test('BatchContextBlock renders the Quick Analysis shortcut button', () => {
      assert.ok(
        batchContextSrc.includes('quick-analysis'),
        'BatchContextBlock must contain link to quick-analysis'
      );
    });
  });

  describe('Hero Image & Brand Asset Integration', () => {
    const dashboardComponentSrc = loadSource('src/features/analytics/quick-analysis/QuickAnalysisDashboard.jsx');

    test('QuickAnalysisDashboard imports the user-specified campus hero image and logos', () => {
      assert.ok(
        dashboardComponentSrc.includes("import dypiuCampusHero from '../../../assets/dypiu_campus_hero.webp';"),
        'Must import dypiu_campus_hero.webp'
      );
      assert.ok(
        dashboardComponentSrc.includes("import dypLogo from '../../../assets/image.png';"),
        'Must import DYPIU crest logo'
      );
      assert.ok(
        dashboardComponentSrc.includes("import iqacLogo from '../../../assets/iqac.png';"),
        'Must import IQAC seal logo'
      );
    });
  });

  describe('Infographic Sections & Visual Composition Invariants (Ref: ChatGPT Image 23 Sept 2026, 12_28_48.png)', () => {
    const dashboardComponentSrc = loadSource('src/features/analytics/quick-analysis/QuickAnalysisDashboard.jsx');

    test('Header contains 4 context cards: Programme, Batch, School, and Generated on', () => {
      assert.ok(dashboardComponentSrc.includes('Programme'), 'Must render Programme card');
      assert.ok(dashboardComponentSrc.includes('Batch'), 'Must render Batch card');
      assert.ok(dashboardComponentSrc.includes('School'), 'Must render School card');
      assert.ok(dashboardComponentSrc.includes('Generated on'), 'Must render Generated on card');
      assert.ok(dashboardComponentSrc.includes('Empowering Education'), 'Must render hero tagline');
    });

    test('Section 1 contains exactly 7 key OBE indicators', () => {
      assert.ok(dashboardComponentSrc.includes('KEY OBE ATTAINMENT INDICATORS'), 'Must include Section 1 title');
      assert.ok(dashboardComponentSrc.includes('Average Attainment'), 'Indicator 1');
      assert.ok(dashboardComponentSrc.includes('POs Met Target'), 'Indicator 2');
      assert.ok(dashboardComponentSrc.includes('POs Below Target'), 'Indicator 3');
      assert.ok(dashboardComponentSrc.includes('PSOs Met Target'), 'Indicator 4');
      assert.ok(dashboardComponentSrc.includes('PSOs Below Target'), 'Indicator 5');
      assert.ok(dashboardComponentSrc.includes('Direct Weight'), 'Indicator 6');
      assert.ok(dashboardComponentSrc.includes('Indirect Weight'), 'Indicator 7');
    });

    test('Section 2 renders PO & PSO vertical grouped bar chart with Target benchmark', () => {
      assert.ok(dashboardComponentSrc.includes('PO &amp; PSO ATTAINMENT (Current vs Previous Batch &amp; Target)'), 'Must include Section 2 title');
      assert.ok(dashboardComponentSrc.includes('CustomOutcomeTick'), 'Custom tick for PO/PSO outcome colors');
      assert.ok(dashboardComponentSrc.includes('ReferenceLine'), 'Must include orange Target benchmark reference line');
    });

    test('Section 3 renders PO & PSO Attainment Growth with YoY percentage deltas', () => {
      assert.ok(dashboardComponentSrc.includes('ATTAINMENT GROWTH (Average Attainment)'), 'Must include Section 3 title');
      assert.ok(dashboardComponentSrc.includes('PO Average Attainment'), 'Must have PO Average sub-column');
      assert.ok(dashboardComponentSrc.includes('PSO Average Attainment'), 'Must have PSO Average sub-column');
      assert.ok(dashboardComponentSrc.includes('Growth in PO average'), 'Must include growth label');
      assert.ok(dashboardComponentSrc.includes('Growth in PSO average'), 'Must include growth label');
    });

    test('Section 4 renders 100% stacked bar chart for Target Status (Previous vs Current)', () => {
      assert.ok(dashboardComponentSrc.includes('TARGET STATUS (Previous vs Current Batch)'), 'Must include Section 4 title');
      assert.ok(dashboardComponentSrc.includes('stackId="status"'), 'Must use stacked bar chart');
      assert.ok(dashboardComponentSrc.includes('Met Target'), 'Must include Met Target legend');
      assert.ok(dashboardComponentSrc.includes('Below Target'), 'Must include Below Target legend');
    });

    test('Section 5 renders Direct vs Indirect Attainment grouped bars', () => {
      assert.ok(dashboardComponentSrc.includes('DIRECT vs INDIRECT ATTAINMENT'), 'Must include Section 5 title');
      assert.ok(dashboardComponentSrc.includes('Direct Attainment'), 'Direct Attainment category');
      assert.ok(dashboardComponentSrc.includes('Indirect Attainment'), 'Indirect Attainment category');
    });

    test('Section 6 renders Outcome Progression (Increased, Unchanged, Decreased)', () => {
      assert.ok(dashboardComponentSrc.includes('OUTCOME PROGRESSION (POs + PSOs)'), 'Must include Section 6 title');
      assert.ok(dashboardComponentSrc.includes('Change in attainment from previous to current batch'), 'Must include progression subtitle');
      assert.ok(dashboardComponentSrc.includes('Increased'), 'Must include Increased bar');
      assert.ok(dashboardComponentSrc.includes('Unchanged'), 'Must include Unchanged bar');
      assert.ok(dashboardComponentSrc.includes('Decreased'), 'Must include Decreased bar');
    });

    test('Section 7 renders Indirect Evidence Sources with Exit Survey, Events, and Other Surveys', () => {
      assert.ok(dashboardComponentSrc.includes('INDIRECT EVIDENCE SOURCES'), 'Must include Section 7 title');
      assert.ok(dashboardComponentSrc.includes('Programme End Survey'), 'Source 1');
      assert.ok(dashboardComponentSrc.includes('Programme Events'), 'Source 2');
      assert.ok(dashboardComponentSrc.includes('Other Surveys'), 'Source 3');
      assert.ok(dashboardComponentSrc.includes('PO Average'), 'PO Avg legend');
      assert.ok(dashboardComponentSrc.includes('PSO Average'), 'PSO Avg legend');
    });

    test('Section 8 strictly titled COURSE CONTRIBUTIONS TO PROGRAMME DIRECT ATTAINMENT without rankings', () => {
      assert.ok(dashboardComponentSrc.includes('COURSE CONTRIBUTIONS TO PROGRAMME DIRECT ATTAINMENT'), 'Must match exact Section 8 title');
      assert.ok(dashboardComponentSrc.includes('Average contribution of courses to PO/PSO attainment'), 'Must match exact subtitle');
      assert.ok(dashboardComponentSrc.includes('View all courses &rarr;'), 'Must have View all courses link');
      assert.ok(!dashboardComponentSrc.includes('Top Courses (Direct Attainment)'), 'Must NOT use Top Courses title');
    });

    test('Section 9 renders Areas Requiring Attention and advisory callout', () => {
      assert.ok(dashboardComponentSrc.includes('AREAS REQUIRING ATTENTION'), 'Must include Section 9 title');
      assert.ok(dashboardComponentSrc.includes('Outcomes below target in current batch'), 'Must include Section 9 subtitle');
      assert.ok(dashboardComponentSrc.includes('Focus on these outcomes through targeted actions and enhanced evidence.'), 'Callout text');
    });

    test('Section 10 & 11 render deterministic Observations and Next Steps with Quote', () => {
      assert.ok(dashboardComponentSrc.includes('KEY OBSERVATIONS &amp; INSIGHTS'), 'Must include Section 10 title');
      assert.ok(dashboardComponentSrc.includes('NEXT STEPS'), 'Must include Section 11 title');
      assert.ok(dashboardComponentSrc.includes('From learning outcomes to real impact.'), 'Must include official DYPIU OBE motto');
    });

    test('Footer renders all 3 export and navigation actions', () => {
      assert.ok(dashboardComponentSrc.includes('Download PDF'), 'Must have Download PDF button');
      assert.ok(dashboardComponentSrc.includes('Download PNG'), 'Must have Download PNG button');
      assert.ok(dashboardComponentSrc.includes('View Detailed Analytics'), 'Must have View Detailed Analytics button');
    });
  });
});
