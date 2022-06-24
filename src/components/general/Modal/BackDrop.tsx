import { motion, Variants } from "framer-motion";
import React from "react";
import type { FC } from "../../../lib/types";

const variants: Variants = {
	hidden: {
		opacity: 0,
		transition: {
			duration: 0.3,
			ease: [0.4, 0, 0.2, 1]
		}
	},
	visible: {
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: [0.4, 0, 0.2, 1]
		}
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.3,
			ease: [0.4, 0, 0.2, 1]
		}
	}
};

const BackDrop: FC<{ onClick: () => void }> = ({ onClick, children }) => {
	return (
		<motion.div className="modal-backdrop" onClick={onClick} initial="hidden" animate="visible" exit="exit" variants={variants}>
			{children}
		</motion.div>
	);
};

export default BackDrop;
