import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/MainPage.css";

function MainPage() {
  const [teams, setTeams] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role === "Admin") {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Invalid token format");
      }
    }

    axios.get("http://localhost:5000/api/teams")
      .then(res => setTeams(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="main-page">
      <h1 className="main-heading">Teams</h1>
      {isAdmin && (
        <button className="admin-button" onClick={() => navigate("/admin/teamdashboard")}>
          Go to Admin Dashboard
        </button>
      )}
      <ul className="team-list">
        {teams.map(team => (
          <li key={team.TeamID} className="team-card">
            <Link to={`/teams/${team.Name}`} className="team-link">
              {team.Name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MainPage;
