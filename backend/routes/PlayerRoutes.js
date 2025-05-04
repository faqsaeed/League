const express = require("express");
const playerRouter = express.Router();
const { getPlayers, getPlayerByPlayerId, getPlayersById, createPlayer, updatePlayer, deletePlayer,getPlayersByTeam } = require("../controllers/PlayerController");
const {verifyToken, verifyOwnerForTeam} = require("../middleware/AuthMiddleware");


playerRouter.get("/", getPlayers);
playerRouter.get("/:teamName", getPlayersByTeam);
playerRouter.get("/id/:id", getPlayersById);
playerRouter.post("/", verifyToken, verifyOwnerForTeam, createPlayer);
playerRouter.put("/:id", verifyToken, verifyOwnerForTeam, updatePlayer);
playerRouter.delete("/:id", verifyToken, verifyOwnerForTeam, deletePlayer);
playerRouter.get("/play/:id", getPlayerByPlayerId)


module.exports = playerRouter;