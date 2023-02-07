import { TransparentButton } from "@paperplane/buttons";
import { Input, SelectMenu, SelectOption } from "@paperplane/forms";
import type React from "react";
import { useEffect, useState } from "react";

interface Props {
	pages: number;
	page: number;
	setPage: (page: number) => void;

	setSearch: (search: string) => void;
}

export const AuditLogToolbar: React.FC<Props> = ({ page, pages, setPage, setSearch }) => {
	const pageOptions: SelectOption[] = Array(pages)
		.fill(null)
		.map((_, key) => ({ label: `Page ${key + 1}`, value: key.toString() }));
	const pageValue: SelectOption = { label: `Page ${page + 1}`, value: page.toString() };

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
		<div className="w-full flex justify-between items-center mt-2 gap-4 flex-wrap max-[512px]:flex-col max-[512px]:flex-nowrap">
			<Input type="primary" placeholder="Search for a specific event" onInputCapture={(ctx) => _setSearch(ctx.currentTarget.value)} />
			<div className="flex gap-4">
				<TransparentButton type="button" onClick={previousPage} disabled={page <= 0}>
					<i className="fa-solid fa-angle-left text-lg" />
				</TransparentButton>
				<SelectMenu type="primary" placeholder="page" options={pageOptions} value={pageValue} onChange={onPageChange} />
				<TransparentButton type="button" onClick={nextPage} disabled={page >= pages - 1}>
					<i className="fa-solid fa-angle-right text-lg" />
				</TransparentButton>
			</div>
		</div>
	);
};
