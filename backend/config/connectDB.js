const sql = require("mssql");

const config = {
  user: "SA",
  password: "Pakistan1947",
  server: "localhost", // or your server address
  database: "SportsLeague",
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // Bypass SSL certificate issues
  },
};

module.exports = config;
