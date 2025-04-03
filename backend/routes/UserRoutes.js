const express = require("express");
const userRouter = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/UserController");

userRouter.get("/", getUsers);
userRouter.post("/", createUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

module.exports = userRouter;