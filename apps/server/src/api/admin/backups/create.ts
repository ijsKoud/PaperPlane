import type { Response, Request } from "express";
import { Auth } from "../../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../../lib/types.js";
import type Server from "../../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	const backup = await server.backups.createBackup();
	if (!backup) {
		res.status(500).send({ message: "Fatal error while creating a backup, please check the server logs for more information." });
		return;
	}

	res.send({ name: backup });
}

export const methods: RequestMethods[] = ["post"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];
