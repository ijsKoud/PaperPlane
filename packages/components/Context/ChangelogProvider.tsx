"use client";

import React, { createContext, useContext, useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "@paperplane/ui/dialog";
import { useSwr } from "@paperplane/swr";
import axios from "axios";
import { PAPERPLANE_VERSION, cn, parseReleaseMarkdown } from "@paperplane/utils";
import { Skeleton } from "@paperplane/ui/skeleton";
import Markdown from "@paperplane/markdown";
import { Button } from "@paperplane/ui/button";
import Link from "next/link";

export interface ChangelogContext {
	isOpen: boolean;
	setState(open: boolean): void;
}

interface ReleaseApiResponse {
	body: string;
}

interface ChangelogDataLoading {
	isLoading: true;
	url: string;
	error: undefined;
	data: undefined;
}

interface ChangelogDataSuccess {
	isLoading: false;
	url: string;
	error: undefined;
	data: ReleaseApiResponse;
}

interface ChangelogDataFail {
	isLoading: false;
	url: string;
	error: any;
	data: undefined;
}

type UseChangelogData = ChangelogDataFail | ChangelogDataLoading | ChangelogDataSuccess;

const ChangelogContext = createContext<ChangelogContext>({ isOpen: false, setState: () => void 0 });
export const UseChangelog = () => useContext(ChangelogContext);

const UseChangelogData = (): UseChangelogData => {
	const releaseApiUrl = `https://api.github.com/repos/ijsKoud/paperplane/releases/tags/v${PAPERPLANE_VERSION}`;
	const releaseUrl = `https://github.com/ijsKoud/PaperPlane/releases/tag/v${PAPERPLANE_VERSION}`;
	const { data, isLoading, error } = useSwr<ReleaseApiResponse>(releaseApiUrl, undefined, (url) => axios.get(url).then((res) => res.data));

	return { data, url: releaseUrl, isLoading: isLoading as any, error };
};

export const ChangelogProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false);
	const changelog = UseChangelogData();

	return (
		<ChangelogContext.Provider value={{ isOpen, setState: setIsOpen }}>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent>
					{changelog.isLoading ? (
						["w-[160px]", "w-[210px]", "w-[135px]", "w-[260px]", "w-[60px]", "w-[125px]"].map((width, key) => (
							<Skeleton key={key} className={cn("h-[20px] rounded-full", width)} />
						))
					) : (
						<React.Fragment>
							<div className="pr-4 max-h-[calc(100vh-2rem-100px)] overflow-y-auto">
								<Markdown>{parseReleaseMarkdown(changelog.data?.body ?? "")}</Markdown>
							</div>
						</React.Fragment>
					)}
					<DialogFooter>
						<Button variant="default" asChild onClick={() => setIsOpen(false)}>
							<Link target="_blank" href={changelog.url}>
								Open changelog
							</Link>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{children}
		</ChangelogContext.Provider>
	);
};
