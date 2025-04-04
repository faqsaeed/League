const express = require("express");
const PointsRouter = express.Router();
const { getPointTable} = require("../controllers/PointsController");

PointsRouter.get("/", getPointTable);

module.exports = PointsRouter;