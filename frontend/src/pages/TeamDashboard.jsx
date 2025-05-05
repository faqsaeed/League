import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link , useNavigate } from "react-router-dom";
import adminCheck from '../services/adminCheck';
import "../styles/TeamDashboard.css";

function TeamDashboard() {
  const [teams, setTeams] = useState([]);
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

    axios.get("http://localhost:5000/api/teams", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }).then(res => setTeams(res.data))
      .catch(err => console.error(err));
  }, [navigate]);

  const handleDelete = async (teamId) => {
    if(isAdmin);
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/teams/${teamId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
      setTeams(prev => prev.filter(team => team.TeamID !== teamId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <Link to="/admin/createteam" className="create-button">+ Create New Team</Link>
      <ul className="team-list">
        {teams.map(team => (
          <li key={team.TeamID} className="team-card">
            <strong>{team.Name}</strong> - Coach: {team.Coach}
            <div className="team-actions">
              <Link to={`../../admin/editteam/${team.TeamID}`} className="edit-link">Edit</Link>
              <button onClick={() => handleDelete(team.TeamID)} className="delete-button">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeamDashboard;
