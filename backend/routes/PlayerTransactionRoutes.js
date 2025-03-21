const express = require("express");
const transactionRouter = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require("../controllers/PlayerTransactionController");

transactionRouter.get("/transactions", getTransactions);
transactionRouter.post("/transactions", createTransaction);
transactionRouter.put("/transactions/:id", updateTransaction);
transactionRouter.delete("/transactions/:id", deleteTransaction);

module.exports = transactionRouter;