import React from "react";
import type { FC } from "../../../../lib/types";
import SelectMenu from "../../../general/SelectMenu";

interface Props {
	page: number;
	pages: number;
	setPage: (page: number) => void;

	setSearchQuery: (query: string) => void;

	sortOptions: string[];
	setSort: (option: string) => void;
}

const FilterBar: FC<Props> = ({ page, pages, setPage, setSearchQuery, sortOptions, setSort }) => {
	const options = sortOptions.map((opt) => ({ label: opt.replace(/-/g, " "), value: opt }));

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

	return (
		<div className="dashboard__stats-navigation">
			<div className="dashboard__files-search">
				<input type="search" placeholder="Search..." onChange={(e) => setSearchQuery(e.target.value.trim())} />
			</div>
			<div className="dashboard__page-selection">
				<button onClick={previousPage} className={page - 1 <= 0 ? "dashboard__page-button disabled" : "dashboard__page-button"}>
					<i className="fas fa-angle-left" /> Previous
				</button>
				<SelectMenu
					instanceId="page"
					onChange={(v) => setPage(v?.value ?? 1)}
					options={Array(pages)
						.fill(null)
						.map((_, i) => ({ label: `Page ${i}`, value: i }))}
					className="dashboard__page-dropdown"
					value={{ label: `Page ${page}`, value: page }}
				/>
				<button onClick={nextPage} className={pages < page + 1 ? "dashboard__page-button disabled" : "dashboard__page-button"}>
					Next <i className="fas fa-angle-right" />
				</button>
			</div>
			<SelectMenu
				instanceId="sort-type"
				onChange={onSortChange}
				options={options}
				defaultValue={options[0]}
				className="dashboard__page-dropdown2"
			/>
		</div>
	);
};

export default FilterBar;
