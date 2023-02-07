import type { Domain, File, Token, Url, Auditlog, Invites, SignupDomain } from "@prisma/client";
import _ from "lodash";
import { readdir, readFile, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import type Server from "../../../Server.js";
import { BackupUtils } from "../BackupUtils.js";
import type { iBackupV400 } from "../types.js";

export class BackupV400 {
	public constructor(public server: Server, public dataDir: string) {}

	public async import(dir: string) {
		const files = await readdir(dir);
		if (!files.includes("db.json")) throw new Error(JSON.stringify({ errors: { backup: "Unknown db.json file" } }));
		if (!files.includes("files")) throw new Error(JSON.stringify({ errors: { backup: "Unknown files folder" } }));

		const filePath = join(dir, "db.json");
		const dbData = await readFile(filePath, "utf8");
		const data = this.parseDatabase(dbData);

		await this.server.prisma.auditlog.deleteMany();
		await this.server.prisma.file.deleteMany();
		await this.server.prisma.invites.deleteMany();
		await this.server.prisma.url.deleteMany();
		await this.server.prisma.token.deleteMany();

		await this.server.prisma.signupDomain.deleteMany();
		await this.server.prisma.domain.deleteMany();

		for (const user of data.users) {
			const { apiTokens, ...data } = user;
			await this.server.prisma.domain.create({ data: { ...data, apiTokens: { create: apiTokens.map(({ domain, ...rest }) => rest) } } });
		}

		for (const auditlog of data.auditLogs) {
			await this.server.prisma.auditlog.create({ data: auditlog });
		}

		for (const file of data.files) {
			await this.server.prisma.file.create({ data: file });
		}

		for (const url of data.urls) {
			await this.server.prisma.url.create({ data: url });
		}

		for (const invite of data.invites) {
			await this.server.prisma.invites.create({ data: invite });
		}

		for (const signupDomain of data.signupDomains) {
			await this.server.prisma.signupDomain.create({ data: signupDomain });
		}

		this.server.config.config.encryptionKey = data.encryption;
		await this.server.config.triggerUpdate();

		await rm(join(this.dataDir, "files"), { recursive: true });
		await rename(join(dir, "files"), join(this.dataDir, "files"));
	}

	private parseDatabase(_data: string) {
		const errors: Record<string, any> = {};
		const data = JSON.parse(_data) as iBackupV400;

		if (typeof data.version !== "string" || data.version !== "4.0.0") errors.version = "INVALID_VERSION";
		if (typeof data.encryption !== "string") errors.encryptionKey = "INVALID_ENCRYPTION_KEY";

		const _users = [...this.parseUsers(data.users)];
		if (_users.some((user) => typeof user === "string")) {
			const results = _users
				.map((res, key) => ({ res, key }))
				.filter((res) => typeof res.res === "string")
				.map((res) => ({ [res.key]: res.res as string }));
			errors.users = results;
		}
		const users = _users as (Domain & { apiTokens: Token[] })[];

		const _files = [...this.parseFiles(data.files)];
		if (_files.some((file) => typeof file === "string")) {
			const results = _files
				.map((res, key) => ({ res, key }))
				.filter((res) => typeof res.res === "string")
				.map((res) => ({ [res.key]: res.res as string }));
			errors.files = results;
		}
		const files = _files as File[];

		const _urls = [...this.parseUrls(data.urls)];
		if (_urls.some((url) => typeof url === "string")) {
			const results = _urls
				.map((res, key) => ({ res, key }))
				.filter((res) => typeof res.res === "string")
				.map((res) => ({ [res.key]: res.res as string }));
			errors.urls = results;
		}
		const urls = _urls as Url[];

		const _auditlogs = [...this.parseAuditLogs(data.auditlogs)];
		if (_auditlogs.some((url) => typeof url === "string")) {
			const results = _auditlogs
				.map((res, key) => ({ res, key }))
				.filter((res) => typeof res.res === "string")
				.map((res) => ({ [res.key]: res.res as string }));
			errors.auditlogs = results;
		}
		const auditLogs = _auditlogs as Auditlog[];

		const _invites = [...this.parseInvites(data.invites)];
		if (_invites.some((url) => typeof url === "string")) {
			const results = _invites
				.map((res, key) => ({ res, key }))
				.filter((res) => typeof res.res === "string")
				.map((res) => ({ [res.key]: res.res as string }));
			errors.invites = results;
		}
		const invites = _invites as Invites[];

		const _signupDomains = [...this.parseSignUpDomains(data.signupDomains)];
		if (_signupDomains.some((url) => typeof url === "string")) {
			const results = _signupDomains
				.map((res, key) => ({ res, key }))
				.filter((res) => typeof res.res === "string")
				.map((res) => ({ [res.key]: res.res as string }));
			errors.signupDomains = results;
		}
		const signupDomains = _signupDomains as SignupDomain[];

		if (Object.keys(errors).length) throw new Error(JSON.stringify({ errors }));
		return {
			users,
			files,
			urls,
			auditLogs,
			invites,
			signupDomains,
			encryption: data.encryption
		};
	}

	private *parseUsers(users: iBackupV400["users"]) {
		for (const user of users) {
			if (typeof user !== "object") {
				yield "INVALID_USER_OBJECT";
				continue;
			}
			if (!BackupUtils.typeofString(user.auditlogDuration)) {
				yield "INVALID_AUDITLOG_DURATION";
				continue;
			}
			if (!BackupUtils.typeofString(user.backupCodes)) {
				yield "INVALID_BACKUP_CODES";
				continue;
			}
			if (!BackupUtils.typeofString(user.date)) {
				yield "INVALID_USER_DATE";
				continue;
			}
			if (!BackupUtils.typeofBoolean(user.disabled)) {
				yield "INVALID_USER_DISABLED";
				continue;
			}
			if (!BackupUtils.typeofString(user.embedColor)) {
				yield "INVALID_EMBED_COLOR";
				continue;
			}
			if (!BackupUtils.typeofString(user.embedDescription)) {
				yield "INVALID_EMBED_DESCRIPTION";
				continue;
			}
			if (!BackupUtils.typeofBoolean(user.embedEnabled)) {
				yield "INVALID_EMBED_ENABLED";
				continue;
			}
			if (!BackupUtils.typeofString(user.embedTitle)) {
				yield "INVALID_EMBED_TITLE";
				continue;
			}
			if (!BackupUtils.typeofString(user.extensionsList)) {
				yield "INVALID_EXTENSIONS_LIST";
				continue;
			}
			if (!BackupUtils.typeofString(user.extensionsMode)) {
				yield "INVALID_EXTENSIONS_MODE";
				continue;
			}
			if (!BackupUtils.typeofString(user.maxStorage)) {
				yield "INVALID_MAX_STORAGE";
				continue;
			}
			if (!BackupUtils.typeofString(user.maxUploadSize)) {
				yield "INVALID_UPLOAD_SIZE";
				continue;
			}
			if (!BackupUtils.typeofNumber(user.nameLength)) {
				yield "INVALID_NAME_LENGTH";
				continue;
			}
			if (!BackupUtils.typeofString(user.nameStrategy) || !["id", "zerowidth", "name"].includes(user.nameStrategy)) {
				yield "INVALID_NAME_STRATEGY";
				continue;
			}
			if (!BackupUtils.typeofString(user.pathId)) {
				yield "INVALID_PATH_ID";
				continue;
			}

			if (user.password && !BackupUtils.typeofString(user.password)) {
				yield "INVALID_PASSWORD";
				continue;
			}
			if (user.twoFactorSecret && !BackupUtils.typeofString(user.twoFactorSecret)) {
				yield "INVALID_2FA_SECRET";
				continue;
			}

			const { apiTokens: _apiTokens, ..._domain } = user;
			const apiTokensRes = [...this.parseTokens(_apiTokens)];
			if (apiTokensRes.some((res) => _.isNull(res))) {
				yield "INVALID_API_TOKENS";
				continue;
			}

			const date = new Date(user.date);
			const domain: Domain = { ..._domain, date };

			yield { ...domain, apiTokens: apiTokensRes as Token[] };
		}
	}

	private *parseTokens(tokens: iBackupV400["users"][0]["apiTokens"]) {
		for (const _token of tokens) {
			if (typeof _token !== "object") {
				yield null;
				continue;
			}

			if (!Object.keys(_token).every((key) => BackupUtils.typeofString(_token[key as keyof typeof _token]))) {
				yield null;
				continue;
			}

			const token: Token = { ..._token, date: new Date(_token.date) };
			yield token;
		}
	}

	private *parseFiles(files: iBackupV400["files"]) {
		for (const file of files) {
			if (typeof file !== "object") {
				yield "INVALID_FILE_OBJECT";
				continue;
			}
			if (!BackupUtils.typeofString(file.authSecret)) {
				yield "INVALID_AUTH_SECRET";
				continue;
			}
			if (!BackupUtils.typeofString(file.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!BackupUtils.typeofString(file.domain)) {
				yield "INVALID_DOMAIN";
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

			const [fileName, userId] = file.path.split("/").reverse();
			const filePath = join(this.dataDir, "files", userId, fileName);
			const fileObj: File = { ...file, path: filePath, date: new Date(file.date) };
			yield fileObj;
		}
	}

	private *parseUrls(urls: iBackupV400["urls"]) {
		for (const url of urls) {
			if (typeof url !== "object") {
				yield "INVALID_URL_OBJECT";
				continue;
			}
			if (!BackupUtils.typeofString(url.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!BackupUtils.typeofString(url.domain)) {
				yield "INVALID_DOMAIN";
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
			const urlObj: Url = { ...url, date: new Date(url.date) };
			yield urlObj;
		}
	}

	private *parseAuditLogs(logs: iBackupV400["auditlogs"]) {
		for (const log of logs) {
			if (typeof log !== "object") {
				yield "INVALID_AUDITLOG_OBJECT";
				continue;
			}
			if (!BackupUtils.typeofString(log.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!BackupUtils.typeofString(log.details)) {
				yield "INVALID_DETAILS";
				continue;
			}
			if (!BackupUtils.typeofString(log.id)) {
				yield "INVALID_ID";
				continue;
			}
			if (!BackupUtils.typeofString(log.type)) {
				yield "INVALID_TYPE";
				continue;
			}
			if (!BackupUtils.typeofString(log.user)) {
				yield "INVALID_USER";
				continue;
			}
			const logObj: Auditlog = { ...log, date: new Date(log.date) };
			yield logObj;
		}
	}

	private *parseInvites(invites: iBackupV400["invites"]) {
		for (const invite of invites) {
			if (typeof invite !== "object") {
				yield "INVALID_INVITE_OBJECT";
				continue;
			}
			if (!BackupUtils.typeofString(invite.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!BackupUtils.typeofString(invite.invite)) {
				yield "INVALID_CODE";
				continue;
			}

			const inviteObj: Invites = { invite: invite.invite, Date: new Date(invite.date) };
			yield inviteObj;
		}
	}

	private *parseSignUpDomains(domains: iBackupV400["signupDomains"]) {
		for (const domain of domains) {
			if (typeof domain !== "object") {
				yield "INVALID_SIGNUP_DOMAIN_OBJECT";
				continue;
			}
			if (!BackupUtils.typeofString(domain.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!BackupUtils.typeofString(domain.domain)) {
				yield "INVALID_DOMAIN";
				continue;
			}

			const domainObj: SignupDomain = { domain: domain.domain, Date: new Date(domain.date) };
			yield domainObj;
		}
	}
}
