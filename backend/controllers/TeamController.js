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
        SELECT t.TeamID, t.Name, t.Coach, t.Owner,
               u.Username as OwnerName,
               COUNT(DISTINCT p.PlayerID) as PlayerCount
        FROM Teams t
        LEFT JOIN Users u ON t.Owner = u.UserID
        LEFT JOIN Players p ON t.TeamID = p.TeamID
        GROUP BY t.TeamID, t.Name, t.Coach, t.Owner, u.Username
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
    const { Name, Coach, Owner } = req.body;
    
    // Validate required fields
    if (!Name || !Coach || !Owner) {
      return res.status(400).json({ message: 'Name, Coach, and Owner are required' });
    }
    
    const pool = await mssql.connect(dbConfig);
    
    // Check if owner exists and has 'Owner' role
    const ownerCheck = await pool.request()
      .input('ownerID', mssql.Int, Owner)
      .query(`
        SELECT UserID, Role 
        FROM Users 
        WHERE UserID = @ownerID
      `);
    
    if (ownerCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    
    if (ownerCheck.recordset[0].Role !== 'Owner') {
      return res.status(403).json({ message: 'User must have Owner role to own a team' });
    }
    
    // Check if owner already has a team
    const existingTeamCheck = await pool.request()
      .input('ownerID', mssql.Int, Owner)
      .query(`
        SELECT TeamID 
        FROM Teams 
        WHERE Owner = @ownerID
      `);
    
    if (existingTeamCheck.recordset.length > 0) {
      return res.status(409).json({ message: 'Owner already has a team' });
    }
    
    // Start a transaction
    const transaction = new mssql.Transaction(pool);
    await transaction.begin();
    
    try {
      // Insert team
      const teamResult = await transaction.request()
        .input('name', mssql.VarChar(255), Name)
        .input('coach', mssql.VarChar(255), Coach)
        .input('owner', mssql.Int, Owner)
        .query(`
          INSERT INTO Teams (Name, Coach, Owner)
          OUTPUT INSERTED.TeamID
          VALUES (@name, @coach, @owner)
        `);
      
      const teamID = teamResult.recordset[0].TeamID;
      
      // Update owner's TeamID
      await transaction.request()
        .input('teamID', mssql.Int, teamID)
        .input('ownerID', mssql.Int, Owner)
        .query(`
          UPDATE Users
          SET TeamID = @teamID
          WHERE UserID = @ownerID
        `);
      
      await transaction.commit();
      
      res.status(201).json({
        message: 'Team created successfully',
        teamID: teamID
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Error creating team', error: error.message });
  }
};

// Update an existing team
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Coach, Owner } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }
    
    const teamID = parseInt(id);
    
    const pool = await mssql.connect(dbConfig);
    
    // Check if team exists
    const teamCheck = await pool.request()
      .input('teamID', mssql.Int, teamID)
      .query(`
        SELECT TeamID, Owner 
        FROM Teams 
        WHERE TeamID = @teamID
      `);
    
    if (teamCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Get current owner
    const currentOwnerID = teamCheck.recordset[0].Owner;
    
    // If changing owner, check if new owner exists and has 'Owner' role
    let newOwnerID = null;
    
    if (Owner && Owner !== currentOwnerID) {
      newOwnerID = Owner;
      
      const ownerCheck = await pool.request()
        .input('ownerID', mssql.Int, newOwnerID)
        .query(`
          SELECT UserID, Role 
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
      const existingTeamCheck = await pool.request()
        .input('ownerID', mssql.Int, newOwnerID)
        .query(`
          SELECT TeamID 
          FROM Teams 
          WHERE Owner = @ownerID
        `);
      
      if (existingTeamCheck.recordset.length > 0) {
        return res.status(409).json({ message: 'New owner already has a team' });
      }
    }
    
    // Start a transaction if we're changing the owner
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
      
      if (newOwnerID) {
        updateFields.push('Owner = @ownerID');
        requestObj.input('ownerID', mssql.Int, newOwnerID);
      }
      
      if (updateFields.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'No fields to update' });
      }
      
      // Update team
      updateTeamQuery += updateFields.join(', ') + ' WHERE TeamID = @teamID';
      await requestObj.query(updateTeamQuery);
      
      // If changing owner, update both old and new owner's TeamID
      if (newOwnerID) {
        // Remove team association from old owner
        await transaction.request()
          .input('currentOwnerID', mssql.Int, currentOwnerID)
          .query(`
            UPDATE Users
            SET TeamID = NULL
            WHERE UserID = @currentOwnerID
          `);
        
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

// Delete a team
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }
    
    const teamID = parseInt(id);
    
    const pool = await mssql.connect(dbConfig);
    
    // Check if team exists
    const teamCheck = await pool.request()
      .input('teamID', mssql.Int, teamID)
      .query(`
        SELECT TeamID, Owner 
        FROM Teams 
        WHERE TeamID = @teamID
      `);
    
    if (teamCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Get current owner
    const currentOwnerID = teamCheck.recordset[0].Owner;
    
    // Start a transaction
    const transaction = new mssql.Transaction(pool);
    await transaction.begin();
    
    try {
      // First, update any users associated with this team to have NULL TeamID
      await transaction.request()
        .input('teamID', mssql.Int, teamID)
        .query(`
          UPDATE Users
          SET TeamID = NULL
          WHERE TeamID = @teamID
        `);
      
      // Delete the team (this will cascade to delete players due to the ON DELETE CASCADE constraint)
      await transaction.request()
        .input('teamID', mssql.Int, teamID)
        .query(`
          DELETE FROM Teams
          WHERE TeamID = @teamID
        `);
      
      await transaction.commit();
      
      res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Error deleting team', error: error.message });
  }
};