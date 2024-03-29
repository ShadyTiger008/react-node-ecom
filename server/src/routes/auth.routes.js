import express from "express";
import {
  userLogin,
  userLogout,
  userRegistration,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/register").post(
  //   upload.fields([
  //     {
  //       name: "avatar",
  //       maxCount: 1,
  //     },
  //     {
  //       name: "coverImage",
  //       maxCount: 1,
  //     },
  //   ]),
  userRegistration
);

router.route("/login").post(userLogin);
router.route("/logout").get(verifyJWT, userLogout);

export default router;
