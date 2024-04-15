import { getConnection } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const productId = req.query.productsId;
  if (!productId) throw new ApiError(400, "products id is required!");

  const connection = await getConnection();

  const alreadyPresent = await connection.query(
    `SELECT * FROM wishlists WHERE userID=? AND productID=?`,
    [userId, productId]
  );

  if (alreadyPresent) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, alreadyPresent, "Product is already in wishlist!")
      );
  }

  const isAddedToWishlist = await connection.query(
    `INSERT INTO wishlists (productID, userID) VALUES (?, ?)`,
    [productId, userId]
  );

  if (!isAddedToWishlist)
    throw new ApiError(500, "Can't add the item to the wishlist");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        isAddedToWishlist,
        "products successfully added to wishlist"
      )
    );
});

const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const connection = await getConnection();

  const WishlistItems = await connection.query(
    `SELECT wishlist.wishlistID, wishlist.productID, wishlist.userID, products.title, products.description, products.actualPrice, products.currentPrice, products.category, products.subcategory, products.gender, products.sizes, products.colors, products.ratings, products.images 
     FROM wishlist 
     INNER JOIN products ON wishlist.productID = products.productID
     WHERE wishlist.userID=?`,
    [userId]
  );

  if (!WishlistItems[0].length) {
    return res.status(200).json(new ApiResponse(200, [], "Wishlist is empty"));
  }

  const formattedWishlistItems = WishlistItems[0].map((item) => ({
    wishlistID: item.wishlistID,
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

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formattedWishlistItems,
        "Wishlist items retrieved successfully"
      )
    );
});

export { addToWishlist, getWishlist };
