"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { FileResponse } from "./page";
import Markdown from "@paperplane/markdown";
import { Button } from "@paperplane/ui/button";

const FileView: React.FC<FileResponse & { id: string }> = ({ charset, data, id }) => {
	const router = useRouter();
	const onRawClick = () => {
		router.push(`/files/${id}?raw=true`);
	};

	return (
		<div className="w-screen h-screen relative">
			{charset === "UTF-8" ? <Markdown>{data ?? ""}</Markdown> : <iframe className="w-screen h-screen" src={`/files/${id}?raw=true`} />}
			<Button onClick={onRawClick} variant="outline" className="absolute z-50 right-2 top-2">
				Show Raw
			</Button>
		</div>
	);
};

export default FileView;
