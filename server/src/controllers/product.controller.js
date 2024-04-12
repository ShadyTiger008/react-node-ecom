import { getConnection } from "../db/index.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    category,
    subcategory,
    gender,
    sizes,
    colors,
    ratings,
  } = req.body;

  const queryFields = [
    "title",
    "description",
    "price",
    "category",
    "subcategory",
    "gender",
    "sizes",
    "colors",
    "ratings",
  ];

  let queryValues = [
    title,
    description,
    price,
    category,
    subcategory,
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

    console.log("Images local path: ", imagesLocalPath);

    if (!imagesLocalPath) {
      throw new ApiError(400, "Images are required!");
    }

    console.log("Uploading images to Cloudinary:", imagesLocalPath);

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

  console.log("Query fields: ", queryFields);
  console.log("Query values: ", queryValues);

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
