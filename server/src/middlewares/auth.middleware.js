import { getConnection } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const incomingToken =
      req.cookies.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(incomingToken);

    if (!incomingToken) throw new ApiError(404, "Unauthorized request!");

    const decodedToken = await jwt.decode(incomingToken, config.get("ref_sec"));

    // console.log(decodedToken);

    if (!decodedToken) throw new ApiError(401, "Invalid token!");

    const userId = decodedToken?._id;

    const connection = await getConnection();

    const user = await connection.query(
      `SELECT * FROM users WHERE userID='${userId}'`
    );

    // console.log("Auth middleware User: ", user);

    if (!user) {
      throw new ApiError(401, "Invalid access token!");
    }

    req.user = user[0][0];
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
