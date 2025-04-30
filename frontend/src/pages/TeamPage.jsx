import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../styles/TeamPage.css";

function TeamPage() {
  const { teamname } = useParams();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/players/${teamname}/`)
      .then(res => setPlayers(res.data))
      .catch(err => console.error(err));
  }, [teamname]);

  return (
    <div className="team-page">
      <h1 className="team-heading">Players in {teamname}</h1>
      <ul className="player-list">
        {players.map(player => (
          <li key={player.PlayerID} className="player-card">
            <Link to={`/players/${player.Name}`} className="player-link">
              <div className="player-name">{player.Name}</div>
              <div className="player-position">Position: {player.Position}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeamPage;
