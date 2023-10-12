"use client";

import { Button } from "@paperplane/ui/button";
import { ToastAction } from "@paperplane/ui/toast";
import { useToast } from "@paperplane/ui/use-toast";
import { cn, formatDate } from "@paperplane/utils";
import { CopyIcon, EditIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon, LockIcon, Trash2Icon, UnlockIcon } from "lucide-react";
import React, { useState } from "react";
import { UpdateDialog } from "../UpdateDialog";
import { api } from "#trpc/server";
import { File } from "../FilesDisplay";

export interface GridCardProps {
	file: File;

	selected: boolean;
	toggleSelected: () => void;
}

const GridCard: React.FC<GridCardProps> = ({ file, selected, toggleSelected }) => {
	const { toast } = useToast();
	const [editModal, setEditModal] = useState(false);
	const getFilePreviewUrl = () => `${file.url}?preview=true&raw=true`;

	const onKeyEvent = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if ((event.target as any)?.id !== "filecard" || event.key !== "Enter") return;
		toggleSelected();
	};

	const onMouseEvent = (event: React.MouseEvent<HTMLDivElement>) => {
		if ((event.target as any)?.id === "filebutton" || event.button !== 0) return;
		toggleSelected();
	};

	const deleteFile = async () => {
		try {
			await api().v1.dashboard.files.delete.mutate([file.name]);
			toast({ title: "File Deleted", description: `${file.name} has been deleted.` });
		} catch (err) {
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong",
				description: `There was a problem with your request: ${err.message}`,
				action: (
					<ToastAction altText="Try again" onClick={deleteFile}>
						Try again
					</ToastAction>
				)
			});
		}
	};

	const copyUrl = () => {
		void navigator.clipboard.writeText(file.url);
		toast({ title: "URL Copied", description: "URL copied to clipboard." });
	};

	const editFile = () => setEditModal(true);

	return (
		<div
			id="filecard"
			role="checkbox"
			tabIndex={0}
			aria-checked={selected}
			onMouseUpCapture={onMouseEvent}
			onKeyUpCapture={onKeyEvent}
			className={cn(
				"w-[330px] bg-zinc-200 dark:bg-zinc-800 rounded-xl p-4 outline outline-4 outline-transparent focus-visible:outline-blue-500 hover:outline-blue-500",
				"cursor-pointer transition-all flex flex-col gap-2",
				selected && "!outline-blue"
			)}
		>
			<UpdateDialog isOpen={editModal} name={file.name} passwordEnabled={file.password} visible={file.visible} setIsOpen={setEditModal} />

			<div className="w-[298px] h-40 overflow-hidden grid place-items-center bg-zinc-500 dark:bg-zinc-600 rounded-md">
				{file.isImage ? (
					<img className="w-full" src={getFilePreviewUrl()} alt={`${file.name} preview image`} />
				) : (
					<div className="h-full w-full relative grid place-items-center">
						<p className="text-11 font-semibold uppercase absolute">{file.ext}</p>
					</div>
				)}
			</div>

			<ul className="max-w-[298px]">
				<li className="flex justify-between items-center gap-2">
					<h1 className="text-4 font-medium text-ellipsis whitespace-nowrap overflow-hidden" title={file.name}>
						{file.name}
					</h1>

					<div className="flex items-center gap-1">
						<Button className="w-fit" id="filebutton" aria-label="Delete file" variant="ghost" size="icon" onClick={deleteFile}>
							<Trash2Icon id="filebutton" />
						</Button>
						<Button className="w-fit" id="filebutton" aria-label="Edit file" variant="ghost" size="icon" onClick={editFile}>
							<EditIcon id="filebutton" />
						</Button>
						<Button className="w-fit" id="filebutton" aria-label="Copy url" variant="ghost" size="icon" onClick={copyUrl}>
							<CopyIcon id="filebutton" />
						</Button>
						<Button
							className="w-fit"
							id="filebutton"
							aria-label="Open url"
							variant="ghost"
							size="icon"
							onClick={() => window.open(file.url)}
						>
							<ExternalLinkIcon id="filebutton" />
						</Button>
					</div>
				</li>

				<li className="flex justify-between items-center my-2">
					<p className="italic text-small font-normal">{formatDate(file.date)}</p>
					<p className="text-small font-medium">{file.size}</p>
				</li>

				<li className="flex items-center justify-between">
					<p className="text-small font-medium">{file.views} views</p>
					<div className="flex items-center justify-center gap-2">
						{file.password ? <LockIcon /> : <UnlockIcon />}
						{file.visible ? <EyeIcon /> : <EyeOffIcon />}
					</div>
				</li>
			</ul>
		</div>
	);
};

export default GridCard;
