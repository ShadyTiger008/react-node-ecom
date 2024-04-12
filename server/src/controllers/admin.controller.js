import { getConnection } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//TODO: Changes in make admin controller -> If user is already exists with that email then it will update the user role other wise it will create a new admin

const makeAdmin = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const connection = await getConnection();

  const user = await connection.query(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  if (!user) throw new ApiError(404, "No user found with this email!");

  const isUpdated = await connection.query(
    `UPDATE users SET type=2 WHERE userID=?`,
    [user[0][0]?.userID]
  );
  if (!isUpdated) throw new ApiError(500, "User can;t be updated!");

  const updatedUser = await connection.query(
    `SELECT * FROM users WHERE userID=?`,
    [user[0][0]?.userID]
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser[0][0],
        "Successfully update the user to admin!"
      )
    );
});

const updateAdmin = asyncHandler(async (req, res) => {});

const deleteAdmin = asyncHandler(async (req, res) => {});

export { makeAdmin, updateAdmin, deleteAdmin };
