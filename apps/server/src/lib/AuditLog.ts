import type Server from "../Server.js";
import type { Auditlog } from "@prisma/client";
import { bold } from "colorette";

export class AuditLog {
	public logs: Auditlog[] = [];

	public constructor(public server: Server, public user: string) {}

	public async start() {
		this.logs = await this.server.prisma.auditlog.findMany({ where: { user: this.user } }).catch(() => []);
	}

	public async removeExpired() {
		const maxAge = this.server.envConfig.auditLogDuration;
		if (maxAge === 0) return;

		const now = Date.now();
		const mappedAgeId = this.logs.map((log) => ({ age: now - log.date.getTime(), id: log.id }));
		const toBin = mappedAgeId.filter((v) => v.age >= maxAge);

		try {
			await this.server.prisma.auditlog.deleteMany({ where: { id: { in: toBin.map((v) => v.id) }, user: this.user } });
			this.logs = this.logs.filter((log) => !toBin.some((v) => v.id === log.id));
		} catch (err) {
			this.server.logger.fatal(`[AUDITLOG]: Error while deleting expired logs for ${bold(this.user)}: `, err);
		}
	}
}
