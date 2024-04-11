import { asyncHandler } from "../utils/asyncHandler";

const addProduct = asyncHandler(async (req, res) => {});

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
