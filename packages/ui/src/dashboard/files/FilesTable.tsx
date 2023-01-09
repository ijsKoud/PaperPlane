import type { ApiFile } from "@paperplane/utils";
import type React from "react";
import { Table } from "../../index";
import FilesTableEntry from "./FilesTableEntry";

interface Props {
	files: ApiFile[];
	selected: string[];
	onSelect: (fileName: string) => void;
}

export const FilesTable: React.FC<Props> = ({ files, selected, onSelect }) => {
	return (
		<div className="w-full flex flex-wrap gap-4 items-center justify-center bg-main p-8 rounded-xl">
			<div className="overflow-auto w-full max-w-[calc(100vw-16px-64px)]">
				<Table
					className="whitespace-nowrap w-full"
					headClassName="px-2"
					headPosition="left"
					heads={["Name", "Size", "Date", "Locked", "Visible", "Options"]}
				>
					{files.map((file, key) => (
						<FilesTableEntry file={file} key={key} selected={selected.includes(file.name)} onClick={onSelect} />
					))}
				</Table>
			</div>
		</div>
	);
};
