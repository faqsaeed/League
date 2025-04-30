import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/PlayerStatsPage.css";

function PlayerStatsPage() {
  const { name } = useParams();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/stats/${name}`)
      .then(res => setStats(res.data))
      .catch(err => {
        console.error(err);
        setError("Player stats not found.");
      });
  }, [name]);

  return (
    <div className="stats-page">
      <h1 className="stats-heading">Stats for {name}</h1>
      {error ? (
        <p className="error-text">{error}</p>
      ) : stats ? (
        <div className="stats-card">
          <p><strong>Age:</strong> {stats.Age}</p>
          <p><strong>Position:</strong> {stats.Position}</p>
          <p><strong>Runs:</strong> {stats.Runs}</p>
          <p><strong>Wickets:</strong> {stats.Wickets}</p>
          <p><strong>Total Innings:</strong> {stats.TotalInnings}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default PlayerStatsPage;
