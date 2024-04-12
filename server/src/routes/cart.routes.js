import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCart,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/add-to-cart").post(verifyJWT, addToCart);
router.route("/remove-from-cart").delete(verifyJWT, removeFromCart);
router.route("/update-cart").put(verifyJWT, updateCart);
router.route("/get-cart").get(verifyJWT, getCart);

export default router;
