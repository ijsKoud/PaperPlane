import React, { useEffect } from "react";
import type { FormikProps } from "formik";
import type { FC } from "../../../../lib/types";
import { motion, useAnimation, Variants } from "framer-motion";
import Button from "../../../general/Button";
import { toast } from "react-toastify";
import { fetch } from "../../../../lib/fetch";

interface Props {
	formik: FormikProps<Record<string, boolean>>;
	updateFileList: () => void;
}

const DeleteItemsPopup: FC<Props> = ({ formik, updateFileList }) => {
	const controller = useAnimation();
	const variants: Variants = {
		show: {
			transform: "translateY(0px)",
			opacity: 1,
			transition: {
				duration: 0.5,
				ease: [0.6, 0, 0.17, 1]
			}
		},
		hide: {
			transform: "translateY(10px)",
			opacity: 0,
			transition: {
				duration: 0.5,
				ease: [0.6, 0, 0.17, 1]
			}
		}
	};

	useEffect(() => {
		if (Object.keys(formik.values).length) void controller.start("show");
		else void controller.start("hide");

		return () => controller.stop();
	}, [formik.values]);

	const deleteFiles = async () => {
		const files = Object.keys(formik.values);

		try {
			const deletePromise = fetch("/api/dashboard/files/update", undefined, { method: "DELETE", data: { id: files } });
			await toast.promise(deletePromise, {
				error: "Unable to delete the files, please try again later.",
				success: `Successfully deleted ${files.length} file(s)`,
				pending: `Attempting to delete ${files.length} file(s)`
			});
		} catch (err) {}

		formik.setValues({});
		updateFileList();
	};

	return (
		<motion.div className="dashboard-delete-items" variants={variants} initial="hide" animate={controller}>
			<div>
				<p>
					Delete {Object.keys(formik.values).length} {Object.keys(formik.values).length === 1 ? "item" : "items"}?
				</p>
				<Button type="button" style="danger" onClick={deleteFiles}>
					<i className="fa-solid fa-trash-can" /> Delete
				</Button>
			</div>
		</motion.div>
	);
};

export default DeleteItemsPopup;
