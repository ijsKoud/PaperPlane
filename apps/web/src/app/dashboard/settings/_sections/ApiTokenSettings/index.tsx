import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { PaperPlaneApiOutputs } from "#trpc/server";

export type Token = PaperPlaneApiOutputs["v1"]["dashboard"]["settings"]["get"]["tokens"][0];

export interface ApiTokenSettingsProps {
	tokens: Token[];
}

const ApiTokenSettings: React.FC<ApiTokenSettingsProps> = ({ tokens }) => {
	return (
		<section>
			<div className="mb-2">
				<h2 className="text-6 font-semibold">API Access</h2>
				<p className="text-base">
					This allows you to create <strong>API Tokens</strong> and generate a <strong>ShareX configuration</strong> which can be used to
					interact with the public APIs. For more information of about the public API, read the <strong>documentation</strong>.
				</p>
			</div>
			<div className="dark:bg-red-500 bg-red-400 p-2 rounded-xl my-4">
				⚠️ <strong>Warning</strong>: Never share API Tokens with anyone except yourself. People could do dangerous things without your
				knowledge.
			</div>

			<DataTable columns={columns} data={tokens} />
		</section>
	);
};

export default ApiTokenSettings;
