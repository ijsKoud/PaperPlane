import type { Response, Request } from "express";
import { Auth } from "../../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../../lib/types.js";
import type Server from "../../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	if (typeof req.body.id !== "string") {
		res.status(400).send({ message: "Invalid backup id provided" });
		return;
	}

	const backup = await server.backups.import(req.body.id ?? "");
	if (!backup) {
		res.status(500).send({ message: "Error while importing a backup, please check the server logs for more information." });
		return;
	}

	if (typeof backup === "object") {
		res.status(500).json(backup);
		return;
	}

	res.sendStatus(204);
}

export const methods: RequestMethods[] = ["post"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];
