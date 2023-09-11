"use client";

import React from "react";
import { saveAs } from "file-saver";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@paperplane/ui/dialog";
import { Button } from "@paperplane/ui/button";
import { DownloadIcon } from "lucide-react";

interface Props {
	codes: string[];
	open: boolean;
	close: () => void;
}

export const CodesDialog: React.FC<Props> = ({ codes, open, close }) => {
	/**
	 * Saves the backup codes to the device in a .txt file
	 */
	const downloadCodes = () => {
		const blob = new Blob([codes.join("\n")], {
			type: "data:application/json;charset=utf-8"
		});
		saveAs(blob, "paperplane-backup-codes.txt");
	};

	/**
	 * Handles the onOpenChange event on the dialog element
	 * @param open The open state
	 */
	const onOpenChange = (open: boolean) => {
		if (open) return;
		close();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Here are your backup codes</DialogTitle>
					<DialogDescription>
						Make sure to store these codes somewhere safe. You will not be able to see them again after this.
					</DialogDescription>
				</DialogHeader>
				<div className="grid grid-cols-3">
					{codes.map((code, key) => (
						<p key={key} className="text-base dark:bg-zinc-800 bg-zinc-200 m-1 p-2 rounded-lg">
							{code}
						</p>
					))}
				</div>
				<DialogFooter>
					<Button variant="default" onClick={downloadCodes}>
						<DownloadIcon className="mr-2 h-4 w-4" /> Download
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
