import express from "express";
import {
  changePassword,
  forgetPassword,
  getCurrentUser,
  resendOTP,
  userLogin,
  userLogout,
  userRegistration,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  userRegistration
);

router.route("/login").post(userLogin);
router.route("/logout").get(verifyJWT, userLogout);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/verify-email").post(verifyEmail);
router.route("/resend-otp").get(resendOTP);
router.route("/forget-password").post(verifyJWT, forgetPassword);
router.route("/change-password").put(verifyJWT, changePassword);

export default router;
