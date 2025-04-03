// PlayerController.js
const mssql = require('mssql');
const dbConfig = require('../config/connectDB');

// Get all players
exports.getPlayers = async (req, res) => {
  try {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT p.PlayerID, p.Name, p.Age, p.Position, p.TeamID, t.Name as TeamName, 
               ps.Runs, ps.Wickets, ps.TotalInnings
        FROM Players p
        LEFT JOIN Teams t ON p.TeamID = t.TeamID
        LEFT JOIN PlayerStats ps ON p.PlayerID = ps.PlayerID
      `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: 'Error fetching players', error: error.message });
  }
};

// Get players by team ID
exports.getPlayersByTeam = async (req, res) => {
  try {
    const { teamID } = req.params;
    
    if (!teamID || isNaN(parseInt(teamID))) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }
    
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request()
      .input('teamID', mssql.Int, parseInt(teamID))
      .query(`
        SELECT p.PlayerID, p.Name, p.Age, p.Position, p.TeamID, t.Name as TeamName, 
               ps.Runs, ps.Wickets, ps.TotalInnings
        FROM Players p
        LEFT JOIN Teams t ON p.TeamID = t.TeamID
        LEFT JOIN PlayerStats ps ON p.PlayerID = ps.PlayerID
        WHERE p.TeamID = @teamID
      `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching players by team:', error);
    res.status(500).json({ message: 'Error fetching players by team', error: error.message });
  }
};

// Create a new player
exports.createPlayer = async (req, res) => {
  try {
    const { Name, Age, Position, TeamID } = req.body;
    
    // Validate required fields
    if (!Name || !Age || !Position || !TeamID) {
      return res.status(400).json({ message: 'All fields are required: Name, Age, Position, TeamID' });
    }
    
    // Start a transaction
    const pool = await mssql.connect(dbConfig);
    const transaction = new mssql.Transaction(pool);
    await transaction.begin();
    
    try {
      // Check if TeamID exists
      const teamCheck = await transaction.request()
        .input('teamID', mssql.Int, TeamID)
        .query('SELECT TeamID FROM Teams WHERE TeamID = @teamID');
      
      if (teamCheck.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Team not found' });
      }
      
      // Insert player
      const playerResult = await transaction.request()
        .input('name', mssql.VarChar(255), Name)
        .input('age', mssql.Int, Age)
        .input('position', mssql.VarChar(100), Position)
        .input('teamID', mssql.Int, TeamID)
        .query(`
          INSERT INTO Players (Name, Age, Position, TeamID)
          OUTPUT INSERTED.PlayerID
          VALUES (@name, @age, @position, @teamID)
        `);
      
      const playerID = playerResult.recordset[0].PlayerID;
      
      // Initialize player stats
      await transaction.request()
        .input('playerID', mssql.Int, playerID)
        .input('runs', mssql.Int, 0)
        .input('wickets', mssql.Int, 0)
        .input('totalInnings', mssql.Int, 0)
        .query(`
          INSERT INTO PlayerStats (PlayerID, Runs, Wickets, TotalInnings)
          VALUES (@playerID, @runs, @wickets, @totalInnings)
        `);
      
      await transaction.commit();
      
      res.status(201).json({ 
        message: 'Player created successfully',
        playerID: playerID 
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({ message: 'Error creating player', error: error.message });
  }
};

// Update an existing player
exports.updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Age, Position, TeamID, Runs, Wickets, TotalInnings } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid player ID' });
    }
    
    const playerID = parseInt(id);
    
    // Start a transaction
    const pool = await mssql.connect(dbConfig);
    const transaction = new mssql.Transaction(pool);
    await transaction.begin();
    
    try {
      // Check if player exists
      const playerCheck = await transaction.request()
        .input('playerID', mssql.Int, playerID)
        .query('SELECT PlayerID FROM Players WHERE PlayerID = @playerID');
      
      if (playerCheck.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Player not found' });
      }
      
      // Check if TeamID exists if provided
      if (TeamID) {
        const teamCheck = await transaction.request()
          .input('teamID', mssql.Int, TeamID)
          .query('SELECT TeamID FROM Teams WHERE TeamID = @teamID');
        
        if (teamCheck.recordset.length === 0) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Team not found' });
        }
      }
      
      // Build update query for Players table
      let updatePlayerQuery = 'UPDATE Players SET ';
      const playerRequestObj = transaction.request().input('playerID', mssql.Int, playerID);
      
      const updateFields = [];
      
      if (Name) {
        updateFields.push('Name = @name');
        playerRequestObj.input('name', mssql.VarChar(255), Name);
      }
      
      if (Age) {
        updateFields.push('Age = @age');
        playerRequestObj.input('age', mssql.Int, Age);
      }
      
      if (Position) {
        updateFields.push('Position = @position');
        playerRequestObj.input('position', mssql.VarChar(100), Position);
      }
      
      if (TeamID) {
        updateFields.push('TeamID = @teamID');
        playerRequestObj.input('teamID', mssql.Int, TeamID);
      }
      
      // If player details provided, update Players table
      if (updateFields.length > 0) {
        updatePlayerQuery += updateFields.join(', ') + ' WHERE PlayerID = @playerID';
        await playerRequestObj.query(updatePlayerQuery);
      }
      
      // If stats provided, update PlayerStats table
      if (Runs !== undefined || Wickets !== undefined || TotalInnings !== undefined) {
        // Check if stats record exists
        const statsCheck = await transaction.request()
          .input('playerID', mssql.Int, playerID)
          .query('SELECT PlayerID FROM PlayerStats WHERE PlayerID = @playerID');
        
        const statsRequestObj = transaction.request().input('playerID', mssql.Int, playerID);
        
        if (statsCheck.recordset.length > 0) {
          // Update existing stats
          let updateStatsQuery = 'UPDATE PlayerStats SET ';
          const statsFields = [];
          
          if (Runs !== undefined) {
            statsFields.push('Runs = @runs');
            statsRequestObj.input('runs', mssql.Int, Runs);
          }
          
          if (Wickets !== undefined) {
            statsFields.push('Wickets = @wickets');
            statsRequestObj.input('wickets', mssql.Int, Wickets);
          }
          
          if (TotalInnings !== undefined) {
            statsFields.push('TotalInnings = @totalInnings');
            statsRequestObj.input('totalInnings', mssql.Int, TotalInnings);
          }
          
          if (statsFields.length > 0) {
            updateStatsQuery += statsFields.join(', ') + ' WHERE PlayerID = @playerID';
            await statsRequestObj.query(updateStatsQuery);
          }
        } else {
          // Create new stats record
          await statsRequestObj
            .input('runs', mssql.Int, Runs !== undefined ? Runs : 0)
            .input('wickets', mssql.Int, Wickets !== undefined ? Wickets : 0)
            .input('totalInnings', mssql.Int, TotalInnings !== undefined ? TotalInnings : 0)
            .query(`
              INSERT INTO PlayerStats (PlayerID, Runs, Wickets, TotalInnings)
              VALUES (@playerID, @runs, @wickets, @totalInnings)
            `);
        }
      }
      
      await transaction.commit();
      
      res.status(200).json({ message: 'Player updated successfully' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ message: 'Error updating player', error: error.message });
  }
};

// Delete a player
exports.deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid player ID' });
    }
    
    const playerID = parseInt(id);
    
    const pool = await mssql.connect(dbConfig);
    
    // Check if player exists
    const playerCheck = await pool.request()
      .input('playerID', mssql.Int, playerID)
      .query('SELECT PlayerID FROM Players WHERE PlayerID = @playerID');
    
    if (playerCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // With CASCADE constraints, we only need to delete from the Players table
    // PlayerStats will be automatically deleted
    await pool.request()
      .input('playerID', mssql.Int, playerID)
      .query('DELETE FROM Players WHERE PlayerID = @playerID');
    
    res.status(200).json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ message: 'Error deleting player', error: error.message });
  }
};