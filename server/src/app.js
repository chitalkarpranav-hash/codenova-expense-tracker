import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
app.use("/api/transactions", transactionRoutes);

app.use("/api", (_request, response) => {
  response.status(404).json({ message: "API route not found." });
});

if (process.env.NODE_ENV === "production") {
  const clientDist = path.resolve(currentDirectory, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_request, response) => {
    response.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((error, _request, response, _next) => {
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ message: "Request body must be valid JSON." });
  }

  console.error(error);
  return response.status(500).json({ message: "An unexpected server error occurred." });
});

export default app;
