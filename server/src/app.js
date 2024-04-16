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
import cartRouter from "./routes/cart.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import supportRouter from "./routes/support.routes.js";

//routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/support", supportRouter);

// http://localhost:8000/api/v1/auth/register
// http://localhost:8000/api/v1/product/add-product
// http://localhost:8000/api/v1/admin/make-admin
// http://localhost:8000/api/v1/cart/add-to-cart
// http://localhost:8000/api/v1/wishlist/add-to-wishlist

export { app };
