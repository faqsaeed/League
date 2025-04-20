const express = require("express");
const sql = require("mssql");
const dbConfig = require("./backend/config/connectDB");
const cors = require("cors");
require("dotenv").config();


const app = express();
app.use(express.json());
app.use(cors());

// Import all route files
const matchRoutes = require("./backend/routes/MatchRoutes");
const playerRoutes = require("./backend/routes/PlayerRoutes");
const playerStatsRoutes = require("./backend/routes/PlayerStatsRoutes");
const playerTransactionRoutes = require("./backend/routes/PlayerTransactionRoutes");
const teamRoutes = require("./backend/routes/TeamRoutes");
const userRoutes = require("./backend/routes/UserRoutes");
const authRoutes = require("./backend/routes/AuthRoutes"); 
const PointTableRoute = require("./backend/routes/PointTableRoutes");

const PORT = process.env.PORT || 5000;

// Proper SQL Connection Pool
const testConnection = async () => {
  try 
  {
    await sql.connect(dbConfig);
    console.log("Connected to database successfully!");
  } 
  catch (err) 
  {
    console.error("Database connection failed:", err.message);
  }
};


app.get("/", (req, res) => {
  return res.send("Hello, I am running!");
});

const apiPrefix = "/api";
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/teams`, teamRoutes);
app.use(`${apiPrefix}/players`, playerRoutes);
app.use(`${apiPrefix}/matches`, matchRoutes);
app.use(`${apiPrefix}/stats`, playerStatsRoutes);
app.use(`${apiPrefix}/transactions`, playerTransactionRoutes);
app.use(`${apiPrefix}/pointTable`, PointTableRoute);
app.use(`${apiPrefix}/auth`, authRoutes);


app.listen(PORT, async () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
  await testConnection(); 
});
