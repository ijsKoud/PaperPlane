import type { ApiFile } from "@paperplane/utils";
import type React from "react";
import FilesCard from "./FilesCard";

interface Props {
	files: ApiFile[];
	selected: string[];

	onSelect: (fileName: string) => void;
	deleteFile: (id: string) => void;
	updateFile: (...props: any) => Promise<boolean>;
}

export const FilesGrid: React.FC<Props> = ({ files, selected, onSelect, deleteFile, updateFile }) => {
	return (
		<div className="w-full flex flex-wrap gap-4 items-center justify-center">
			{files.map((file, key) => (
				<FilesCard
					file={file}
					key={key}
					selected={selected.includes(file.name)}
					onClick={onSelect}
					deleteFile={deleteFile}
					updateFile={updateFile}
				/>
			))}
		</div>
	);
};
