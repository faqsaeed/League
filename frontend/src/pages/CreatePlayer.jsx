import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
import adminCheck from "../services/adminCheck";
import { useNavigate } from 'react-router-dom';
import "../styles/PlayerDashboard.css";



function CreatePlayerForm({ teamname, onSuccess }) {
  const { ID } = useParams();
  const [formData, setFormData] = useState({
    Name: "",
    Age: "",
    Position: "",
    TeamID: ID || ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectToPlayerDashboard, setRedirectToPlayerDashboard] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();


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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!isAdmin) {
      alert("You are not authorized to create a player.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/players", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      console.log("Response:", res);
      setFormData({ ...formData, Name: "", Age: "", Position: "" });
      setError("");
      
      // Set success message and state
      setSuccessMessage("Player created successfully!");
      setSuccess(true);
      
      // Call the onSuccess callback if provided
      if (onSuccess) onSuccess();
      
      // Set timeout to redirect after showing success message
      setTimeout(() => {
        setRedirectToPlayerDashboard(true);
      }, 2000); // Redirect after 2 seconds
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create player. Please try again.");
      setSuccess(false);
    }
  };

  // Redirect to player dashboard if success and timeout complete
  if (redirectToPlayerDashboard) {
    return <Navigate to={`/admin/playerdashboard/${ID}`} />;
  }

  return (
    <form className="create-player-form" onSubmit={handleSubmit}>
      <h3>Add New Player {teamname && `to ${teamname}`}</h3>
      
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{successMessage}</p>}
      
      <input
        type="text"
        placeholder="Name"
        value={formData.Name}
        onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Age"
        value={formData.Age}
        onChange={(e) => setFormData({ ...formData, Age: Number(e.target.value) })}
        required
      />
      <input
        type="text"
        placeholder="Position"
        value={formData.Position}
        onChange={(e) => setFormData({ ...formData, Position: e.target.value })}
        required
      />
      <button type="submit" disabled={success}>Add Player</button>
    </form>
  );
}

export default CreatePlayerForm;