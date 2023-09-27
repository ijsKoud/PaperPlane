import { AuthUserProdeduce } from "#trpc/context/AuthUser.js";
import { t } from "#trpc/lib.js";

export const dashboardRoute = t.router({
	stats: AuthUserProdeduce.query(async (opt) => {
		const { domain, server } = opt.ctx;

		const files = await server.prisma.file.count({ where: { domain: domain.domain } });
		const shorturls = await server.prisma.url.count({ where: { domain: domain.domain } });
		const pastebins = await server.prisma.pastebin.count({ where: { domain: domain.domain } });

		const parsedDomainData = domain.toJSON().parsed;
		return {
			files,
			shorturls,
			pastebins,
			storage: {
				total: parsedDomainData.maxStorage,
				used: parsedDomainData.storage
			}
		};
	})
});
