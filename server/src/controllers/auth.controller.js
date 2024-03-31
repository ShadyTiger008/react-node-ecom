import { getConnection } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import { generateRefreshToken } from "../helpers/auth.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { sendEmail } from "../services/send_email.js";
import { generateOTP } from "../helpers/index.js";
import { mailTypes } from "../constants/index.js";

const userRegistration = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  const connection = getConnection();

  const [existedUser] = await connection.query(
    `SELECT * FROM users WHERE email='${email}'`
  );
  if (existedUser.length > 0) {
    throw new ApiError(409, "Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userId =
    Math.floor(Date.now()).toString() +
    "-" +
    Math.floor(Math.random() * 10000 + 1)
      .toString()
      .padStart(5, "0");

  console.log("Hashed Password: ", hashedPassword);

  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required!");
  }
  console.log("Uploading avatar to Cloudinary:", avatarLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    console.error("Avatar upload to Cloudinary failed:", avatar);
    throw new ApiError(400, "Avatar file is required!");
  }

  console.log("Avatar uploaded successfully:", avatar);

  const generatedOtp = await generateOTP();

  const user = await connection.query(
    `INSERT INTO users (userID, fullName, email, phone, password, profileImage, otp) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, fullName, email, phone, hashedPassword, avatar.url, generatedOtp]
  );

  if (!user) {
    throw new ApiError(401, "Failed to create an account");
  }

  const insertedUser = await connection.query(
    `SELECT * FROM users WHERE userID='${userId}'`
  );
  if (!insertedUser[0]) throw new ApiErrorError(401, "Failed to add the user");

  await sendEmail({
    mail_type: mailTypes[1],
    email: insertedUser[0][0].email,
    subject: "Verify E-Mail OTP",
    title: "Verify your email now",
    otp: generatedOtp,
    name: insertedUser[0][0].fullName,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        insertedUser[0][0],
        "User account created successfully!"
      )
    );
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Please provide all required fields!");
  }

  const connection = await getConnection();

  const existedUser = await connection.query(
    `SELECT * FROM users WHERE email='${email}'`
  );
  if (!existedUser[0].length) {
    throw new ApiError(401, "No user exits with this email!.");
  }

  if (password) {
    const isValidPassword = await bcrypt.compare(
      password,
      existedUser[0][0].password
    );
    if (!isValidPassword) throw new ApiError(401, "Invalid Password");
  } else {
    const generatedOtp = generateOTP();

    await connection.query(`UPDATE users SET otp=? WHERE userID=?`, [
      generatedOtp,
      existedUser[0][0].userID,
    ]);

    await sendEmail({
      mail_type: mailTypes[1],
      email: existedUser[0][0].email,
      subject: "Your Login OTP",
      title: "One Time Password for User Account Verification",
      otp: generatedOtp,
      name: existedUser[0][0].fullName,
    });
  }

  const refreshToken = await generateRefreshToken({
    userId: existedUser[0][0].userID,
    userEmail: existedUser[0][0].email,
  });

  await connection.query(
    `UPDATE users SET refreshToken='${refreshToken}' WHERE userID='${existedUser[0][0].userID}'`
  );

  const loggedUser = await connection.query(
    `SELECT * FROM users WHERE userID='${existedUser[0][0].userID}'`
  );

  const accessToken = await generateRefreshToken({
    userId: loggedUser[0][0].userID,
  });

  const options = {
    httpsOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser[0][0],
          refreshToken: refreshToken,
          accessToken: accessToken,
        },
        "Logged in Successfully!"
      )
    );
});

const userLogout = asyncHandler(async (req, res) => {
  const userId = req.user.userID;

  if (!userId) throw new ApiError(401, "Unauthorized request!");

  const connection = getConnection();

  const loggedUser = await connection.query(
    `SELECT * FROM users WHERE userID='${userId}'`
  );

  if (!loggedUser) throw new ApiError(404, "No such user exists");

  await connection.query(
    `UPDATE users SET refreshToken=null WHERE userID='${loggedUser[0][0].userID}'`
  );

  if (!loggedUser) throw new ApiError(401, "Couldn't update the user!");

  const options = {
    httpsOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Got the user successfully!"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const email = req.query.email;
  const { otp } = req.body;

  const connection = await getConnection();

  const user = await connection.query(
    `SELECT * FROM users WHERE email='${email}'`
  );

  if (!user || !user[0]?.length) {
    throw new ApiError(400, "No account with this email found.");
  }

  if (user[0][0].isVerified === Boolean(1)) {
    throw new ApiResponse(500, "User is already verified!");
  }

  if (user[0][0].otp === null) {
    throw new ApiError(
      403,
      "Email is already verified! Please login to continue"
    );
  }

  if (user[0][0].otp !== otp) {
    throw new ApiError(403, "Invalid OTP provided!");
  }

  await connection.query(
    `UPDATE users SET isVerified=1, otpVerified=1, otp=null WHERE email='${email}'`
  );

  const updatedUser = await connection.query(
    `SELECT * FROM users WHERE email='${email}'`
  );

  await sendEmail({
    mail_type: mailTypes[2],
    email: updatedUser[0][0].email,
    subject: "Your Email Verification was Successful",
    title: "Email Verification Successful",
    name: updatedUser[0][0].fullName,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser[0][0],
        "Account has been verified successfully!"
      )
    );
});

const resendOTP = asyncHandler(async (req, res) => {
  const email = req.query.email;

  const connection = await getConnection();

  const user = await connection.query(
    `SELECT * FROM users WHERE email='${email}'`
  );

  if (!user || !user[0]?.length) {
    throw new ApiError(400, "No account with this email found.");
  }

  const generatedOtp = generateOTP();

  await connection.query(
    `UPDATE users SET otp='${generatedOtp}' WHERE email='${user[0][0].email}'`
  );

  await sendEmail({
    mail_type: mailTypes[1],
    email: email,
    subject: "Resend E-mail Otp",
    title: "Your new Otp",
    name: user[0][0].fullName,
    otp: generatedOtp,
  });

  const updatedUser = await connection.query(
    "SELECT * FROM users WHERE userID=?",
    [user[0][0].userID]
  );

  return res
    .status(201)
    .json(new ApiResponse(200, updatedUser[0][0], "Resend OTP successfully!"));
});

const forgetPassword = asyncHandler(async (req, res) => {
  const user = req.user;

  const { password } = req.body;

  const connection = await getConnection();

  const loggedUser = await connection.query(
    `SELECT * FROM users WHERE userID=?`,
    [user.userID]
  );

  if (!loggedUser) throw new ApiError(404, "User not found");

  if (password) {
    const isValidPassword = await bcrypt.compare(
      password,
      loggedUser[0][0].password
    );

    if (!isValidPassword) {
      throw new ApiError(403, "Wrong current password!");
    }
  } else {
    const generatedOtp = generateOTP();

    await connection.query(
      `UPDATE users SET otp=${generatedOtp}, otpVerified=0, otpVerified=0 WHERE email='${user.email}'`
    );

    await sendEmail({
      mail_type: mailTypes[1],
      email: user?.email,
      subject: "Forget Password E-mail Otp",
      title: "Your Otp is",
      name: user?.fullName,
      otp: generatedOtp,
    });
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, loggedUser[0][0], "Successfully sent the email!")
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const user = req.user;

  const { newPassword } = req.body;

  const connection = await getConnection();

  const loggedUser = await connection.query(
    `SELECT * FROM users WHERE userID=?`,
    [user.userID]
  );

  if (!loggedUser)
    throw new ApiError(400, "There was a problem with your login.");

  const isMatch = await bcrypt.compare(newPassword, loggedUser[0][0].password);

  if (isMatch) throw new ApiError(402, "Old and new password can not be same!");

  const newHashedPassword = await bcrypt.hash(newPassword, 10);

  await connection.query(`UPDATE users SET password=? WHERE userID=?`, [
    newHashedPassword,
    loggedUser[0][0].userID,
  ]);

  const updatedUser = await connection.query(
    `SELECT * FROM users WHERE  userID=?`,
    [loggedUser[0][0].userID]
  );

  await sendEmail({
    mail_type: mailTypes[2],
    email: updatedUser[0][0].email,
    subject: "Your Password Has Been Changed.",
    title: "Successfully changes the password",
    name: updatedUser[0][0].name,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser[0][0], "Password changed successfully")
    );
});

export {
  userRegistration,
  userLogin,
  userLogout,
  verifyEmail,
  getCurrentUser,
  resendOTP,
  forgetPassword,
  changePassword,
};
