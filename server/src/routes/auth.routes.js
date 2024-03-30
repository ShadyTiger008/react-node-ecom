import express from "express";
import {
  getCurrentUser,
  userLogin,
  userLogout,
  userRegistration,
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

export default router;