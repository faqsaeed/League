const express = require("express");
const playerRouter = express.Router();
const { getPlayers, createPlayer, updatePlayer, deletePlayer,getPlayersByTeam } = require("../controllers/PlayerController");

playerRouter.get("/players", getPlayers);
playerRouter.get("/players/:teamID", getPlayersByTeam);
playerRouter.post("/players", createPlayer);
playerRouter.put("/players/:id", updatePlayer);
playerRouter.delete("/players/:id", deletePlayer);

module.exports = playerRouter;