import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import adminCheck from '../services/adminCheck';
import '../styles/EditMatch.css';

const EditMatch = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [matchData, setMatchData] = useState({
    Date: '',
    Venue: '',
    Team1ID: '',
    Team2ID: '',
    Result: ''
  });

  const [originalMatch, setOriginalMatch] = useState(null);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = () => {
      const authStatus = adminCheck();
      if (!authStatus.isAuthenticated || !authStatus.isAdmin) {
        navigate('/');
        return;
      }
      setIsAdmin(true);
    };
  
    checkAdminStatus();
  }, [navigate]);

  useEffect(() => {
    const init = async () => {
      try {
        const auth = await adminCheck();
        if (!auth.isAuthenticated || !auth.isAdmin) {
          navigate('/');
          return;
        }
        await fetchMatch();
        await fetchTeams();
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication error. Please log in.');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [matchId, navigate]);

  const fetchMatch = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/matches/match/${matchId}`);
      const match = res.data;

      setOriginalMatch(match);
      setMatchData({
        Date: match.Date ? new Date(match.Date).toISOString().split('T')[0] : '',
        Venue: match.Venue || '',
        Team1ID: match.Team1ID?.toString() || '',
        Team2ID: match.Team2ID?.toString() || '',
        Result: match.Result || ''
      });
    } catch (err) {
      console.error('Error fetching match:', err);
      setError('Failed to load match data.');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMatchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalMatch) {
      setError('Match data not loaded yet.');
      return;
    }

    const updatedMatch = {
      Date: matchData.Date || originalMatch.Date,
      Venue: matchData.Venue || originalMatch.Venue,
      Team1ID: matchData.Team1ID || originalMatch.Team1ID,
      Team2ID: matchData.Team2ID || originalMatch.Team2ID,
      Result: matchData.Result || originalMatch.Result
    };
    if(!isAdmin)
    {
      alert("You are not authorized to edit a match.");
      return;
    }
    

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/matches/${matchId}`,
        updatedMatch,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/admin/matchdashboard');
    } catch (err) {
      console.error('Error updating match:', err);
      setError('Failed to update match.');
    }
  };

  if (isLoading) return <div className="edit-loading">Loading match data...</div>;

  return (
    <div className="edit-match-container">
      <h2>Edit Match</h2>
      {error && <div className="edit-error">{error}</div>}
      <form onSubmit={handleSubmit} className="edit-match-form">
        <div className="edit-form-group">
          <label htmlFor="Date">Date</label>
          <input
            type="date"
            name="Date"
            id="Date"
            value={matchData.Date}
            onChange={handleChange}
          />
        </div>

        <div className="edit-form-group">
          <label htmlFor="Venue">Venue</label>
          <input
            type="text"
            name="Venue"
            id="Venue"
            value={matchData.Venue}
            onChange={handleChange}
            placeholder="Enter venue (optional)"
          />
        </div>

        <div className="edit-form-group">
          <label htmlFor="Team1ID">Team 1</label>
          <select name="Team1ID" id="Team1ID" value={matchData.Team1ID} onChange={handleChange}>
            <option value="">Select Team 1</option>
            {teams.map(team => (
              <option key={team.TeamID} value={team.TeamID}>
                {team.TeamName}
              </option>
            ))}
          </select>
        </div>

        <div className="edit-form-group">
          <label htmlFor="Team2ID">Team 2</label>
          <select name="Team2ID" id="Team2ID" value={matchData.Team2ID} onChange={handleChange}>
            <option value="">Select Team 2</option>
            {teams.map(team => (
              <option key={team.TeamID} value={team.TeamID}>
                {team.TeamName}
              </option>
            ))}
          </select>
        </div>

        <div className="edit-form-group">
          <label htmlFor="Result">Result</label>
          <input
            type="text"
            name="Result"
            id="Result"
            value={matchData.Result}
            onChange={handleChange}
            placeholder="e.g. 3-1 or TBD"
          />
        </div>

        <div className="edit-form-actions">
          <button type="submit" className="edit-btn-update">Update Match</button>
          <button
            type="button"
            className="edit-btn-cancel"
            onClick={() => navigate('/admin/matchdashboard')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMatch;
