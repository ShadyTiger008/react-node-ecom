import { getConnection } from "../db/index.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addSupport = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const { subject, description, supportType, userEmail, userPhone } = req.body;

  const connection = await getConnection();

  const user_mail = userEmail ? userEmail : req.user.email;
  const user_phone = userPhone ? userPhone : req.user.phone;

  let queryFields = [
    "userID",
    "subject",
    "description",
    "supportType",
    "userEmail",
    "userPhone",
  ];
  let queryValues = [
    userId,
    subject,
    description,
    supportType,
    user_mail,
    user_phone,
  ];

  let uploadedImageArray = [];

  if (req.files && req.files.attachments) {
    const attachmentsArray = req.files.attachments;
    const attachmentsLocalPath = attachmentsArray.map((image) => image.path);

    // console.log("attachments local path: ", attachmentsLocalPath);

    if (!attachmentsLocalPath) {
      throw new ApiError(400, "attachments are required!");
    }

    // console.log("Uploading attachments to Cloudinary:", attachmentsLocalPath);

    const uploadedAttachments = await Promise.all(
      attachmentsLocalPath.map(uploadOnCloudinary)
    );

    uploadedAttachments.forEach((image) => {
      uploadedImageArray.push(image.url);
    });

    if (!uploadedImageArray.length) {
      console.error(
        "attachments upload to Cloudinary failed:",
        attachmentsLocalPath
      );
      throw new ApiError(400, "Image files are required!");
    }

    queryFields.push("attachments");
    queryValues.push(JSON.stringify(uploadedImageArray));
  }

  const placeholders = queryValues.map(() => "?").join(", ");
  const query = `INSERT INTO supports (${queryFields.join(
    ", "
  )}) VALUES (${placeholders})`;

  const newSupport = await connection.query(query, queryValues);

  if (newSupport[0].length === 0)
    throw new ApiError(500, "An error occurred while creating support");

  return res
    .status(200)
    .json(new ApiResponse(200, newSupport[0], "Support successfully created"));
});

const deleteSupport = asyncHandler(async (req, res) => {
  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");
  console.log(userId);

  const wishlistId = req.query.wishlistId;
  if (!wishlistId) throw new ApiError(400, "wishlist id is required!");
  console.log(wishlistId);

  const connection = await getConnection();

  const wishlistItem = await connection.query(
    `SELECT * FROM wishlists WHERE wishlistID=?`,
    [wishlistId]
  );
  // console.log( wishlistItem[ 0 ] );

  if (wishlistItem[0].length === 0) {
    throw new ApiError(403, "This product is already removed!");
  }

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

const getSupport = asyncHandler(async (req, res) => {
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

  const WishlistItems = await connection.query(
    `SELECT wishlists.wishlistID, wishlists.productID, wishlists.userID, products.title, products.description, products.actualPrice, products.currentPrice, products.category, products.subcategory, products.gender, products.sizes, products.colors, products.ratings, products.attachments 
     FROM wishlists
     INNER JOIN products ON wishlists.productID = products.productID
     WHERE wishlists.userID=? ORDER BY ${orderBy} ${sortOrder} LIMIT ${limit} OFFSET ${skip}`,
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
      attachments: item.attachments,
    },
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products: formattedWishlistItems,
        total: count,
        page: page,
      },
      "Wishlist items retrieved successfully"
    )
  );
});

export { addSupport, getSupport, deleteSupport };
