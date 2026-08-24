import React from 'react';

export const Table = ({
  columns = [], // Array of { header, accessor, render, align, width }
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  style = {},
  className = '',
}) => {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: '#ffffff',
        ...style,
      }}
      className={`admin-table-container ${className}`}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  padding: '12px 16px',
                  fontWeight: '700',
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  textAlign: col.align || 'left',
                  width: col.width || 'auto',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>{emptyMessage}</div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                style={{
                  borderBottom: rowIdx === data.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                  transition: 'background-color 0.15s ease',
                }}
                className="table-row-hover"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {columns.map((col, colIdx) => {
                  let cellContent;
                  if (col.render) {
                    cellContent = col.render(row, rowIdx);
                  } else if (col.accessor) {
                    cellContent = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                  } else {
                    cellContent = null;
                  }

                  return (
                    <td
                      key={colIdx}
                      style={{
                        padding: '14px 16px',
                        color: 'var(--text-primary)',
                        textAlign: col.align || 'left',
                        verticalAlign: 'middle',
                      }}
                    >
                      {cellContent ?? '—'}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
