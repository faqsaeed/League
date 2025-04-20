import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function TeamPage() {
  const { teamname } = useParams();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/players/${teamname}/`)
      .then(res => setPlayers(res.data))
      .catch(err => console.error(err));
  }, [teamname]);

  return (
    <div>
      <h1>Players in Team {teamname}</h1>
      <ul>
        {players.map(player => (
          <li key={player.PlayerID}>{player.Name} - {player.Position}</li>
        ))}
      </ul>
    </div>
  );
}

export default TeamPage;
