const express = require("express");
const playerRouter = express.Router();
const { getPlayers, createPlayer, updatePlayer, deletePlayer,getPlayersByTeam } = require("../controllers/PlayerController");

playerRouter.get("/", getPlayers);
playerRouter.get("/:teamID", getPlayersByTeam);
playerRouter.post("/", createPlayer);
playerRouter.put("/:id", updatePlayer);
playerRouter.delete("/:id", deletePlayer);

module.exports = playerRouter;