import type { FC } from "../../../lib/types";

interface Props {
	onClick: () => void;
	isOpen: boolean;
}

const MenuButton: FC<Props> = ({ onClick, isOpen }) => {
	return (
		<button className={`navbar-menu-button ${isOpen ? "enabled" : ""}`} onClick={onClick}>
			<div className="navbar-menu-button-bar"></div>
			<div className="navbar-menu-button-bar"></div>
			<div className="navbar-menu-button-bar"> </div>
		</button>
	);
};

export default MenuButton;
