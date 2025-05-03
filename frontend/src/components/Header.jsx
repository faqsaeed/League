import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";

function Header({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const storedValue = localStorage.getItem('token');
  const booleanValue =(!(!storedValue));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.setItem('skipLogin', 'true');
    setIsLoggedIn(false);
    navigate("/main");
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate("/")}>Pakistan Super League</div>
      <nav className="nav-links">
        <Link to="/main">Teams</Link>
        <Link to="/points">Points Table</Link>
        <Link to="/schedule">Match Schedule</Link>
        
        {!booleanValue ? 
        ( <Link to="/login" className="auth-btn">Login</Link> )
        : 
        ( <button onClick={handleLogout} className="auth-btn logout-btn">Logout</button> )
        }
      </nav>
    </header>
  );
}

export default Header;
