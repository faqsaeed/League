const express = require("express");
const TeamRouter = express.Router();
const { getTeams, createTeam, updateTeam, deleteTeam } = require("../controllers/TeamController");
const {verifyToken, verifyAdmin, verifyOwnerForTeam} = require("../middleware/AuthMiddleware");

TeamRouter.get("/", getTeams);
TeamRouter.post("/", verifyToken, verifyAdmin, createTeam);
TeamRouter.put("/:id",verifyToken, verifyOwnerForTeam, updateTeam);
TeamRouter.delete("/:id",verifyToken, verifyAdmin, deleteTeam);

module.exports = TeamRouter;