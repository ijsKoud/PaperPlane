import type { Response } from "express";
import { Auth } from "../../lib/Auth.js";
import type { DashboardRequest, Middleware, RequestMethods, UpdateDashboardEmbedFormBody } from "../../lib/types.js";
import { Utils } from "../../lib/utils.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	if (req.method === "GET") {
		res.send({
			title: req.locals.domain.embedTitle,
			description: req.locals.domain.embedDescription,
			color: req.locals.domain.embedColor
		});

		return;
	}

	if (req.method === "POST") {
		try {
			const data = req.body as UpdateDashboardEmbedFormBody;
			if (typeof data.title !== "string" || data.title.length > 256) {
				res.status(400).send({ message: "Invalid title provided" });
				return;
			}

			if (typeof data.description !== "string" || data.description.length > 4096) {
				res.status(400).send({ message: "Invalid description provided" });
				return;
			}

			if (typeof data.title !== "string" || !Utils.checkColor(data.color)) {
				res.status(400).send({ message: "Invalid color provided" });
				return;
			}

			await req.locals.domain.update({ embedTitle: data.title, embedDescription: data.description, embedColor: data.color });
			req.locals.domain.auditlogs.register("Embed Update", "N/A");
			res.sendStatus(204);
			return;
		} catch (err) {
			server.logger.fatal(`[EMBED:POST]: Fatal error while updating a PaperPlane account `, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}
	}
}

export const methods: RequestMethods[] = ["get", "post"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];
