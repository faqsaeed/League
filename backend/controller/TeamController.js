const sql = require("msnodesqlv8");
const connectionString = require("../config/connectDB");

const getTeams = (req, res) => {

    const query = "SELECT * FROM Teams";

    sql.query(connectionString, query, (err, rows) => {

        if (err) 
            return res.status(500).send("Error: " + err);

        res.json(rows);
    });
};

const createTeam = (req, res) => {

    const { name, coach, owner } = req.body;
    const query = `INSERT INTO Teams (Name, Coach, Owner) VALUES ('${name}', '${coach}', '${owner}')`;
   
    sql.query(connectionString, query, (err) => {

        if (err) 
            return res.status(500).send("Error: " + err);

        res.status(201).send("Team created successfully.");
    });
};

const updateTeam = (req, res) => {
    const { id } = req.params;
    const { name, coach, owner } = req.body;
    const query = `UPDATE Teams SET Name = '${name}', Coach = '${coach}', Owner = '${owner}' WHERE TeamID = ${id}`;

    sql.query(connectionString, query, (err, result) => {

        if (err) 
            return res.status(500).send("Error: " + err);

        if (result.affectedRows === 0) 
            return res.status(404).send("Team not found.");

        res.status(200).send("Team updated successfully.");
    });
};

const deleteTeam = (req, res) => {

    const { id } = req.params;
    const query = `DELETE FROM Teams WHERE TeamID = ${id}`;

    sql.query(connectionString, query, (err, result) => {
        if (err) 
            return res.status(500).send("Error: " + err);

        if (result.affectedRows === 0) 
            return res.status(404).send("Team not found.");

        res.status(200).send("Team deleted successfully.");
    });
};

module.exports = { getTeams, createTeam, updateTeam, deleteTeam };
