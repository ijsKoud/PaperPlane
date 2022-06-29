import { watch } from "chokidar";
import { existsSync, Stats } from "node:fs";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { Server } from "../Server";
import { createToken, encryptPassword, generateId } from "../utils";

export class Data {
	public filesDir = join(process.cwd(), "data", "files");

	public constructor(public server: Server) {}

	public async init() {
		if (!existsSync(this.filesDir)) await mkdir(this.filesDir, { recursive: true }).catch(() => void 0);

		await this.migrate();
		watch(this.filesDir, { alwaysStat: true })
			.on("unlink", (path) => this.unlink(path))
			.on("change", (path, stats) => this.change(path, stats!));

		await this.createUser();
	}

	public async unlink(path: string) {
		await this.server.prisma.file.delete({ where: { path } }).catch(() => void 0);
	}

	public async change(path: string, stats: Stats) {
		const file = await this.server.prisma.file.findFirst({ where: { path } });
		if (!file) return;

		await this.server.prisma.file.update({ where: { path }, data: { size: BigInt(stats.size) } });
	}

	public async migrate() {
		const dir = join(process.cwd(), "data", "files");
		const _files = await readdir(dir);

		const exist: string[] = [];
		const newFiles: string[] = [];
		const files = await this.server.prisma.file.findMany();

		for await (const file of _files) {
			const filePath = join(dir, file);
			const dbFile = files.find((f) => f.path === filePath);

			if (dbFile) {
				exist.push(dbFile.id);
				continue;
			}

			const id = generateId() || file.split(".")[0];
			const stats = await stat(filePath);
			await this.server.prisma.file.create({ data: { date: new Date(), id, path: filePath, size: BigInt(stats.size) } });
			exist.push(id);
			newFiles.push(id);
		}

		const removed = files.filter((f) => !exist.includes(f.id)).map((f) => f.id);
		await this.server.prisma.file.deleteMany({ where: { id: { in: removed } } });

		this.server.logger.info(`Database file migrations complete - ${newFiles.length} files added & ${removed.length} files removed`);
	}

	private async createUser() {
		const users = await this.server.prisma.user.count();
		if (users) return;

		const password = encryptPassword("password");
		await this.server.prisma.user.create({ data: { embedEnabled: false, password, token: createToken(), username: "username" } });
		console.log(
			`[LOCAL]: New user created with username: 'username' and password: 'password'. Please login and change both credentials immediately!`
		);
	}
}
