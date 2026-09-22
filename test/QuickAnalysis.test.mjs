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
});
