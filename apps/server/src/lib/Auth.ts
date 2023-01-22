import { generateSecret, generateToken } from "node-2fa";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Auth {
	public static generateToken(length = 32) {
		const charset = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";
		let res = "";

		for (let i = 0; i !== length; ++i) res += charset[Math.floor(Math.random() * charset.length)];
		return res;
	}

	public static generate2FASecret(account = "Admin") {
		const auth = generateSecret({ name: "PaperPlane", account });

		return {
			secret: auth.secret,
			uri: auth.uri
		};
	}

	public static check2FASecret(secret: string): boolean {
		return Boolean(generateToken(secret));
	}
}
