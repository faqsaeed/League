const express = require("express");
const matchRouter = express.Router();
const { getMatches, getMatch, createMatch, updateMatch, deleteMatch, getMatchesByTeam } = require("../controllers/MatchController");
const {verifyToken, verifyAdmin} = require("../middleware/AuthMiddleware");


matchRouter.get("/", getMatches);
matchRouter.get("/:teamName", getMatchesByTeam);
matchRouter.get("/match/:id", getMatch);
matchRouter.post("/", verifyToken, verifyAdmin, createMatch);
matchRouter.put("/:id",verifyToken, verifyAdmin, updateMatch);
matchRouter.delete("/:id",verifyToken, verifyAdmin, deleteMatch);

module.exports = matchRouter;