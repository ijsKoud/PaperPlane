import type { ApiFile } from "@paperplane/utils";
import type React from "react";
import { useState } from "react";
import FilesCard from "./FilesCard";

interface Props {
	files: ApiFile[];
}

export const FilesGrid: React.FC<Props> = ({ files }) => {
	const [selected, setSelected] = useState<string[]>([]);
	const onSelect = (fileName: string) => {
		if (selected.includes(fileName)) setSelected(selected.filter((str) => str !== fileName));
		else setSelected([...selected, fileName]);
	};

	return (
		<div className="w-full flex flex-wrap gap-4 items-center justify-center">
			{files.map((file, key) => (
				<FilesCard file={file} key={key} selected={selected.includes(file.name)} onClick={onSelect} />
			))}
		</div>
	);
};
