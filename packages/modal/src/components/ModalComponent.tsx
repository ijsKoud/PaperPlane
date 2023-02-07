import type React from "react";
import Backdrop from "./Backdrop";
import ModalItem from "./ModalItem";

interface Props {
	onClick: () => void;
}

const ModalComponent: React.FC<React.PropsWithChildren<Props>> = ({ onClick, children }) => {
	return (
		<Backdrop onClick={onClick}>
			<ModalItem onClick={onClick}>{children}</ModalItem>
		</Backdrop>
	);
};

export default ModalComponent;
