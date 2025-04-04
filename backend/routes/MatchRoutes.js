const express = require("express");
const matchRouter = express.Router();
const { getMatches, createMatch, updateMatch, deleteMatch, getMatchesByTeam } = require("../controllers/MatchController");
const {verifyToken, verifyAdmin} = require("../middleware/AuthMiddleware");


matchRouter.get("/", getMatches);
matchRouter.get("/:teamID", getMatchesByTeam);
matchRouter.post("/", verifyToken, verifyAdmin, createMatch);
matchRouter.put("/:id",verifyToken, verifyAdmin, updateMatch);
matchRouter.delete("/:id",verifyToken, verifyAdmin, deleteMatch);

module.exports = matchRouter;