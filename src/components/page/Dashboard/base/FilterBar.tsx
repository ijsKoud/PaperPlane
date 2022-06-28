import React, { useEffect, useState } from "react";
import type { FC } from "../../../../lib/types";
import Button from "../../../general/Button";
import SelectMenu from "../../../general/SelectMenu";

interface Props {
	page: number;
	pages: number;
	setPage: (page: number) => void;

	setSearchQuery: (query: string) => void;

	sortOptions: {
		[x: string]: string;
	};
	setSort: (option: string) => void;
}

const FilterBar: FC<Props> = ({ page, pages, setPage, setSearchQuery, sortOptions, setSort }) => {
	const options = Object.keys(sortOptions).map((opt) => ({ label: sortOptions[opt], value: opt }));
	const [searchTerm, setSearchTerm] = useState("");

	const onSortChange = (value: { label: string; value: any } | null) => {
		if (!value) return;
		setSort(value.value);
	};

	const nextPage = () => {
		const next = page + 1;
		if (pages < next) return;

		setPage(next);
	};

	const previousPage = () => {
		const previous = page - 1;
		if (previous <= 0) return;

		setPage(previous);
	};

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => setSearchQuery(searchTerm), 1e3);
		return () => clearTimeout(delayDebounceFn);
	}, [searchTerm]);

	return (
		<div className="dashboard-table-navigation">
			<div className="dashboard-table-search">
				<input type="search" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value.trim())} />
			</div>
			<div className="dashboard-table-page-select">
				<Button type="button" style="grey" onClick={previousPage}>
					<i className="fa-solid fa-angle-left" /> Previous
				</Button>
				<SelectMenu
					instanceId="page"
					onChange={(v) => setPage(v?.value ?? 1)}
					options={Array(pages)
						.fill(null)
						.map((_, i) => ({ label: `Page ${i + 1}`, value: i + 1 }))}
					className="dashboard-table-dropdown"
					value={{ label: `Page ${page}`, value: page }}
				/>
				<Button type="button" style="grey" onClick={nextPage}>
					Next <i className="fa-solid fa-angle-right" />
				</Button>
			</div>
			<SelectMenu
				instanceId="sort-type"
				onChange={onSortChange}
				options={options}
				defaultValue={options[0]}
				className="dashboard-table-dropdown big"
			/>
		</div>
	);
};

export default FilterBar;
