const express = require("express");
const TeamRouter = express.Router();
const { getTeams, getTeamById, createTeam, updateTeam, deleteTeam, getTeamByName } = require("../controllers/TeamController");
const {verifyToken, verifyAdmin, verifyOwnerForTeam} = require("../middleware/AuthMiddleware");

TeamRouter.get("/", getTeams);
TeamRouter.post("/", verifyToken, verifyAdmin, createTeam);
TeamRouter.put("/:id",verifyToken, verifyOwnerForTeam, updateTeam);
TeamRouter.delete("/:id",verifyToken, verifyAdmin, deleteTeam);
TeamRouter.get("/:teamname", getTeamByName);
TeamRouter.get("/id/:id", getTeamById)
module.exports = TeamRouter;