import express from "express";
import { userLogin, userRegistration } from "../controllers/auth.controller.js";

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

export default router;
