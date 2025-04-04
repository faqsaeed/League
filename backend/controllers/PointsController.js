const mssql = require('mssql');
const dbConfig = require('../config/connectDB');

exports.getPointTable = async (req, res) => {
  try 
  {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT 
    t.Name AS TeamName, COUNT(m.MatchID) AS TotalMatches,
    SUM(CASE 
        WHEN (m.Team1ID = t.TeamID AND m.Result LIKE '%' + t.Name + ' won%') OR 
             (m.Team2ID = t.TeamID AND m.Result LIKE '%' + t.Name + ' won%')
        THEN 1 ELSE 0 
    END) AS Wins,

    SUM(CASE 
        WHEN m.Result LIKE '%draw%' OR m.Result LIKE '%tie%' 
        THEN 1 ELSE 0 
    END) AS Draws,

    SUM(CASE 
        WHEN (m.Team1ID = t.TeamID OR m.Team2ID = t.TeamID) AND 
             m.Result NOT LIKE '%' + t.Name + ' won%' AND
             m.Result NOT LIKE '%draw%' AND 
             m.Result NOT LIKE '%tie%'
        THEN 1 ELSE 0 
    END) AS Losses,

    (SUM(CASE 
        WHEN (m.Team1ID = t.TeamID AND m.Result LIKE '%' + t.Name + ' won%') OR 
             (m.Team2ID = t.TeamID AND m.Result LIKE '%' + t.Name + ' won%')
        THEN 1 ELSE 0 
    END) * 2 + 
    SUM(CASE 
        WHEN m.Result LIKE '%draw%' OR m.Result LIKE '%tie%' 
        THEN 1 ELSE 0 
    END)) AS Points
FROM Teams t LEFT JOIN Matches m ON t.TeamID = m.Team1ID OR t.TeamID = m.Team2ID
GROUP BY t.TeamID, t.Name
ORDER BY Points DESC, Wins DESC;

      `);
    
    res.status(200).json(result.recordset);
  } catch (error) 
  {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches', error: error.message });
  }
};