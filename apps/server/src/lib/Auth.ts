import { generateSecret, generateToken, verifyToken } from "node-2fa";
import Jwt from "jsonwebtoken";
import _ from "lodash";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type Server from "../Server.js";

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
		return Jwt.sign({ version: process.env.NODE_ENV === "development" ? "paperplane_dev" : "paperplane_stable", account }, secret, {
			expiresIn: "7d"
		});
	}

	public static verifyJWTToken(token: string, secret: string, expected: string): boolean {
		try {
			const res = Jwt.verify(token, secret);
			if (typeof res !== "object") return false;

			const version = process.env.NODE_ENV === "development" ? "paperplane_dev" : "paperplane_stable";
			return res.version === version && res.account === expected;
		} catch (error) {
			return false;
		}
	}

	public static encryptToken(token: string, secret: string) {
		const iv = randomBytes(16);

		const cipher = createCipheriv("aes-256-ctr", secret, iv);
		const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);

		return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
	}

	public static decryptToken(hash: string, secret: string) {
		const [iv, encrypted] = hash.split(":");

		const decipher = createDecipheriv("aes-256-ctr", secret, Buffer.from(iv, "hex"));
		const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]);
		const token = decrypted.toString();

		return token;
	}

	public static adminMiddleware(server: Server, req: Request, res: Response, next: NextFunction) {
		try {
			const authCookie: string = req.cookies["PAPERPLANE-ADMIN"] ?? "";
			if (!authCookie) throw new Error("Unauthorized");

			const verify = Auth.verifyJWTToken(authCookie, server.envConfig.encryptionKey, "admin");
			if (!verify) throw new Error("Unauthorized");

			next();
		} catch (err) {
			res.status(401).send({ message: err.message });
		}
	}
}
