import { TransparentButton } from "@paperplane/buttons";
import { Input, SelectMenu, SelectOption } from "@paperplane/forms";
import { UrlsSort, ShortUrlsSortNames } from "@paperplane/utils";
import type React from "react";

interface Props {
	pages: number;
	page: number;
	setPage: (page: number) => void;

	setSearch: (search: string) => void;

	sort: UrlsSort;
	setSort: (sort: UrlsSort) => void;
}

export const ShortUrlsDashboardToolbar: React.FC<Props> = ({ sort, setSort, page, pages, setPage, setSearch }) => {
	const sortOptions: SelectOption[] = Object.keys(ShortUrlsSortNames).map((key) => ({
		value: key,
		label: ShortUrlsSortNames[key as unknown as UrlsSort]
	}));
	const sortValue: SelectOption = { label: ShortUrlsSortNames[sort], value: sort.toString() };

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

	return (
		<div className="w-full flex justify-between items-center mt-4 gap-4 flex-wrap max-[512px]:flex-col max-[512px]:flex-nowrap">
			<Input type="main" placeholder="Search for a shorturl" onInputCapture={(ctx) => setSearch(ctx.currentTarget.value)} />
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
		</div>
	);
};
