import type Domain from "#components/Domain.js";
import type { PartialFileCreateOptions } from "#components/PartialFile.js";
import PartialFile from "#components/PartialFile.js";
import { Collection } from "@discordjs/collection";
import type { PartialFile as iPartialFile } from "@prisma/client";
import { rm } from "node:fs/promises";

export default class PartialFileManager {
	public readonly domain: Domain;

	/** Collection of active partial file handlers */
	public readonly partials = new Collection<string, PartialFile>();

	public constructor(domain: Domain, files: iPartialFile[]) {
		this.domain = domain;
		files.forEach((file) => this.partials.set(file.id, new PartialFile(this, file)));
	}

	/**
	 * Creates a new partial file instance
	 * @param data The partial file configuration
	 * @returns
	 */
	public async create(data: PartialFileCreateOptions) {
		const file = await PartialFile.create(data, this);
		this.partials.set(file.id, file);

		return file;
	}

	/**
	 * Deletes a partial file handler
	 * @param id The id of the partial file handler
	 * @returns
	 */
	public async delete(id: string) {
		const partial = this.partials.get(id);
		if (!partial) return;

		await rm(partial.path, { force: true, recursive: true });
		await this.domain.server.prisma.partialFile.delete({ where: { id, path: partial.path } });

		clearTimeout(partial.timeout);
		this.partials.delete(id);
	}
}
