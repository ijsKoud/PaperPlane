import { config } from "dotenv";
import { join } from "node:path";
config({ path: join(process.cwd(), "..", "..", "data", ".env") });

import Server from "./Server.js";
void (async () => {
	const server = new Server();
	await server.run();
})();
