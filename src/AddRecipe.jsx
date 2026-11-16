import API_BASE_URL from "./api";
import { useState } from "react";

function AddRecipe({ onClose, onRecipeAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    ingredients: "",
    instructions: "",
    imageUrl: "",
    category: "Indian",
    dietType: "Vegetarian",
    cuisineType: "Indian",
    cookingTime: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter a recipe name.");
      return;
    }

    if (!formData.ingredients.trim()) {
      setError("Please enter the ingredients.");
      return;
    }

    if (!formData.instructions.trim()) {
      setError("Please enter the instructions.");
      return;
    }

    try {
      const image = new URL(formData.imageUrl);
      if (!["http:", "https:"].includes(image.protocol)) {
        throw new Error();
      }
    } catch {
      setError("Please enter a valid HTTP or HTTPS image URL.");
      return;
    }

    const cookingTime = Number(formData.cookingTime);

    if (!Number.isInteger(cookingTime) || cookingTime < 1) {
      setError("Cooking time must be a positive whole number.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          ingredients: formData.ingredients.trim(),
          instructions: formData.instructions.trim(),
          imageUrl: formData.imageUrl.trim(),
          cuisineType: formData.cuisineType.trim(),
          cookingTime,
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "Session expired or access denied. Please log in again."
            : "Unable to add recipe. Please check your details."
        );
      }

      const savedRecipe = await response.json();

      onRecipeAdded(savedRecipe);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="recipe-modal add-recipe-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} type="button">
          ✕
        </button>

        <div className="modal-body">
          <h2>🍲 Add a New Recipe</h2>
          <p>Share something delicious with RecipeHub!</p>

          <form onSubmit={handleSubmit} className="add-recipe-form">
            <label>
              Recipe Name
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength="150"
                required
              />
            </label>

            <label>
              Ingredients (separate with commas)
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                maxLength="2000"
                required
              />
            </label>

            <label>
              Instructions
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                maxLength="10000"
                required
              />
            </label>

            <label>
              Image URL
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Category
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Indian">Indian</option>
                <option value="Italian">Italian</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Diet Type
              <select
                name="dietType"
                value={formData.dietType}
                onChange={handleChange}
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </label>

            <label>
              Cuisine Type
              <input
                name="cuisineType"
                value={formData.cuisineType}
                onChange={handleChange}
                maxLength="100"
                required
              />
            </label>

            <label>
              Cooking Time (minutes)
              <input
                type="number"
                name="cookingTime"
                min="1"
                step="1"
                value={formData.cookingTime}
                onChange={handleChange}
                required
              />
            </label>

            {error && <p role="alert">{error}</p>}

            <button
              type="submit"
              className="hero-btn"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Recipe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRecipe;
