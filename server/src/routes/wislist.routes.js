import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addToWishlist, getWishlist } from "../controllers/wishlist.controller.js";

const router = express.Router();

router.route("/add-to-wishlist").post(verifyJWT, addToWishlist);
router.route("/get-wishlist").get(verifyJWT, getWishlist);

export default router;
