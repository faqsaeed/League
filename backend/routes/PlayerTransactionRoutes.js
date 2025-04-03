const express = require("express");
const transactionRouter = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require("../controllers/PlayerTransactionController");

transactionRouter.get("/", getTransactions);
transactionRouter.post("/", createTransaction);
transactionRouter.put("/:id", updateTransaction);
transactionRouter.delete("/:id", deleteTransaction);

module.exports = transactionRouter;