import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";

const router = express.Router();

router.route( "/add-to-wishlist" ).get( verifyJWT, addToWishlist );
router.route("/remove-from-wishlist").delete(verifyJWT, removeFromWishlist);
router.route("/get-wishlist").get(verifyJWT, getWishlist);

export default router;
