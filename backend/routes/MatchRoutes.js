const express = require("express");
const matchRouter = express.Router();
const { getMatches, createMatch, updateMatch, deleteMatch, getMatchesByTeam } = require("../controllers/MatchController");

matchRouter.get("/", getMatches);
matchRouter.get("/:teamID", getMatchesByTeam);
matchRouter.post("/", createMatch);
matchRouter.put("/:id", updateMatch);
matchRouter.delete("/:id", deleteMatch);

module.exports = matchRouter;