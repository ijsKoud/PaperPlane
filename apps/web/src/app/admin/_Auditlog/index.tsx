"use client";

import { AuditlogTable, AuditlogToolbar } from "./DataTable";
import React from "react";
import { UseAdminAudit } from "../_lib/hooks";
import { type ReadonlyURLSearchParams, useSearchParams } from "next/navigation";

export const Auditlog: React.FC = () => {
	const params = getAuditlogSearchParams(useSearchParams());
	const { logs, page, pages, setPage, setSearch } = UseAdminAudit(params);

	return (
		<div className="w-full px-2">
			<div className="w-full rounded-lg p-8 flex flex-col gap-2 dark:bg-zinc-900 bg-zinc-100 border border-zinc-200 dark:border-zinc-700 ">
				<h1 className="text-7 font-semibold max-sm:text-center">Audit Logs</h1>
				<AuditlogToolbar page={page} pages={pages} setSearch={setSearch} setPage={setPage} />
				<div className="overflow-x-auto max-w-[calc(100vw-16px-64px-16px)] w-full">
					<AuditlogTable logs={logs} />
				</div>
			</div>
		</div>
	);
};

/**
 * Parses the search params
 * @param params The readonly search params class
 * @returns
 */
function getAuditlogSearchParams(params: ReadonlyURLSearchParams) {
	const query = params.get("q") ?? "";
	const _page = params.get("page");
	const page = Number(_page);

	return {
		query,
		page: isNaN(page) ? 0 : page
	};
}
