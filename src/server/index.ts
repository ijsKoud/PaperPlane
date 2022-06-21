import { config } from "dotenv";
import { join } from "node:path";
config({ path: join(process.cwd(), "data", ".env") });

import { Server } from "./Server";

const server = new Server();
void server.run();
