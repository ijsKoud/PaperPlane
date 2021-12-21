import React from "react";
import { sortTypes } from "../../../lib/clientConstants";
import ReactSelectDropdown from "../../general/ReactDropdown";

type StateFunction<T> = (v: T) => void;

interface Props {
	setQuery: StateFunction<string>;
	setPage: StateFunction<number>;
	setSort: StateFunction<string>;
	fetchItems: () => void;
	page: number;
	pages: number;
}

const Navigation: React.FC<Props> = ({ setQuery, setPage, setSort, fetchItems, page, pages }) => {
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

	const search = () => {
		setPage(1);
		fetchItems();
	};

	return (
		<div className="dashboard__stats-navigation">
			<div className="dashboard__files-search">
				<input
					type="search"
					placeholder="Search..."
					onChange={(e) => setQuery(e.target.value.trim())}
					onKeyPress={(e) => e.key === "Enter" && search()}
				/>
				<button onClick={search}>
					<i className="fas fa-search" />
				</button>
			</div>
			<div className="dashboard__page-selection">
				<button onClick={previousPage} className={page - 1 <= 0 ? "dashboard__page-button disabled" : "dashboard__page-button"}>
					<i className="fas fa-angle-left" /> Previous
				</button>
				<ReactSelectDropdown
					instanceId="page"
					onChange={(v) => setPage(v?.value ?? 1)}
					options={Array(pages)
						.fill(null)
						.map((_, i) => ({ label: `Page ${i + 1}`, value: i + 1 }))}
					className="dashboard__page-dropdown"
					value={{ label: `Page ${page}`, value: page }}
				/>
				<button onClick={nextPage} className={pages < page + 1 ? "dashboard__page-button disabled" : "dashboard__page-button"}>
					Next <i className="fas fa-angle-right" />
				</button>
			</div>
			<ReactSelectDropdown
				instanceId="sort-type"
				onChange={onSortChange}
				options={sortTypes}
				defaultValue={sortTypes[0]}
				className="dashboard__page-dropdown2"
			/>
		</div>
	);
};

export default Navigation;
