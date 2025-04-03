// UserController.js
const mssql = require('mssql');
const bcrypt = require('bcrypt');
const dbConfig = require('../config/connectDB');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const pool = await mssql.connect(dbConfig);
    
    // Don't return password hashes
    const result = await pool.request()
      .query(`
        SELECT u.UserID, u.Username, u.Role, u.TeamID, t.Name as TeamName
        FROM Users u
        LEFT JOIN Teams t ON u.TeamID = t.TeamID
      `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { Username, Password, Role, TeamID } = req.body;
    
    // Validate required fields
    if (!Username || !Password || !Role) {
      return res.status(400).json({ message: 'Username, Password, and Role are required' });
    }
    
    // Validate role is in allowed values
    if (Role !== 'Admin' && Role !== 'Owner') {
      return res.status(400).json({ message: 'Role must be either Admin or Owner' });
    }
    
    const pool = await mssql.connect(dbConfig);
    
    // Check if username already exists
    const userCheck = await pool.request()
      .input('username', mssql.VarChar(100), Username)
      .query('SELECT Username FROM Users WHERE Username = @username');
    
    if (userCheck.recordset.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    // Check if TeamID exists if provided
    if (TeamID) {
      const teamCheck = await pool.request()
        .input('teamID', mssql.Int, TeamID)
        .query('SELECT TeamID FROM Teams WHERE TeamID = @teamID');
      
      if (teamCheck.recordset.length === 0) {
        return res.status(404).json({ message: 'Team not found' });
      }
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);
    
    // Insert user
    const result = await pool.request()
      .input('username', mssql.VarChar(100), Username)
      .input('password', mssql.VarChar(255), hashedPassword)
      .input('role', mssql.VarChar(10), Role)
      .input('teamID', TeamID ? mssql.Int : mssql.NVarChar, TeamID || null)
      .query(`
        INSERT INTO Users (Username, Password, Role, TeamID)
        OUTPUT INSERTED.UserID
        VALUES (@username, @password, @role, @teamID)
      `);
    
    const userID = result.recordset[0].UserID;
    
    res.status(201).json({
      message: 'User created successfully',
      userID: userID
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Update an existing user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { Username, Password, Role, TeamID } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const userID = parseInt(id);
    
    // Validate role if provided
    if (Role && Role !== 'Admin' && Role !== 'Owner') {
      return res.status(400).json({ message: 'Role must be either Admin or Owner' });
    }
    
    const pool = await mssql.connect(dbConfig);
    
    // Check if user exists
    const userCheck = await pool.request()
      .input('userID', mssql.Int, userID)
      .query('SELECT UserID FROM Users WHERE UserID = @userID');
    
    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if username already exists if updating username
    if (Username) {
      const usernameCheck = await pool.request()
        .input('username', mssql.VarChar(100), Username)
        .input('userID', mssql.Int, userID)
        .query('SELECT Username FROM Users WHERE Username = @username AND UserID != @userID');
      
      if (usernameCheck.recordset.length > 0) {
        return res.status(409).json({ message: 'Username already exists' });
      }
    }
    
    // Check if TeamID exists if provided
    if (TeamID !== undefined) {
      if (TeamID === null) {
        // Allow setting TeamID to null
      } else {
        const teamCheck = await pool.request()
          .input('teamID', mssql.Int, TeamID)
          .query('SELECT TeamID FROM Teams WHERE TeamID = @teamID');
        
        if (teamCheck.recordset.length === 0) {
          return res.status(404).json({ message: 'Team not found' });
        }
      }
    }
    
    // Build update query
    let updateQuery = 'UPDATE Users SET ';
    const requestObj = pool.request().input('userID', mssql.Int, userID);
    
    const updateFields = [];
    
    if (Username) {
      updateFields.push('Username = @username');
      requestObj.input('username', mssql.VarChar(100), Username);
    }
    
    if (Password) {
      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(Password, saltRounds);
      
      updateFields.push('Password = @password');
      requestObj.input('password', mssql.VarChar(255), hashedPassword);
    }
    
    if (Role) {
      updateFields.push('Role = @role');
      requestObj.input('role', mssql.VarChar(10), Role);
    }
    
    if (TeamID !== undefined) {
      updateFields.push('TeamID = @teamID');
      requestObj.input('teamID', TeamID !== null ? mssql.Int : mssql.NVarChar, TeamID);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    updateQuery += updateFields.join(', ') + ' WHERE UserID = @userID';
    
    await requestObj.query(updateQuery);
    
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const userID = parseInt(id);
    
    const pool = await mssql.connect(dbConfig);
    
    // Check if user exists
    const userCheck = await pool.request()
      .input('userID', mssql.Int, userID)
      .query('SELECT UserID FROM Users WHERE UserID = @userID');
    
    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user
    await pool.request()
      .input('userID', mssql.Int, userID)
      .query('DELETE FROM Users WHERE UserID = @userID');
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};