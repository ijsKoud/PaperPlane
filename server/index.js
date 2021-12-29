/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();
const express = require("express");
const next = require("next");
const nextHandler = require("./handlers/NextHandler");
const dataHandler = require("./handlers/DataHandler");
const { json } = require("body-parser");

console.log(
	[
		"______                         ______  _                     ",
		"| ___ \\                        | ___ \\| |                    ",
		"| |_/ /__ _  _ __    ___  _ __ | |_/ /| |  __ _  _ __    ___ ",
		"|  __// _` || '_ \\  / _ \\| '__||  __/ | | / _` || '_ \\  / _ \\",
		"| |  | (_| || |_) ||  __/| |   | |    | || (_| || | | ||  __/",
		"\\_|   \\__,_|| .__/  \\___||_|   \\_|    |_| \\__,_||_| |_| \\___|",
		"            | |                                              ",
		"            |_|                                              "
	].join("\n")
);

const server = express();
const nextApp = next({
	dev: process.env.NODE_ENV === "development",
	customServer: true
});

server.use(json(), dataHandler(nextApp, server));
void nextHandler(nextApp, server);

const getPort = () => {
	const env = process.env.PORT;
	if (!env) return 3e3;

	const port = Number(env);
	return isNaN(port) ? 3e3 : port;
};

server.listen(getPort(), () => console.log(`Api listening to port ${getPort()} (http://localhost:${getPort()})`));
