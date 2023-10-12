import type Domain from "#components/Domain.js";
import Scheduler from "#components/Scheduler.js";
import { Collection } from "@discordjs/collection";

export class PastebinReadScheduler extends Scheduler<string> {
	public domain: Domain;

	public constructor(domain: Domain) {
		super(3e4);
		this.domain = domain;
	}

	protected override async schedulerFunction(queue: string[]) {
		const views = new Collection<string, number>();
		queue.forEach((view) => views.set(view, (views.get(view) ?? 0) + 1));

		for await (const [key, amount] of views) {
			await this.domain.server.prisma.pastebin
				.update({
					where: { id_domain: { domain: this.domain.domain, id: key } },
					data: { views: { increment: amount } }
				})
				.catch(() => void 0); // 99% of the errors come from deleted items
		}
	}
}
