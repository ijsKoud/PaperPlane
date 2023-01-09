import type { ApiFile } from "@paperplane/utils";
import type React from "react";
import FilesCard from "./FilesCard";

interface Props {
	files: ApiFile[];
	selected: string[];
	onSelect: (fileName: string) => void;
}

export const FilesGrid: React.FC<Props> = ({ files, selected, onSelect }) => {
	return (
		<div className="w-full flex flex-wrap gap-4 items-center justify-center">
			{files.map((file, key) => (
				<FilesCard file={file} key={key} selected={selected.includes(file.name)} onClick={onSelect} />
			))}
		</div>
	);
};
