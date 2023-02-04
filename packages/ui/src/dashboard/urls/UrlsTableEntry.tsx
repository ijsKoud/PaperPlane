import { TransparentButton } from "@paperplane/buttons";
import { ApiUrl, formatDate } from "@paperplane/utils";
import type React from "react";
import { useState } from "react";
import { TableEntry } from "../../index";
import { UrlEditModal } from "./EditModal";

interface Props {
	url: ApiUrl;
	selected: boolean;

	onClick: (fileName: string) => void;
	deleteUrl: (id: string) => void;
	updateUrl: (...props: any) => Promise<boolean>;
	toastSuccess: (str: string) => void;
}

const ShortUrlsTableEntry: React.FC<Props> = ({ url, selected, onClick, deleteUrl, updateUrl, toastSuccess }) => {
	const [isOpen, setIsOpen] = useState(false);
	const ModalonClick = () => setIsOpen(false);
	const viewIcon = url.visible ? "fa-solid fa-eye text-base" : "fa-solid fa-eye-slash text-base";

	const updateUrlFn = async (...props: any) => {
		const success = await updateUrl(url.name, ...props);
		if (success) ModalonClick();
	};

	const onCopy = () => {
		navigator.clipboard.writeText(url.url);
		toastSuccess("Copied to clipboard!");
	};

	return (
		<>
			<UrlEditModal isOpen={isOpen} onClick={ModalonClick} onSubmit={updateUrlFn} url={url} />
			<TableEntry>
				<td>
					<input type="checkbox" onChange={() => onClick(url.name)} checked={selected} />
				</td>
				<td className="px-2 max-w-[200px] text-ellipsis whitespace-nowrap overflow-hidden" title={url.name}>
					{url.name}
				</td>
				<td className="px-2 max-w-[250px] overflow-hidden whitespace-nowrap text-ellipsis" title={url.redirect}>
					{url.redirect}
				</td>
				<td className="px-2">{formatDate(url.date)}</td>
				<td className="px-2">{url.visits}</td>
				<td className="px-2">
					<i className={viewIcon} />
				</td>
				<td className="flex items-center gap-2 px-2">
					<TransparentButton type="button" onClick={() => deleteUrl(url.name)}>
						<i id="urlbutton" className="fa-regular fa-trash-can" />
					</TransparentButton>
					<TransparentButton type="button" onClick={() => setIsOpen(true)}>
						<i id="urlbutton" className="fa-regular fa-pen-to-square" />
					</TransparentButton>
					<TransparentButton type="button" onClick={onCopy}>
						<i id="urlbutton" className="fa-regular fa-copy" />
					</TransparentButton>
					<TransparentButton type="link" href={url.url} target="_blank">
						<i id="urlbutton" className="fa-solid fa-up-right-from-square" />
					</TransparentButton>
				</td>
			</TableEntry>
		</>
	);
};

export default ShortUrlsTableEntry;
