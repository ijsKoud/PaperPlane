import { DangerButton, SuccessButton } from "@paperplane/buttons";
import type React from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const variants = {
	initial: {
		transform: "translateY(10px)",
		opacity: 0,
		transition: {
			duration: 0.3,
			ease: [0.4, 0, 0.2, 1]
		}
	},
	animate: {
		transform: "translateY(0px)",
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: [0.4, 0, 0.2, 1]
		}
	},
	exit: {
		transform: "translateY(-10px)",
		opacity: 0,
		transition: {
			duration: 0.3,
			ease: [0.4, 0, 0.2, 1]
		}
	}
} satisfies Variants;

interface Props {
	items: string[];
	type: "file" | "shorturl" | "pastebin";

	cancel: () => void;
	success: () => void;
}

export const DashboardDeleteBanner: React.FC<Props> = ({ items, type, cancel, success }) => {
	const correctTypeForm = items.length === 1 ? type : `${type}s`;

	return (
		<AnimatePresence>
			{items.length && (
				<motion.div
					variants={variants}
					initial="initial"
					animate="animate"
					exit="exit"
					key="hello"
					className="px-4 fixed bottom-4 max-w-[1008px] w-full"
				>
					<div className="bg-main p-4 border-white-100 border rounded-xl flex items-center justify-between w-full max-md:flex-col gap-y-4">
						<p className="text-base text-center">
							Are you sure you want to delete{" "}
							<span className="font-semibold">
								{items.length} {correctTypeForm}
							</span>
							?
						</p>
						<div className="flex items-center justify-center gap-2">
							<DangerButton type="button" className="rounded-lg" onClick={success}>
								Yes do it!
							</DangerButton>
							<SuccessButton type="button" className="rounded-lg" onClick={cancel}>
								No go back!
							</SuccessButton>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
