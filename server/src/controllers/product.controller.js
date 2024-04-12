import { getConnection } from "../db";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const addProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    category,
    subcategory,
    sizes,
    colors,
    ratings,
  } = req.body;

  const connection = getConnection();

  const productAdded = await connection.query(
    `INSERT INTO products (title, description, price, category, subcategory, sizes, colors, ratings) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, price, category, subcategory, sizes, colors, ratings]
  );

  if (!productAdded) throw new ApiError(500, "Product can't be added!");

  return res
    .status(200)
    .json(
      new ApiResponse(
        201,
        { productAdded, status: true },
        "Product successfully created!"
      )
    );
});

const updateProduct = asyncHandler(async (req, res) => {});
const deleteProduct = asyncHandler(async (req, res) => {});
const getProductByID = asyncHandler(async (req, res) => {});
const addToCart = asyncHandler(async (req, res) => {});
const removeFromCart = asyncHandler(async (req, res) => {});

export {
  addProduct,
  updateProduct,
  deleteProduct,
  getProductByID,
  addToCart,
  removeFromCart,
};
