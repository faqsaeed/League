import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/MatchDashboard.css';
import adminCheck from '../services/adminCheck';
import axios from 'axios';

const MatchDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [matches, setMatches] = useState([]);

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
    if (isAdmin) {
      fetchMatches();
    }
  }, [isAdmin]);

  const fetchMatches = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/matches');
      setMatches(res.data);
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  };

  const handleDelete = async (matchID) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/matches/${matchID}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setMatches(matches.filter(match => match.MatchID !== matchID));
      window.location.reload(true);
    } catch (err) {
      console.error('Error deleting match:', err);
    }

  };

  return (
    <div className="match-dashboard">
      <h2>Match Admin Dashboard</h2>

      <div className="dashboard-actions">
        <button 
          className="action-button create" 
          onClick={() => navigate('/admin/creatematch')}
        >
          Create New Match
        </button>
      </div>

      <div className="match-list">
        <h3>All Matches</h3>
        {matches.length === 0 ? (
          <p>No matches found.</p>
        ) : (
          <table className="match-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Venue</th>
                <th>Team 1</th>
                <th>Team 2</th>
                <th>Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(match => (
                <tr key={match.MatchID}>
                  <td>{new Date(match.Date).toLocaleDateString()}</td>
                  <td>{match.Venue}</td>
                  <td>{match.Team1Name}</td>
                  <td>{match.Team2Name}</td>
                  <td>{match.Result}</td>
                  <td>
                    <button 
                      className="edit-btn" 
                      onClick={() => navigate(`/admin/editmatch/${match.MatchID}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(match.MatchID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MatchDashboard;
