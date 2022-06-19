import type { Request, Response } from "express";
import type { Server } from "../Server";

export class Routes {
	public DISCORD_IMAGE_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 11.6; rv:92.0) Gecko/20100101 Firefox/92.0";

	public constructor(public server: Server) {}

	public init() {
		this.server.express.get("/files/:id", this.getFile.bind(this));
	}

	private async getFile(req: Request, res: Response) {
		const { id } = req.params;

		const user = await this.server.prisma.user.findFirst();
		if (user?.embedEnabled && req.headers["user-agent"] === this.DISCORD_IMAGE_AGENT) return this.server.next.render(req, res, `/files/${id}`);

		const file = await this.server.prisma.file.findUnique({ where: { id } });
		if (!file) return this.server.next.render404(req, res);

		res.sendFile(file.path, (err) => (err ? res.end() : null));
	}
}
