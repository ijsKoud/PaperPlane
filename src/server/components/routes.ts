import type { Request, Response } from "express";
import { scryptSync, timingSafeEqual } from "node:crypto";
import type { Server } from "../Server";

export class Routes {
	public DISCORD_IMAGE_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 11.6; rv:92.0) Gecko/20100101 Firefox/92.0";

	public constructor(public server: Server) {}

	public init() {
		this.server.express.get("/files/:id", this.getFile.bind(this));
	}

	private async getFile(req: Request, res: Response) {
		const { id, password, check } = req.params;
		const isUserAgent = req.headers["user-agent"] === this.DISCORD_IMAGE_AGENT;

		const user = await this.server.prisma.user.findFirst();
		const file = await this.server.prisma.file.findUnique({ where: { id } });

		if (!file) return this.server.next.render404(req, res);
		if (file.password && !password && !isUserAgent) return this.server.next.render(req, res, `/files/${id}?type=password`);
		if (user?.embedEnabled && isUserAgent)
			return this.server.next.render(req, res, `/files/${id}?type=discord&p=${encodeURIComponent(password)}`);

		if (file.password) {
			const [salt, key] = file.password.split(":");
			const passwordBuffer = scryptSync(password, salt, 64);

			const keyBuffer = Buffer.from(key, "hex");
			const match = timingSafeEqual(passwordBuffer, keyBuffer);
			if (!match) return res.status(404).send({ message: "Incorrect password provided" });

			// check if a check param is present -> send 204 success res back
			if (check) return res.sendStatus(204);
		}

		res.sendFile(file.path, (err) => (err ? res.end() : null));
	}
}
