import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import ModalComponent from "./ModalComponent";
import ReactDOM from "react-dom";

interface Props {
	onClick: () => void;
	isOpen: boolean;
}

export const Modal: React.FC<React.PropsWithChildren<Props>> = ({ children, onClick, isOpen }) => {
	const [BodyEl, setBodyEl] = useState<HTMLElement>();
	const [nextEl, setNextEl] = useState<HTMLElement>();
	const ChildEl = <AnimatePresence mode="wait">{isOpen && <ModalComponent onClick={onClick}>{children}</ModalComponent>}</AnimatePresence>;

	useEffect(() => {
		const body = document.getElementsByTagName("body");
		setBodyEl(body[0]);

		const next = document.getElementById("__next") ?? undefined;
		setNextEl(next);
	}, []);

	useEffect(() => {
		if (isOpen && nextEl) nextEl.ariaHidden = "true";
		else if (nextEl) nextEl.ariaHidden = "false";
	}, [isOpen]);

	return BodyEl ? ReactDOM.createPortal(ChildEl, BodyEl) : <div></div>;
};
