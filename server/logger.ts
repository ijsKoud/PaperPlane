import { Logger } from "@daangamesdg/logger";

interface LoggerKeys {
	api: never;
	database: never;
	sessions: never;
}

type Loggers = keyof LoggerKeys;

const loggers: Record<Loggers, Logger> = {
	api: new Logger({ name: "api" }),
	database: new Logger({ name: "Database" }),
	sessions: new Logger({ name: "SessionHandler" }),
};

export default function logger(type: Loggers): Logger {
	return loggers[type];
}
