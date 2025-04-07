import React from "react";
import "../styles/Login.css"; // Import the CSS file for styling

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Log-In</h1>
        <form>
          <div className="input-group">
            <label htmlFor="username">
              <span role="img" aria-label="user">
                👤
              </span>
            </label>
            <input
              type="text"
              id="username"
              placeholder="User Name"
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">
              <span role="img" aria-label="lock">
                🔒
              </span>
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="input-field"
            />
          </div>
          <button type="submit" className="login-button">
            ➡️
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;