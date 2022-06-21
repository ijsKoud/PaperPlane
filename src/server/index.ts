import { config } from "dotenv";
import { join } from "node:path";
import { Server } from "./Server";
config({ path: join(process.cwd(), "data", ".env") });

const server = new Server();
void server.run();
