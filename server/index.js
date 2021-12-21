/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();
const express = require("express");
const next = require("next");
const nextHandler = require("./handlers/NextHandler");
const dataHandler = require("./handlers/DataHandler");

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

server.use(dataHandler(nextApp, server));
void nextHandler(nextApp, server);

server.listen(3000, () => console.log(`Api listening to port ${3000}`));
