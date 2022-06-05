import { AnimatePresence } from "framer-motion";
import React from "react";
import type { FC } from "../../../lib";
import ModalItem from "./ModalItem";

interface Props {
	onClick: () => void;
	isOpen: boolean;
}

const Modal: FC<Props> = ({ children, onClick, isOpen }) => {
	return <AnimatePresence exitBeforeEnter>{isOpen && <ModalItem onClick={onClick}>{children}</ModalItem>}</AnimatePresence>;
};

export default Modal;
