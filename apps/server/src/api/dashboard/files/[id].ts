import type { Response } from "express";
import { Auth } from "../../../lib/Auth.js";
import type { DashboardRequest, FilesEditFormBody, Middleware, RequestMethods } from "../../../lib/types.js";
import type Server from "../../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	const { id } = req.params;
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	const files = await server.prisma.file.findMany({ where: { domain: req.locals.domain.domain } });
	const data = req.body as FilesEditFormBody;
	if (typeof data.name !== "string" || data.name.includes(".") || data.name.includes("/")) {
		res.status(400).send({ message: "Invalid file name provided" });
		return;
	}

	if (typeof data.passwordEnabled !== "boolean") {
		res.status(400).send({ message: "Invalid passwordEnabled value provided" });
		return;
	}

	if (typeof data.visible !== "boolean") {
		res.status(400).send({ message: "Invalid visible value provided" });
		return;
	}

	try {
		await server.prisma.file.update({
			where: { id_domain: { domain: req.locals.domain.domain, id } },
			data: {
				password: data.password
					? Auth.encryptPassword(data.password, server.envConfig.encryptionKey)
					: data.passwordEnabled
					? undefined
					: null,
				visible: data.visible,
				id: files.map((file) => file.id).includes(data.name) ? undefined : data.name
			}
		});
		res.sendStatus(204);
	} catch (err) {
		server.logger.fatal(`[FILES:POST]: Fatal error while updating a file `, err);
		res.status(500).send({ message: "Internal server error occured, please try again later." });
	}
}

export const methods: RequestMethods[] = ["post"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];
