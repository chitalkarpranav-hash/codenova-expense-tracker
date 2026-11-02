import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../");
dotenv.config({ path: path.join(projectRoot, ".env") });

const { default: app } = await import("./app.js");
const port = Number(process.env.PORT) || 5000;
const demoMode = process.env.DEMO_MODE === "true";
const mongoUri =
  process.env.MONGODB_URI ||
  (process.env.NODE_ENV === "production" && !demoMode ? "" : "mongodb://127.0.0.1:27017/expense-tracker");

if (!mongoUri) {
  console.error("MONGODB_URI is required in production. Set it in the hosting service environment.");
  process.exit(1);
}

try {
  if (!demoMode) {
    await mongoose.connect(mongoUri);
  } else {
    console.warn("DEMO_MODE is enabled; transactions are temporary and reset when the service restarts.");
  }

  const server = app.listen(port, () => {
    console.log(`Expense Tracker API listening on http://localhost:${port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received; closing server.`);
    server.close(async () => {
      if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}
