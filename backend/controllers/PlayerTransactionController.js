const sql = require('mssql');
const config = require('../config/connectDB');

exports.getTransactions = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    
    const result = await pool.request()
      .query(`
        SELECT pt.TransactionID, p.Name as PlayerName, 
               t1.Name as FromTeam, t2.Name as ToTeam,
               pt.Type, pt.Amount, pt.LoanStartDate, pt.LoanEndDate, pt.Status
        FROM PlayerTransactions pt
        JOIN Players p ON pt.PlayerID = p.PlayerID
        JOIN Teams t1 ON pt.FromTeamID = t1.TeamID
        JOIN Teams t2 ON pt.ToTeamID = t2.TeamID
      `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to retrieve player transactions" });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { playerID, fromTeamID, toTeamID, type, amount, loanStartDate, loanEndDate, status } = req.body;
    
    // Validate required fields
    if (!playerID || !fromTeamID || !toTeamID || !type || !amount || !status) {
      return res.status(400).json({ message: "Required fields missing" });
    }
    
    // Validate loan dates if transaction type is loan
    if (type.toLowerCase() === 'loan' && (!loanStartDate || !loanEndDate)) {
      return res.status(400).json({ message: "Loan start and end dates are required for loan transactions" });
    }
    
    const pool = await sql.connect(config);
    
    // Check if player exists
    const playerCheck = await pool.request()
      .input('playerID', sql.Int, playerID)
      .query('SELECT PlayerID FROM Players WHERE PlayerID = @playerID');
      
    if (playerCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }
    
    // Check if teams exist
    const teamsCheck = await pool.request()
      .input('fromTeamID', sql.Int, fromTeamID)
      .input('toTeamID', sql.Int, toTeamID)
      .query(`
        SELECT TeamID FROM Teams 
        WHERE TeamID = @fromTeamID OR TeamID = @toTeamID
      `);
      
    if (teamsCheck.recordset.length < 2) {
      return res.status(404).json({ message: "One or both teams not found" });
    }
    
    // Insert transaction
    const result = await pool.request()
      .input('playerID', sql.Int, playerID)
      .input('fromTeamID', sql.Int, fromTeamID)
      .input('toTeamID', sql.Int, toTeamID)
      .input('type', sql.VarChar(50), type)
      .input('amount', sql.Decimal(10, 2), amount)
      .input('loanStartDate', sql.Date, loanStartDate || null)
      .input('loanEndDate', sql.Date, loanEndDate || null)
      .input('status', sql.VarChar(50), status)
      .query(`
        INSERT INTO PlayerTransactions (PlayerID, FromTeamID, ToTeamID, Type, Amount, LoanStartDate, LoanEndDate, Status)
        OUTPUT INSERTED.TransactionID
        VALUES (@playerID, @fromTeamID, @toTeamID, @type, @amount, @loanStartDate, @loanEndDate, @status)
      `);
    
    const transactionID = result.recordset[0].TransactionID;
    
    // If transaction is completed, update player's team
    if (status.toLowerCase() === 'completed') {
      await pool.request()
        .input('playerID', sql.Int, playerID)
        .input('toTeamID', sql.Int, toTeamID)
        .query(`
          UPDATE Players
          SET TeamID = @toTeamID
          WHERE PlayerID = @playerID
        `);
    }
    
    res.status(201).json({ 
      message: "Transaction created successfully",
      transactionID: transactionID,
      data: { playerID, fromTeamID, toTeamID, type, amount, loanStartDate, loanEndDate, status }
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Failed to create player transaction" });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, loanStartDate, loanEndDate, status } = req.body;
    
    if (!type && !amount && !loanStartDate && !loanEndDate && !status) {
      return res.status(400).json({ message: "At least one field must be provided for update" });
    }
    
    const pool = await sql.connect(config);
    
    // Check if transaction exists
    const transactionCheck = await pool.request()
      .input('transactionID', sql.Int, id)
      .query(`
        SELECT t.TransactionID, t.PlayerID, t.ToTeamID, t.Status
        FROM PlayerTransactions t
        WHERE t.TransactionID = @transactionID
      `);
      
    if (transactionCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    const transaction = transactionCheck.recordset[0];
    const oldStatus = transaction.Status;
    const newStatus = status || oldStatus;
    
    // Build dynamic update query
    let updateQuery = 'UPDATE PlayerTransactions SET ';
    const request = pool.request().input('transactionID', sql.Int, id);
    
    const updateFields = [];
    
    if (type) {
      updateFields.push('Type = @type');
      request.input('type', sql.VarChar(50), type);
      
      // Validate loan dates if transaction type is changed to loan
      if (type.toLowerCase() === 'loan' && !loanStartDate && !loanEndDate) {
        // Check if loan dates already exist
        const loanCheck = await pool.request()
          .input('transactionID', sql.Int, id)
          .query(`
            SELECT LoanStartDate, LoanEndDate
            FROM PlayerTransactions
            WHERE TransactionID = @transactionID
          `);
          
        const loanData = loanCheck.recordset[0];
        if (!loanData.LoanStartDate || !loanData.LoanEndDate) {
          return res.status(400).json({ message: "Loan start and end dates are required when changing to loan type" });
        }
      }
    }
    
    if (amount !== undefined) {
      updateFields.push('Amount = @amount');
      request.input('amount', sql.Decimal(10, 2), amount);
    }
    
    if (loanStartDate) {
      updateFields.push('LoanStartDate = @loanStartDate');
      request.input('loanStartDate', sql.Date, loanStartDate);
    }
    
    if (loanEndDate) {
      updateFields.push('LoanEndDate = @loanEndDate');
      request.input('loanEndDate', sql.Date, loanEndDate);
    }
    
    if (status) {
      updateFields.push('Status = @status');
      request.input('status', sql.VarChar(50), status);
    }
    
    updateQuery += updateFields.join(', ') + ' WHERE TransactionID = @transactionID';
    
    await request.query(updateQuery);
    
    // If status changed to 'completed', update player's team
    if (oldStatus.toLowerCase() !== 'completed' && newStatus.toLowerCase() === 'completed') {
      await pool.request()
        .input('playerID', sql.Int, transaction.PlayerID)
        .input('toTeamID', sql.Int, transaction.ToTeamID)
        .query(`
          UPDATE Players
          SET TeamID = @toTeamID
          WHERE PlayerID = @playerID
        `);
    }
    
    res.status(200).json({ 
      message: "Transaction updated successfully",
      transactionID: id
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Failed to update player transaction" });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    
    // Check if transaction exists
    const transactionCheck = await pool.request()
      .input('transactionID', sql.Int, id)
      .query('SELECT TransactionID FROM PlayerTransactions WHERE TransactionID = @transactionID');
      
    if (transactionCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    // Delete transaction
    await pool.request()
      .input('transactionID', sql.Int, id)
      .query('DELETE FROM PlayerTransactions WHERE TransactionID = @transactionID');
    
    res.status(200).json({ 
      message: "Transaction deleted successfully",
      transactionID: id
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Failed to delete player transaction" });
  }
};