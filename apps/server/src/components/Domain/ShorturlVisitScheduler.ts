import type Domain from "#components/Domain.js";
import Scheduler from "#components/Scheduler.js";
import { Collection } from "@discordjs/collection";

export class ShorturlVisitScheduler extends Scheduler<string> {
	public domain: Domain;

	public constructor(domain: Domain) {
		super(3e4);
		this.domain = domain;
	}

	protected override async schedulerFunction(queue: string[]) {
		const visits = new Collection<string, number>();
		queue.forEach((visit) => visits.set(visit, (visits.get(visit) ?? 0) + 1));

		for await (const [key, amount] of visits) {
			await this.domain.server.prisma.url
				.update({
					where: { id_domain: { domain: this.domain.domain, id: key } },
					data: { visits: { increment: amount } }
				})
				.catch(() => void 0); // 99% of the errors come from deleted items
		}
	}
}
