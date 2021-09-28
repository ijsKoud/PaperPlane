import React from "react";
import { sortTypes } from "../../../lib/constants";
import ReactSelectDropdown from "../../reactSelectDropdown";

type StateFunction<T> = (v: T) => void;

interface Props {
	setQuery: StateFunction<string>;
	setPage: StateFunction<number>;
	setSort: StateFunction<string>;
	fetchFiles: () => void;
	page: number;
	pages: number;
}

const Navigation: React.FC<Props> = ({ setQuery, setPage, setSort, fetchFiles, page, pages }) => {
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
		if (0 >= previous) return;

		setPage(previous);
	};

	const search = () => {
		setPage(1);
		fetchFiles();
	};

	return (
		<div className="dashboard__stats-navigation">
			<div className="dashboard__files-search">
				<input
					type="search"
					placeholder="Search..."
					onChange={(e) => setQuery(e.target.value.trim())}
				/>
				<i className="fas fa-search" onClick={search} />
			</div>
			<div className="dashboard__page-selection">
				<p
					onClick={previousPage}
					className={0 >= page - 1 ? "dashboard__page-button disabled" : "dashboard__page-button"}>
					<i className="fas fa-angle-left" /> Previous
				</p>
				<ReactSelectDropdown
					instanceId="page"
					// @ts-ignore
					onChange={(v: { label: string; value: any }) => setPage(v.value)}
					options={Array(pages)
						.fill(null)
						.map((_, i) => ({ label: `Page ${i + 1}`, value: i + 1 }))}
					className="dashboard__page-dropdown"
					value={{ label: `Page ${page}`, value: page }}
				/>
				<p
					onClick={nextPage}
					className={
						pages < page + 1 ? "dashboard__page-button disabled" : "dashboard__page-button"
					}>
					Next <i className="fas fa-angle-right" />
				</p>
			</div>
			<ReactSelectDropdown
				instanceId="sort-type"
				// @ts-ignore
				onChange={onSortChange}
				options={sortTypes}
				defaultValue={sortTypes[0]}
				className="dashboard__page-dropdown2"
			/>
		</div>
	);
};

export default Navigation;
