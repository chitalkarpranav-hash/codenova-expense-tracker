import { Router } from "express";
import {
  createTransaction,
  getSummary,
  listTransactions,
  removeTransaction,
} from "../controllers/transactionController.js";

const router = Router();

router.get("/", listTransactions);
router.post("/", createTransaction);
router.delete("/:id", removeTransaction);
router.get("/summary", getSummary);

export default router;
