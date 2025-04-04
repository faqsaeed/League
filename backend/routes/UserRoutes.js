const express = require("express");
const userRouter = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/UserController");
const {verifyToken, verifyAdmin, verifyAdminOrOwner, verifyOwnerForTeam} = require("../middleware/AuthMiddleware");

userRouter.get("/",verifyToken, verifyAdminOrOwner, getUsers);
userRouter.post("/",verifyToken, verifyAdmin, createUser);
userRouter.put("/:id",verifyToken, verifyOwnerForTeam, updateUser);
userRouter.delete("/:id",verifyToken, verifyAdmin, deleteUser);

module.exports = userRouter;