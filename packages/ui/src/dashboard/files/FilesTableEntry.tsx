import { TransparentButton } from "@paperplane/buttons";
import type { ApiFile, formatDate, formatBytes } from "@paperplane/utils";
import type React from "react";
import { TableEntry } from "../../index";

interface Props {
	file: ApiFile;
	selected: boolean;
	onClick: (fileName: string) => void;
}

const FilesTableEntry: React.FC<Props> = ({ file, selected, onClick }) => {
	const getFilePreviewUrl = () => `${file.url}?preview=true`;
	const lockIcon = file.password ? "fa-solid fa-lock text-base" : "fa-solid fa-lock-open text-base";
	const viewIcon = file.visible ? "fa-solid fa-eye text-base" : "fa-solid fa-eye-slash text-base";

	const onKeyEvent = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if ((event.target as any)?.id !== "filecard" || event.key !== "Enter") return;
		onClick(file.name);
	};

	const onMouseEvent = (event: React.MouseEvent<HTMLDivElement>) => {
		if ((event.target as any)?.id === "filebutton" || event.button !== 0) return;
		onClick(file.name);
	};

	return (
		<TableEntry>
			<td>Image Uploaded</td>
			<td>Desktop: Windows 11 - Chrome</td>
			<td>12 Dec. 2022 4:32 PM</td>
		</TableEntry>
	);
};

export default FilesTableEntry;
