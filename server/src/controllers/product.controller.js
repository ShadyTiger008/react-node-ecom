import { getConnection } from "../db/index.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    actualPrice,
    currentPrice,
    category,
    subcategory,
    isNew,
    isFeatured,
    isBestSeller,
    gender,
    sizes,
    colors,
    ratings,
  } = req.body;

  const queryFields = [
    "title",
    "description",
    "actualPrice",
    "currentPrice",
    "category",
    "subcategory",
    "isNew",
    "isFeatured",
    "isBestSeller",
    "gender",
    "sizes",
    "colors",
    "ratings",
  ];

  let queryValues = [
    title,
    description,
    actualPrice,
    currentPrice ? currentPrice : actualPrice,
    category,
    subcategory,
    isNew ? isNew : 1,
    isFeatured ? isFeatured : 0,
    isBestSeller ? isBestSeller : 0,
    gender,
    sizes,
    colors,
    ratings,
  ];

  const connection = await getConnection();

  let uploadedImageArray = [];

  if (req.files && req.files.images) {
    const imagesArray = req.files.images;
    const imagesLocalPath = imagesArray.map((image) => image.path);

    // console.log("Images local path: ", imagesLocalPath);

    if (!imagesLocalPath) {
      throw new ApiError(400, "Images are required!");
    }

    // console.log("Uploading images to Cloudinary:", imagesLocalPath);

    const uploadedImages = await Promise.all(
      imagesLocalPath.map(uploadOnCloudinary)
    );

    uploadedImages.forEach((image) => {
      uploadedImageArray.push(image.url);
    });

    if (!uploadedImageArray.length) {
      console.error("Images upload to Cloudinary failed:", imagesLocalPath);
      throw new ApiError(400, "Image files are required!");
    }

    queryFields.push("images");
    queryValues.push(JSON.stringify(uploadedImageArray));
  }

  // console.log("Query fields: ", queryFields);
  // console.log("Query values: ", queryValues);

  const placeholders = queryValues.map(() => "?").join(", ");
  const query = `INSERT INTO products (${queryFields.join(
    ", "
  )}) VALUES (${placeholders})`;

  const productAdded = await connection.query(query, queryValues);

  if (!productAdded) {
    throw new ApiError(500, "Product can't be added!");
  }

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

const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.query.productId;

  const {
    title,
    description,
    actualPrice,
    currentPrice,
    category,
    subcategory,
    isNew,
    isFeatured,
    isBestSeller,
    gender,
    sizes,
    colors,
    ratings,
  } = req.body;

  const queryFields = [];

  let queryValues = [];

  if (title) {
    queryFields.push("title");
    queryValues.push(title);
  }
  if (description) {
    queryFields.push("description");
    queryValues.push(description);
  }
  if (actualPrice) {
    queryFields.push("actualPrice");
    queryValues.push(actualPrice);
  }
  if (currentPrice) {
    queryFields.push("currentPrice");
    queryValues.push(currentPrice);
  }
  if (category) {
    queryFields.push("category");
    queryValues.push(category);
  }
  if (subcategory) {
    queryFields.push("subcategory");
    queryValues.push(subcategory);
  }
  if (isNew) {
    queryFields.push("isNew");
    queryValues.push(isNew);
  }
  if (isFeatured) {
    queryFields.push("isFeatured");
    queryValues.push(isFeatured);
  }
  if (isBestSeller) {
    queryFields.push("isBestSeller");
    queryValues.push(isBestSeller);
  }
  if (gender) {
    queryFields.push("gender");
    queryValues.push(gender);
  }
  if (sizes) {
    queryFields.push("sizes");
    queryValues.push(sizes);
  }
  if (colors) {
    queryFields.push("colors");
    queryValues.push(colors);
  }
  if (ratings) {
    queryFields.push("ratings");
    queryValues.push(ratings);
  }

  const connection = await getConnection();

  let uploadedImageArray = [];

  if (req.files && req.files.images) {
    const imagesArray = req.files.images;
    const imagesLocalPath = imagesArray.map((image) => image.path);

    // console.log("Images local path: ", imagesLocalPath);

    if (!imagesLocalPath) {
      throw new ApiError(400, "Images are required!");
    }

    // console.log("Uploading images to Cloudinary:", imagesLocalPath);

    const uploadedImages = await Promise.all(
      imagesLocalPath.map(uploadOnCloudinary)
    );

    uploadedImages.forEach((image) => {
      uploadedImageArray.push(image.url);
    });

    if (!uploadedImageArray.length) {
      console.error("Images upload to Cloudinary failed:", imagesLocalPath);
      throw new ApiError(400, "Image files are required!");
    }

    queryFields.push("images");
    queryValues.push(JSON.stringify(uploadedImageArray));
  }

  // console.log("Query fields: ", queryFields);
  // console.log("Query values: ", queryValues);

  const fieldsToUpdate = queryFields.map((field) => `${field}=?`).join(", ");
  const fieldValues = [...queryValues, productId];
  const query = `UPDATE products SET ${fieldsToUpdate} WHERE productID=?`;

  const productUpdated = await connection.query(query, fieldValues);

  if (!productUpdated) {
    throw new ApiError(500, "Product can't be added!");
  }

  const updatedProduct = await connection.query(
    `SELECT * FROM products WHERE productID=?`,
    [productId]
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        201,
        updatedProduct[0][0],
        "Product successfully created!"
      )
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.query.productId;
  if (!productId) throw new ApiError(401, "No product ID is selected");

  const connection = await getConnection();

  const product = await connection.query(
    `SELECT * FROM products WHERE productID=?`,
    [productId]
  );
  if (!product) throw new ApiError(404, "No product found with this ID");

  const productDeleted = await connection.query(
    `DELETE FROM products WHERE productID=?`,
    [productId]
  );
  if (!productDeleted) throw new ApiError(500, "Product can't be deleted");

  return res
    .status(200)
    .json(new ApiResponse(200, deleteProduct, "Product deleted successfully!"));
});

