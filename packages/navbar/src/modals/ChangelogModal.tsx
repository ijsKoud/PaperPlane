import type React from "react";
import axios from "axios";
import useSWR from "swr";
import { HashLoader } from "react-spinners";
import dynamic from "next/dynamic";
import { TransparentButton } from "@paperplane/buttons";
import { PAPERPLANE_VERSION, parseReleaseMarkdown } from "@paperplane/utils";

const Markdown = dynamic(() => import("@paperplane/markdown"));

interface ReleaseApiRes {
	body: string;
}

const ChangelogModal: React.FC = () => {
	const releaseApiUrl = `https://api.github.com/repos/ijsKoud/paperplane/releases/tags/v${PAPERPLANE_VERSION}`;
	const releaseUrl = `https://github.com/ijsKoud/PaperPlane/releases/tag/v${PAPERPLANE_VERSION}`;

	const fetcher = (url: string) => axios.get(url).then((res) => res.data);
	const { data, isLoading, error } = useSWR<ReleaseApiRes>(releaseApiUrl, fetcher);

	const Base: React.FC<React.PropsWithChildren> = ({ children }) => <div>{children}</div>;

	if (isLoading)
		return (
			<Base>
				<HashLoader color="#fff" />
			</Base>
		);

	if (!data || error) return <Base>{":("}</Base>;

	return (
		<Base>
			<div className="flex justify-between items-center">
				<h1 className="text-3xl">Release v{PAPERPLANE_VERSION}</h1>
				<TransparentButton type="link" href={releaseUrl} target="_blank" extra="text-xl">
					<i className="fa-solid fa-arrow-up-right-from-square" />
				</TransparentButton>
			</div>
			<div className="max-h-[600px] pr-4 overflow-y-auto">
				<Markdown>{parseReleaseMarkdown(data.body)}</Markdown>
			</div>
		</Base>
	);
};

export default ChangelogModal;
