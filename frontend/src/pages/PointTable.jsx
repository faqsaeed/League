import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PointTable.css"; 

const PointsTable = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/pointTable");
        setTableData(response.data);
      } catch (error) {
        console.error("Error fetching point table:", error);
      }
    };

    fetchPoints();
  }, []);

  return (
    <div className="points-table-container">
      <h2>Points Table</h2>
      <table className="points-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>Matches</th>
            <th>Wins</th>
            <th>Draws</th>
            <th>Losses</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((team, index) => (
            <tr key={team.TeamName}>
              <td>{index + 1}</td>
              <td>{team.TeamName}</td>
              <td>{team.TotalMatches}</td>
              <td>{team.Wins}</td>
              <td>{team.Draws}</td>
              <td>{team.Losses}</td>
              <td>{team.Points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PointsTable;
