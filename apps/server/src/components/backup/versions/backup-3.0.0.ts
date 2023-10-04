import type { File, Token, Url, Prisma } from "@prisma/client";
import _ from "lodash";
import ms from "ms";
import { readdir, readFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { Auth } from "#lib/Auth.js";
import { Utils } from "#lib/utils.js";
import type { iBackupV300 } from "../types.js";
import Backup from "../Backup.js";
import Config from "#lib/Config.js";

export default class BackupV300 extends Backup {
	/**
	 * Import the backup
	 * @param dir The backup contents directory
	 */
	public async import(dir: string) {
		const files = await readdir(dir);
		if (!files.includes("db.json")) throw new Error(JSON.stringify({ errors: { backup: "Unknown db.json file" } }));
		if (!files.includes("files")) throw new Error(JSON.stringify({ errors: { backup: "Unknown files folder" } }));

		const filePath = join(dir, "db.json");
		const dbData = await readFile(filePath, "utf8");
		const data = this.parseDatabase(dbData);

		// create user
		const domain = await this.server.prisma.domain.create({ data: data.user });

		// Add files to the database
		for (const file of data.files) {
			const [filename] = file.path.split("/").reverse();
			await this.server.prisma.file.create({ data: { ...file, path: join(this.dir, "files", domain.pathId, filename) } });
		}

		// add urls to database
		for (const url of data.urls) {
			await this.server.prisma.url.create({ data: url });
		}

		// move files from backup to correct data folder
		await rename(join(dir, "files"), join(this.dir, "files", domain.pathId));
	}

	private parseDatabase(_data: string) {
		const errors: Record<string, any> = {};
		const data = JSON.parse(_data) as iBackupV300;

		if (typeof data.version !== "string" || data.version !== "3.0.0") errors.version = "INVALID_VERSION";

		// parse the user data
		const _user = this.parseUser(data.user);
		if (typeof _user === "string") errors.user = _user;

		// cast user to correct type
		const user = _user as Prisma.DomainCreateArgs["data"];

		// parse the files
		const _files = [...this.parseFiles(data.files, data.user.username)];
		if (_files.some((file) => typeof file === "string")) {
			const results = this.mapErrors(_files);
			errors.files = results;
		}

		// parse the urls
		const _urls = [...this.parseUrls(data.urls, data.user.username)];
		if (_urls.some((url) => typeof url === "string")) {
			const results = this.mapErrors(_urls);
			errors.urls = results;
		}

		// cast the files and urls to the correct type
		const files = _files as File[];
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
		if (!this.typeofBoolean(user.embedEnabled)) {
			return "INVALID_EMBED_ENABLED";
		}
		if (typeof user.embedTitle !== "string" && !_.isNull(user.embedTitle)) {
			return "INVALID_EMBED_TITLE";
		}
		if (!this.typeofString(user.username)) {
			return "INVALID_USERNAME";
		}
		if (!this.typeofString(user.token)) {
			return "INVALID_API_TOKEN";
		}

		const config = Config.getEnv();
		const apiTokens: Omit<Token, "domain">[] = [{ date: new Date(), name: "v3-token", token: user.token }];

		const date = new Date();
		const domain: Prisma.DomainCreateArgs["data"] = {
			auditlogDuration: ms(config.auditLogDuration),
			disabled: false,
			domain: user.username,
			apiTokens: { create: apiTokens },
			date,
			backupCodes: "paperplane-cdn",
			embedColor: user.embedColour || "#000000",
			embedDescription: user.embedDescription || undefined,
			embedEnabled: user.embedEnabled,
			embedTitle: user.embedTitle || undefined,
			extensionsList: config.extensionsList.join(","),
			extensionsMode: config.extensionsMode,
			maxStorage: Utils.parseStorage(config.maxStorage),
			maxUploadSize: Utils.parseStorage(config.maxUpload)
		};

		return domain;
	}

	private *parseFiles(files: iBackupV300["files"], domain: string) {
		const config = Config.getEnv();

		for (const file of files) {
			if (typeof file !== "object") {
				yield "INVALID_FILE_OBJECT";
				continue;
			}
			if (!this.typeofString(file.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!this.typeofString(file.id)) {
				yield "INVALID_ID";
				continue;
			}
			if (file.password && !this.typeofString(file.password)) {
				yield "INVALID_PASSWORD";
				continue;
			}
			if (!this.typeofString(file.path)) {
				yield "INVALID_FILE_PATH";
				continue;
			}
			if (!this.typeofString(file.size)) {
				yield "INVALID_SIZE";
				continue;
			}
			if (!this.typeofNumber(file.views)) {
				yield "INVALID_VIEWS";
				continue;
			}
			if (!this.typeofBoolean(file.visible)) {
				yield "INVALID_VISIBLE";
				continue;
			}

			const authBuffer = Buffer.from(`${Auth.generateToken(32)}.${Date.now()}.${domain}.${file.id}`).toString("base64");
			const authSecret = Auth.encryptToken(authBuffer, config.encryptionKey);
			const password = file.password ? Auth.encryptPassword(file.password, config.encryptionKey) : null;

			const fileObj: File = {
				...file,
				mimeType: "",
				date: new Date(file.date),
				authSecret,
				domain,
				password
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
			if (!this.typeofString(url.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!this.typeofString(url.id)) {
				yield "INVALID_ID";
				continue;
			}
			if (!this.typeofString(url.url)) {
				yield "INVALID_URL";
				continue;
			}
			if (!this.typeofNumber(url.visits)) {
				yield "INVALID_VISITS";
				continue;
			}
			if (!this.typeofBoolean(url.visible)) {
				yield "INVALID_VISIBLE";
				continue;
			}

			const urlObj: Url = { ...url, date: new Date(url.date), domain };
			yield urlObj;
		}
	}
}
