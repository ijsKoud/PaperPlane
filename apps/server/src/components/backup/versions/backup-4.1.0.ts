import type { Domain, File, Token, Url, Auditlog, Invites, SignupDomain, Pastebin } from "@prisma/client";
import _ from "lodash";
import { readdir, readFile, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import type { iBackupV410 } from "../types.js";
import { Utils } from "#lib/utils.js";
import Backup from "../Backup.js";
import Config from "#lib/Config.js";

export default class BackupV410 extends Backup {
	/**
	 * Import the backup
	 * @param dir The backup contents directory
	 */
	public async import(dir: string) {
		const files = await readdir(dir);
		if (!files.includes("db.json")) throw new Error(JSON.stringify({ errors: { backup: "Unknown db.json file" } }));
		if (!files.includes("files")) throw new Error(JSON.stringify({ errors: { backup: "Unknown files folder" } }));
		if (!files.includes("paste-bins")) throw new Error(JSON.stringify({ errors: { backup: "Unknown paste-bins folder" } }));

		const filePath = join(dir, "db.json");
		const dbData = await readFile(filePath, "utf8");
		const data = this.parseDatabase(dbData);

		// full system wipe
		await this.server.prisma.auditlog.deleteMany();
		await this.server.prisma.file.deleteMany();
		await this.server.prisma.invites.deleteMany();
		await this.server.prisma.url.deleteMany();
		await this.server.prisma.token.deleteMany();
		await this.server.prisma.signupDomain.deleteMany();
		await this.server.prisma.domain.deleteMany();

		// process users
		for (const user of data.users) {
			const { apiTokens, ...data } = user;
			await this.server.prisma.domain.create({ data: { ...data, apiTokens: { create: apiTokens.map(({ domain, ...rest }) => rest) } } });
		}

		// process auditlogs
		for (const auditlog of data.auditLogs) {
			await this.server.prisma.auditlog.create({ data: auditlog });
		}

		// process files
		for (const file of data.files) {
			await this.server.prisma.file.create({ data: file });
		}

		// process bins
		for (const bins of data.bins) {
			await this.server.prisma.pastebin.create({ data: bins });
		}

		// process urls
		for (const url of data.urls) {
			await this.server.prisma.url.create({ data: url });
		}

		// process invites
		for (const invite of data.invites) {
			await this.server.prisma.invites.create({ data: invite });
		}

		// process signup domains
		for (const signupDomain of data.signupDomains) {
			await this.server.prisma.signupDomain.create({ data: signupDomain });
		}

		// update the .env
		const config = Config.getEnv();
		await Config.updateEnv({ ...config, encryptionKey: data.encryption });

		// move files to correct directory
		await rm(join(this.dir, "files"), { recursive: true });
		await rename(join(dir, "files"), join(this.dir, "files"));

		// move paste-bins to correct directory
		await rm(join(this.dir, "paste-bins"), { recursive: true });
		await rename(join(dir, "paste-bins"), join(this.dir, "paste-bins"));
	}

	private parseDatabase(_data: string) {
		const errors: Record<string, any> = {};
		const data = JSON.parse(_data) as iBackupV410;

		if (typeof data.version !== "string" || data.version !== "4.0.0") errors.version = "INVALID_VERSION";
		if (typeof data.encryption !== "string") errors.encryptionKey = "INVALID_ENCRYPTION_KEY";

		// parse users
		const _users = [...this.parseUsers(data.users)];
		if (_users.some((user) => typeof user === "string")) {
			const results = this.mapErrors(_users);
			errors.users = results;
		}

		// parse files
		const _files = [...this.parseFiles(data.files)];
		if (_files.some((file) => typeof file === "string")) {
			const results = this.mapErrors(_files);
			errors.files = results;
		}

		// parse pastebins
		const _bins = [...this.parsePasteBins(data.pastebins)];
		if (_bins.some((bin) => typeof bin === "string")) {
			const results = this.mapErrors(_bins);
			errors.bins = results;
		}

		// parse urls
		const _urls = [...this.parseUrls(data.urls)];
		if (_urls.some((url) => typeof url === "string")) {
			const results = this.mapErrors(_urls);
			errors.urls = results;
		}

		// parse auditlogs
		const _auditlogs = [...this.parseAuditLogs(data.auditlogs)];
		if (_auditlogs.some((url) => typeof url === "string")) {
			const results = this.mapErrors(_auditlogs);
			errors.auditlogs = results;
		}

		// parse invites
		const _invites = [...this.parseInvites(data.invites)];
		if (_invites.some((url) => typeof url === "string")) {
			const results = this.mapErrors(_invites);
			errors.invites = results;
		}

		// parse signup domains
		const _signupDomains = [...this.parseSignUpDomains(data.signupDomains)];
		if (_signupDomains.some((url) => typeof url === "string")) {
			const results = this.mapErrors(_signupDomains);
			errors.signupDomains = results;
		}

		// cast objects to correct type
		const users = _users as (Domain & { apiTokens: Token[] })[];
		const files = _files as File[];
		const bins = _bins as Pastebin[];
		const urls = _urls as Url[];
		const auditLogs = _auditlogs as Auditlog[];
		const invites = _invites as Invites[];
		const signupDomains = _signupDomains as SignupDomain[];

		if (Object.keys(errors).length) throw new Error(JSON.stringify({ errors }));
		return {
			users,
			files,
			bins,
			urls,
			auditLogs,
			invites,
			signupDomains,
			encryption: data.encryption
		};
	}

	private *parseUsers(users: iBackupV410["users"]) {
		for (const user of users) {
			if (typeof user !== "object") {
				yield "INVALID_USER_OBJECT";
				continue;
			}
			if (!this.typeofString(user.auditlogDuration)) {
				yield "INVALID_AUDITLOG_DURATION";
				continue;
			}
			if (!this.typeofString(user.backupCodes)) {
				yield "INVALID_BACKUP_CODES";
				continue;
			}
			if (!this.typeofString(user.date)) {
				yield "INVALID_USER_DATE";
				continue;
			}
			if (!this.typeofBoolean(user.disabled)) {
				yield "INVALID_USER_DISABLED";
				continue;
			}
			if (!this.typeofString(user.embedColor)) {
				yield "INVALID_EMBED_COLOR";
				continue;
			}
			if (!this.typeofString(user.embedDescription)) {
				yield "INVALID_EMBED_DESCRIPTION";
				continue;
			}
			if (!this.typeofBoolean(user.embedEnabled)) {
				yield "INVALID_EMBED_ENABLED";
				continue;
			}
			if (!this.typeofString(user.embedTitle)) {
				yield "INVALID_EMBED_TITLE";
				continue;
			}
			if (!this.typeofString(user.extensionsList)) {
				yield "INVALID_EXTENSIONS_LIST";
				continue;
			}
			if (!this.typeofString(user.extensionsMode)) {
				yield "INVALID_EXTENSIONS_MODE";
				continue;
			}
			if (!this.typeofString(user.maxStorage)) {
				yield "INVALID_MAX_STORAGE";
				continue;
			}
			if (!this.typeofString(user.maxUploadSize)) {
				yield "INVALID_UPLOAD_SIZE";
				continue;
			}
			if (!this.typeofNumber(user.nameLength)) {
				yield "INVALID_NAME_LENGTH";
				continue;
			}
			if (!this.typeofString(user.nameStrategy) || !["id", "zerowidth", "name"].includes(user.nameStrategy)) {
				yield "INVALID_NAME_STRATEGY";
				continue;
			}
			if (!this.typeofString(user.pathId)) {
				yield "INVALID_PATH_ID";
				continue;
			}

			if (user.password && !this.typeofString(user.password)) {
				yield "INVALID_PASSWORD";
				continue;
			}
			if (user.twoFactorSecret && !this.typeofString(user.twoFactorSecret)) {
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

	private *parseTokens(tokens: iBackupV410["users"][0]["apiTokens"]) {
		for (const _token of tokens) {
			if (typeof _token !== "object") {
				yield null;
				continue;
			}

			// check to make sure all values are strings
			if (!Object.keys(_token).every((key) => this.typeofString(_token[key as keyof typeof _token]))) {
				yield null;
				continue;
			}

			const token: Token = { ..._token, date: new Date(_token.date) };
			yield token;
		}
	}

	private *parseFiles(files: iBackupV410["files"]) {
		for (const file of files) {
			if (typeof file !== "object") {
				yield "INVALID_FILE_OBJECT";
				continue;
			}
			if (!this.typeofString(file.authSecret)) {
				yield "INVALID_AUTH_SECRET";
				continue;
			}
			if (!this.typeofString(file.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!this.typeofString(file.domain)) {
				yield "INVALID_DOMAIN";
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
			if (!this.typeofString(file.mimeType) || !Utils.getExtension(file.mimeType)) {
				yield "INVALID_MIME_TYPE";
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

			const [fileName, userId] = file.path.split("/").reverse();
			const filePath = join(this.dir, "files", userId, fileName);
			const fileObj: File = { ...file, path: filePath, date: new Date(file.date) };
			yield fileObj;
		}
	}

	private *parsePasteBins(pasteBins: iBackupV410["pastebins"]) {
		for (const bin of pasteBins) {
			if (typeof bin !== "object") {
				yield "INVALID_FILE_OBJECT";
				continue;
			}
			if (!this.typeofString(bin.authSecret)) {
				yield "INVALID_AUTH_SECRET";
				continue;
			}
			if (!this.typeofString(bin.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!this.typeofString(bin.domain)) {
				yield "INVALID_DOMAIN";
				continue;
			}
			if (!this.typeofString(bin.id)) {
				yield "INVALID_ID";
				continue;
			}
			if (bin.password && !this.typeofString(bin.password)) {
				yield "INVALID_PASSWORD";
				continue;
			}
			if (!this.typeofString(bin.path)) {
				yield "INVALID_bin_PATH";
				continue;
			}
			if (!this.typeofString(bin.highlight)) {
				yield "INVALID_HIGHLIGHT_TYPE";
				continue;
			}
			if (!this.typeofNumber(bin.views)) {
				yield "INVALID_VIEWS";
				continue;
			}
			if (!this.typeofBoolean(bin.visible)) {
				yield "INVALID_VISIBLE";
				continue;
			}

			const [binName, userId] = bin.path.split("/").reverse();
			const binPath = join(this.dir, "bins", userId, binName);
			const binObj: Pastebin = { ...bin, path: binPath, date: new Date(bin.date) };
			yield binObj;
		}
	}

	private *parseUrls(urls: iBackupV410["urls"]) {
		for (const url of urls) {
			if (typeof url !== "object") {
				yield "INVALID_URL_OBJECT";
				continue;
			}
			if (!this.typeofString(url.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!this.typeofString(url.domain)) {
				yield "INVALID_DOMAIN";
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
			const urlObj: Url = { ...url, date: new Date(url.date) };
			yield urlObj;
		}
	}

	private *parseAuditLogs(logs: iBackupV410["auditlogs"]) {
		for (const log of logs) {
			if (typeof log !== "object") {
				yield "INVALID_AUDITLOG_OBJECT";
				continue;
			}
			if (!this.typeofString(log.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!this.typeofString(log.details)) {
				yield "INVALID_DETAILS";
				continue;
			}
			if (!this.typeofString(log.id)) {
				yield "INVALID_ID";
				continue;
			}
			if (!this.typeofString(log.type)) {
				yield "INVALID_TYPE";
				continue;
			}
			if (!this.typeofString(log.user)) {
				yield "INVALID_USER";
				continue;
			}
			const logObj: Auditlog = { ...log, date: new Date(log.date) };
			yield logObj;
		}
	}

	private *parseInvites(invites: iBackupV410["invites"]) {
		for (const invite of invites) {
			if (typeof invite !== "object") {
				yield "INVALID_INVITE_OBJECT";
				continue;
			}
			if (!this.typeofString(invite.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!this.typeofString(invite.invite)) {
				yield "INVALID_CODE";
				continue;
			}

			const inviteObj: Invites = { invite: invite.invite, Date: new Date(invite.date) };
			yield inviteObj;
		}
	}

	private *parseSignUpDomains(domains: iBackupV410["signupDomains"]) {
		for (const domain of domains) {
			if (typeof domain !== "object") {
				yield "INVALID_SIGNUP_DOMAIN_OBJECT";
				continue;
			}
			if (!this.typeofString(domain.date)) {
				yield "INVALID_DATE";
				continue;
			}
			if (!this.typeofString(domain.domain)) {
				yield "INVALID_DOMAIN";
				continue;
			}

			const domainObj: SignupDomain = { domain: domain.domain, Date: new Date(domain.date) };
			yield domainObj;
		}
	}
}
