import osUtils from "node-os-utils";
import pidusage from "pidusage";
import { Utils } from "#lib/utils.js";
import { join } from "node:path";
import ms from "ms";

export default class ServerStats {
	/** The CPU usage in percentage */
	public cpu = 0;

	/** The storage usage in Bytes */
	public storage = 0;

	/** The memory usage in Bytes */
	public memory = { usage: 0, total: 0 };

	/** The application uptime */
	public uptime = 0;

	public constructor() {
		void this.update();
		setInterval(this.update.bind(this), 1e4);
	}

	/** Updates the usage data */
	public async update() {
		const pid = await pidusage(process.pid);
		const memory = osUtils.mem.totalMem();

		this.memory = {
			total: memory,
			usage: pid.memory
		};

		this.uptime = pid.elapsed;

		const cpuUsage = await osUtils.cpu.usage();
		this.cpu = cpuUsage;

		const storage = await Utils.sizeOfDir(join(process.cwd(), "..", "..", "data"));
		this.storage = storage;
	}

	public toJSON() {
		return {
			raw: {
				uptime: this.uptime,
				cpuUsage: this.cpu,
				storageUsage: this.storage,
				memoryUsage: this.memory
			},
			formatted: {
				uptime: ms(this.uptime),
				cpuUsage: `${this.cpu}%`,
				storageUsage: Utils.parseStorage(this.storage),
				memoryUsage: {
					total: Utils.parseStorage(this.memory.total),
					usage: Utils.parseStorage(this.memory.usage)
				}
			}
		};
	}
}
