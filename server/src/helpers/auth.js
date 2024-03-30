import jwt from "jsonwebtoken";

export const generateAccessToken = ({ userId, userEmail }) => {
  return jwt.sign(
    {
      _id: userId,
      email: userEmail,
    },
    process.env.ACCESS_TOKEN_SECRET || "access_token_secret",
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};

export const generateRefreshToken = ({ userId, userEmail }) => {
  return jwt.sign(
    {
      _id: userId,
      email: userEmail,
    },
    process.env.REFRESH_TOKEN_SECRET || "refresh_token_secret",
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d" }
  );
};
