import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const allowedTypes = new Set(["income", "expense"]);

function validateTransaction(body) {
  const errors = {};
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";

  if (!title) errors.title = "Title is required.";
  else if (title.length > 120) errors.title = "Title must be 120 characters or fewer.";

  const amount = body.amount;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Amount must be a number greater than zero.";
  }

  if (!allowedTypes.has(body.type)) errors.type = "Type must be income or expense.";
  if (!category) errors.category = "Category is required.";
  else if (category.length > 60) errors.category = "Category must be 60 characters or fewer.";

  const dateString = typeof body.date === "string" ? body.date : "";
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(dateString);
  const date = new Date(dateString);
  const [year, month, day] = dateParts ? dateParts.slice(1).map(Number) : [];
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const hasValidCalendarDate =
    dateParts &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth[month - 1];
  if (!hasValidCalendarDate || !Number.isFinite(date.getTime())) errors.date = "A valid date is required.";

  return { errors, values: { title, amount, type: body.type, category, date } };
}

export async function listTransactions(_request, response, next) {
  try {
    const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 }).lean();
    response.json(transactions);
  } catch (error) {
    next(error);
  }
}

export async function createTransaction(request, response, next) {
  try {
    const { errors, values } = validateTransaction(request.body ?? {});
    if (Object.keys(errors).length) {
      return response.status(400).json({ message: "Please correct the highlighted fields.", errors });
    }

    const transaction = await Transaction.create(values);
    return response.status(201).json(transaction);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.fromEntries(
        Object.entries(error.errors).map(([field, detail]) => [field, detail.message]),
      );
      return response.status(400).json({ message: "Please correct the highlighted fields.", errors });
    }
    return next(error);
  }
}

export async function removeTransaction(request, response, next) {
  try {
    if (!mongoose.isObjectIdOrHexString(request.params.id)) {
      return response.status(400).json({ message: "Transaction id is invalid." });
    }

    const transaction = await Transaction.findByIdAndDelete(request.params.id);
    if (!transaction) return response.status(404).json({ message: "Transaction not found." });
    return response.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function getSummary(_request, response, next) {
  try {
    const [totals = { totalIncome: 0, totalExpense: 0 }] = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
        },
      },
      { $project: { _id: 0, totalIncome: 1, totalExpense: 1 } },
    ]);

    response.json({
      totalIncome: totals.totalIncome,
      totalExpense: totals.totalExpense,
      balance: totals.totalIncome - totals.totalExpense,
    });
  } catch (error) {
    next(error);
  }
}
