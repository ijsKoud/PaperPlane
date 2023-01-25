import { DangerButton, SuccessButton } from "@paperplane/buttons";
import type React from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

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

	cancel: () => void;
	settings: () => void;
	deleteFn: () => void;
}

const AdminDeleteBannerEl: React.FC<Props> = ({ items, cancel, settings, deleteFn }) => {
	return (
		<AnimatePresence>
			{items.length && (
				<motion.div
					variants={variants}
					initial="initial"
					animate="animate"
					exit="exit"
					key="hello"
					className="fixed bottom-4 grid place-items-center w-screen px-4"
				>
					<div className="bg-main max-w-[1100px] p-4 border-white-100 border rounded-xl flex items-center justify-between w-full max-md:flex-col gap-y-4">
						<p className="text-base text-center">
							Ready to edit or delete{" "}
							<span className="font-semibold">
								{items.length} {items.length === 1 ? "item" : "items"}
							</span>
							?
						</p>
						<div className="flex items-center justify-center gap-2">
							<DangerButton type="button" className="rounded-lg max-sm:text-small" onClick={deleteFn}>
								Delete them!
							</DangerButton>
							<DangerButton type="button" className="rounded-lg max-sm:text-small" onClick={settings}>
								Change settings!
							</DangerButton>
							<SuccessButton type="button" className="rounded-lg max-sm:text-small" onClick={cancel}>
								No go back!
							</SuccessButton>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export const AdminDeleteBanner: React.FC<Props> = (props) => {
	const [BodyEl, setBodyEl] = useState<HTMLElement>();

	useEffect(() => {
		const body = document.getElementsByTagName("body");
		setBodyEl(body[0]);
	}, []);

	return BodyEl ? ReactDOM.createPortal(<AdminDeleteBannerEl {...props} />, BodyEl) : <div></div>;
};
