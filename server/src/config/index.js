import dotenv from "dotenv";
import { config } from "../constants/environment";

dotenv.config();

export const server_url = `http://localhost:${config.get('port')}`;
