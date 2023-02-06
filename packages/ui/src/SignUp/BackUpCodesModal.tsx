import { PrimaryButton } from "@paperplane/buttons";
import { Modal } from "@paperplane/modal";
import type React from "react";

interface Props {
	isOpen: boolean;
	codes: string[];

	downloadCodes: () => void;
	onClick: () => void;
}

export const BackUpCodesModal: React.FC<Props> = ({ isOpen, codes, downloadCodes, onClick }) => {
	return (
		<Modal isOpen={isOpen} onClick={onClick}>
			<div className="w-[60vw] max-xl:w-[80vw]">
				<h1 className="text-3xl">Back up codes</h1>
				<p className="text-base">
					Here are your backup codes, store them somewhere save because you this is the only time you will see them.
				</p>
				<div className="grid grid-cols-3">
					{codes.map((code, key) => (
						<p key={key} className="text-base font-semibold bg-main m-1 p-2 rounded-xl">
							{code}
						</p>
					))}
				</div>
				<PrimaryButton type="button" className="mt-2" onClick={downloadCodes}>
					Download Codes
				</PrimaryButton>
			</div>
		</Modal>
	);
};
