import { Plus, Trash2 } from 'lucide-react';

export default function AuditTable({
  title,
  subtitle,
  columns = [],
  data = [],
  onAddRow,
  onDeleteRow,
  onChangeCell,
  readOnly = false,
  actions = null,
}) {
  return (
    <div className="card">
      {(title || actions) && (
        <div className="card-header">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {actions}
            {!readOnly && onAddRow && (
              <button className="btn btn-success" onClick={onAddRow}>
                <Plus size={14} /> Add Row
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="audit-data-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    width: col.width || 'auto',
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.label}
                </th>
              ))}
              {!readOnly && onDeleteRow && (
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (readOnly || !onDeleteRow ? 1 : 2)}
                  style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}
                >
                  No records found. {!readOnly && onAddRow && 'Click "+ Add Row" to add your first record.'}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748b' }}>
                    {rowIndex + 1}
                  </td>
                  {columns.map((col) => {
                    const value = row[col.key] ?? '';
                    if (readOnly || col.readOnly) {
                      return (
                        <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                          {col.render ? col.render(value, row) : value}
                        </td>
                      );
                    }

                    if (col.type === 'select') {
                      return (
                        <td key={col.key}>
                          <select
                            aria-label={col.label || "Select Option"}
                            className="form-select"
                            style={{ width: '100%', padding: '6px 8px' }}
                            value={value}
                            onChange={(e) => onChangeCell && onChangeCell(rowIndex, col.key, e.target.value)}
                          >
                            {col.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    }

                    return (
                      <td key={col.key}>
                        <input
                          type={col.type || 'text'}
                          className="form-control"
                          style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }}
                          value={value}
                          placeholder={col.placeholder || ''}
                          onChange={(e) => onChangeCell && onChangeCell(rowIndex, col.key, e.target.value)}
                        />
                      </td>
                    );
                  })}
                  {!readOnly && onDeleteRow && (
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 8px' }}
                        onClick={() => onDeleteRow(rowIndex)}
                        title="Delete row"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