const getProductByID = asyncHandler(async (req, res) => {
  const productId = req.query.productId;
  if (!productId) throw new ApiError(401, "No product ID is selected");

  const connection = await getConnection();

  const product = await connection.query(
    `SELECT * FROM products WHERE productID=?`,
    [productId]
  );
  if (!product) throw new ApiError(404, "No product found with this ID");

  return res
    .status(200)
    .json(
      new ApiResponse(200, product[0][0], "Successfully got the user by id!")
    );
});

const getAllProduct = asyncHandler(async (req, res) => {
  let page = req.query.page || 1;
  let sort = req.query.sort || "ASC";
  let limit = req.query.limit || 10;
  let skip = (page - 1) * limit;

  let orderBy = "productID";
  if (req.query.sortBy) {
    orderBy = req.query.sortBy;
  }

  const sortOrder = sort.toUpperCase() === "DESC" ? "DESC" : "ASC";

  let queryFields = [];
  let queryValues = [];

  if (req.query.isBestSeller) {
    queryFields.push("isBestSeller");
    queryValues.push(req.query.isBestSeller);
  }
  if (req.query.isNew) {
    queryFields.push("isNew");
    queryValues.push(req.query.isNew);
  }
  if (req.query.isFeatured) {
    queryFields.push("isFeatured");
    queryValues.push(req.query.featured);
  }
  if (req.query.gender) {
    queryFields.push("gender");
    queryValues.push(req.query.gender);
  }
  if (req.query.size) {
    queryFields.push("gender");
    queryValues.push(req.query.size);
  }
  if (req.query.subcategory) {
    queryFields.push("subcategory");
    queryValues.push(req.query.subcategory);
  }
  if (req.query.category) {
    queryFields.push("category");
    queryValues.push(req.query.category);
  }
  if (req.query.title) {
    queryFields.push("title");
    queryValues.push(req.query.title);
  }
  if (req.query.minCurrentPrice) {
    queryFields.push("currentPrice >= ?");
    queryValues.push(req.query.minCurrentPrice);
  }
  if (req.query.maxCurrentPrice) {
    queryFields.push("currentPrice <= ?");
    queryValues.push(req.query.maxCurrentPrice);
  }
  if (req.query.minActualPrice) {
    queryFields.push("actualPrice >= ?");
    queryValues.push(req.query.minActualPrice);
  }
  if (req.query.maxActualPrice) {
    queryFields.push("actualPrice <= ?");
    queryValues.push(req.query.maxActualPrice);
  }

  const connection = await getConnection();
  const query =
    queryFields.length > 0
      ? `SELECT * FROM products WHERE ${queryFields.join(
          " AND "
        )} ORDER BY ${orderBy} ${sortOrder} LIMIT ${limit} OFFSET ${skip}`
      : `SELECT * FROM products ORDER BY ${orderBy} ${sortOrder} LIMIT ${limit} OFFSET ${skip}`;

  const products = await connection.query(query, queryValues);

  const count = products[0].length;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { products: products[0], total: count, page: parseInt(page) },
        "Successfully fetched all the products!"
      )
    );
});

export {
  addProduct,
  updateProduct,
  deleteProduct,
  getProductByID,
  getAllProduct,
};
