import React, { useState } from "react";
import { fetch } from "../../../lib/fetch";
import { useAuth } from "../../../lib/hooks/useAuth";
import PulseLoader from "../../general/PulseLoader";

interface Props {
	handleClose: () => void;
}

const GenerateTokenModal: React.FC<Props> = ({ handleClose }) => {
	const [loading, setLoading] = useState(false);
	const { fetch: userFetch } = useAuth();

	const handleAccept = async () => {
		setLoading(true);
		await fetch("/api/user/token", undefined, { method: "POST" });
		userFetch();

		setLoading(false);
		handleClose();
	};

	return (
		<div className="edit-wrapper confirmation">
			{loading ? (
				<PulseLoader />
			) : (
				<>
					<i className="fas fa-times" onClick={handleClose} />
					<h2>Are you sure you want to regenerate your token?</h2>
					<div className="confirm-buttons">
						<button className="cancel" onClick={handleClose}>
							<i className="fas fa-times" /> Cancel
						</button>
						<button className="delete" onClick={handleAccept}>
							<i className="fas fa-check" /> Regenerate
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default GenerateTokenModal;
