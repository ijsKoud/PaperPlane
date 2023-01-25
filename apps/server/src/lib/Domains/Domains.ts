import type Server from "../../Server.js";
import { Collection } from "@discordjs/collection";
import { Domain } from "./Domain.js";
import type Prisma from "@prisma/client";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

export class Domains {
	public domains = new Collection<string, Domain>();

	public constructor(public server: Server) {}

	public async start() {
		const domains = await this.server.prisma.domain.findMany();
		for (const domain of domains) {
			const dm = new Domain(this.server, domain);
			this.domains.set(dm.domain, dm);
		}
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

	public getAll(includeDisabled = false) {
		if (includeDisabled) return this.domains;
		return this.domains.filter((domain) => !domain.disabled);
	}

	public get(domain: string): Domain | undefined {
		return this.domains.get(domain);
	}
}
