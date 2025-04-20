const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const dbConfig = require("../config/connectDB");
const authRouter = express.Router();

// Secret key for JWT
const JWT_SECRET = "FaiqSaeed"; // Change this in production!

// 🔹 Register a new user
authRouter.post("/register", async (req, res) => {
    const { username, password, role, teamID } = req.body;

    try {
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("username", sql.VarChar, username)
            .input("password", sql.VarChar, hashedPassword)
            .input("role", sql.VarChar, role)
            .input("teamID", sql.Int, teamID || null) // TeamID only for Owners
            .query(`INSERT INTO Users (Username, Password, Role, TeamID) VALUES (@username, @password, @role, @teamID)`);

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Login a user
authRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("username", sql.VarChar, username)
            .query(`SELECT * FROM Users WHERE Username = @username`);

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Create JWT token
        const token = jwt.sign(
            { userID: user.UserID, role: user.Role, teamID: user.TeamID },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ success: true, msg: "Login successful!", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = authRouter;
