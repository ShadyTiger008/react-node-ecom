import { getConnection } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const productId = req.query.productId;
  if (!productId) throw new ApiError(402, "Product id is required!");

  // console.log("Quantity ",req.body.quantity);

  let qty = req.body?.quantity ? req?.body?.quantity : 1;
  if (qty < 1) throw new ApiError(400, "Quantity must be greater than 0");

  const connection = await getConnection();

  const isAddedToCart = await connection.query(
    `INSERT INTO carts (productID, userID, quantity) VALUES (?, ?, ?)`,
    [productId, userId, qty]
  );
  if (!isAddedToCart) throw new ApiError(500, "Can't add the item into cart");

  return res
    .status(200)
    .json(
      new ApiResponse(200, isAddedToCart, "Product successfully added to cart")
    );
});

const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const cartId = req.query.cartId;
  if (!cartId) throw new ApiError(402, "Cart id is required!");

  const connection = await getConnection();

  const cartItem = await connection.query(
    `SELECT * FROM carts WHERE cartID=?`,
    [cartId]
  );
  if (!cartItem)
    throw new ApiError(404, "Cart item is deleted or something else");

  if (cartItem[0][0]?.userID !== userId) {
    throw new ApiError(403, "You are not authorized to delete this item");
  }

  const isDeleted = await connection.query(`DELETE FROM carts WHERE cartID=?`, [
    cartItem[0][0]?.cartID,
  ]);
  if (!isDeleted) throw new ApiError(500, "Can't delete the item from cart");

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully removed the item from cart!"));
});

const updateCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const cartId = req.query.cartId;
  if (!cartId) throw new ApiError(402, "Product id is required!");

  // console.log("Quantity ",req.body.quantity);

  let qty = req.body?.quantity;
  if (qty < 1) throw new ApiError(400, "Quantity must be greater than 0");

  const connection = await getConnection();

  const cartItem = await connection.query(
    `SELECT * FROM carts WHERE cartID=?`,
    [cartId]
  );

  if (cartItem[0][0]?.userID !== userId)
    throw new ApiError(403, "You are not authorized to update this cart item!");

  const isUpdated = await connection.query(
    `UPDATE carts SET quantity=? WHERE cartID=?`,
    [qty, cartId]
  );
  if (!isUpdated) throw new ApiError(500, "Can't add the item into cart");

  const updatedItem = await connection.query(
    `SELECT * FROM carts WHERE cartID`,
    [userId, cartId]
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedItem[0][0], "Product successfully added to cart")
    );
});

const getCart = asyncHandler(async (req, res) => {});

export { addToCart, removeFromCart, updateCart, getCart };
