const express = require("express");
const sql = require("mssql");
const dbConfig = require("./backend/config/connectDB");


const app = express();
app.use(express.json());

const PORT = 3000;

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

app.listen(PORT, async () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
  await testConnection(); 
});
