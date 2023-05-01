import { TransparentButton } from "@paperplane/buttons";
import { Input, SelectMenu, type SelectOption } from "@paperplane/forms";
import { FilesSort, FilesSortNames } from "@paperplane/utils";
import type React from "react";
import { useEffect, useState } from "react";

interface Props {
	pages: number;
	page: number;
	setPage: (page: number) => void;

	setSearch: (search: string) => void;

	sort: FilesSort;
	setSort: (sort: FilesSort) => void;

	view: "grid" | "list";
	setView: (view: "grid" | "list") => void;
}

export const FilesDashboardToolbar: React.FC<Props> = ({ setView, view, sort, setSort, page, pages, setPage, setSearch }) => {
	const sortOptions: SelectOption[] = Object.keys(FilesSortNames).map((key) => ({
		value: key,
		label: FilesSortNames[key as unknown as FilesSort]
	}));
	const sortValue: SelectOption = { label: FilesSortNames[sort], value: sort.toString() };

	const pageOptions: SelectOption[] = Array(pages)
		.fill(null)
		.map((_, key) => ({ label: `Page ${key + 1}`, value: key.toString() }));
	const pageValue: SelectOption = { label: `Page ${page + 1}`, value: page.toString() };

	const onSortChange = (option: any) => {
		if (typeof option !== "object") return;
		const { value } = option as SelectOption;

		setSort(Number(value));
	};

	const previousPage = () => setPage(page - 1);
	const nextPage = () => setPage(page + 1);
	const onPageChange = (option: any) => {
		if (typeof option !== "object") return;
		const { value } = option as SelectOption;

		setPage(Number(value));
	};

	const [_search, _setSearch] = useState("");
	const [timeout, setTimeoutFn] = useState<NodeJS.Timeout>();
	useEffect(() => {
		const newTimeout = setTimeout(() => {
			setSearch(_search);
			setTimeoutFn(undefined);
		}, 1e3);

		clearTimeout(timeout);
		setTimeoutFn(newTimeout);

		return () => clearTimeout(timeout);
	}, [_search]);

	return (
		<div className="w-full flex justify-between items-center mt-4 gap-4 flex-wrap max-[512px]:flex-col max-[512px]:flex-nowrap">
			<Input type="main" placeholder="Search for a file" onInputCapture={(ctx) => _setSearch(ctx.currentTarget.value)} />
			<div className="flex gap-4">
				<TransparentButton type="button" onClick={previousPage}>
					<i className="fa-solid fa-angle-left text-lg" />
				</TransparentButton>
				<SelectMenu type="main" placeholder="page" options={pageOptions} value={pageValue} onChange={onPageChange} />
				<TransparentButton type="button" onClick={nextPage}>
					<i className="fa-solid fa-angle-right text-lg" />
				</TransparentButton>
			</div>
			<SelectMenu className="w-52" type="main" placeholder="Filter" options={sortOptions} value={sortValue} onChange={onSortChange} />
			<div className="flex gap-4 items-center">
				<TransparentButton type="button" onClick={() => setView("list")}>
					<i
						className={`fa-solid fa-list-ul text-xl text-white-400 hover:text-white-800 transition-colors ${
							view === "list" && "!text-white"
						}`}
					/>
				</TransparentButton>
				<TransparentButton type="button" onClick={() => setView("grid")}>
					<i
						className={`fa-solid fa-border-none text-xl text-white-400 hover:text-white-800 transition-colors ${
							view === "grid" && "!text-white"
						}`}
					/>
				</TransparentButton>
			</div>
		</div>
	);
};
