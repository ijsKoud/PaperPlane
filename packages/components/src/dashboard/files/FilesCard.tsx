import { TransparentButton } from "@paperplane/buttons";
import { type ApiFile, formatDate } from "@paperplane/utils";
import type React from "react";
import { useState } from "react";
import { FileEditModal } from "./EditModal";

interface Props {
	file: ApiFile;
	selected: boolean;

	toastSuccess: (str: string) => void;
	onClick: (fileName: string) => void;
	deleteFile: (id: string) => void;
	updateFile: (...props: any) => Promise<boolean>;
}

const FilesCard: React.FC<Props> = ({ file, selected, onClick, deleteFile, updateFile, toastSuccess }) => {
	const [isOpen, setIsOpen] = useState(false);
	const ModalonClick = () => setIsOpen(false);

	const getFilePreviewUrl = () => `${file.url}?preview=true&raw=true`;
	const lockIcon = file.password ? "fa-solid fa-lock text-[18px]" : "fa-solid fa-lock-open text-[18px]";
	const viewIcon = file.visible ? "fa-solid fa-eye text-[18px]" : "fa-solid fa-eye-slash text-[18px]";

	const onKeyEvent = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if ((event.target as any)?.id !== "filecard" || event.key !== "Enter") return;
		onClick(file.name);
	};

	const onMouseEvent = (event: React.MouseEvent<HTMLDivElement>) => {
		if ((event.target as any)?.id === "filebutton" || event.button !== 0) return;
		onClick(file.name);
	};

	const deleteFileFn = () => {
		void deleteFile(file.name);
	};

	const updateFileFn = async (...props: any) => {
		const success = await updateFile(file.name, ...props);
		if (success) ModalonClick();
	};

	const onCopy = () => {
		navigator.clipboard.writeText(file.url);
		toastSuccess("Copied to clipboard!");
	};

	return (
		<>
			<FileEditModal file={file} isOpen={isOpen} onClick={ModalonClick} onSubmit={updateFileFn} />
			<div
				id="filecard"
				role="checkbox"
				tabIndex={0}
				aria-checked={selected}
				onMouseUpCapture={onMouseEvent}
				onKeyUpCapture={onKeyEvent}
				className={`bg-main rounded-xl p-4 outline outline-4 outline-transparent focus-visible:outline-blue-500 hover:outline-blue-500 ${
					selected && "!outline-blue"
				} cursor-pointer transition-all flex flex-col gap-2`}
			>
				<div className="w-72 h-40 overflow-hidden grid place-items-center bg-white-200 rounded-md">
					{file.isImage ? (
						<img className="w-full" src={getFilePreviewUrl()} alt={`${file.name} preview image`} />
					) : (
						<div className="h-full w-full relative grid place-items-center">
							<p className="text-3xl font-semibold uppercase absolute text-gray-400">{file.ext}</p>
						</div>
					)}
				</div>
				<ul className="max-w-[18rem]">
					<li className="flex justify-between items-center gap-2">
						<h1 className="text-base text-ellipsis whitespace-nowrap overflow-hidden" title={file.name}>
							{file.name}
						</h1>
						<div className="flex items-center gap-2">
							<TransparentButton type="button" onClick={deleteFileFn}>
								<i id="filebutton" className="fa-regular fa-trash-can" />
							</TransparentButton>
							<TransparentButton type="button" onClick={() => setIsOpen(true)}>
								<i id="filebutton" className="fa-regular fa-pen-to-square" />
							</TransparentButton>
							<TransparentButton type="button" onClick={onCopy}>
								<i id="filebutton" className="fa-regular fa-copy" />
							</TransparentButton>
							<TransparentButton type="link" href={file.url} target="_blank">
								<i id="filebutton" className="fa-solid fa-up-right-from-square" />
							</TransparentButton>
						</div>
					</li>
					<li className="flex justify-between items-center my-2">
						<p className="italic text-small font-medium">{formatDate(file.date)}</p>
						<p className="text-small font-medium">{file.size}</p>
					</li>
					<li className="flex items-center justify-between">
						<p className="text-small font-medium">{file.views} views</p>
						<div className="flex items-center justify-center gap-2">
							<i className={lockIcon} />
							<i className={viewIcon} />
						</div>
					</li>
				</ul>
			</div>
		</>
	);
};

export default FilesCard;
