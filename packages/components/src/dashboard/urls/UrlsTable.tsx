import type { ApiUrl } from "@paperplane/utils";
import type React from "react";
import { Table } from "../../index";
import ShortUrlsTableEntry from "./UrlsTableEntry";

interface Props {
	urls: ApiUrl[];
	selected: string[];

	onSelect: (fileName: string) => void;
	deleteUrl: (id: string) => void;
	updateUrl: (...props: any) => Promise<boolean>;
	toastSuccess: (str: string) => void;
}

export const ShortUrlsTable: React.FC<Props> = ({ urls, selected, onSelect, deleteUrl, updateUrl, toastSuccess }) => {
	return (
		<div className="w-full flex flex-wrap gap-4 items-center justify-center bg-main p-8 rounded-xl">
			<div className="overflow-auto w-full max-w-[calc(100vw-16px-64px)]">
				<Table
					className="whitespace-nowrap w-full"
					headClassName="px-2"
					headPosition="left"
					heads={["", "Name", "URL", "Date", "Visits", "Visible", "Options"]}
				>
					{urls.map((url, key) => (
						<ShortUrlsTableEntry
							url={url}
							key={key}
							selected={selected.includes(url.name)}
							onClick={onSelect}
							deleteUrl={deleteUrl}
							toastSuccess={toastSuccess}
							updateUrl={updateUrl}
						/>
					))}
				</Table>
			</div>
		</div>
	);
};
