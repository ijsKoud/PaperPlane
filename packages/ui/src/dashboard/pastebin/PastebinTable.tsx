import type { ApiBin } from "@paperplane/utils";
import type React from "react";
import { Table } from "../../index";
import PastebinTableEntry from "./PastebinTableEntry";

interface Props {
	bins: ApiBin[];
	selected: string[];

	onSelect: (fileName: string) => void;
	deleteBin: (id: string) => void;
	updateBin: (...props: any) => Promise<boolean>;
	toastSuccess: (str: string) => void;
}

export const PastebinsTable: React.FC<Props> = ({ bins, selected, onSelect, deleteBin, updateBin, toastSuccess }) => {
	return (
		<div className="w-full flex flex-wrap gap-4 items-center justify-center bg-main p-8 rounded-xl">
			<div className="overflow-auto w-full max-w-[calc(100vw-16px-64px)]">
				<Table
					className="whitespace-nowrap w-full"
					headClassName="px-2"
					headPosition="left"
					heads={["", "Name", "Highlight", "Date", "Views", "Visible", "Options"]}
				>
					{bins.map((bin, key) => (
						<PastebinTableEntry
							bin={bin}
							key={key}
							selected={selected.includes(bin.name)}
							onClick={onSelect}
							deleteBin={deleteBin}
							toastSuccess={toastSuccess}
							updateBin={updateBin}
						/>
					))}
				</Table>
			</div>
		</div>
	);
};
