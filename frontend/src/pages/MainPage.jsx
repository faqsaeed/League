import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/MainPage.css"; 
function MainPage() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/teams")
      .then(res => setTeams(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="main-page">
      <h1 className="main-heading">Teams</h1>
      <ul className="team-list">
        {teams.map(team => (
          <li key={team.Name} className="team-card">
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
