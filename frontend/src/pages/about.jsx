import React from "react";
import '../styles/about.css'; // Import the custom stylesheet

const About = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>Sports League Management System</h1>

        <h2>Group Members</h2>
        <ul>
          <li>Faiq Saeed (23L-0905)</li>
          <li>Rohan (23L-0963)</li>
          <li>Saad Ullah (23L-0695)</li>
        </ul>

        <h2>Abstract</h2>
        <p>
          The Sports League Management System is a web-based application designed to
          manage sports leagues efficiently. It allows administrators, team owners,
          coaches, players, and fans to interact with the system based on their roles.
          Owners can manage players by selling or loaning them to other teams, while
          admins oversee the entire league.
        </p>

        <h2>Description</h2>
        <p>
          The system includes features for team and player management, match scheduling,
          tournament organization, and real-time statistics tracking. It simulates real-world
          sports league dynamics.
        </p>

        <h2>Key Features</h2>

        <h3>1. User Roles</h3>
        <ul>
          <li><strong>Admin:</strong> Manages the entire league (teams, players, matches, tournaments).</li>
          <li><strong>Owner:</strong> Manages their team’s players (sell, loan, approve/reject loan requests).</li>
          <li><strong>Fan:</strong> Views league standings, match results, and player stats.</li>
        </ul>

        <h3>2. Player Transactions</h3>
        <ul>
          <li>Sell Players</li>
          <li>Loan Players</li>
          <li>Loan Requests: Send, approve, or reject loan requests</li>
        </ul>

        <h3>3. Match Management</h3>
        <ul>
          <li>Schedule matches between teams</li>
          <li>Record match results and update player stats</li>
        </ul>

        <h3>4. League Standings</h3>
        <ul>
          <li>Calculate and display team rankings</li>
        </ul>

        <h3>5. Statistics and Analytics</h3>
        <ul>
          <li>Display player and team stats</li>
        </ul>

        <h2>List of Tables</h2>

        <h3>1. Teams</h3>
        <ul>
          <li>TeamID (PK)</li>
          <li>Name</li>
          <li>Coach</li>
          <li>Owner</li>
        </ul>

        <h3>2. Players</h3>
        <ul>
          <li>PlayerID (PK)</li>
          <li>Name</li>
          <li>Age</li>
          <li>Position</li>
          <li>TeamID (FK)</li>
        </ul>

        <h3>3. Matches</h3>
        <ul>
          <li>MatchID (PK)</li>
          <li>Date</li>
          <li>Venue</li>
          <li>Team1ID (FK)</li>
          <li>Team2ID (FK)</li>
          <li>Result</li>
        </ul>

        <h3>4. PlayerStats</h3>
        <ul>
          <li>StatID (PK)</li>
          <li>PlayerID (FK)</li>
          <li>MatchID (FK)</li>
          <li>Runs</li>
          <li>Wickets</li>
          <li>TotalInnings</li>
        </ul>

        <h3>5. PlayerTransactions</h3>
        <ul>
          <li>TransactionID (PK)</li>
          <li>PlayerID (FK)</li>
          <li>FromTeamID (FK)</li>
          <li>ToTeamID (FK)</li>
          <li>Type</li>
          <li>Amount</li>
          <li>LoanStartDate</li>
          <li>LoanEndDate</li>
          <li>Status</li>
        </ul>

        <h3>6. Users</h3>
        <ul>
          <li>UserID (PK)</li>
          <li>Username</li>
          <li>Password</li>
          <li>Role</li>
          <li>TeamID (FK)</li>
        </ul>

        <h2>Conclusion</h2>
        <p>
          The Sports League Management System is a practical and scalable solution for managing
          sports leagues. It automates tasks like match scheduling, standings calculation, and player
          transfers, reducing manual effort and enhancing the overall experience.
        </p>
      </div>
    </div>
  );
};

export default About;
