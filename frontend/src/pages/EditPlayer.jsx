import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import adminCheck from "../services/adminCheck";
import "../styles/PlayerDashboard.css";

function EditPlayerForm({ player: propPlayer, onClose, onSuccess }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(propPlayer || null);
  const [loading, setLoading] = useState(!propPlayer);
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
  // Initialize with default empty values to prevent undefined errors
  const [formData, setFormData] = useState({
    Name: "",
    Age: 0,
    Position: "",
    TeamID: "",
    Runs: 0,
    Wickets: 0,
    TotalInnings: 0
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch player data if not provided as prop
  useEffect(() => {
    // If player is provided via props, use that
    if (propPlayer) {
      setPlayer(propPlayer);
      setLoading(false);
      return;
    }
    

    // Otherwise, fetch player data using ID from URL
    const playerId = id;
 
    if (playerId) {
      setLoading(true);
      axios.get(`http://localhost:5000/api/players/play/${playerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then(response => {
        setPlayer(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch player data:", err);
        setError("Failed to load player data. Please try again.");
        setLoading(false);
      });
    }
  }, [propPlayer, id]);

  // Update formData when player data becomes available
  useEffect(() => {
    if (player) {
      setFormData({
        Name: player.Name || "",
        Age: player.Age || 0,
        Position: player.Position || "",
        TeamID: player.TeamID || "",
        Runs: player.Runs || 0,
        Wickets: player.Wickets || 0,
        TotalInnings: player.TotalInnings || 0
      });
    }
  }, [player]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    
    // Use player ID from state if available, otherwise from URL params
    const playerId = player?.PlayerID || id;
    
    axios
      .put(`http://localhost:5000/api/players/${playerId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then((response) => {
        setIsSubmitting(false);
        setSuccessMessage(`Player ${formData.Name} has been successfully updated!`);
        
        // Wait a moment before navigating to main
        setTimeout(() => {
          // Call onSuccess if provided
          if (onSuccess) {
            onSuccess(response.data);
          }
          // Navigate to main dashboard
          navigate(`/admin/playerdashboard/${player.TeamID}`);
        }, 1500);
      })
      .catch((err) => {
        setIsSubmitting(false);
        setError(err.response?.data?.message || "Failed to update player");
        console.error(err);
      });
  };

  // Show loading state
  if (loading) {
    return <div className="loading-indicator">Loading player data...</div>;
  }

  // Show error if player couldn't be loaded
  if (!player && !loading) {
    return (
      <div className="error-container">
        <p className="error-message">{error || "Player not found"}</p>
        <button className="cancel-button" onClick={onClose}>Go Back</button>
      </div>
    );
  }
  
  return (
    <form className="edit-player-form" onSubmit={handleSubmit}>
      <h3>Edit Player: {player.Name}</h3>
      
      {/* Display success or error message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label>Player Name</label>
        <input
          type="text"
          value={formData.Name}
          onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="form-group">
        <label>Age</label>
        <input
          type="number"
          value={formData.Age}
          onChange={(e) => setFormData({ ...formData, Age: Number(e.target.value) })}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="form-group">
        <label>Position</label>
        <input
          type="text"
          value={formData.Position}
          onChange={(e) => setFormData({ ...formData, Position: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="form-section">
        <h4>Player Statistics</h4>
        
        <div className="form-group">
          <label>Total Innings <span className="required">*</span></label>
          <input
            type="number"
            value={formData.TotalInnings}
            onChange={(e) => setFormData({ ...formData, TotalInnings: Number(e.target.value) })}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label>Runs</label>
          <input
            type="number"
            value={formData.Runs}
            onChange={(e) => setFormData({ ...formData, Runs: Number(e.target.value) })}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label>Wickets</label>
          <input
            type="number"
            value={formData.Wickets}
            onChange={(e) => setFormData({ ...formData, Wickets: Number(e.target.value) })}
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="update-button" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Player"}
        </button>
        <button 
          type="button" 
          onClick={onClose} 
          className="cancel-button"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EditPlayerForm;