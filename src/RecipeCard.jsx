
function RecipeCard(props) {
  return (
    <div className="recipe-card">
      <img src={props.image} alt={props.name} />

      <h2>{props.name}</h2>

      <p>👨‍🍳 {props.chef}</p>
      <p>⭐ {props.rating}</p>
      <p>⏱️ {props.time}</p>
      <p>📈 {props.difficulty}</p>

      <button
        className="fav-btn"
        onClick={props.onFavourite}
      >
        {props.favourite ? "❤️" : "🤍"}
      </button>

      {props.canManage && (
        <div className="recipe-actions">
          <button
            onClick={props.onEdit}
            type="button"
          >
            ✏️ Edit
          </button>

          <button
            onClick={props.onDelete}
            type="button"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default RecipeCard;
