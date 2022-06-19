import { watch } from "chokidar";
import { nanoid } from "nanoid";
import { existsSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Server } from "../Server";

export class Data {
	public filesDir = join(process.cwd(), "data", "files");

	public constructor(public server: Server) {}

	public async init() {
		if (!existsSync(this.filesDir)) await mkdir(this.filesDir, { recursive: true }).catch(() => void 0);

		await this.migrate();
		watch(this.filesDir)
			.on("unlink", (path) => this.unlink(path))
			.on("add", (path) => this.link(path));
	}

	public async unlink(path: string) {
		await this.server.prisma.file.delete({ where: { path } });
	}

	public async link(path: string) {
		const file = await this.server.prisma.file.findUnique({ where: { path } });
		if (file) return;

		await this.server.prisma.file.create({ data: { date: new Date(), id: nanoid(10), path } });
	}

	public async migrate() {
		const dir = join(process.cwd(), "data", "files");
		const _files = await readdir(dir);
		const files = await this.server.prisma.file.findMany();

		for await (const file of _files) {
			const filePath = join(dir, file);
			if (files.find((f) => f.path === filePath)) break;

			await this.server.prisma.file.create({ data: { date: new Date(), id: nanoid(10), path: filePath } });
		}

		console.log("Database file migrations complete!");
	}
}
