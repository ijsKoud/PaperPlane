import type React from "react";
import { motion, Variants } from "framer-motion";
import { PrimaryButton, TransparentButton } from "@paperplane/buttons";

const variants: Variants = {
	initial: {
		opacity: 0,
		transition: {
			duration: 0.15,
			ease: [0.4, 0, 0.2, 1]
		}
	},
	animate: {
		opacity: 1,
		transition: {
			duration: 0.15,
			ease: [0.4, 0, 0.2, 1]
		}
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.15,
			ease: [0.4, 0, 0.2, 1]
		}
	}
};

interface Props {
	onClick: () => void;
}

const UserDropdown: React.FC<Props> = ({ onClick }) => {
	return (
		<motion.div
			variants={variants}
			initial="initial"
			animate="animate"
			exit="exit"
			className="absolute right-0 translate-y-2 bg-main border border-white-200 p-2 rounded-lg"
		>
			<TransparentButton type="link" href="/settings" extra="h-[10px]" onClick={onClick}>
				<p className="text-base font-normal text-center">Settings</p>
			</TransparentButton>
			<div className="h-[1px] w-full bg-white-200 my-2" />
			<PrimaryButton type="button" extra="py-1 rounded-md">
				<p className="w-full">Logout</p>
			</PrimaryButton>
		</motion.div>
	);
};

export default UserDropdown;
