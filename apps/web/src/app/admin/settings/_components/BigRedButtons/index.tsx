import React from "react";
import { ResetEncryptionDialog } from "./ResetEncryptionDialog";

const BigRedButtons: React.FC = () => {
	return (
		<section className="w-full mt-4">
			<div className="mb-2">
				<h2 className="text-6 font-semibold">BIG RED BUTTONS!!</h2>
				<p>Pressing one of the following buttons is very dangerous and once started actions cannot be undone.</p>
			</div>
			<div className="flex items-center gap-2 w-full">
				<ResetEncryptionDialog />
			</div>
		</section>
	);
};

export default BigRedButtons;
