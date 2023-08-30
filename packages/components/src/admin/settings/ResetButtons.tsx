import { DangerButton } from "@paperplane/buttons";
import { useRouter } from "next/router";
import type React from "react";
import { useState } from "react";
import { ConfirmModal } from "../../index";

interface Props {
	resetEncryptionKey: () => Promise<boolean>;
}

export const AdminResetButtons: React.FC<Props> = ({ resetEncryptionKey: _resetEncryptionKey }) => {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	const resetEncryptionKey = async () => {
		setIsOpen(false);

		const bool = await _resetEncryptionKey();
		if (bool) void router.push("/login?user=admin");
	};

	return (
		<>
			<ConfirmModal isOpen={isOpen} cancel={() => setIsOpen(false)} confirm={resetEncryptionKey} />
			<div className="max-w-[50vw] max-xl:max-w-[75vw] max-md:max-w-[100vw] w-full">
				<div className="w-full">
					<h1 className="text-xl">BIG RED BUTTONS!!</h1>
					<p className="text-base">Pressing one of the following buttons is very dangerous and once started actions cannot be reverted.</p>
				</div>
				<div className="w-full mt-4 flex items-center gap-2">
					<DangerButton type="button" onClick={() => setIsOpen(true)}>
						Reset Encryption Key
					</DangerButton>
				</div>
			</div>
		</>
	);
};
