import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cookieParser());
// GitHub Pages hosts the public frontend; Airtable writes stay server-side.
// No cookies or credentials are needed for this public submission endpoint.
app.use("/api/lead-magnet/submissions", cors({
  origin: ["https://christastephens.github.io", "https://events.tymflo.com"],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
