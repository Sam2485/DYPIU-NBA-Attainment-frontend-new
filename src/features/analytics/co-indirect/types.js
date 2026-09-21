/**
 * Model contracts and types for CO Indirect Attainment Evidence Analytics.
 * Aligned 1:1 with backend DTOs in com.dypiu.nba.dto.analytics.
 */

/**
 * @typedef {Object} CoIndirectResponseRecord
 * @property {number} responseNumber - Sequential response index (1, 2, ...)
 * @property {string} responseIdentifier - Safe identifier e.g. "Response 1"
 * @property {string} maskedPrn - Privacy-safe masked student PRN e.g. "2021***0001"
 * @property {number} rating - Numeric Likert rating (1.00, 2.00, 3.00)
 * @property {number} ratingLevel - Integer level (1, 2, 3)
 * @property {string} feedback - Feedback text e.g. "Slight", "Moderate", "Substantial"
 */

/**
 * @typedef {Object} CoIndirectEvidenceItem
 * @property {string} coCode - Course Outcome code e.g. "CO1"
 * @property {string} coStatement - Statement description of the outcome
 * @property {number} coTargetLevel - Target attainment benchmark (e.g. 2.50)
 * @property {boolean} coTargetMet - Boolean whether attainment meets target
 * @property {number} indirectAttainment - Authoritative indirect attainment level (1, 2, 3)
 * @property {number} indirectScore - Score on 3.00 scale
 * @property {number} overallIndirectPercentage - Authoritative indirect percentage (e.g. 83.39)
 * @property {number} level1Count - Slight response count
 * @property {number} level2Count - Moderate response count
 * @property {number} level3Count - Substantial response count
 * @property {number} validResponseCount - Total valid survey responses (level1 + level2 + level3)
 * @property {number} totalResponses - Total survey submissions
 * @property {number} level1Percentage - Slight percentage
 * @property {number} level2Percentage - Moderate percentage
 * @property {number} level3Percentage - Substantial percentage
 * @property {Record<string, number>} levelDistribution - Map of category to count
 * @property {CoIndirectResponseRecord[]} responseRecords - Privacy-safe individual response rows
 */

/**
 * @typedef {Object} CoIndirectEvidenceResponse
 * @property {string} programmeBatchCourseId - Course offering UUID/ID
 * @property {string} courseCode - Course code e.g. "CS301"
 * @property {string} courseName - Course name e.g. "Database Management Systems"
 * @property {number} semester - Academic semester
 * @property {string} batchName - Programme batch name
 * @property {string} programmeName - Master programme name
 * @property {string} departmentName - Department name
 * @property {string} schoolName - School name
 * @property {string} courseCoordinatorName - Name of course coordinator
 * @property {string} assessmentMethod - Method name e.g. "Course End Survey"
 * @property {number} totalSurveyResponses - Total responses submitted across course
 * @property {number} indirectWeight - Configured indirect weight percentage (e.g. 20.00)
 * @property {number} overallIndirectAttainment - Course-level indirect attainment
 * @property {string} selectedCoCode - "ALL" or specific code e.g. "CO1"
 * @property {CoIndirectEvidenceItem[]} coEvidence - List of CO indirect evidence items
 */

export const EMPTY_CO_INDIRECT_EVIDENCE = {
  programmeBatchCourseId: '',
  courseCode: '',
  courseName: '',
  semester: null,
  batchName: '',
  programmeName: '',
  departmentName: '',
  schoolName: '',
  courseCoordinatorName: '',
  assessmentMethod: 'Course End Survey',
  totalSurveyResponses: 0,
  indirectWeight: 20,
  overallIndirectAttainment: 0,
  selectedCoCode: 'ALL',
  coEvidence: [],
};
