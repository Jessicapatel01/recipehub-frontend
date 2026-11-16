import API_BASE_URL from './api';
import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import pizza from"./assets/pizza-unsplash.jpg";
import pasta from"./assets/pasta-unsplash.jpg";
import burger from"./assets/burger-unsplash.jpg";
import paneer from"./assets/paneerbuttermasala.jpg";

import './App.css'
import Navbar from './Navbar';
import RecipeCard from './RecipeCard';
import Auth from './Auth';
import AddRecipe from './AddRecipe';
import EditRecipe from './EditRecipe';


function App() {
  const[loading, setLoading]=useState(true);
  const[apiError, setApiError]=useState("");
  const[recipes, setRecipes]=useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");
  const [showAddRecipe, setShowAddRecipe]=useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setApiError("");

        const response = await fetch(
         `${API_BASE_URL}/recipes` );

        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }

        const data = await response.json();

        const realRecipes = data.map((recipe) => ({
          id: recipe.id,
          name: recipe.name,
          chef: "Home Chef",
          rating: recipe.rating?? 0,
          time: recipe.cookingTime
          ? `${recipe.cookingTime} mins`
                : "See instructions",
          difficulty: "Easy",
          image: recipe.imageUrl || "",
          category: recipe.category || "Other",
          dietType: recipe.dietType || "Vegetarian",
          cuisineType: recipe.cuisineType || "Indian",
          cookingTime: recipe.cookingTime || "",
          favourite: false,
          ingredients: recipe.ingredients
            ? recipe.ingredients.split(",").map((item) => item.trim())
            : [],
          instructions: recipe.instructions || "No instructions available.",
        }));


        setRecipes(realRecipes);
      } catch (error) {
        setApiError("Unable to load recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);


    //state variables
  const [search, setSearch] = useState("");
  const [category,setCategory]= useState("All");
  const [sortBy, setSortBy]= useState("None");
  const [showFavourites, setShowFavourites]= useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [toast, setToast] = useState(null);


const handleLogout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    setLoggedInUser("");
  } catch (error) {
    console.error("Logout error:", error);
    alert("Unable to log out. Please try again.");
  }
};

const handleRecipeUpdated = (updatedRecipe) => {
  setRecipes((previous) =>
    previous.map((recipe) =>
      recipe.id === updatedRecipe.id
        ? {
            ...recipe,
            name: updatedRecipe.name,
            ingredients: updatedRecipe.ingredients
              ? updatedRecipe.ingredients.split(",").map((item) => item.trim())
              : [],
            instructions: updatedRecipe.instructions || "",
            image: updatedRecipe.imageUrl || "",
            category: updatedRecipe.category || "Other",
            dietType: updatedRecipe.dietType || "",
            cuisineType: updatedRecipe.cuisineType || "",
            cookingTime: updatedRecipe.cookingTime,
            time: updatedRecipe.cookingTime
              ? `${updatedRecipe.cookingTime} mins`
              : "See instructions",
          }
        : recipe
    )
  );

  setToast("Recipe updated successfully! ✨");
};

