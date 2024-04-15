import { getConnection } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const productId = req.query.productId;
  if (!productId) throw new ApiError(400, "Product ID is required!");

  const connection = await getConnection();

  const alreadyInWishlist = await connection.query(
    `SELECT * FROM wishlists WHERE userID=? AND productID=?`,
    [userId, productId]
  );
  console.log(alreadyInWishlist);
  // if (alreadyInWishlist.length > 0) {
  //   return res
  //     .status(200)
  //     .json(
  //       new ApiResponse(
  //         200,
  //         alreadyInWishlist[0],
  //         "Product already in wishlist"
  //       )
  //     );
  // }

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
        "Product successfully added to wishlist"
      )
    );
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const wishlistId = req.query.wishlistId;
  if (!wishlistId) throw new ApiError(400, "Cart id is required!");

  const connection = await getConnection();

  const wishlistItem = await connection.query(
    `SELECT * FROM carts WHERE wishlistId=?`,
    [wishlistId]
  );

  if (!wishlistItem[0][0] || wishlistItem[0][0].userID !== userId) {
    throw new ApiError(403, "You are not authorized to delete this item");
  }

  const isDeleted = await connection.query(
    `DELETE FROM wishlists WHERE wishlistID=?`,
    [wishlistId]
  );
  if (!isDeleted)
    throw new ApiError(500, "Can't remove the item from the wishlist");

  res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Successfully removed the item from wishlist")
    );
});

const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const connection = await getConnection();

  const WishlistItems = await connection.query(
    `SELECT wishlists.wishlistID, wishlists.productID, wishlists.userID, products.title, products.description, products.actualPrice, products.currentPrice, products.category, products.subcategory, products.gender, products.sizes, products.colors, products.ratings, products.images 
     FROM wishlists
     INNER JOIN products ON wishlists.productID = products.productID
     WHERE wishlists.userID=?`,
    [userId]
  );

  if (!WishlistItems[0].length) {
    return res.status(200).json(new ApiResponse(200, [], "Wishlist is empty"));
  }

  const wishlistItems = await connection.query(
    `SELECT COUNT(*) AS itemCount FROM wishlists WHERE userID = ?`,
    [userId]
  );

  console.log("Items: ", wishlistItems?.[0]?.[0]?.itemCount);

  const count = wishlistItems?.[0]?.[0]?.itemCount;

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

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products: formattedWishlistItems,
        total: count,
      },
      "Wishlist items retrieved successfully"
    )
  );
});

export { addToWishlist, getWishlist, removeFromWishlist };
