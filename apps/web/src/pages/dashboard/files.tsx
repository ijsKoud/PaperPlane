import type { NextPage } from "next";
import { DashboardDeleteBanner, DashboardLayout, FilesDashboardToolbar, FilesGrid, FilesTable, UploadModal } from "@paperplane/ui";
import { TertiaryButton } from "@paperplane/buttons";
import { useSwrWithUpdates } from "@paperplane/swr";
import { useEffect, useState } from "react";
import { FilesApiRes, FilesSort } from "@paperplane/utils";
import { toast } from "react-toastify";
import { NextSeo } from "next-seo";
import type { AxiosError } from "axios";
import axios from "axios";
import type { FormikHelpers } from "formik";

interface FileEditValues {
	name: string;
	passwordEnabled: boolean;
	password: string;
	visible: boolean;
}

const FilesDashboard: NextPage = () => {
	const [data, setData] = useState<FilesApiRes>({ entries: [], pages: 0 });
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");
	const [view, setView] = useState<"grid" | "list">("grid");
	const [sort, setSort] = useState<FilesSort>(FilesSort.DATE_NEW_OLD);

	const [selected, setSelected] = useState<string[]>([]);
	const onSelect = (fileName: string) => {
		if (selected.includes(fileName)) setSelected(selected.filter((str) => str !== fileName));
		else setSelected([...selected, fileName]);
	};

	const [fileUploadModal, setFileUploadModal] = useState(false);
	const openFileUploadModal = () => setFileUploadModal(true);
	const closeFileUploadModal = () => setFileUploadModal(false);

	const swr = useSwrWithUpdates<FilesApiRes>(`/api/dashboard/files?page=${page}&search=${encodeURIComponent(search)}&sort=${sort}`);
	useEffect(() => {
		if (swr.data) setData(swr.data);
	}, [swr.data]);

	const cancel = () => setSelected([]);
	const success = async () => {
		const promise = async () => {
			try {
				await axios.delete("/api/dashboard/files/bulk", { data: { files: selected } });
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Removing passengers from the PaperPlane...",
				error: "Unable to remove the passengers :(",
				success: "Passengers removed from the plane!"
			});

			setSelected([]);
			await swr.mutate();
		} catch (error) {}
	};

	const deleteFile = async (id: string) => {
		const promise = async () => {
			try {
				await axios.delete("/api/dashboard/files/bulk", { data: { files: [id] } });
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Removing passengers from the PaperPlane...",
				error: "Unable to remove the passengers :(",
				success: "Passengers removed from the plane!"
			});

			await swr.mutate();
		} catch (error) {}
	};

	const updateFile = async (id: string, values: FileEditValues, helpers: FormikHelpers<FileEditValues>) => {
		const promise = async () => {
			try {
				await axios.post(`/api/dashboard/files/${id}`, values);
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				helpers.resetForm({
					values,
					errors: Object.keys(values)
						.map((key) => ({ [key]: error }))
						.reduce((a, b) => ({ ...a, ...b }), {})
				});

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Changing a passengers seat...",
				error: "Unable to change the seat :(",
				success: "Seating changed."
			});

			await swr.mutate();
			return true;
		} catch (error) {}

		return false;
	};

	if (swr.error && !swr.data) {
		console.log(swr.error);

		return (
			<DashboardLayout toastInfo={(str) => toast.info(str)}>
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-4xl text-center">An unexpected error occurred</h1>
					<p className="text-base text-center mt-4">Please try again later, if the issue persists contact a developer through Discord!</p>
					<p>(Press the HELP button for more information)</p>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout toastInfo={(str) => toast.info(str)} className="max-w-[1008px]">
			<NextSeo title="Files Dashboard" />
			<UploadModal isOpen={fileUploadModal} onClick={closeFileUploadModal} toastError={toast.error} />
			<div className="w-full flex justify-between items-center">
				<h1 className="text-4xl">Files</h1>
				<TertiaryButton type="button" onClick={openFileUploadModal}>
					Upload
				</TertiaryButton>
			</div>
			<FilesDashboardToolbar
				sort={sort}
				setSort={setSort}
				pages={swr.data?.pages ?? 0}
				page={page}
				setPage={setPage}
				setSearch={setSearch}
				view={view}
				setView={setView}
			/>
			{view === "grid" ? (
				<FilesGrid onSelect={onSelect} selected={selected} files={data.entries} deleteFile={deleteFile} updateFile={updateFile} />
			) : (
				<FilesTable onSelect={onSelect} selected={selected} files={data.entries} deleteFile={deleteFile} />
			)}
			<DashboardDeleteBanner items={selected} type="file" cancel={cancel} success={success} />
		</DashboardLayout>
	);
};

export default FilesDashboard;