const handleDeleteRecipe = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this recipe?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/recipes/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(
        response.status === 403
          ? "Please log in again."
          : "Unable to delete recipe."
      );
    }

    setRecipes((previous) =>
      previous.filter((recipe) => recipe.id !== id)
    );

    setSelectedRecipe(null);
    setToast("Recipe deleted successfully! 🗑️");
  } catch (error) {
    alert(error.message);
  }
};


  useEffect(() => {
    if (!selectedRecipe) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedRecipe(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRecipe]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const favouriteCount = recipes.filter(
    (recipe) => recipe.favourite
  ).length;

  const averageRating=(
    recipes.reduce((sum,recipe)=>sum+recipe.rating, 0)/recipes.length
  ).toFixed(1);

  const toggleFavourite = (id) => {
    const targetRecipe = recipes.find((recipe) => recipe.id === id);
    const updatedRecipes = recipes.map((recipe) =>
      recipe.id === id
        ? { ...recipe, favourite: !recipe.favourite }
        : recipe
    );

    setRecipes(updatedRecipes);

    if (targetRecipe) {
      setToast(
        targetRecipe.favourite
          ? `Removed ${targetRecipe.name} from favourites`
          : `❤️ Added ${targetRecipe.name} to favourites`
      );
    }
  };

  const toggleIngredientChecked = (recipeId, ingredient) => {
    const key = `${recipeId}-${ingredient}`;
    setCheckedIngredients((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const categories = [
    "All",
    "Fast Food",
    "Italian",
    "Indian"
  ];


//filtering and searching recipes
  const filteredRecipes = recipes.filter((recipe) =>{
    const matchesSearch =
    recipe.name.toLowerCase().includes(search.toLowerCase()) ||
    recipe.chef.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
    category==="All"||recipe.category===category;

    const matchesFavourite =
    !showFavourites || recipe.favourite;

    const matchesDifficulty =
    difficultyFilter==="All"||recipe.difficulty===difficultyFilter;

    return matchesSearch && matchesCategory && matchesFavourite && matchesDifficulty;
});



const sortedRecipes = [...filteredRecipes];

if (sortBy === "Rating") {
  sortedRecipes.sort((a, b) => b.rating - a.rating);
}

if (sortBy === "Time") {
  sortedRecipes.sort((a, b) => parseInt(a.time) - parseInt(b.time));
}

if (sortBy === "Name") {
  sortedRecipes.sort((a, b) => a.name.localeCompare(b.name));
}

console.log("Current sort:", sortBy);
  return (
    <div className="container">
      <Navbar
        favouriteCount={favouriteCount}
        loggedInUser={loggedInUser}
        onSignIn={()=>setShowAuth(true)}
        onLogout={handleLogout}
        onAddRecipe={()=> setShowAddRecipe(true)}
        />
     <div className="hero">
       <div className="hero-text">
        <p className="Floating-text">
        🍕 Pizza • 🍔 Burger • 🍝 Pasta • 🥗 Healthy • 🍜 Asian Cuisine
        </p>
        <h1>Discover Delicious Recipes</h1>

    <p>Search, sort and save your favourite recipes.</p>

        <button
        className="hero-btn"
        onClick={() => {
            document.getElementById("recipes-section")
            ?.scrollIntoView({ behavior: "smooth" });
             }}
           >
            Explore Recipes
        </button>
       </div>
     </div>

     <div className="stats">
      <div className="stat-card">
        <h2>🍽️</h2>
        <h3>{recipes.length}</h3>
        <p>Recipes</p>
      </div>
      <div className="stat-card">
        <h2>❤️</h2>
        <h3>{favouriteCount}</h3>
        <p>Favourites</p>
      </div>
      <div className="stat-card">
        <h2>🌎</h2>
        <h3>{categories.length-1}</h3>
        <p>Categories</p>
      </div>
      <div className="stat-card">
        <h2>⭐</h2>
        <h3>{averageRating}</h3>
        <p>Rating</p>
      </div>

     </div>
    {recipes.length>0 && (
     <div className="featured">
      <div className="featured-image">
        <img src={recipes[0].image} alt={recipes[0].name}/>

      </div>
      <div className="featured-content">
        <span className="featured-tag">
        🔥 Chef's Special
        </span>
        <h2>{recipes[0].name}</h2>
        <p>
          {recipes[0].instructions}
        </p>
        <div className="featured-info">
          <span>⭐ {recipes[0].rating}</span>

          <span>👨‍🍳 {recipes[0].chef}</span>

          <span>⏱️ {recipes[0].time}</span>
        </div>

        <button
          className="hero-btn"
          onClick={()=>setSelectedRecipe(recipes[0])}
          >
            View Recipe
          </button>
      </div>
     </div>
    )}
      <input
      className="search-box"
      type="text"
     placeholder="Search recipes..."
     value={search}
     onChange={(event)=>setSearch(event.target.value)}
     />
     <div className="categories">
      {categories.map((item)=>(
        <button
        key={item}
        className={category===item?"active-category" : ""}
        onClick={()=>setCategory(item)}
        >
          {item}
        </button>
      ))}
     </div>

     <div className="favourite-filter">
<button
className="Favourite-btn"
onClick={() => setShowFavourites(!showFavourites)}
>
  {showFavourites ? "❤️ Showing Favourites" : "🤍 Show Favourites"}
</button>
</div>

<div className="sort-section">
    <label>Sort By: </label>
    <select
      value={sortBy}
      onChange={(e)=>setSortBy(e.target.value)}
      >
        <option value="None">None</option>

        <option value="Rating">
        Rating ⭐
        </option>
        <option value="Time">
      Cooking Time ⏱️
    </option>

    <option value="Name">
      Name A-Z
    </option>
  </select>

  <label>Difficulty: </label>
  <select
    value={difficultyFilter}
    onChange={(e)=>setDifficultyFilter(e.target.value)}
    >
    {difficulties.map((level) => (
      <option key={level} value={level}>{level}</option>
    ))}
  </select>
  </div>

     <h3>Showing {filteredRecipes.length} recipes</h3>
     {loading && <p>Loading delicious recipes... 🍽️</p>}

{apiError && (
  <p role="alert">
    {apiError}
    <button onClick={() => window.location.reload()}>
      Retry
    </button>
  </p>
)}
<div className="recipe-grid" id="recipes-section">
  {loading ? (
    <p>Loading delicious recipes... 🍽️</p>
  ) : apiError ? (
    <p role="alert">{apiError}</p>
  ) : sortedRecipes.length === 0 ? (
    <p className="no-results">
      ❌ No recipes found. Try adjusting your filters.
    </p>
  ) : (
    sortedRecipes.map((recipe) => (
      <div
        key={recipe.id}
        className="recipe-card-wrapper"
        onClick={() => setSelectedRecipe(recipe)}
      >
        <span
          className={`difficulty-badge difficulty-${recipe.difficulty.toLowerCase()}`}
        >
          {recipe.difficulty}
        </span>


         <RecipeCard
           name={recipe.name}
           chef={recipe.chef}
           rating={recipe.rating}
           time={recipe.time}
           difficulty={recipe.difficulty}
           image={recipe.image}
           favourite={recipe.favourite}
           canManage={Boolean(loggedInUser)}
           onFavourite={(event) => {
              event?.stopPropagation?.();
              toggleFavourite(recipe.id);
           }}
             onEdit={(event) => {
             event.stopPropagation();
            setRecipeToEdit(recipe);
           }}
             onDelete={(event) => {
             event.stopPropagation();
             handleDeleteRecipe(recipe.id);
           }}
        />

      </div>
    ))
  )}
</div>

    {selectedRecipe && (() => {
      const activeRecipe =
        recipes.find((recipe) => recipe.id === selectedRecipe.id) || selectedRecipe;

      return (
        <div
          className="modal-overlay"
          onClick={() => setSelectedRecipe(null)}
          >
          <div
            className="recipe-modal"
            onClick={(event) => event.stopPropagation()}
            >
            <button
              className="modal-close"
              onClick={() => setSelectedRecipe(null)}
              aria-label="Close recipe"
              >
              ✕
            </button>

            <div className="modal-image">
              <img src={activeRecipe.image} alt={activeRecipe.name} />
              <span className="modal-difficulty">{activeRecipe.difficulty}</span>
            </div>

            <div className="modal-body">
              <span className="featured-tag">{activeRecipe.category}</span>
              <h2>{activeRecipe.name}</h2>

              <div className="featured-info">
                <span>⭐ {activeRecipe.rating}</span>
                <span>👨‍🍳 {activeRecipe.chef}</span>
                <span>⏱️ {activeRecipe.time}</span>
              </div>

              <button
                className="modal-favourite"
                onClick={() => toggleFavourite(activeRecipe.id)}
                >
                {activeRecipe.favourite ? "❤️ Saved to Favourites" : "🤍 Add to Favourites"}
              </button>

              <h3 className="modal-section-title">Ingredients</h3>
              <ul className="ingredient-list">
                {activeRecipe.ingredients.map((ingredient, index) => {
                  const key = `${activeRecipe.id}-${ingredient}`;
                  const isChecked = !!checkedIngredients[key];
                  return (
                    <li key={index}>
                      <label className={`ingredient-item ${isChecked ? "checked" : ""}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleIngredientChecked(activeRecipe.id, ingredient)}
                          />
                        <span>{ingredient}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>

              <h3 className="modal-section-title">Instructions</h3>
              <p className="modal-instructions">{activeRecipe.instructions}</p>
            </div>
          </div>
        </div>
      );
    })()}

    {toast && (
      <div className="toast">{toast}</div>
    )}

{showAuth && (
  <Auth
    onClose={() => setShowAuth(false)}
    onLoginSuccess={(username) => {
      setLoggedInUser(username);
      setShowAuth(false);
    }}
  />
)}

{showAddRecipe && (
  <AddRecipe
    onClose={() => setShowAddRecipe(false)}
    onRecipeAdded={(savedRecipe) => {
      const newRecipe = {
        id: savedRecipe.id,
        name: savedRecipe.name,
        chef: loggedInUser,
        rating: savedRecipe.rating ?? 0,
        time: savedRecipe.cookingTime
          ? `${savedRecipe.cookingTime} mins`
          : "See instructions",
        difficulty: "Easy",
        image: savedRecipe.imageUrl || "",
        category: savedRecipe.category || "Other",
        dietType: savedRecipe.dietType || "Vegetarian",
        cuisineType: savedRecipe.cuisineType || "Indian",
        cookingTime: savedRecipe.cookingTime || "",
        favourite: false,
        ingredients: savedRecipe.ingredients
          ? savedRecipe.ingredients.split(",").map((item) => item.trim())
          : [],
        instructions: savedRecipe.instructions || "",
      };

      setRecipes((previous) => [...previous, newRecipe]);
      setToast("Recipe added successfully! 🍲");
    }}
  />
)}
{recipeToEdit && (
  <EditRecipe
    recipe={recipeToEdit}
    onClose={() => setRecipeToEdit(null)}
    onRecipeUpdated={handleRecipeUpdated}
  />
)}
  </div>
);
}

export default App;