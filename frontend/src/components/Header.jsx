import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";

function Header({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/main");
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate("/")}>Pakistan Super League</div>
      <nav className="nav-links">
        <Link to="/main">Teams</Link>

        {!isLoggedIn ? (
          <Link to="/login" className="auth-btn">Login</Link>
        ) : (
          <button onClick={handleLogout} className="auth-btn logout-btn">Logout</button>
        )}
      </nav>
    </header>
  );
}

export default Header;
