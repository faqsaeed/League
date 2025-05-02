import React, { useState, useEffect } from 'react';
import '../styles/Match.css';
import axios from 'axios';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    fetchAllMatches();
    fetchTeams();
  }, []);

  const fetchAllMatches = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/matches');
      setMatches(res.data);
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/teams');
      setTeams(res.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const handleTeamChange = async (e) => {
    const teamName = e.target.value;
    setSelectedTeam(teamName);

    if (teamName === '') {
      fetchAllMatches();
    } else {
      try {
        const res = await axios.get(`http://localhost:5000/api/matches/${teamName}`);
        setMatches(res.data);
      } catch (err) {
        console.error('Error filtering matches:', err);
        setMatches([]);
      }
    }
  };

  return (
    <div className="matches-container">
      <h2 className="matches-heading">Matches</h2>

      <div className="filter-section">
        <label htmlFor="teamFilter">Filter by Team:</label>
        <select id="teamFilter" value={selectedTeam} onChange={handleTeamChange}>
          <option value="">All Teams</option>
          {teams.map(team => (
            <option key={team.TeamID} value={team.Name}>
              {team.Name}
            </option>
          ))}
        </select>
      </div>

      <div className="matches-list">
  {matches.length === 0 ? (
    <p>No matches to display.</p>
  ) : (
    <table className="matches-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Venue</th>
          <th>Team 1</th>
          <th>Team 2</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        {matches.map(match => (
          <tr key={match.MatchID}>
            <td>{new Date(match.Date).toLocaleDateString()}</td>
            <td>{match.Venue}</td>
            <td>{match.Team1Name || match.Team1}</td>
            <td>{match.Team2Name || match.Team2}</td>
            <td>{match.Result}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

    </div>
  );
};

export default Matches;
