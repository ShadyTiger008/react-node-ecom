import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/environment.js";

const app = express();

app.use(
  cors({
    origin: config.get("cors_origin"),
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import adminRouter from "./routes/admin.routes.js";

//routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/admin", adminRouter);

// http://localhost:8000/api/v1/auth/register
// http://localhost:8000/api/v1/product/add-product

export { app };
