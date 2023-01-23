import { generateSecret, generateToken, verifyToken } from "node-2fa";
import Jwt from "jsonwebtoken";

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

	public static verify2FASecret(secret: string, code: string) {
		return verifyToken(secret, code);
	}

	public static createJWTToken(account: string, secret: string) {
		return Jwt.sign(
			`${Auth.generateToken()}-${process.env.NODE_ENV === "development" ? "paperplane_dev" : "paperplane_stable"}-${account}`,
			secret,
			{
				expiresIn: "7d",
				issuer: "PaperPlane",
				subject: "Authentication"
			}
		);
	}

	public static verifyJWTToken(token: string, secret: string, expected: string): boolean {
		const res = Jwt.verify(token, secret, { subject: "Authentication", issuer: "PaperPlane" });
		if (typeof res !== "string") return false;

		return res.endsWith(`${process.env.NODE_ENV === "development" ? "paperplane_dev" : "paperplane_stable"}-${expected}`);
	}
}
