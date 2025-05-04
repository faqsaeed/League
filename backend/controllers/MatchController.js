// MatchController.js
const mssql = require('mssql');
const dbConfig = require('../config/connectDB');

// Get all matches
exports.getMatches = async (req, res) => {
  try 
  {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT m.MatchID, m.Date, m.Venue, m.Result,
               m.Team1ID, t1.Name as Team1Name,
               m.Team2ID, t2.Name as Team2Name
        FROM Matches m
        JOIN Teams t1 ON m.Team1ID = t1.TeamID
        JOIN Teams t2 ON m.Team2ID = t2.TeamID
        ORDER BY m.Date DESC
      `);
    
    res.status(200).json(result.recordset);
  } catch (error) 
  {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches', error: error.message });
  }
};
// Get match by ID
exports.getMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const matchID = parseInt(id, 10);

    if (isNaN(matchID)) {
      return res.status(400).json({ message: 'Invalid match ID' });
    }

    const pool = await mssql.connect(dbConfig);
    const result = await pool.request()
      .input('matchID', mssql.Int, matchID)
      .query(`
        SELECT m.MatchID, m.Date, m.Venue, m.Team1ID, m.Team2ID,t1.Name AS Team1Name,t2.Name AS Team2Name, m.Result
        FROM Matches AS m
        JOIN Teams AS t1 ON m.Team1ID = t1.TeamID
        JOIN Teams AS t2 ON m.Team2ID = t2.TeamID
        WHERE m.MatchID = @matchID;
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: `No match found with ID '${matchID}'`});
    }

    // return a single object, not an array
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching match by ID:', error);
    res.status(500).json({
      message: 'Internal server error while fetching the match',
      error: error.message
    });
  }
};

// Get matches by team Name
exports.getMatchesByTeam = async (req, res) => {
  try {
    const { teamName } = req.params;

    if (!teamName || teamName.trim() === '') {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const pool = await mssql.connect(dbConfig);

    const result = await pool.request()
      .input('teamName', mssql.VarChar(255), teamName.trim())
      .query(`
        SELECT  m.MatchID, m.Date, m.Venue, t1.Name AS Team1, t2.Name AS Team2, m.Result
        FROM Matches m
        JOIN Teams t1 ON m.Team1ID = t1.TeamID
        JOIN Teams t2 ON m.Team2ID = t2.TeamID
        WHERE t1.Name = @teamName OR t2.Name = @teamName
        ORDER BY m.Date DESC;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: `No matches found for team '${teamName}'` });
    }

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching matches by team:', error);
    res.status(500).json({
      message: 'Internal server error while fetching matches',
      error: error.message
    });
  }
};

// Create a new match
exports.createMatch = async (req, res) => {
  try {
    const { Date: MatchDate, Venue, Team1ID, Team2ID, Result } = req.body;
    
    // Validate required fields
    if (!MatchDate || !Venue || !Team1ID || !Team2ID || !Result) {
      return res.status(400).json({ message: 'All fields are required: Date, Venue, Team1ID, Team2ID, Result' });
    }
    
    // Validate that teams are different
    if (Team1ID === Team2ID) {
      return res.status(400).json({ message: 'Team1ID and Team2ID must be different' });
    }
    
    const pool = await mssql.connect(dbConfig);
    
    // Check if both teams exist
    const teamsCheck = await pool.request()
      .input('team1ID', mssql.Int, Team1ID)
      .input('team2ID', mssql.Int, Team2ID)
      .query(`
        SELECT t1.TeamID as Team1Exists, t2.TeamID as Team2Exists
        FROM (SELECT TeamID FROM Teams WHERE TeamID = @team1ID) t1
        CROSS JOIN (SELECT TeamID FROM Teams WHERE TeamID = @team2ID) t2
      `);
    
    if (teamsCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'One or both teams not found' });
    }
    
    // Insert match
    const result = await pool.request()
      .input('date', mssql.Date, new Date(MatchDate))
      .input('venue', mssql.VarChar(255), Venue)
      .input('team1ID', mssql.Int, Team1ID)
      .input('team2ID', mssql.Int, Team2ID)
      .input('result', mssql.VarChar(255), Result)
      .query(`
        INSERT INTO Matches (Date, Venue, Team1ID, Team2ID, Result)
        OUTPUT INSERTED.MatchID
        VALUES (@date, @venue, @team1ID, @team2ID, @result)
      `);
    
    const matchID = result.recordset[0].MatchID;
    
    res.status(201).json({
      message: 'Match created successfully',
      matchID: matchID
    });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ message: 'Error creating match', error: error.message });
  }
};
exports.updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const matchID = parseInt(id, 10);

    if (isNaN(matchID)) {
      return res.status(400).json({ message: 'Invalid Match ID' });
    }

    const pool = await mssql.connect(dbConfig);

    // Get existing data first
    const existing = await pool.request()
      .input('matchID', mssql.Int, matchID)
      .query(`SELECT * FROM Matches WHERE MatchID = @matchID`);

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const previous = existing.recordset[0];
    const {
      Date = previous.Date,
      Venue = previous.Venue,
      Team1ID = previous.Team1ID,
      Team2ID = previous.Team2ID,
      Result = previous.Result
    } = req.body;

    if (Team1ID === Team2ID) {
      return res.status(400).json({ message: 'Team1ID and Team2ID must be different' });
    }

    await pool.request()
      .input('Date', mssql.Date, Date)
      .input('Venue', mssql.VarChar(255), Venue)
      .input('Team1ID', mssql.Int, Team1ID)
      .input('Team2ID', mssql.Int, Team2ID)
      .input('Result', mssql.VarChar(50), Result)
      .input('matchID', mssql.Int, matchID)
      .query(`
        UPDATE Matches
        SET Date = @Date,
            Venue = @Venue,
            Team1ID = @Team1ID,
            Team2ID = @Team2ID,
            Result = @Result
        WHERE MatchID = @matchID
      `);

    res.status(200).json({ message: 'Match updated successfully' });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Delete a match
exports.deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid match ID' });
    }
    
    const matchID = parseInt(id);
    
    const pool = await mssql.connect(dbConfig);
    
    // Check if match exists
    const matchCheck = await pool.request()
      .input('matchID', mssql.Int, matchID)
      .query('SELECT MatchID FROM Matches WHERE MatchID = @matchID');
    
    if (matchCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Delete match
    await pool.request()
      .input('matchID', mssql.Int, matchID)
      .query('DELETE FROM Matches WHERE MatchID = @matchID');
    
    res.status(200).json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ message: 'Error deleting match', error: error.message });
  }
};