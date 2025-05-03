import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/TeamForm.css";

function CreateTeam() {
  const [Name, setName] = useState("");
  const [Coach, setCoach] = useState("");
  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const teamResponse = await axios.post(
        "http://localhost:5000/api/teams",
        {
          Name,
          Coach
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const teamID = teamResponse.data.teamID; // Get the teamID from the response

      // 2. Create the owner user
      await axios.post(
        "http://localhost:5000/api/users",
        {
          Username,
          Password,
          Role: "Owner",
          TeamID: teamID // Send the teamID along with the user creation
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      navigate("/admin/teamdashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="team-form-container">
      <h2>Create Team</h2>
      <form onSubmit={handleSubmit} className="team-form">
        {error && <p className="form-error">{error}</p>}

        <label>Team Name</label>
        <input type="text" value={Name} onChange={(e) => setName(e.target.value)} required />

        <label>Coach Name</label>
        <input type="text" value={Coach} onChange={(e) => setCoach(e.target.value)} required />

        <h3>Owner Details</h3>
        <label>Owner Name</label>
        <input type="text" value={Username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Owner Password</label>
        <input type="Password" value={Password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Create Team</button>
      </form>
    </div>
  );
}

export default CreateTeam;
