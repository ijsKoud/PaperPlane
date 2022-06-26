import React from "react";
import type { FC } from "../../../lib/types";
import Button from "../Button";

const Navbar: FC = () => {
	return (
		<div className="navbar-container-wrapper">
			<div className="navbar-container">
				<div className="navbar-content">
					<img alt="paperplane logo" src="assets/svg/paperplane_nobg.svg" />
					<Button type="link" style="text" url="/dasboard" text="Dashboard" />
					<Button type="link" style="text" url="/settings" text="Settings" />
				</div>
			</div>
		</div>
	);
};

export default Navbar;
