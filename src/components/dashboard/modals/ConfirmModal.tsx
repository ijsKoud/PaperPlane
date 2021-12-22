import React from "react";

interface Props {
	handleCancel: () => void;
	handleAccept: () => void;
}

const ConfirmModal: React.FC<Props> = ({ handleAccept, handleCancel }) => {
	return (
		<div className="edit-wrapper confirmation">
			<i className="fas fa-times" onClick={handleCancel} />
			<h2>Are you sure you want to delete this item?</h2>
			<div className="confirm-buttons">
				<button className="cancel" onClick={handleCancel}>
					<i className="fas fa-times" /> Cancel
				</button>
				<button className="delete" onClick={handleAccept}>
					<i className="fas fa-trash" /> Delete
				</button>
			</div>
		</div>
	);
};

export default ConfirmModal;
