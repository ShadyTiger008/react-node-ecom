import dotenv from "dotenv";
import { config } from "./environment.js";

dotenv.config();

export const server_url = `http://localhost:${config.get("port")}`;
