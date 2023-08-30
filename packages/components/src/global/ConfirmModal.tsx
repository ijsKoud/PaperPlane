import { DangerButton } from "@paperplane/buttons";
import { Modal } from "@paperplane/modal";
import type React from "react";

interface Props {
	isOpen: boolean;

	cancel: () => void;
	confirm: () => void;
}

export const ConfirmModal: React.FC<Props> = ({ isOpen, cancel, confirm }) => {
	return (
		<Modal isOpen={isOpen} onClick={cancel}>
			<div className="flex flex-col gap-8 items-center justify-center">
				<div className="max-w-[40vw] max-xl:max-w-[75vw] max-md:max-w-[100vw]">
					<h1 className="text-3xl text-center">Are you sure?</h1>
					<p className="text-base text-center">You are about to do something dangerous, you can still go back!</p>
				</div>
				<div className="w-full grid place-items-center">
					<DangerButton type="button" onClick={confirm} className="w-full">
						Continue
					</DangerButton>
				</div>
			</div>
		</Modal>
	);
};
