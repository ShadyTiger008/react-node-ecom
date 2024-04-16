import express from "express";
import { checkAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addSupport,
  deleteSupport,
  getSupport,
  updateSupport,
} from "../controllers/support.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/add-support").post(
  verifyJWT,
  upload.fields([
    {
      name: "attachments",
      maxCount: 5,
    },
  ]),
  addSupport
);
router.route("/update-support").post(
  verifyJWT,
  checkAdmin,
  upload.fields([
    {
      name: "attachments",
      maxCount: 5,
    },
  ]),
  updateSupport
);
router.route("/delete-support").delete(verifyJWT, checkAdmin, deleteSupport);
router.route("/get-supports").get(verifyJWT, checkAdmin, getSupport);

export default router;
