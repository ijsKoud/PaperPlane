import type Server from "../../Server.js";
import { Collection } from "@discordjs/collection";
import { Domain } from "./Domain.js";
import type Prisma from "@prisma/client";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Invites } from "@prisma/client";
import { Auth } from "../Auth.js";

export class Domains {
	public domains = new Collection<string, Domain>();
	public invites: Invites[] = [];

	public constructor(public server: Server) {}

	public async start() {
		const domains = await this.server.prisma.domain.findMany();
		for (const domain of domains) {
			const dm = new Domain(this.server, domain);
			this.domains.set(dm.domain, dm);
		}

		this.invites = await this.server.prisma.invites.findMany();
	}

	public async createInvite() {
		const invite = await this.server.prisma.invites.create({ data: { invite: Auth.generateToken(16) } });
		this.invites.push(invite);

		return invite;
	}

	public async resetAuth() {
		for await (const [, domain] of this.domains) {
			await domain.resetAuth();
		}

		this.server.adminAuditLogs.register("AuthMode Change", `Mode: ${this.server.envConfig.authMode}`);
	}

	public async create(data: Prisma.Prisma.DomainCreateArgs["data"]) {
		const res = await this.server.prisma.domain.create({ data });

		await mkdir(join(process.cwd(), "..", "..", "data", "files", res.pathId), { recursive: true });
		this.domains.set(res.domain, new Domain(this.server, res));
	}

	public async update(domains: string[], data: Prisma.Prisma.DomainUpdateArgs["data"]) {
		const found = this.domains.filter((dm) => domains.includes(dm.domain));

		for await (const [, domain] of found) {
			await domain.update(data);
		}
	}

	public async delete(domains: string[]) {
		const found = this.domains.filter((dm) => domains.includes(dm.domain));

		for await (const [key, domain] of found) {
			await domain.delete();
			this.domains.delete(key);

			this.server.adminAuditLogs.register("Delete User", `User: ${key}`);
		}
	}

	public getAll(includeDisabled = false) {
		if (includeDisabled) return this.domains;
		return this.domains.filter((domain) => !domain.disabled);
	}

	public get(domain: string): Domain | undefined {
		return this.domains.get(domain);
	}
}
