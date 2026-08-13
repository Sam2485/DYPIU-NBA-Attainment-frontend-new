import "/Users/rajshaikh/Desktop/dypiu-nba-attainment-frontend/src/index.css";
export default function RowButtons({
  onAdd,
  onDel,
  canDel = true,
  addLabel = '+ Add Row',
  deleteLabel = '- Delete Last Row',
}) {
  return (
    <div className="row-buttons">
      <button
        type="button"
        className="row-buttons__add-button"
        onClick={onAdd}
      >
        {addLabel}
      </button>

      {canDel && (
        <button
          type="button"
          className="row-buttons__delete-button"
          onClick={onDel}
        >
          {deleteLabel}
        </button>
      )}
    </div>
  );
}