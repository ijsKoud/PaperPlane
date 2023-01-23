import type { Response, Request } from "express";
import type { RequestMethods } from "../../lib/types.js";

export default function handler(req: Request, res: Response) {
	const { domain, code, password } = req.body ?? {};
	if (typeof domain !== "string") {
		res.status(400).send({ message: "Invalid domain provided" });
		return;
	}

	if (code) {
		if (typeof code !== "number" || code.toString().length !== 6) {
			res.status(400).send({ message: "Invalid Two Factor Authentication provided" });
			return;
		}

		res.sendStatus(204);
		return;
	}

	if (typeof password !== "string") {
		res.status(400).send({ message: "Invalid Password provided" });
		return;
	}

	res.sendStatus(204);
}

export const methods: RequestMethods[] = ["post"];
