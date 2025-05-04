import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import adminCheck from '../services/adminCheck';
import '../styles/CreateMatch.css';

const CreateMatch = () => {
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ Date: '', Venue: '', Team1ID: '', Team2ID: '', Result: '' });
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
        const checkAdminStatus = () => {
          const authStatus = adminCheck();
          
          if (!authStatus.isAuthenticated || !authStatus.isAdmin) 
          {
            navigate('/');
          }
          setIsAdmin(true);      
        };
        
        checkAdminStatus();

      fetchTeams();
    }
  , [navigate]);

  const fetchTeams = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/teams');
      setTeams(res.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/matches', form,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
      alert('Match created successfully!');
      navigate('/admin/matchdashboard');
    } catch (err) {
      console.error('Error creating match:', err);
      alert('Failed to create match');
    }
  };

  return (
    <div className="create-match">
      <h2>Create New Match</h2>
      <form onSubmit={handleSubmit}>
        <input type="date" name="Date" value={form.Date} onChange={handleChange} required />
        <input type="text" name="Venue" placeholder="Venue" value={form.Venue} onChange={handleChange} required />
        <select name="Team1ID" value={form.Team1ID} onChange={handleChange} required>
          <option value="">Select Team 1</option>
          {teams.map(team => <option key={team.TeamID} value={team.TeamID}>{team.Name}</option>)}
        </select>
        <select name="Team2ID" value={form.Team2ID} onChange={handleChange} required>
          <option value="">Select Team 2</option>
          {teams.map(team => <option key={team.TeamID} value={team.TeamID}>{team.Name}</option>)}
        </select>
        <input type="text" name="Result" placeholder="Result" value={form.Result} onChange={handleChange} />
        <button type="submit">Create Match</button>
      </form>
    </div>
  );
};

export default CreateMatch;
