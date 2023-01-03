import type React from "react";
import axios from "axios";
import { HashLoader } from "react-spinners";
import dynamic from "next/dynamic";
import { TransparentButton } from "@paperplane/buttons";
import { PAPERPLANE_VERSION, parseReleaseMarkdown } from "@paperplane/utils";
import { useSwr } from "@paperplane/swr";

const Markdown = dynamic(() => import("@paperplane/markdown"));

interface ReleaseApiRes {
	body: string;
}

const ChangelogModal: React.FC = () => {
	const releaseApiUrl = `https://api.github.com/repos/ijsKoud/paperplane/releases/tags/v${PAPERPLANE_VERSION}`;
	const releaseUrl = `https://github.com/ijsKoud/PaperPlane/releases/tag/v${PAPERPLANE_VERSION}`;

	const fetcher = (url: string) => axios.get(url).then((res) => res.data);
	const { data, isLoading, error } = useSwr<ReleaseApiRes>(releaseApiUrl, fetcher);

	if (isLoading)
		return (
			<div>
				<HashLoader color="#fff" />
			</div>
		);

	if (!data || error)
		return (
			<div>
				<h1 className="text-xl">PaperPlane couldn&apos;t withstand the heavy wind.</h1>
				<p className="text-base">We failed to retrieve the changelog, we will retry it again in a couple of seconds...</p>
			</div>
		);

	return (
		<>
			<div className="flex justify-between items-center">
				<h1 className="text-3xl">Release v{PAPERPLANE_VERSION}</h1>
				<TransparentButton type="link" href={releaseUrl} target="_blank" extra="text-xl">
					<i className="fa-solid fa-arrow-up-right-from-square" />
				</TransparentButton>
			</div>
			<div className="pr-4 max-h-[calc(100vh-2rem-100px)] overflow-y-auto">
				<Markdown>{parseReleaseMarkdown(data.body)}</Markdown>
			</div>
		</>
	);
};

export default ChangelogModal;
