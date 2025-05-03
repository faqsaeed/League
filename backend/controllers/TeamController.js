// TeamController.js
const mssql = require('mssql');
const dbConfig = require('../config/connectDB');

// Get all teams
exports.getTeams = async (req, res) => {
  try {
    const pool = await mssql.connect(dbConfig);
    
    // Get teams with owner information and player count
    const result = await pool.request()
      .query(`
        SELECT t.TeamID, t.Name, t.Coach,
               u.UserID as OwnerID, u.Username as OwnerName,
               COUNT(DISTINCT p.PlayerID) as PlayerCount
        FROM Teams t
        LEFT JOIN Users u ON t.TeamID = u.TeamID AND u.Role = 'Owner'
        LEFT JOIN Players p ON t.TeamID = p.TeamID
        GROUP BY t.TeamID, t.Name, t.Coach, u.UserID, u.Username
        ORDER BY t.Name
      `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
};

// Create a new team 
exports.createTeam = async (req, res) => {
  try {
    const { Name, Coach } = req.body;

    if (!Name || !Coach) {
      return res.status(400).json({ message: 'Name and Coach are required' });
    }

    const pool = await mssql.connect(dbConfig);

    const teamResult = await pool.request()
      .input('name', mssql.VarChar(255), Name)
      .input('coach', mssql.VarChar(255), Coach)
      .query(`
        INSERT INTO Teams (Name, Coach)
        OUTPUT INSERTED.TeamID
        VALUES (@name, @coach)
      `);

    const teamID = teamResult.recordset[0].TeamID;


    res.status(201).json({
      message: 'Team created successfully',
      teamID
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Error creating team', error: error.message });
  }
};
// Update an existing team
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Coach, NewOwnerID } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }
    
    const teamID = parseInt(id);
    
    const pool = await mssql.connect(dbConfig);
    
    // Check if team exists
    const teamCheck = await pool.request()
      .input('teamID', mssql.Int, teamID)
      .query(`
        SELECT TeamID
        FROM Teams 
        WHERE TeamID = @teamID
      `);
    
    if (teamCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Get current owner (if any)
    const currentOwnerCheck = await pool.request()
      .input('teamID', mssql.Int, teamID)
      .query(`
        SELECT UserID
        FROM Users
        WHERE TeamID = @teamID AND Role = 'Owner'
      `);
    
    const currentOwnerID = currentOwnerCheck.recordset.length > 0 ? 
      currentOwnerCheck.recordset[0].UserID : null;
    
    // If changing owner, check if new owner exists and has 'Owner' role
    let newOwnerID = null;
    
    if (NewOwnerID && NewOwnerID !== currentOwnerID) {
      newOwnerID = NewOwnerID;
      
      const ownerCheck = await pool.request()
        .input('ownerID', mssql.Int, newOwnerID)
        .query(`
          SELECT UserID, Role, TeamID
          FROM Users 
          WHERE UserID = @ownerID
        `);
      
      if (ownerCheck.recordset.length === 0) {
        return res.status(404).json({ message: 'New owner not found' });
      }
      
      if (ownerCheck.recordset[0].Role !== 'Owner') {
        return res.status(403).json({ message: 'User must have Owner role to own a team' });
      }
      
      // Check if new owner already has a team
      if (ownerCheck.recordset[0].TeamID) {
        return res.status(409).json({ message: 'New owner already has a team' });
      }
    }
    
    // Start a transaction
    const transaction = new mssql.Transaction(pool);
    await transaction.begin();
    
    try {
      // Build update query for Teams table
      let updateTeamQuery = 'UPDATE Teams SET ';
      const updateFields = [];
      const requestObj = transaction.request().input('teamID', mssql.Int, teamID);
      
      if (Name) {
        updateFields.push('Name = @name');
        requestObj.input('name', mssql.VarChar(255), Name);
      }
      
      if (Coach) {
        updateFields.push('Coach = @coach');
        requestObj.input('coach', mssql.VarChar(255), Coach);
      }
      
      if (updateFields.length === 0 && !newOwnerID) {
        await transaction.rollback();
        return res.status(400).json({ message: 'No fields to update' });
      }
      
      // Update team if there are fields to update
      if (updateFields.length > 0) {
        updateTeamQuery += updateFields.join(', ') + ' WHERE TeamID = @teamID';
        await requestObj.query(updateTeamQuery);
      }
      
      // If changing owner, update both old and new owner's TeamID
      if (newOwnerID) {
        // Remove team association from old owner if exists
        if (currentOwnerID) {
          await transaction.request()
            .input('currentOwnerID', mssql.Int, currentOwnerID)
            .query(`
              UPDATE Users
              SET TeamID = NULL
              WHERE UserID = @currentOwnerID
            `);
        }
        
        // Add team association to new owner
        await transaction.request()
          .input('newOwnerID', mssql.Int, newOwnerID)
          .input('teamID', mssql.Int, teamID)
          .query(`
            UPDATE Users
            SET TeamID = @teamID
            WHERE UserID = @newOwnerID
          `);
      }
      
      await transaction.commit();
      
      res.status(200).json({ message: 'Team updated successfully' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Error updating team', error: error.message });
  }
};
// Delete a team and its owner
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }

    const teamID = parseInt(id);
    const pool = await mssql.connect(dbConfig);

    // Check if the team exists
    const teamCheck = await pool.request()
      .input('teamID', mssql.Int, teamID)
      .query('SELECT * FROM Teams WHERE TeamID = @teamID');

    if (teamCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Delete the owner of the team (if exists)
    await pool.request()
      .input('teamID', mssql.Int, teamID)
      .query("DELETE FROM Users WHERE TeamID = @teamID AND Role = 'Owner'");

    // Delete the team
    await pool.request()
      .input('teamID', mssql.Int, teamID)
      .query('DELETE FROM Teams WHERE TeamID = @teamID');

    res.status(200).json({ message: 'Team and its owner deleted successfully' });
  } catch (error) {
    console.error('Error deleting team and user:', error);
    res.status(500).json({ message: 'Error deleting team and user', error: error.message });
  }
};



// Get a specific team by ID
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }
    
    const teamID = parseInt(id);
    
    const pool = await mssql.connect(dbConfig);
    
    // Get team details with owner information and player count
    const result = await pool.request()
      .input('teamID', mssql.Int, teamID)
      .query(`
        SELECT t.TeamID, t.Name, t.Coach,
               u.UserID as OwnerID, u.Username as OwnerName,
               COUNT(DISTINCT p.PlayerID) as PlayerCount
        FROM Teams t
        LEFT JOIN Users u ON t.TeamID = u.TeamID AND u.Role = 'Owner'
        LEFT JOIN Players p ON t.TeamID = p.TeamID
        WHERE t.TeamID = @teamID
        GROUP BY t.TeamID, t.Name, t.Coach, u.UserID, u.Username
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Error fetching team', error: error.message });
  }
};