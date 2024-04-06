import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { config } from "../config/environment.js";
import dotenv from "dotenv";

dotenv.config();

console.log(config.get("cloud_name"));

cloudinary.config({
  cloud_name: config.get("cloud_name"),
  api_key: config.get("cloud_key"),
  api_secret: config.get("cloud_api"),
});

const uploadOnCloudinary = async function (localFilePath) {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //File has been successfully uploaded
    console.log("File is uploaded successfully ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
