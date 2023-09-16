import Domain from "#components/Domain.js";
import type Server from "#server.js";
import { Collection } from "@discordjs/collection";
import type { Invites, Prisma } from "@prisma/client";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import Config from "./Config.js";
import { Auth } from "./Auth.js";

export default class DomainsManager {
	public server: Server;

	public domains = new Collection<string, Domain>();
	public invites: Invites[] = [];

	public constructor(server: Server) {
		this.server = server;
	}

	/**
	 * Gets all the domains (users)
	 * @param includeDisabled Whether to include the disabled domains or not
	 * @returns
	 */
	public getAll(includeDisabled = false) {
		if (includeDisabled) return this.domains;
		return this.domains.filter((domain) => !domain.disabled);
	}

	/**
	 * Shortcut for `<DomainsManager>.domains.get(domain)`
	 * @param domain The name of the domain
	 * @returns
	 */
	public get(domain: string): Domain | undefined {
		return this.domains.get(domain);
	}

	/** Loads all the domain related data */
	public async start() {
		// Load all the domains (users)
		const domains = await this.server.prisma.domain.findMany({ include: { apiTokens: true } });
		for await (const domain of domains) {
			const dm = new Domain(this.server, domain);
			await dm.start();

			this.domains.set(dm.domain, dm);
		}

		this.invites = await this.server.prisma.invites.findMany();
	}

	/**
	 * Creates a new domain (user)
	 * @param data The data required to create a new domain (user)
	 */
	public async create(data: Prisma.DomainCreateArgs["data"]) {
		const res = await this.server.prisma.domain.create({ data, include: { apiTokens: true } });

		await mkdir(join(process.cwd(), "..", "..", "data", "files", res.pathId), { recursive: true });
		await mkdir(join(process.cwd(), "..", "..", "data", "paste-bins", res.pathId), { recursive: true });
		const domain = new Domain(this.server, res);
		this.domains.set(res.domain, domain);

		await domain.start();
	}

	/**
	 * Allows you to (bulk) update domains (users)
	 * @param domains The domains to update
	 * @param data The updated data
	 */
	public async update(domains: string[], data: Prisma.DomainUpdateArgs["data"]) {
		const validDomains = this.domains.filter((dm) => domains.includes(dm.domain));

		for await (const [, domain] of validDomains) {
			await domain.update(data);
		}
	}

	/**
	 * (Bulk) deletes domains (users)
	 * @param domains A list of domains to delete
	 */
	public async delete(domains: string[]) {
		const found = this.domains.filter((dm) => domains.includes(dm.domain));

		for await (const [key, domain] of found) {
			await domain.delete();
			this.domains.delete(key);

			this.server.adminAuditLogs.register("Delete User", `User: ${key}`);
		}
	}

	/** Resets the authentication data for every domain (user) */
	public async resetAuth() {
		for await (const [, domain] of this.domains) {
			await domain.resetAuth();
		}

		const mode = Config.getEnv().authMode;
		this.server.adminAuditLogs.register("AuthMode Change", `Mode: ${mode}`);
		this.server.logger.info(`[DomainsManager]: Authentication mode changed to ${mode}`);
	}

	/**
	 * Resets the encryption key
	 * @param oldKey The old encryption key
	 */
	public async resetEncryption(oldKey: string) {
		for await (const [, domain] of this.domains) {
			await domain.resetEncryption(oldKey);
		}

		this.server.logger.info("[DomainsManager]: Encryption key changed");
	}

	/** Creates a new invite */
	public async createInvite() {
		const invite = await this.server.prisma.invites.create({ data: { invite: Auth.generateToken(16) } });
		this.invites.push(invite);

		this.server.adminAuditLogs.register("Invite Create", `Invite: ${invite.invite}`);

		return invite;
	}

	/**
	 * Deletes an existing invite
	 * @param invite The invite to delete
	 */
	public async deleteInvite(invite: string) {
		const found = this.invites.find((inv) => inv.invite === invite);
		if (found) {
			this.invites = this.invites.filter((inv) => inv.invite !== found.invite);
			await this.server.prisma.invites.delete({ where: { invite: found.invite } });

			this.server.adminAuditLogs.register("Invite Delete", `Invite: ${found.invite}`);
		}
	}
}
