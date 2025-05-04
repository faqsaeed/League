import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/PlayerDashboard.css";

function AdminTeamDashboard() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [teamName, setTeamName] = useState("");

useEffect(() => {
  axios
    .get(`http://localhost:5000/api/teams/id/${teamId}`) // endpoint should return team data
    .then((res) => setTeamName(res.data.Name))
    .catch((err) => console.error(err));
}, [teamId]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/players/id/${teamId}/`)
      .then((res) => setPlayers(res.data))
      .catch((err) => console.error(err));
  }, [teamId, refresh]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/players/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setRefresh(!refresh);
      alert("Player deleted successfully");
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleEdit = (playerId) => {
    navigate(`/admin/editplayer/${playerId}`);
  };

  const handleCreate = () => {
    navigate(`/admin/createplayer/${teamId}`);
  };

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-heading">Admin Dashboard - {teamName}</h2>
      <button className="create-button" onClick={handleCreate}>Create New Player</button>

      <ul className="player-admin-list">
        {players.map((player) => (
          <li key={player.PlayerID} className="admin-player-card">
            <div>
              <strong>{player.Name}</strong> - {player.Position}
            </div>
            <div>
              Runs: {player.Runs} | Wickets: {player.Wickets} | Innings: {player.TotalInnings}
            </div>
            <div className="admin-buttons">
              <button onClick={() => handleEdit(player.PlayerID)}>Edit</button>
              <button onClick={() => handleDelete(player.PlayerID)} className="delete-button">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminTeamDashboard;
