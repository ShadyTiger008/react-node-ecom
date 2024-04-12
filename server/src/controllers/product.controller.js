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

const updateProduct = asyncHandler(async (req, res) => {});

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
