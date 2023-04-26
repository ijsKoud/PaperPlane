import type React from "react";
import { motion, type Variants } from "framer-motion";

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

interface Props {
	onClick: () => void;
}

const Backdrop: React.FC<React.PropsWithChildren<Props>> = ({ children, onClick }) => {
	return (
		<motion.div
			onClick={onClick}
			initial="hidden"
			animate="visible"
			exit="exit"
			variants={variants}
			className="fixed z-[200] w-screen h-screen left-0 top-0 bg-black-700 backdrop-blur-md grid place-items-center"
		>
			{children}
		</motion.div>
	);
};

export default Backdrop;
