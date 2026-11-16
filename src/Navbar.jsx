
function Navbar({ favouriteCount, loggedInUser, onSignIn, onLogout, onAddRecipe }) {
  return (
    <nav className="navbar">
      <div className="logo">
        🍲 <span>RecipeHub</span>
      </div>

      <div className="nav-right">
        <p className="fav-count">
          ❤️ {favouriteCount}
        </p>

        {loggedInUser ? (
          <>
            <span className="welcome-user">
              Hi, {loggedInUser}!
            </span>

            <button className="auth-nav-btn" onClick={onAddRecipe}>
              + Add Recipe
            </button>

            <button className="auth-nav-btn" onClick={onLogout}>
              Log Out
            </button>
          </>
        ) : (
          <button className="auth-nav-btn" onClick={onSignIn}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
