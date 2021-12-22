import { motion } from "framer-motion";
import React from "react";
import BackDrop from "./Backdrop";

const variants = {
	hidden: {
		y: "-100vh",
		opacity: 0
	},
	visible: {
		y: "0",
		opacity: 1,
		transition: {
			duration: 0.1,
			type: "spring",
			damping: 25,
			stiffness: 500
		}
	},
	exit: {
		y: "100vh",
		opacity: 0
	}
};

interface Props {
	onClick: () => void;
}

const ModalItem: React.FC<Props> = ({ children, onClick }) => {
	return (
		<BackDrop onClick={onClick}>
			<motion.div onClick={(e) => e.stopPropagation()} className="modal" variants={variants} initial="hidden" animate="visible" exit="exit">
				{children}
			</motion.div>
		</BackDrop>
	);
};

export default ModalItem;
