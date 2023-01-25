import type Server from "../Server.js";
import type { Auditlog } from "@prisma/client";
import { bold } from "colorette";
import { UAParser } from "ua-parser-js";
import { CronJob } from "cron";

export class AuditLog {
	public logs: Auditlog[] = [];

	private _queue: Omit<Auditlog, "id" | "user" | "date">[] = [];
	private _queueTimeout: NodeJS.Timeout | null = null;

	public constructor(public server: Server, public user: string) {}

	public async start() {
		this.logs = await this.server.prisma.auditlog.findMany({ where: { user: this.user } }).catch(() => []);
		new CronJob("0 1 * * *", this.removeExpired.bind(this), undefined, true, undefined, undefined, true);
	}

	public register(type: string, details: string) {
		this._queue.push({ type, details });
		this.queueUpdate();
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

	private queueUpdate() {
		if (this._queueTimeout) return;

		const timeoutFunction = async () => {
			const createLog = (details: string, type: string) =>
				this.server.prisma.auditlog
					.create({ data: { user: this.user, details, type } })
					.then((log) => this.logs.push(log))
					.catch(() => void 0);

			await Promise.all(this._queue.map(({ details, type }) => createLog(details, type)));

			this._queue = [];
			this._queueTimeout = null;
		};

		const timeout = setTimeout(timeoutFunction.bind(this), 6e4);
		this._queueTimeout = timeout;
	}

	public static getUserAgentData(userAgent: string | undefined) {
		const parser = new UAParser(userAgent);
		return parser.getResult();
	}
}
