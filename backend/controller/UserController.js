const sql = require("msnodesqlv8");
const connectionString = require("../config/connectDB");

const getPlayers = (req, res) => {

    const query = "SELECT * FROM Players";

    sql.query(connectionString, query, (err, rows) => {

        if (err) 
            return res.status(500).send("Error: " + err);

        res.json(rows);
    });
};

const createPlayer = (req, res) => {

    const { name, age, position, teamID } = req.body;
    const query = `INSERT INTO Players (Name, Age, Position, TeamID) VALUES ('${name}', ${age}, '${position}', ${teamID})`;
    
    sql.query(connectionString, query, (err) => {
        if (err) 
            return res.status(500).send("Error: " + err);

        res.status(201).send("Player created successfully.");
    });
};

const updatePlayer = (req, res) => {

    const { id } = req.params;
    const { name, age, position, teamID } = req.body;
    const query = `UPDATE Players SET Name = '${name}', Age = ${age}, Position = '${position}', TeamID = ${teamID} WHERE PlayerID = ${id}`;
    
    sql.query(connectionString, query, (err, result) => {

        if (err) 
            return res.status(500).send("Error: " + err);

        if (result.affectedRows === 0) 
            return res.status(404).send("Player not found.");

        res.status(200).send("Player updated successfully.");
    });
};

const deletePlayer = (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM Players WHERE PlayerID = ${id}`;

    sql.query(connectionString, query, (err, result) => {

        if (err) 
            return res.status(500).send("Error: " + err);
        
        if (result.affectedRows === 0) 
            return res.status(404).send("Player not found.");
        
        res.status(200).send("Player deleted successfully.");
    });
};

module.exports = { getPlayers, createPlayer, updatePlayer, deletePlayer };
