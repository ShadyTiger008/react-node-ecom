// db.js
import mysql from "mysql2/promise";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let pool;

let Host = process.env.DB_HOST || "localhost";
let User = process.env.DB_USER || "root";
let Password = process.env.DB_PASSWORD || "soumya008";
let Database = process.env.DB_NAME || "ecommerce";

export const connectDB = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool({
        host: Host,
        user: User,
        password: Password,
        database: Database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      console.log("Connected to MySQL database");
    }
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1); // Exit the process if unable to connect to the database
  }
};

export function getConnection() {
  if (!pool) {
    console.log("Database connection has not been established.");
  }
  return pool;
}

// import mongoose from "mongoose";

// export async function connectDB() {
//   try {
//     mongoose.connect(process.env.MONGO_URI!);
//     mongoose.connection.on("connected", () =>
//       console.log("Mongoose connected to " + process.env.MONGO_URI)
//     );
//     mongoose.connection.on("error", (error) => {
//       console.log(
//         "Mongo DB Connection error, Please make sure Database is up and running",
//         error
//       );
//       process.exit(1);
//     });
//   } catch (error) {
//     console.log("Somethings went wrong while connecting to DB!", error);
//   }
// }
