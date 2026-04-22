import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "express-async-errors";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { eventsRouter } from "./routes/events.js";

export function createApp() {
  const app = express();
  const allowList = new Set([
    env.frontendOrigin,
    ...env.frontendOrigins,
    "http://localhost:5173",
    "http://localhost:3000"
  ]);

  const corsOptions = {
    origin: (origin, callback) => {
      // Non-browser clients (curl/postman) may not send Origin.
      if (!origin) return callback(null, true);
      if (allowList.has(origin)) return callback(null, true);

      // Allow GitHub Pages custom path deployments under github.io.
      if (/^https:\/\/[a-z0-9-]+\.github\.io$/i.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/events", eventsRouter);

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
