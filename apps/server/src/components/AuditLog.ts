import type Server from "#server.js";
import type { Auditlog } from "@prisma/client";
import { bold } from "colorette";
import { UAParser } from "ua-parser-js";
import { CronJob } from "cron";
import Config from "#lib/Config.js";

export class AuditLog {
	/** The which are currently available */
	public logs: Auditlog[] = [];

	/** The maximum age per log in ms */
	public maxAge: number;

	private _queue: Omit<Auditlog, "id" | "user" | "date">[] = [];
	private _queueTimeout: NodeJS.Timeout | null = null;
	private cron!: CronJob;

	public constructor(
		public server: Server,
		public user: string,
		maxAge?: number
	) {
		const config = Config.getEnv();
		if (user === "admin") this.maxAge = config.auditLogDuration;
		else this.maxAge = maxAge ?? 0;
	}

	/** Loads the auditlogs and start the cronjob */
	public async start() {
		const logs = await this.server.prisma.auditlog.findMany({ where: { user: this.user } });
		this.logs = logs;

		this.cron = new CronJob("0 1 * * *", this.removeExpired.bind(this), undefined, true);
		this.cron.start();
	}

	/**
	 * Registers a new Audit log event
	 * @param type The event type
	 * @param details The event details
	 */
	public register(type: string, details: string) {
		this._queue.push({ type, details });
		this.queueUpdate();
	}

	/** Deletes all the events from the server and stops the cronjob */
	public async destroy() {
		this.cron.stop();
		if (this._queueTimeout) clearTimeout(this._queueTimeout);

		await this.server.prisma.auditlog.deleteMany({ where: { user: this.user } });
	}

	/** Forces a maxAge check on the existing logs */
	public async removeExpired() {
		if (this.maxAge === 0) return;

		const now = Date.now();
		const mappedAgeId = this.logs.map((log) => ({ age: now - log.date.getTime(), id: log.id }));
		const toBin = mappedAgeId.filter((v) => v.age >= this.maxAge);

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

		const timeout = setTimeout(timeoutFunction.bind(this), 3e4);
		this._queueTimeout = timeout;
	}

	public static getUserAgentData(userAgent: string | undefined) {
		const parser = new UAParser(userAgent);
		return parser.getResult();
	}
}
