export const outcomeCode = (item) => String(
  typeof item === 'string'
    ? item
    : item?.code ?? item?.outcomeCode ?? item?.coCode ?? item?.poCode ?? item?.psoCode ?? ''
).trim().toUpperCase().replace(/\s+/g, '');

export const compareOutcomeCodes = (left, right) => outcomeCode(left).localeCompare(
  outcomeCode(right),
  undefined,
  { numeric: true, sensitivity: 'base' },
);

// Keep API-provided arrays immutable: callers can safely use this for display
// without changing the response/state collection they received.
export const sortOutcomes = (items = []) => [...(Array.isArray(items) ? items : [])]
  .sort(compareOutcomeCodes);

export const sortOutcomeCodes = (codes = []) => [...new Set(codes.filter(Boolean))]
  .sort(compareOutcomeCodes);
