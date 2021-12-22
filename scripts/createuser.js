/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const { randomBytes, scryptSync } = require("crypto");
const prompts = require("prompts");

const client = new PrismaClient();

// Utils
const encryptPassword = (password) => {
	const salt = randomBytes(16).toString("hex");
	const pwd = scryptSync(password, salt, 64).toString("hex");

	return `${salt}:${pwd}`;
};

function randomChars(length) {
	const charset = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";

	let res = "";
	for (let i = 0; i !== length; ++i) res += charset[Math.floor(Math.random() * charset.length)];
	return res;
}

function createToken() {
	return `${randomChars(24)}.${Buffer.from(Date.now().toString()).toString("base64url")}`;
}

void (async () => {
	console.info("[INFO] - Creating/resetting a user:");
	const response = await prompts({
		type: "text",
		name: "username",
		message: "What do you want your username to be?",
		validate: (value) => (value.length > 32 ? "The username must be smaller than 32 characters" : true)
	});
	const { username } = response;

	const response2 = await prompts({
		type: "password",
		name: "password",
		message: "What do you want your password to be?",
		validate: (value) => (value.length < 5 ? "The password must be larger than 5 characters" : true)
	});
	const { password } = response2;

	const response3 = await prompts({
		type: "confirm",
		name: "confirm",
		message: "Are you sure you want to create a user with these credentials?"
	});
	const { confirm } = response3;
	if (!confirm) {
		console.log("[INFO] - Cancellation request");
		return process.exit(0);
	}

	console.info("[INFO] - Deleting all users...");
	await client.user.deleteMany();

	console.info("[INFO] - Creating new user");
	await client.user.create({ data: { embedEnabled: false, password: encryptPassword(password), username, token: createToken() } });

	await client.$disconnect();

	console.info("[INFO] - Creation completed!");
})();
