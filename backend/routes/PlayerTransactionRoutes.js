const express = require("express");
const transactionRouter = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require("../controllers/PlayerTransactionController");
const {verifyToken, verifyOwnerForTeam} = require("../middleware/AuthMiddleware");

transactionRouter.get("/", getTransactions);
transactionRouter.post("/", verifyToken, verifyOwnerForTeam, createTransaction);
transactionRouter.put("/:id",verifyToken, verifyOwnerForTeam, updateTransaction);
transactionRouter.delete("/:id",verifyToken, verifyOwnerForTeam, deleteTransaction);

module.exports = transactionRouter;