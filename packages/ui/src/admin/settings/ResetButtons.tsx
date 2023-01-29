import { DangerButton } from "@paperplane/buttons";
import type React from "react";

interface Props {}

export const AdminResetButtons: React.FC<Props> = () => {
	return (
		<>
			<div className="max-w-[50vw] max-xl:max-w-[75vw] max-md:max-w-[100vw] w-full">
				<div className="w-full">
					<h1 className="text-xl">BIG RED BUTTONS!!</h1>
					<p className="text-base">Pressing one of the following buttons is very dangerous and once started actions cannot be reverted.</p>
				</div>
				<div className="w-full mt-4 flex items-center gap-2">
					<DangerButton type="button">Reset PaperPlane</DangerButton>
					<DangerButton type="button">Reset Encryption Key</DangerButton>
				</div>
			</div>
		</>
	);
};
