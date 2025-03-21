const express = require("express");
const statsRouter = express.Router();
const { getPlayerStats, createPlayerStats, updatePlayerStats, deletePlayerStats } = require("../controllers/PlayerStatsController");

statsRouter.get("/player-stats", getPlayerStats);
statsRouter.post("/player-stats", createPlayerStats);
statsRouter.put("/player-stats/:id", updatePlayerStats);
statsRouter.delete("/player-stats/:id", deletePlayerStats);

module.exports = statsRouter;
