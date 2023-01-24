import type Server from "../../Server.js";
import { Collection } from "@discordjs/collection";
import { Domain } from "./Domain.js";

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

	public getAll(includeDisabled = false) {
		if (includeDisabled) return this.domains;
		return this.domains.filter((domain) => !domain.disabled);
	}

	public get(domain: string): Domain | undefined {
		return this.domains.get(domain);
	}
}
