const express = require("express");
const userRouter = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/UserController");

userRouter.get("/users", getUsers);
userRouter.post("/users", createUser);
userRouter.put("/users/:id", updateUser);
userRouter.delete("/users/:id", deleteUser);

module.exports = userRouter;