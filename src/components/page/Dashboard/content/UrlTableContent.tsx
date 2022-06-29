import "moment-timezone";
import moment from "moment";
import React, { useState } from "react";
import type { ApiURL, FC } from "../../../../lib/types";
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import Button from "../../../general/Button";
import { fetch } from "../../../../lib/fetch";
import URLEditModal from "../modals/URLEditModal";
import ToolTip from "../../../general/ToolTip";

interface Props {
	url: ApiURL;

	updateURLList: () => void;
	selectUrl: (id: string) => void;
}

const UrlTableContent: FC<Props> = ({ url, updateURLList, selectUrl }) => {
	const [showModal, setShowModal] = useState(false);
	const getDate = (date: Date): string => moment(date).format("DD/MM/YYYY HH:mm:ss");

	const copyUrl = () => {
		copy(url.url);
		toast.info("URL copied to your clipboard");
	};

	const deleteURL = async () => {
		try {
			const deletePromise = fetch("/api/dashboard/urls/update", undefined, { method: "DELETE", data: { id: url.name } });
			await toast.promise(deletePromise, {
				error: "Unable to delete the url, please try again later.",
				success: `Successfully deleted ${url.name}`,
				pending: `Attempting to delete ${url.name}`
			});
		} catch (err) {}

		updateURLList();
	};

	const onClick = () => setShowModal(false);
	const onEditClick = () => setShowModal(true);

	return (
		<>
			<tr>
				<td>{url.name}</td>
				<td>{url.redirect}</td>
				<td>
					<div className="dashboard-table-visibility">
						<ToolTip content={`Visibility: ${url.visible ? "everyone" : "you"}`}>
							<i className={url.visible ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"} />
						</ToolTip>
					</div>
				</td>
				<td>
					{url.visits} {url.visits === 1 ? "visit" : "visits"}
				</td>
				<td>{getDate(url.date)}</td>
				<td className="dashboard-table-buttons">
					<div>
						<URLEditModal {...{ isOpen: showModal, onClick, name: url.name, visible: url.visible, updateURLList }} />
						<Button type="link" url={url.url} style="blurple" newWindow>
							<i className="fa-solid fa-square-arrow-up-right" />
						</Button>
						<Button type="button" onClick={copyUrl} style="success">
							<i className="fa-solid fa-link" />
						</Button>
						<Button type="button" onClick={onEditClick} style="yellow">
							<i className="fa-solid fa-pen-to-square" />
						</Button>
					</div>
				</td>
				<td className="dashboard-table-buttons">
					<div>
						<input type="checkbox" onChange={() => selectUrl(url.name.split(".")[0])} />
						<Button type="button" onClick={deleteURL} style="danger">
							<i className="fa-solid fa-trash-can" />
						</Button>
					</div>
				</td>
			</tr>
		</>
	);
};

export default UrlTableContent;
