import { getConnection } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import { generateRefreshToken } from "../helpers/index.js";

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

  const user = await connection.query(
    `INSERT INTO users (userID, fullName, email, phone, password) VALUES (?, ?, ?, ?, ?)`,
    [userId, fullName, email, phone, hashedPassword]
  );

  if (!user) {
    throw new ApiError(401, "Failed to create an account");
  }

  const insertedUser = await connection.query(
    `SELECT * FROM users WHERE userID='${userId}'`
  );
  if (!insertedUser[0]) throw new ApiErrorError(401, "Failed to add the user");

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

  const loggedUser = await connection.query(
    `SELECT * FROM users WHERE userID='${existedUser[0][0].userID}'`
  );

  const options = {
    httpsOnly: true,
    secure: true,
  };

  const refreshToken = await generateRefreshToken({
    userId: loggedUser[0][0].userID,
    userEmail: loggedUser[0][0].email,
  });

  const accessToken = await generateRefreshToken({
    userId: loggedUser[0][0].userID,
  });

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

export { userRegistration, userLogin };
