import { useAnimation, motion, Variants } from "framer-motion";
import React, { useState } from "react";
import type { FC } from "../../../../lib/types";

interface Props {
	title: string;
}

const carrotButtonVariants: Variants = {
	init: {
		transform: "rotate(0deg)",
		transition: {
			duration: 0.5,
			ease: [0.25, 0.1, 0.25, 1]
		}
	},
	animation: {
		transform: "rotate(90deg)",
		transition: {
			duration: 0.5,
			ease: [0.25, 0.1, 0.25, 1]
		}
	}
};

const tableVariants: Variants = {
	init: {
		maxHeight: 0,
		transition: {
			duration: 0.8,
			ease: [0.25, 0.1, 0.25, 1]
		}
	},
	animation: {
		maxHeight: 50e2,
		transition: {
			duration: 0.8,
			ease: [0.25, 0.1, 0.25, 1]
		}
	}
};

const CollapseTable: FC<Props> = ({ title, children }) => {
	const [open, setOpen] = useState(true);
	const controller = useAnimation();

	const toggleOpen = () => {
		const _open = !open;
		setOpen(_open);

		controller.stop();
		if (_open) void controller.start("animation");
		else void controller.start("init");
	};

	return (
		<div className="dashboard-list">
			<div className="dashboard-table-title">
				<motion.button
					className="button button-text"
					onClick={toggleOpen}
					variants={carrotButtonVariants}
					initial="animation"
					animate={controller}
				>
					<i className="fa fa-chevron-right" />
				</motion.button>
				<h1>{title}</h1>
			</div>
			<motion.div variants={tableVariants} initial="animation" animate={controller}>
				{children}
			</motion.div>
		</div>
	);
};

export default CollapseTable;
