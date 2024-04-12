import express from "express";
import { checkAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { makeAdmin } from "../controllers/admin.controller.js";

const router = express.Router();

router.route("/make-admin").post(verifyJWT, checkAdmin, makeAdmin);

export default router;
