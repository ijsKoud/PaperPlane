import { watch } from "chokidar";
import { nanoid } from "nanoid";
import { existsSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Server } from "../Server";

export class Data {
	public constructor(public server: Server) {}

	public async init() {
		const dir = join(process.cwd(), "data", "files");
		if (!existsSync(dir)) await mkdir(dir, { recursive: true }).catch(() => void 0);

		await this.migrate();
		watch(dir)
			.on("unlink", (path) => this.unlink(path))
			.on("add", (path) => this.link(path));
	}

	public async unlink(path: string) {
		await this.server.prisma.image.delete({ where: { path } });
	}

	public async link(path: string) {
		const file = await this.server.prisma.image.findUnique({ where: { path } });
		if (file) return;

		await this.server.prisma.image.create({ data: { date: new Date(), id: nanoid(10), path } });
	}

	public async migrate() {
		const dir = join(process.cwd(), "data", "files");
		const files = await readdir(dir);
		const images = await this.server.prisma.image.findMany();

		for await (const file of files) {
			const filePath = join(dir, file);
			if (images.find((img) => img.path === filePath)) break;

			await this.server.prisma.image.create({ data: { date: new Date(), id: nanoid(10), path: filePath } });
		}

		console.log("Database file migrations complete!");
	}
}
