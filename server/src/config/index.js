import dotenv from "dotenv";

dotenv.config();

export const server_url = `http://localhost:${process.env.PORT}`;
