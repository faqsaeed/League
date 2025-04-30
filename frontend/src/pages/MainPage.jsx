import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function MainPage() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/teams")
      .then(res => setTeams(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Teams</h1>
      <ul>
        {teams.map(team => (
          <li key={team.Name}>
            <Link to={`/teams/${team.Name}`}>{team.Name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MainPage;
