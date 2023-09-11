import React from "react";
import { ResetAccountDialog } from "./ResetAccountDialog";
import { ResetAuthDialog } from "./ResetAuthDialog";

const BigRedButtons: React.FC = () => {
	return (
		<section className="w-full mt-4">
			<div className="mb-2">
				<h2 className="text-6 font-semibold">BIG RED BUTTONS!!</h2>
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Here you can reset your password/2FA or your account. Note: once a reset is progress you cannot go back so use it wisely!
				</p>
			</div>
			<div className="flex items-center gap-2 w-full">
				<ResetAccountDialog />
				<ResetAuthDialog />
			</div>
		</section>
	);
};

export default BigRedButtons;
