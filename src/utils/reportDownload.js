const filenameFromDisposition = (value, fallback) => {
  const match = value?.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : fallback;
};

const resolveBlob = (responseOrBlob) => {
  if (responseOrBlob instanceof Blob) return responseOrBlob;
  if (responseOrBlob?.data instanceof Blob) return responseOrBlob.data;
  throw new TypeError('The report download response did not contain a binary file.');
};

export const downloadReportBlob = (response, fallbackName) => {
  const url = URL.createObjectURL(resolveBlob(response));
  const link = document.createElement('a');
  link.href = url;
  link.download = filenameFromDisposition(response.headers?.['content-disposition'], fallbackName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const openReportPdf = (response) => {
  const url = URL.createObjectURL(resolveBlob(response));
  const viewer = window.open(url, '_blank', 'noopener,noreferrer');
  if (!viewer) downloadReportBlob(response, 'official-report.pdf');
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
};
