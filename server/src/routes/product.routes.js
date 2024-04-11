import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addProduct,
  addToCart,
  deleteProduct,
  getProductByID,
  removeFromCart,
  updateProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

router.route("/admin/add-product").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  addProduct
);

router.route("/update-product").put(
  verifyJWT,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  updateProduct
);
router.route("/delete-product").delete(verifyJWT, deleteProduct);
router.route("/get-product").get(getProductByID);
router.route("/add-to-cart").post(verifyJWT, addToCart);
router.route("/remove-from-cart").post(verifyJWT, removeFromCart);


export default router;
