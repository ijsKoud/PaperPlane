import type Domain from "#components/Domain.js";
import { Auth } from "#lib/Auth.js";
import Config from "#lib/Config.js";
import { Utils } from "#lib/utils.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { NextFunction, Request, Response } from "express";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ZodError, z } from "zod";

@ApplyOptions<Route.Options>({ ratelimit: { max: 5, windowMs: 1e3 }, middleware: [[methods.POST, "user-api-key"]] })
export default class ApiRoute extends Route<Server> {
	public async [methods.POST](req: Request, res: Response, next: NextFunction, { domain }: Record<"domain", Domain>) {
		const body = this.parseBody(req.body);
		if (body instanceof ZodError) {
			const errors = Utils.parseZodError(body);
			res.status(400).send({ errors });
			return;
		}

		const config = Config.getEnv();
		const pastebins = await this.server.prisma.pastebin.findMany({ where: { domain: domain.domain } });

		try {
			const path = join(domain.pastebinPath, `${Auth.generateToken(32)}.txt`);
			const id = Utils.generateId(domain.nameStrategy, domain.nameLength) || (Utils.generateId("id", domain.nameLength) as string);

			// Authentication stuff
			const authBuffer = Buffer.from(`${Auth.generateToken(32)}.${Date.now()}.${domain.domain}.${id}`).toString("base64");
			const authSecret = Auth.encryptToken(authBuffer, config.encryptionKey);

			await writeFile(path, body.content);
			const pastebin = await this.server.prisma.pastebin.create({
				data: {
					id: body.name ? (pastebins.map((bin) => bin.id).includes(body.name) ? id : body.name) : id,
					password: body.password ? Auth.encryptPassword(body.password, config.encryptionKey) : undefined,
					date: new Date(),
					domain: domain.domain,
					visible: body.visible,
					highlight: body.highlight,
					authSecret,
					path
				}
			});

			domain.auditlogs.register("Pastebin Created", `Id: ${id}`);
			res.status(200).json({
				url: `${Utils.getProtocol()}${domain}/bins/${id}`,
				visible: pastebin.visible,
				password: Boolean(pastebin.password),
				highlight: pastebin.highlight,
				date: pastebin.date,
				domain: pastebin.domain
			});
		} catch (err) {
			this.server.logger.fatal("[BIN:CREATE]: Fatal error while creating a pastebin", err);
			res.status(500).send({
				errors: [
					{
						field: null,
						code: "INTERNAL_SERVER_ERROR",
						message: "Unknown error occurred while creating a pastebin, please try again later."
					}
				]
			});
		}
	}

	/**
	 * Parses the request body
	 * @param body The body to parse
	 * @returns Parsed json content or ZodError if there was a parsing issue
	 */
	private parseBody(body: any) {
		const schema = z.object({
			name: z
				.string({ invalid_type_error: "Property 'name' must be a string" })
				.refine((arg) => !arg.includes("/"), "Name cannot contain a slash (/)")
				.optional(),
			visible: z.boolean({ required_error: "Visibility state is required", invalid_type_error: "Property 'visible' must be a boolean" }),
			content: z
				.string({ required_error: "Pastebin content is required", invalid_type_error: "Property 'content' must be a string" })
				.min(1, "Pastebin content is required"),
			highlight: z.string({
				required_error: "A valid highlight type is required",
				invalid_type_error: "Property 'highlight' must be a string"
			}),
			password: z.string({ invalid_type_error: "Property 'password' must be a string" }).optional()
		});

		try {
			return schema.parse(body);
		} catch (error) {
			return error as ZodError;
		}
	}
}
