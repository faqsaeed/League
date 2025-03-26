const express = require("express");
const matchRouter = express.Router();
const { getMatches, createMatch, updateMatch, deleteMatch, getMatchesByTeam } = require("../controllers/MatchController");

matchRouter.get("/matches", getMatches);
matchRouter.get("/matches/:teamID", getMatchesByTeam);
matchRouter.post("/matches", createMatch);
matchRouter.put("/matches/:id", updateMatch);
matchRouter.delete("/matches/:id", deleteMatch);

module.exports = matchRouter;