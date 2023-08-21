import type { File, Token, Url, Prisma } from "@prisma/client";
import _ from "lodash";
import ms from "ms";
import { readdir, readFile, rename } from "node:fs/promises";
import { join } from "node:path";
import type Server from "../../../Server.js";
import { Auth } from "../../Auth.js";
import { Utils } from "../../utils.js";
import { BackupUtils } from "../BackupUtils.js";
import type { iBackupV300 } from "../types.js";

export class BackupV300 {
	public constructor(
		public server: Server,
		public dataDir: string
	) {}

	public async import(dir: string) {
		const files = await readdir(dir);
		if (!files.includes("db.json")) throw new Error(JSON.stringify({ errors: { backup: "Unknown db.json file" } }));
		if (!files.includes("files")) throw new Error(JSON.stringify({ errors: { backup: "Unknown files folder" } }));

		const filePath = join(dir, "db.json");
		const dbData = await readFile(filePath, "utf8");
		const data = this.parseDatabase(dbData);

		const domain = await this.server.prisma.domain.create({ data: data.user });

		for (const file of data.files) {
			const [filename] = file.path.split("/").reverse();
			await this.server.prisma.file.create({ data: { ...file, path: join(this.dataDir, "files", domain.pathId, filename) } });
		}

		for (const url of data.urls) {
			await this.server.prisma.url.create({ data: url });
		}

		await rename(join(dir, "files"), join(this.dataDir, "files", domain.pathId));
	}

	private parseDatabase(_data: string) {
		const errors: Record<string, any> = {};
		const data = JSON.parse(_data) as iBackupV300;

		if (typeof data.version !== "string" || data.version !== "3.0.0") errors.version = "INVALID_VERSION";

		const _user = this.parseUser(data.user);
		if (typeof _user === "string") errors.user = _user;

		const user = _user as Prisma.DomainCreateArgs["data"];

		const _files = [...this.parseFiles(data.files, data.user.username)];
		if (_files.some((file) => typeof file === "string")) {
			const results = _files
				.map((res, key) => ({ res, key }))
				.filter((res) => typeof res.res === "string")
				.map((res) => ({ [res.key]: res.res as string }));
			errors.files = results;
		}
		const files = _files as File[];

		const _urls = [...this.parseUrls(data.urls, data.user.username)];
		if (_urls.some((url) => typeof url === "string")) {
			const results = _urls
				.map((res, key) => ({ res, key }))
				.filter((res) => typeof res.res === "string")
				.map((res) => ({ [res.key]: res.res as string }));
			errors.urls = results;
		}
		const urls = _urls as Url[];

		if (Object.keys(errors).length) throw new Error(JSON.stringify({ errors }));
		return {
			user,
			files,
			urls
		};
	}

	private parseUser(user: iBackupV300["user"]) {
		if (typeof user !== "object") {
			return "INVALID_USER_OBJECT";
		}
		if (typeof user.embedColour !== "string" && !_.isNull(user.embedColour)) {
			return "INVALID_EMBED_COLOR";
		}
		if (typeof user.embedDescription !== "string" && !_.isNull(user.embedDescription)) {
			return "INVALID_EMBED_DESCRIPTION";
		}
		if (!BackupUtils.typeofBoolean(user.embedEnabled)) {
			return "INVALID_EMBED_ENABLED";
		}
		if (typeof user.embedTitle !== "string" && !_.isNull(user.embedTitle)) {
			return "INVALID_EMBED_TITLE";
		}
		if (!BackupUtils.typeofString(user.username)) {
			return "INVALID_USERNAME";
		}
		if (!BackupUtils.typeofString(user.token)) {
			return "INVALID_API_TOKEN";
		}

		const { envConfig } = this.server;
		const apiTokens: Omit<Token, "domain">[] = [{ date: new Date(), name: "v3-token", token: user.token }];

		const date = new Date();
		const domain: Prisma.DomainCreateArgs["data"] = {
			auditlogDuration: ms(envConfig.auditLogDuration),
			disabled: false,
			domain: user.username,
			apiTokens: { create: apiTokens },
			date,
			backupCodes: "paperplane-cdn",
			embedColor: user.embedColour || "#000000",
			embedDescription: user.embedDescription || undefined,
			embedEnabled: user.embedEnabled,
			embedTitle: user.embedTitle || undefined,
			extensionsList: envConfig.extensionsList.join(","),
			extensionsMode: envConfig.extensionsMode,
			maxStorage: Utils.parseStorage(envConfig.maxStorage),
			maxUploadSize: Utils.parseStorage(envConfig.maxUpload)
		};

		return domain;
	}

	private *parseFiles(files: iBackupV300["files"], domain: string) {
		for (const file of files) {
			if (typeof file !== "object") {
				yield "INVALID_FILE_OBJECT";
				continue;
			}
			if (!BackupUtils.typeofString(file.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!BackupUtils.typeofString(file.id)) {
				yield "INVALID_ID";
				continue;
			}
			if (file.password && !BackupUtils.typeofString(file.password)) {
				yield "INVALID_PASSWORD";
				continue;
			}
			if (!BackupUtils.typeofString(file.path)) {
				yield "INVALID_FILE_PATH";
				continue;
			}
			if (!BackupUtils.typeofString(file.size)) {
				yield "INVALID_SIZE";
				continue;
			}
			if (!BackupUtils.typeofNumber(file.views)) {
				yield "INVALID_VIEWS";
				continue;
			}
			if (!BackupUtils.typeofBoolean(file.visible)) {
				yield "INVALID_VISIBLE";
				continue;
			}

			const authBuffer = Buffer.from(`${Auth.generateToken(32)}.${Date.now()}.${domain}.${file.id}`).toString("base64");
			const authSecret = Auth.encryptToken(authBuffer, this.server.envConfig.encryptionKey);
			const fileObj: File = {
				...file,
				mimeType: "",
				date: new Date(file.date),
				authSecret,
				domain,
				password: file.password ? Auth.encryptPassword(file.password, this.server.envConfig.encryptionKey) : null
			};
			yield fileObj;
		}
	}

	private *parseUrls(urls: iBackupV300["urls"], domain: string) {
		for (const url of urls) {
			if (typeof url !== "object") {
				yield "INVALID_URL_OBJECT";
				continue;
			}
			if (!BackupUtils.typeofString(url.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!BackupUtils.typeofString(url.id)) {
				yield "INVALID_ID";
				continue;
			}
			if (!BackupUtils.typeofString(url.url)) {
				yield "INVALID_URL";
				continue;
			}
			if (!BackupUtils.typeofNumber(url.visits)) {
				yield "INVALID_VISITS";
				continue;
			}
			if (!BackupUtils.typeofBoolean(url.visible)) {
				yield "INVALID_VISIBLE";
				continue;
			}
			const urlObj: Url = { ...url, date: new Date(url.date), domain };
			yield urlObj;
		}
	}
}
