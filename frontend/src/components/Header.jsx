import React from "react";
import { Link, useNavigate } from "react-router-dom";
import adminCheck from '../services/adminCheck';
import "../styles/Header.css";

function Header({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.setItem('skipLogin', 'true');
    setIsLoggedIn(false);
    navigate("/main");
    window.location.reload(true);
  };
  const auth =  adminCheck();
         
  return (
    <header className="header">
      <div className="logo" onClick={() => navigate("/")}>Pakistan Super League</div>
      <nav className="nav-links">
        <Link to="/main">Teams</Link>
        <Link to="/points">Points Table</Link>
        <Link to="/schedule">Match Schedule</Link>
        
        {!auth.isAuthenticated ? 
        ( <Link to="/login" className="auth-btn">Login</Link> )
        : 
        ( <button onClick={handleLogout} className="auth-btn logout-btn">Logout</button> )
        }
      </nav>
    </header>
  );
}

export default Header;
