import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";
import { config } from "./constants/environment.js";

dotenv.config({
  path: "./.env",
} );

const port = config.get('port') || 8001

connectDB()
  .then(() => {
    app.listen(port, (req, res) => {
      console.log(`⚙️  Server listening on ${port}.....`);
    });
  })
  .catch((error) => {
    console.log(`Error listening on ${port}`, error);
  });
