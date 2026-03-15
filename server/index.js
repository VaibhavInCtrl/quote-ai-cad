import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import analyzeRouter from "./routes/analyze.js";
import quoteRouter from "./routes/quote.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : true;

app.use(
  cors({
    origin: clientOrigins,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "QuoteAI" });
});

app.use("/api/analyze", analyzeRouter);
app.use("/api/quote", quoteRouter);

app.use((err, _req, res, _next) => {
  if (err?.name === "MulterError") {
    return res.status(400).json({
      error: err.message,
    });
  }

  if (err?.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    error: "Unexpected server error.",
  });
});

app.listen(port, () => {
  console.log(`QuoteAI server listening on http://localhost:${port}`);
});
