import React, { useEffect, useState } from "react";
import { fetch, getCancelToken, Stats } from "../../lib";
import { motion, useAnimation, Variants } from "framer-motion";
import { defaultVariant } from "../../lib/clientConstants";

const carrotButtonVariants: Variants = {
	init: {
		transform: "rotate(0deg)",
		...defaultVariant
	},
	animation: {
		transform: "rotate(90deg)",
		...defaultVariant
	}
};

const tableVariants: Variants = {
	init: {
		height: 0,
		...defaultVariant
	},
	animation: {
		height: 175,
		...defaultVariant
	}
};

const Statistics: React.FC = () => {
	const [stats, setStats] = useState<Stats>({ files: { size: 0, bytes: "0 kB" }, links: 0 });
	const [open, setOpen] = useState(true);
	const controller = useAnimation();

	const toggleOpen = () => {
		const _open = !open;
		setOpen(_open);

		controller.stop();
		if (_open) void controller.start("animation");
		else void controller.start("init");
	};

	useEffect(() => {
		const { cancel, token } = getCancelToken();
		fetch<Stats>("/api/stats", token)
			.then((res) => setStats(res.data))
			.catch(() => void 0);

		return () => cancel();
	}, []);

	return (
		<div className="dashboard-stats">
			<div className="dashboard-table-title">
				<motion.button onClick={toggleOpen} variants={carrotButtonVariants} initial="init" animate={controller}>
					<i className="fas fa-chevron-right" />
				</motion.button>
				<h1>Files</h1>
			</div>
			<motion.div
				className="dashboard__stats-items"
				style={{ overflow: "hidden" }}
				variants={tableVariants}
				initial="init"
				animate={controller}
			>
				<div className="dashboard__stats-item">
					<h2>Files</h2>
					<p>{stats.files.size}</p>
				</div>
				<div className="dashboard__stats-item">
					<h2>Links</h2>
					<p>{stats.links}</p>
				</div>
				<div className="dashboard__stats-item">
					<h2>Total Size</h2>
					<p>{stats.files.bytes}</p>
				</div>
			</motion.div>
		</div>
	);
};

export default Statistics;
