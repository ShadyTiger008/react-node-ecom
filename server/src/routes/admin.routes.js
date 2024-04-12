import express from "express";
import { checkAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteAdmin,
  makeAdmin,
  updateAdmin,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.route("/make-admin").post(verifyJWT, checkAdmin, makeAdmin);
router.route("/make-admin").post(verifyJWT, checkAdmin, updateAdmin);
router.route("/make-admin").post(verifyJWT, checkAdmin, deleteAdmin);

export default router;
