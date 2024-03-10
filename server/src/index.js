import express from "express";
import { server_url } from "../src/config/index.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

console.log(process.env.PORT);

app.listen(process.env.PORT, () => {
  console.log(`⚙️ Server is running on ${server_url}...`);
});
