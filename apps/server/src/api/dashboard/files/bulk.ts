import type { Response } from "express";
import { Auth } from "../../../lib/Auth.js";
import type { DashboardRequest, FilesBulkDeleteFormBody, Middleware, RequestMethods } from "../../../lib/types.js";
import type Server from "../../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (req.method === "DELETE") {
		const data = req.body as FilesBulkDeleteFormBody;
		if (!Array.isArray(data.files)) {
			res.status(400).send({ message: "Invalid files array provided" });
			return;
		}

		const files = data.files.filter((file) => typeof file === "string");
		await server.prisma.file.deleteMany({ where: { id: { in: files }, domain: req.locals.domain.domain } });
		res.sendStatus(204);
	}
}

export const methods: RequestMethods[] = ["delete"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];
