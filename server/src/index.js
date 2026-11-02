import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../");
dotenv.config({ path: path.join(projectRoot, ".env") });

const { default: app } = await import("./app.js");
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expense-tracker";

try {
  await mongoose.connect(mongoUri);
  const server = app.listen(port, () => {
    console.log(`Expense Tracker API listening on http://localhost:${port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received; closing server.`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}
