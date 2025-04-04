const express = require("express");
const statsRouter = express.Router();
const { getPlayerStats, createPlayerStats, updatePlayerStats, deletePlayerStats } = require("../controllers/PlayerStatsController");
const {verifyToken, verifyAdmin} = require("../middleware/AuthMiddleware");

statsRouter.get("/:name", getPlayerStats);
statsRouter.post("/",verifyToken, verifyAdmin, createPlayerStats);
statsRouter.put("/:id", verifyToken, verifyAdmin, updatePlayerStats);
statsRouter.delete("/:id",verifyToken, verifyAdmin, deletePlayerStats);

module.exports = statsRouter;
