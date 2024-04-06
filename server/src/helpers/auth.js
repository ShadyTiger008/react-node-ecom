import jwt from "jsonwebtoken";

export const generateAccessToken = ({ userId, userEmail }) => {
  return jwt.sign(
    {
      _id: userId,
      email: userEmail,
    },
    config.get("access_sec"),
    { expiresIn: config.get("access_exp") }
  );
};

export const generateRefreshToken = ({ userId, userEmail }) => {
  return jwt.sign(
    {
      _id: userId,
      email: userEmail,
    },
    config.get("ref_sec"),
    { expiresIn: config.get("ref_exp") }
  );
};
