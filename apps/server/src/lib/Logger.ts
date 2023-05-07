import { Logger as IcicleLogger, type LoggerOptions, LogLevel } from "@snowcrystals/icicle";
import "winston-daily-rotate-file";
import winston from "winston";
import { join } from "node:path";

export class Logger extends IcicleLogger {
	public winston = winston.createLogger({
		exitOnError: false,
		handleRejections: true,
		handleExceptions: true,
		format: winston.format.simple()
	});

	public constructor(options?: LoggerOptions | undefined) {
		super(options);

		const transport = new winston.transports.DailyRotateFile({
			filename: "paperplane-%DATE%.log",
			datePattern: "YYYY-MM-DD-HH",
			zippedArchive: true,
			maxSize: "20m",
			maxFiles: "1d",
			dirname: join(process.cwd(), "..", "..", "data", "logs")
		});
		this.winston.add(transport);
	}

	public override write(level: LogLevel, ...values: readonly unknown[]) {
		super.write(level, ...values);
		const styles = this.styles.get(level);
		const content = this.parser.parse(values);

		this.winston.log({
			level: this.getLevel(level),
			message: this.process(content, `[${LogLevel[level].toUpperCase()}]`, styles?.message)
		});
	}

	private getLevel(level: LogLevel) {
		if (level === LogLevel.Fatal) return "error";
		return LogLevel[level].toLowerCase();
	}
}
