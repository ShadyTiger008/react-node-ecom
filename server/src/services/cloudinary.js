import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "ddcpocb6l",
  api_key: process.env.CLOUDINARY_API_KEY || "666319358326825",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "gq2F896k7DFJ9_sYQTYQLWa5WI8",
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
