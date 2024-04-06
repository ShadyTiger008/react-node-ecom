import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: config.get('cors_origin'),
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import authRouter from "./routes/auth.routes.js";
import { config } from "./constants/environment.js";

//routes declaration
app.use("/api/v1/auth", authRouter);

// http://localhost:8000/api/v1/auth/register

export { app };
