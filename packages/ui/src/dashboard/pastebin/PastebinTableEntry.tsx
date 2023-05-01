import { TransparentButton } from "@paperplane/buttons";
import { type ApiBin, formatDate } from "@paperplane/utils";
import type React from "react";
import { useState } from "react";
import { TableEntry } from "../../index";
import { EditPastebinModal } from "./EditModal";

interface Props {
	bin: ApiBin;
	selected: boolean;

	onClick: (fileName: string) => void;
	deleteBin: (id: string) => void;
	updateBin: (...props: any) => Promise<boolean>;
	toastSuccess: (str: string) => void;
}

const PastebinTableEntry: React.FC<Props> = ({ bin, selected, onClick, deleteBin, updateBin, toastSuccess }) => {
	const [isOpen, setIsOpen] = useState(false);
	const ModalonClick = () => setIsOpen(false);
	const viewIcon = bin.visible ? "fa-solid fa-eye text-base" : "fa-solid fa-eye-slash text-base";

	const updateBinFn = async (...props: any) => {
		const success = await updateBin(bin.name, ...props);
		if (success) ModalonClick();
	};

	const onCopy = () => {
		navigator.clipboard.writeText(bin.url);
		toastSuccess("Copied to clipboard!");
	};

	return (
		<>
			<EditPastebinModal isOpen={isOpen} onClick={ModalonClick} onSubmit={updateBinFn} bin={bin} />
			<TableEntry>
				<td>
					<input type="checkbox" onChange={() => onClick(bin.name)} checked={selected} />
				</td>
				<td className="px-2 max-w-[175px] text-ellipsis whitespace-nowrap overflow-hidden" title={bin.name}>
					{bin.name}
				</td>
				<td className="px-2 max-w-[250px] overflow-hidden whitespace-nowrap text-ellipsis" title={bin.highlight}>
					{bin.highlight}
				</td>
				<td className="px-2">{formatDate(bin.date)}</td>
				<td className="px-2">{bin.views}</td>
				<td className="px-2">
					<i className={viewIcon} />
				</td>
				<td className="flex items-center gap-2 px-2">
					<TransparentButton type="button" onClick={() => deleteBin(bin.name)}>
						<i id="urlbutton" className="fa-regular fa-trash-can" />
					</TransparentButton>
					<TransparentButton type="button" onClick={() => setIsOpen(true)}>
						<i id="urlbutton" className="fa-regular fa-pen-to-square" />
					</TransparentButton>
					<TransparentButton type="button" onClick={onCopy}>
						<i id="urlbutton" className="fa-regular fa-copy" />
					</TransparentButton>
					<TransparentButton type="link" href={bin.url} target="_blank">
						<i id="urlbutton" className="fa-solid fa-up-right-from-square" />
					</TransparentButton>
				</td>
			</TableEntry>
		</>
	);
};

export default PastebinTableEntry;
