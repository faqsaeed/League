const express = require("express");
const statsRouter = express.Router();
const { getPlayerStats, createPlayerStats, updatePlayerStats, deletePlayerStats } = require("../controllers/PlayerStatsController");

statsRouter.get("/:name", getPlayerStats);
statsRouter.post("/", createPlayerStats);
statsRouter.put("/:id", updatePlayerStats);
statsRouter.delete("/:id", deletePlayerStats);

module.exports = statsRouter;
