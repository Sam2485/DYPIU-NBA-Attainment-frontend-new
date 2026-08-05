export default function RowButtons({
  onAdd,
  onDel,
  canDel = true,
  addLabel = "+ Add Row",
  deleteLabel = "- Delete Last Row",
}) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
      <button
        type="button"
        style={{
          minHeight: 38,
          padding: '8px 18px',
          background: '#ffffff',
          color: '#4f46e5',
          border: '1.5px solid #6366f1',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'inherit',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 1px 3px rgba(99,102,241,0.08)',
        }}
        onClick={onAdd}
      >
        {addLabel}
      </button>
      {canDel && (
        <button
          type="button"
          style={{
            minHeight: 38,
            padding: '8px 18px',
            background: '#ffffff',
            color: '#ef4444',
            border: '1.5px solid #fecaca',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 3px rgba(239,68,68,0.08)',
          }}
          onClick={onDel}
        >
          {deleteLabel}
        </button>
      )}
    </div>
  );
}
