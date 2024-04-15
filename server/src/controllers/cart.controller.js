import { getConnection } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const productsId = req.query.productsId;
  if (!productsId) throw new ApiError(400, "products id is required!");

  let qty = req.body?.quantity || 1;
  if (qty < 1) throw new ApiError(400, "Quantity must be greater than 0");

  const connection = await getConnection();

  const isAddedToCart = await connection.query(
    `INSERT INTO carts (productsID, userID, quantity) VALUES (?, ?, ?)`,
    [productsId, userId, qty]
  );

  if (!isAddedToCart) throw new ApiError(500, "Can't add the item to the cart");

  return res
    .status(200)
    .json(
      new ApiResponse(200, isAddedToCart, "products successfully added to cart")
    );
});

const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const cartId = req.query.cartId;
  if (!cartId) throw new ApiError(400, "Cart id is required!");

  const connection = await getConnection();

  const cartItem = await connection.query(
    `SELECT * FROM carts WHERE cartID=?`,
    [cartId]
  );

  if (!cartItem[0][0] || cartItem[0][0].userID !== userId) {
    throw new ApiError(403, "You are not authorized to delete this item");
  }

  const isDeleted = await connection.query(`DELETE FROM carts WHERE cartID=?`, [
    cartId,
  ]);
  if (!isDeleted)
    throw new ApiError(500, "Can't delete the item from the cart");

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully removed the item from cart"));
});

const updateCart = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const cartId = req.query.cartId;
  if (!cartId) throw new ApiError(400, "Cart id is required!");

  let qty = req.body?.quantity;
  if (!qty || qty < 1)
    throw new ApiError(400, "Quantity must be greater than 0");

  const connection = await getConnection();

  const cartItem = await connection.query(
    `SELECT * FROM carts WHERE cartID=?`,
    [cartId]
  );

  if (!cartItem[0][0] || cartItem[0][0].userID !== userId) {
    throw new ApiError(403, "You are not authorized to update this cart item!");
  }

  const isUpdated = await connection.query(
    `UPDATE carts SET quantity=? WHERE cartID=?`,
    [qty, cartId]
  );

  if (!isUpdated) throw new ApiError(500, "Can't update the item in the cart");

  const updatedItem = await connection.query(
    `SELECT * FROM carts WHERE cartID=?`,
    [cartId]
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedItem[0][0], "Cart item updated successfully")
    );
});

const getCart = asyncHandler(async (req, res) => {
  let page = req.query.page || 1;
  let sort = req.query.sort || "ASC";
  let limit = req.query.limit || 10;
  let skip = (page - 1) * limit;

  let orderBy = "productID";
  if (req.query.sortBy) {
    orderBy = req.query.sortBy;
  }

  const sortOrder = sort.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const connection = await getConnection();

  const cartItems = await connection.query(
    `SELECT carts.cartID, carts.productID, carts.quantity, products.title, products.description, products.actualPrice, products.currentPrice, products.category, products.subcategory, products.gender, products.sizes, products.colors, products.ratings, products.images 
     FROM carts 
     INNER JOIN products ON carts.productID = products.productID
     WHERE carts.userID=? ORDER BY ${orderBy} ${sortOrder} LIMIT ${limit} OFFSET ${skip}`,
    [userId]
  );

  if (!cartItems[0].length) {
    return res.status(200).json(new ApiResponse(200, [], "Cart is empty"));
  }

  const formattedCartItems = cartItems[0].map((item) => ({
    cartID: item.cartID,
    productID: item.productID,
    quantity: item.quantity,
    product: {
      title: item.title,
      description: item.description,
      current_price: item.currentPrice,
      actual_price: item.actualPrice,
      category: item.category,
      sub_category: item.subcategory,
      gender: item.gender,
      sizes: item.sizes,
      colors: item.colors,
      ratings: item.ratings,
      images: item.images,
    },
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      { products: formattedCartItems, total: formattedCartItems.length, page: parseInt(page) },
      "Cart items retrieved successfully"
    )
  );
});

export { addToCart, removeFromCart, updateCart, getCart };
