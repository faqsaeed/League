const express = require("express");
const { getTeams, createTeam, updateTeam, deleteTeam } = require("../controllers/TeamController");
const router = express.Router();

router.get("/teams", getTeams);
router.post("/teams", createTeam);
router.put("/teams/:id", updateTeam);
router.delete("/teams/:id", deleteTeam);

module.exports = router;