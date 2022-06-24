import { motion, Variants } from "framer-motion";
import React from "react";
import type { FC } from "../../../lib/types";
import BackDrop from "./BackDrop";

const variants: Variants = {
	hidden: {
		scale: 0.8,
		opacity: 0,
		transition: {
			duration: 0.3,
			ease: [0.4, 0, 0.2, 1]
		}
	},
	visible: {
		scale: 1,
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: [0.4, 0, 0.2, 1]
		}
	},
	exit: {
		scale: 0.8,
		opacity: 0,
		transition: {
			duration: 0.3,
			ease: [0.4, 0, 0.2, 1]
		}
	}
};

interface Props {
	onClick: () => void;
}

const ModalItem: FC<Props> = ({ children, onClick }) => {
	return (
		<BackDrop onClick={onClick}>
			<motion.div onClick={(e) => e.stopPropagation()} className="modal" variants={variants} initial="hidden" animate="visible" exit="exit">
				{children}
			</motion.div>
		</BackDrop>
	);
};

export default ModalItem;
