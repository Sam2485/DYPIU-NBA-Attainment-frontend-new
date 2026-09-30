/**
 * Utility to download public template files stored in /public
 */

const getPublicAssetUrl = (relativePath) => {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${cleanBase}${encodeURI(cleanPath)}`;
};

/**
 * Downloads a static file from public folder.
 * Fetches as Blob first to ensure reliable filename handling in all modern browsers.
 */
export const downloadPublicTemplate = async (relativePath, targetFilename) => {
  const url = getPublicAssetUrl(relativePath);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('Template file not found (SPA HTML fallback returned).');
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = targetFilename || relativePath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    return true;
  } catch (err) {
    console.warn(`Blob fetch for ${relativePath} failed (${err.message}), falling back to direct anchor link`);
    const link = document.createElement('a');
    link.href = url;
    link.download = targetFilename || relativePath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  }
};

/**
 * 1. Course Addition Template
 * File: public/Course Adittion.xlsx
 */
export const downloadCourseAdditionTemplate = () => {
  return downloadPublicTemplate('Course Adittion.xlsx', 'Course_Addition_Template.xlsx');
};

/**
 * 2. PO / PSO & Competencies Templates
 * Files in: public/po_pso_import_template/
 * - PO & PSO Both: PO:PSO and Competancies.xlsx
 * - PO Only: PO and Competency.xlsx
 * - PSO Only: PSO and Competency.xlsx
 */
export const downloadOutcomeImportTemplate = (scope = 'ALL') => {
  const normalizedScope = (scope || 'ALL').toUpperCase();
  if (normalizedScope === 'PO') {
    return downloadPublicTemplate('po_pso_import_template/PO and Competency.xlsx', 'PO_and_Competency_Template.xlsx');
  }
  if (normalizedScope === 'PSO') {
    return downloadPublicTemplate('po_pso_import_template/PSO and Competency.xlsx', 'PSO_and_Competency_Template.xlsx');
  }
  return downloadPublicTemplate('po_pso_import_template/PO:PSO and Competancies.xlsx', 'PO_PSO_and_Competencies_Template.xlsx');
};

/**
 * 3. CO-PO / PSO Mapping Templates
 * Files in: public/co_po:pso_mapping_import_template/
 * - CO-PO & CO-PSO Mapping Sheet: co-po:pso mapping.xlsx
 * - CO-PO Mapping Sheet: co-po mapping.xlsx
 * - CO-PSO Mapping Sheet: co-pso mapping.xlsx
 */
export const downloadMappingImportTemplate = (scope = 'ALL') => {
  const normalizedScope = (scope || 'ALL').toUpperCase();
  if (normalizedScope === 'PO') {
    return downloadPublicTemplate('co_po:pso_mapping_import_template/co-po mapping.xlsx', 'CO_PO_Mapping_Template.xlsx');
  }
  if (normalizedScope === 'PSO') {
    return downloadPublicTemplate('co_po:pso_mapping_import_template/co-pso mapping.xlsx', 'CO_PSO_Mapping_Template.xlsx');
  }
  return downloadPublicTemplate('co_po:pso_mapping_import_template/co-po:pso mapping.xlsx', 'CO_PO_PSO_Mapping_Template.xlsx');
};
