const sql = require('mssql');
const config = require('../config/connectDB');

exports.getPlayerStats = async (req, res) => {
  try {
    const { name } = req.params;
    const pool = await sql.connect(config);
    
    const result = await pool.request()
      .input('name', sql.VarChar(255), name)
      .query(`
        SELECT p.PlayerID, p.Name, p.Age, p.Position, p.TeamID, 
               ps.Runs, ps.Wickets, ps.TotalInnings
        FROM Players p
        LEFT JOIN PlayerStats ps ON p.PlayerID = ps.PlayerID
        WHERE p.Name = @name
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }
    
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching player stats:", error);
    res.status(500).json({ error: "Failed to retrieve player statistics" });
  }
};

exports.createPlayerStats = async (req, res) => {
  try {
    const { playerID, runs, wickets, totalInnings } = req.body;
    
    if (!playerID || runs === undefined || wickets === undefined || totalInnings === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const pool = await sql.connect(config);
    
    const playerCheck = await pool.request()
      .input('playerID', sql.Int, playerID)
      .query('SELECT PlayerID FROM Players WHERE PlayerID = @playerID');
      
    if (playerCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }
    
    const statsCheck = await pool.request()
      .input('playerID', sql.Int, playerID)
      .query('SELECT PlayerID FROM PlayerStats WHERE PlayerID = @playerID');
      
    if (statsCheck.recordset.length > 0) {
      return res.status(400).json({ message: "Stats already exist for this player. Use update instead." });
    }
    
    await pool.request()
      .input('playerID', sql.Int, playerID)
      .input('runs', sql.Int, runs)
      .input('wickets', sql.Int, wickets)
      .input('totalInnings', sql.Int, totalInnings)
      .query(`
        INSERT INTO PlayerStats (PlayerID, Runs, Wickets, TotalInnings)
        VALUES (@playerID, @runs, @wickets, @totalInnings)
      `);
    
    res.status(201).json({ 
      message: "Player stats created successfully",
      data: { playerID, runs, wickets, totalInnings }
    });
  } catch (error) {
    console.error("Error creating player stats:", error);
    res.status(500).json({ error: "Failed to create player statistics" });
  }
};

exports.updatePlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { runs, wickets, totalInnings } = req.body;
    
    if (runs === undefined && wickets === undefined && totalInnings === undefined) {
      return res.status(400).json({ message: "At least one field must be provided for update" });
    }
    
    const pool = await sql.connect(config);
    
    const statsCheck = await pool.request()
      .input('playerID', sql.Int, id)
      .query('SELECT PlayerID FROM PlayerStats WHERE PlayerID = @playerID');
      
    if (statsCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Stats not found for this player" });
    }
    
    let updateQuery = 'UPDATE PlayerStats SET ';
    const request = pool.request().input('playerID', sql.Int, id);
    
    const updateFields = [];
    
    if (runs !== undefined) {
      updateFields.push('Runs = @runs');
      request.input('runs', sql.Int, runs);
    }
    
    if (wickets !== undefined) {
      updateFields.push('Wickets = @wickets');
      request.input('wickets', sql.Int, wickets);
    }
    
    if (totalInnings !== undefined) {
      updateFields.push('TotalInnings = @totalInnings');
      request.input('totalInnings', sql.Int, totalInnings);
    }
    
    updateQuery += updateFields.join(', ') + ' WHERE PlayerID = @playerID';
    
    await request.query(updateQuery);
    
    res.status(200).json({ 
      message: "Player stats updated successfully",
      playerID: id
    });
  } catch (error) {
    console.error("Error updating player stats:", error);
    res.status(500).json({ error: "Failed to update player statistics" });
  }
};

exports.deletePlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    
    const statsCheck = await pool.request()
      .input('playerID', sql.Int, id)
      .query('SELECT PlayerID FROM PlayerStats WHERE PlayerID = @playerID');
      
    if (statsCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Stats not found for this player" });
    }
    
    await pool.request()
      .input('playerID', sql.Int, id)
      .query('DELETE FROM PlayerStats WHERE PlayerID = @playerID');
    
    res.status(200).json({ 
      message: "Player stats deleted successfully",
      playerID: id
    });
  } catch (error) {
    console.error("Error deleting player stats:", error);
    res.status(500).json({ error: "Failed to delete player statistics" });
  }
};