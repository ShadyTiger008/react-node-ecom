import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";

dotenv.config({
  path: "./.env",
} );

const port = process.env.PORT || 8001

connectDB()
  .then(() => {
    app.listen(port, (req, res) => {
      console.log(`⚙️  Server listening on ${port}.....`);
    });
  })
  .catch((error) => {
    console.log(`Error listening on ${port}`, error);
  });
