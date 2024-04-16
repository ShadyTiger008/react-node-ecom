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

  const supportID = req.query.supportID;
  if (!supportID) throw new ApiError(400, "wishlist id is required!");
  console.log(supportID);

  const connection = await getConnection();

  const supportItem = await connection.query(
    `SELECT * FROM supports WHERE supportID=?`,
    [supportID]
  );
  // console.log( wishlistItem[ 0 ] );

  if (supportItem[0].length === 0) {
    throw new ApiError(403, "This product is already removed!");
  }

  if (!supportItem[0][0] || supportItem[0][0].userID !== userId) {
    throw new ApiError(403, "You are not authorized to delete this item");
  }

  const isDeleted = await connection.query(
    `DELETE FROM supports WHERE supportID=?`,
    [supportID]
  );
  if (!isDeleted)
    throw new ApiError(500, "Can't remove this support ticket");

  res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Successfully removed the support")
    );
});

const getSupport = asyncHandler(async (req, res) => {
  let page = req.query.page || 1;
  let sort = req.query.sort || "ASC";
  let limit = req.query.limit || 10;
  let skip = (page - 1) * limit;

  const userId = req.user?.userID;
  if (!userId) throw new ApiError(403, "No logged in user found!");

  const connection = await getConnection();

  let query = `
    SELECT 
      supports.supportID, supports.subject, supports.description, supports.userID, 
      supports.supportType, supports.userEmail, supports.userPhone, supports.status AS support_status, 
      supports.priority, supports.attachments, supports.createdAt, supports.updatedAt, 
      users.fullName, users.gender, users.email, users.phone, users.address, users.city, 
      users.state, users.zip, users.type, users.status, users.createdAt, users.profileImage 
    FROM supports
    INNER JOIN users ON supports.userID = users.userID`;

  const queryValues = [];
  const whereClauses = [];

  if (req.query.supportID) {
    whereClauses.push("supports.supportID = ?");
    queryValues.push(req.query.supportID);
  }
  if (req.query.userID) {
    whereClauses.push("supports.userID = ?");
    queryValues.push(req.query.userID);
  }
  if (req.query.supportType) {
    whereClauses.push("supports.supportType = ?");
    queryValues.push(req.query.supportType);
  }
  if (req.query.email) {
    whereClauses.push("supports.userEmail = ?");
    queryValues.push(req.query.email);
  }
  if (req.query.phone) {
    whereClauses.push("supports.userPhone = ?");
    queryValues.push(req.query.phone);
  }
  if (req.query.status) {
    whereClauses.push("supports.status = ?");
    queryValues.push(req.query.status);
  }
  if (req.query.priority) {
    whereClauses.push("supports.priority = ?");
    queryValues.push(req.query.priority);
  }
  if (req.query.created_from && req.query.created_to) {
    whereClauses.push("supports.createdAt BETWEEN ? AND ?");
    queryValues.push(req.query.created_from, req.query.created_to);
  }
  if (req.query.updated_from && req.query.updated_to) {
    whereClauses.push("supports.updatedAt BETWEEN ? AND ?");
    queryValues.push(req.query.updated_from, req.query.updated_to);
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  const orderBy = req.query.sortBy || "supportID";
  const sortOrder = sort.toUpperCase() === "DESC" ? "DESC" : "ASC";
  query += ` ORDER BY ${orderBy} ${sortOrder} LIMIT ${limit} OFFSET ${skip}`;

  const supportItems = await connection.query(query, queryValues);

  console.log(supportItems);

  if (!supportItems[0].length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No support ticket found"));
  }

  const totalCount = await connection.query(
    `SELECT COUNT(*) AS total FROM supports`
  );
  const count = totalCount[0][0].total;

  const formattedSupportItems = supportItems[0].map((item) => ({
    supportId: item.supportID,
    subject: item.subject,
    description: item.description,
    supportType: item.supportType,
    userId: item.userID,
    userEmail: item.userEmail,
    userPhone: item.userPhone,
    supportStatus: item.support_status,
    priority: item.priority,
    attachments: item.attachments,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    userDetails: {
      fullName: item.fullName,
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
