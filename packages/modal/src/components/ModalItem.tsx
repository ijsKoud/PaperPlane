import type React from "react";
import { motion, Variants } from "framer-motion";

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

const ModalItem: React.FC<React.PropsWithChildren<Props>> = ({ children, onClick }) => {
	return (
		<motion.div
			aria-modal
			onClick={(e) => e.stopPropagation()}
			className="relative bg-bg-dark border-white-200 rounded-xl border px-4 py-2 mx-4 my-4 max-h-[calc(100vh_-_2rem)] overflow-hidden"
			variants={variants}
			initial="hidden"
			animate="visible"
			exit="exit"
		>
			<main className="px-4 py-2">{children}</main>
			<button onClick={onClick} className="absolute right-0 top-0 text-center text-base hover:text-white-600 transition-colors px-2 py-1">
				<i className="fa-solid fa-times" />
			</button>
		</motion.div>
	);
};

export default ModalItem;
