import { getConnection } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import { generateRefreshToken } from "../helpers/auth.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { sendEmail } from "../services/send_emil.js";
import { generateOTP } from "../helpers/index.js";

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

  if (!email || !password) {
    throw new ApiError(400, "Please provide all required fields!");
  }

  const connection = await getConnection();

  const existedUser = await connection.query(
    `SELECT * FROM users WHERE email='${email}'`
  );
  if (!existedUser[0].length) {
    throw new ApiError(401, "Email or password is incorrect.");
  }

  const isValidPassword = await bcrypt.compare(
    password,
    existedUser[0][0].password
  );
  if (!isValidPassword) throw new ApiError(401, "Invalid Password");

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

  const updateUser = await connection.query(
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

const verifyEmail = asyncHandler(async (req, res) => {});

export { userRegistration, userLogin, userLogout, verifyEmail, getCurrentUser };
