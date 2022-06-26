import React from "react";
import type { FC } from "../../../../../lib/types";
import Button from "../../../Button";
import Modal from "../../../Modal";
import Form from "./Form";

interface Props {
	onClick: () => void;
	isOpen: boolean;
}

const CreateModal: FC<Props> = (props) => {
	return (
		<Modal {...props}>
			<div className="upload-modal-content">
				<div className="upload-modal-top">
					<h1 className="upload-modal-title">Create a Short URL</h1>
					<Button type="button" style="text" onClick={props.onClick}>
						<i className="fa-solid fa-times" />
					</Button>
				</div>
				<Form />
			</div>
		</Modal>
	);
};

export default CreateModal;
