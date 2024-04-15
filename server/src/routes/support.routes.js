import express from "express";
import { checkAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { addSupport, deleteSupport, getSupport } from "../controllers/support.controller.js";

const router = express.Router();

router.route("/add-support").get(verifyJWT, addSupport);
router.route("/delete-support").delete(verifyJWT, checkAdmin, deleteSupport);
router.route("/get-supports").get(verifyJWT, checkAdmin, getSupport);

export default router;
