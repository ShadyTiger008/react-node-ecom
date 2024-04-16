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

  let orderBy = "supportID";
  if (req.query.sortBy) {
    orderBy = req.query.sortBy;
  }

  const sortOrder = sort.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const connection = await getConnection();

  const SupportItems = await connection.query(
    `SELECT supports.supportID, supports.subject, supports.description, supports.userID, supports.supportType, supports.userEmail, supports.userPhone, supports.status, supports.priority, supports.attachments, supports.createdAt, supports.updatedAt, users.fullName, users.gender, users.email, users.phone, users.address, users.city, users.state, users.zip, users.type, users.status, users.createdAt, users.profileImage 
     FROM supports
     INNER JOIN users ON supports.userID = users.userID
     ORDER BY ${orderBy} ${sortOrder} LIMIT ${limit} OFFSET ${skip}`,
    [userId]
  );

  console.log(SupportItems);

  if (!SupportItems[0].length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No support ticket created"));
  }

  const supportItems = await connection.query(
    `SELECT COUNT(*) AS itemCount FROM supports`,
    [userId]
  );

  // console.log("Items: ", supportItems?.[0]?.[0]?.itemCount);

  const count = supportItems?.[0]?.[0]?.itemCount;

  const formattedSupportItems = SupportItems[0].map((item) => ({
    supportId: item.supportID,
    subject: item.support,
    description: item.description,
    support_type: item.supportType,
    userId: item.userID,
    user_email: item.email,
    user_phone: item.phone,
    status: item.status,
    priority: item.priority,
    attachments: item.attachments,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    user_details: {
      name: item.fullName,
      gender: item.gender,
      email: item.email,
      phone: item.phone,
      address: item.address,
      city: item.city,
      state: item.state,
      zip: item.zip,
      type: item.type,
      status: item.status,
      createdAt: item.createdAt,
      profileImage: item.profileImage,
    },
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products: formattedSupportItems,
        total: count,
        page: page,
      },
      "All supports retrieved successfully"
    )
  );
});

export { addSupport, getSupport, deleteSupport };
