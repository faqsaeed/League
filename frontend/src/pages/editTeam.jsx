import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import adminCheck from "../services/adminCheck";
import "../styles/TeamForm.css";

function EditTeam() {
  const { teamId } = useParams();
  const [name, setName] = useState("");
  const [coach, setCoach] = useState("");
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
    axios.get(`http://localhost:5000/api/teams/${teamId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }).then(res => {
      setName(res.data.Name);
      setCoach(res.data.Coach);
    }).catch(err => {
      console.error("Failed to fetch team", err);
    });
  }, [teamId, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/teams/${teamId}`, {
        Name: name,
        Coach: coach,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      navigate("/admin/teamdashboard");
    } catch (error) {
      console.error("Failed to update team", error);
    }
  };

  return (
    <div className="team-form-container">
      <h2>Edit Team</h2>
      <form onSubmit={handleUpdate} className="team-form">
        <label>Team Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />

        <label>Coach Name</label>
        <input type="text" value={coach} onChange={e => setCoach(e.target.value)} />

        <button type="submit">Update Team</button>
      </form>
    </div>
  );
}

export default EditTeam;
