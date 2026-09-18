import apiClient from './client';

export const analyticsApi = {
  /**
   * Fetch institutional quality KPIs with optional hierarchical scoping.
   * @param {Object} params
   * @param {string} [params.schoolId]
   * @param {string} [params.departmentId]
   * @param {string} [params.masterProgrammeId]
   * @param {string} [params.programmeBatchId]
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getKpis: ({ schoolId, departmentId, masterProgrammeId, programmeBatchId, batchStatus } = {}) => {
    const params = {};
    if (schoolId) params.schoolId = schoolId;
    if (departmentId) params.departmentId = departmentId;
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    if (programmeBatchId) params.programmeBatchId = programmeBatchId;
    if (batchStatus) params.batchStatus = batchStatus;

    return apiClient.get('/analytics/kpis', { params });
  },

  /**
   * Fetch PO health metrics (PO1-PO12) for the specified scope.
   * @param {Object} params
   * @param {string} [params.schoolId]
   * @param {string} [params.departmentId]
   * @param {string} [params.masterProgrammeId]
   * @param {string} [params.programmeBatchId]
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getPoHealth: ({ schoolId, departmentId, masterProgrammeId, programmeBatchId } = {}) => {
    const params = {};
    if (schoolId) params.schoolId = schoolId;
    if (departmentId) params.departmentId = departmentId;
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    if (programmeBatchId) params.programmeBatchId = programmeBatchId;

    return apiClient.get('/analytics/po-health', { params });
  },

  /**
   * Fetch PSO health metrics for the specified scope.
   * @param {Object} params
   * @param {string} [params.schoolId]
   * @param {string} [params.departmentId]
   * @param {string} [params.masterProgrammeId]
   * @param {string} [params.programmeBatchId]
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getPsoHealth: ({ schoolId, departmentId, masterProgrammeId, programmeBatchId } = {}) => {
    const params = {};
    if (schoolId) params.schoolId = schoolId;
    if (departmentId) params.departmentId = departmentId;
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    if (programmeBatchId) params.programmeBatchId = programmeBatchId;

    return apiClient.get('/analytics/pso-health', { params });
  },

  /**
   * Fetch paginated programme cohort landscape with scoping, search, filter, and sorting.
   * @param {Object} params
   * @param {string} [params.schoolId]
   * @param {string} [params.departmentId]
   * @param {string} [params.masterProgrammeId]
   * @param {string} [params.programmeBatchId]
   * @param {number} [params.page=0]
   * @param {number} [params.size=10]
   * @param {string} [params.query]
   * @param {string} [params.statusFilter='ALL']
   * @param {string} [params.batchStatus]
   * @param {boolean} [params.attentionOnly]
   * @param {string} [params.sortBy='programmeName']
   * @param {string} [params.direction='ASC']
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getProgrammes: ({
    schoolId,
    departmentId,
    masterProgrammeId,
    programmeBatchId,
    page = 0,
    size = 10,
    query,
    statusFilter = 'ALL',
    batchStatus,
    attentionOnly,
    sortBy = 'programmeName',
    direction = 'ASC',
  } = {}) => {
    const params = { page, size, statusFilter, sortBy, direction };
    if (schoolId) params.schoolId = schoolId;
    if (departmentId) params.departmentId = departmentId;
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    if (programmeBatchId) params.programmeBatchId = programmeBatchId;
    if (batchStatus) params.batchStatus = batchStatus;
    if (attentionOnly !== undefined && attentionOnly !== null) params.attentionOnly = attentionOnly;
    if (query && query.trim()) params.query = query.trim();

    return apiClient.get('/analytics/programmes', { params });
  },

  /**
   * Fetch prioritized attention areas (PO/PSO deficits) with course/CO evidence and ATR observations.
   * @param {Object} params
   * @param {string} [params.schoolId]
   * @param {string} [params.departmentId]
   * @param {string} [params.masterProgrammeId]
   * @param {string} [params.programmeBatchId]
   * @param {number} [params.limit=10]
   * @param {string} [params.outcomeType='ALL'] - 'ALL' | 'PO' | 'PSO'
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getAttentionAreas: ({
    schoolId,
    departmentId,
    masterProgrammeId,
    programmeBatchId,
    limit = 10,
    outcomeType = 'ALL',
  } = {}) => {
    const params = { limit, outcomeType };
    if (schoolId) params.schoolId = schoolId;
    if (departmentId) params.departmentId = departmentId;
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    if (programmeBatchId) params.programmeBatchId = programmeBatchId;

    return apiClient.get('/analytics/attention-areas', { params });
  },

  /**
   * Fetch historical multi-cohort longitudinal trends for POs and PSOs.
   * @param {Object} params
   * @param {string} [params.schoolId]
   * @param {string} [params.departmentId]
   * @param {string} [params.masterProgrammeId]
   * @param {number} [params.numCohorts]
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getTrends: ({
    schoolId,
    departmentId,
    masterProgrammeId,
    numCohorts,
  } = {}) => {
    const params = {};
    if (schoolId) params.schoolId = schoolId;
    if (departmentId) params.departmentId = departmentId;
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    if (numCohorts !== undefined && numCohorts !== null) params.numCohorts = numCohorts;

    return apiClient.get('/analytics/trends', { params });
  },

  /**
   * Fetch detailed ATR intelligence (status distribution, gaps with/without ATR, recorded actions & observations).
   * @param {Object} params
   * @param {string} [params.schoolId]
   * @param {string} [params.departmentId]
   * @param {string} [params.masterProgrammeId]
   * @param {string} [params.programmeBatchId]
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getAtrIntelligence: ({
    schoolId,
    departmentId,
    masterProgrammeId,
    programmeBatchId,
  } = {}) => {
    const params = {};
    if (schoolId) params.schoolId = schoolId;
    if (departmentId) params.departmentId = departmentId;
    if (masterProgrammeId) params.masterProgrammeId = masterProgrammeId;
    if (programmeBatchId) params.programmeBatchId = programmeBatchId;

    return apiClient.get('/analytics/atr-intelligence', { params });
  },

  /**
   * Fetch mapped course and CO evidence for a specific outcome in a programme batch.
   * @param {Object} params
   * @param {string} params.programmeBatchId
   * @param {string} params.outcomeCode
   * @param {string} [params.outcomeType='PO']
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getCourseEvidence: ({ programmeBatchId, outcomeCode, outcomeType = 'PO' } = {}) => {
    const params = { programmeBatchId, outcomeCode, outcomeType };
    return apiClient.get('/analytics/course-evidence', { params });
  },

  /**
   * Fetch aggregated student evidence and performance drill-down for a course offering and CO.
   * @param {Object} params
   * @param {string} params.programmeBatchCourseId
   * @param {string} params.coCode
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getStudentEvidence: ({ programmeBatchCourseId, coCode } = {}) => {
    const params = { programmeBatchCourseId, coCode };
    return apiClient.get('/analytics/student-evidence', { params });
  },

  /**
   * Fetch current IQAC Student Performance Evidence Threshold configuration.
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  getStudentEvidenceThreshold: () => {
    return apiClient.get('/analytics/config/student-evidence-threshold');
  },

  /**
   * Update IQAC Student Performance Evidence Threshold configuration.
   * @param {Object} params
   * @param {number} params.thresholdPercentage
   * @returns {Promise<import('axios').AxiosResponse>}
   */
  updateStudentEvidenceThreshold: ({ thresholdPercentage } = {}) => {
    return apiClient.put('/analytics/config/student-evidence-threshold', { thresholdPercentage });
  },
};

export default analyticsApi;
