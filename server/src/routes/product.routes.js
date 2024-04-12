import express from "express";
import { checkAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addProduct,
  deleteProduct,
  getProductByID,
  updateProduct,
} from "../controllers/product.controller.js";
import { addToCart, removeFromCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.route("/add-product").post(
  verifyJWT,
  checkAdmin,
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  addProduct
);

router.route("/update-product").put(
  verifyJWT,
  checkAdmin,
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  updateProduct
);

router.route( "/delete-product" ).delete( verifyJWT, checkAdmin, deleteProduct );

router.route("/get-product").get(getProductByID);


export default router;
