import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      maxlength: [120, "Title must be 120 characters or fewer."],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required."],
      min: [Number.MIN_VALUE, "Amount must be greater than zero."],
      validate: {
        validator: Number.isFinite,
        message: "Amount must be a valid number.",
      },
    },
    type: {
      type: String,
      required: [true, "Type is required."],
      enum: {
        values: ["income", "expense"],
        message: "Type must be income or expense.",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
      maxlength: [60, "Category must be 60 characters or fewer."],
    },
    date: {
      type: Date,
      required: [true, "Date is required."],
      validate: {
        validator: (value) => value instanceof Date && Number.isFinite(value.getTime()),
        message: "Date must be valid.",
      },
    },
  },
  { timestamps: true, versionKey: false },
);

transactionSchema.index({ date: -1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
