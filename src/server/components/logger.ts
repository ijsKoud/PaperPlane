import { inspect, InspectOptions } from "node:util";
import { bgRed, dim, magenta, red, white, yellow, blue, gray, bold } from "colorette";
import moment from "moment";
import { join } from "node:path";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { appendFile } from "node:fs/promises";

export class Logger {
	public name?: string;
	public file: string;

	public colours = {
		[LogLevel.Trace]: dim,
		[LogLevel.Debug]: magenta,
		[LogLevel.Info]: blue,
		[LogLevel.Warn]: yellow,
		[LogLevel.Error]: red,
		[LogLevel.Fatal]: bgRed,
		[LogLevel.None]: white
	};

	private fileContents: string[] = [];
	private timer: NodeJS.Timeout | undefined;

	public constructor(file: string, name?: string) {
		this.name = name;
		this.file = file;
	}

	public trace(...message: unknown[]): void {
		this._log(LogLevel.Trace, message);
	}

	public debug(...message: unknown[]): void {
		this._log(LogLevel.Debug, message);
	}

	public info(...message: unknown[]): void {
		this._log(LogLevel.Info, message);
	}

	public warn(...message: unknown[]): void {
		this._log(LogLevel.Warn, message);
	}

	public error(...message: unknown[]): void {
		this._log(LogLevel.Error, message);
	}

	public fatal(...message: unknown[]): void {
		this._log(LogLevel.Fatal, message);
	}

	public log(...message: unknown[]): void {
		this._log(LogLevel.None, message);
	}

	private preprocess(values: readonly unknown[], colors = true): string {
		const inspectOptions: InspectOptions = { colors, depth: 3 };
		return values.map((value) => (typeof value === "string" ? value : inspect(value, inspectOptions))).join(" ");
	}

	private _log(level: LogLevel, _message: unknown[]) {
		const logMessage = this.preprocess(_message);
		const fileMessage = this.preprocess(_message, false);
		const loglevel = LogLevel[level].toUpperCase();
		const date = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");

		const consoleItem = `${gray(date)} ${this.colours[level](loglevel.padEnd(5, " "))} ${
			this.name ? `${bold(`[${this.name}]`)} =>` : "=>"
		} ${logMessage}`;
		const fileItem = `${date} ${loglevel.padEnd(5, " ")} ${this.name ? `[${this.name}] =>` : "=>"} ${fileMessage}`;

		this.writeFile(fileItem);
		console.log(consoleItem);
	}

	private writeFile(message: string) {
		const dir = join(process.cwd(), "data", "logs");
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

		this.startWrite();
		this.fileContents.push(message);
	}

	private startWrite() {
		if (!this.timer) {
			const dir = join(process.cwd(), "data", "logs");
			const filePath = join(dir, this.file);

			if (!existsSync(filePath))
				writeFileSync(
					filePath,
					[
						"______                         ______  _                     ",
						"| ___ \\                        | ___ \\| |                    ",
						"| |_/ /__ _  _ __    ___  _ __ | |_/ /| |  __ _  _ __    ___ ",
						"|  __// _` || '_ \\  / _ \\| '__||  __/ | | / _` || '_ \\  / _ \\",
						"| |  | (_| || |_) ||  __/| |   | |    | || (_| || | | ||  __/",
						"\\_|   \\__,_|| .__/  \\___||_|   \\_|    |_| \\__,_||_| |_| \\___|",
						"            | |                                              ",
						"            |_|                                              ",
						""
					].join("\n")
				);

			const timer = setInterval(async () => {
				if (this.fileContents.length) {
					const contents = `${this.fileContents.join("\n")}\n`;
					this.fileContents = [];

					await appendFile(filePath, contents);
				}
			}, 1e3);

			this.timer = timer;
		}
	}
}

enum LogLevel {
	Trace = 10,
	Debug = 20,
	Info = 30,
	Warn = 40,
	Error = 50,
	Fatal = 60,
	None = 100
}
