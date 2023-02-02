import type { NextPage } from "next";
import { DashboardDeleteBanner, DashboardLayout, FilesDashboardToolbar, FilesGrid, FilesTable } from "@paperplane/ui";
import { TertiaryButton } from "@paperplane/buttons";
import { useSwrWithUpdates } from "@paperplane/swr";
import { useEffect, useState } from "react";
import { FilesApiRes, FilesSort } from "@paperplane/utils";
import { toast } from "react-toastify";
import { NextSeo } from "next-seo";
import type { AxiosError } from "axios";
import axios from "axios";

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

	const ViewComponent = () =>
		view === "grid" ? (
			<FilesGrid onSelect={onSelect} selected={selected} files={data.entries} deleteFile={deleteFile} />
		) : (
			<FilesTable onSelect={onSelect} selected={selected} files={data.entries} deleteFile={deleteFile} />
		);

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
			<div className="w-full flex justify-between items-center">
				<h1 className="text-4xl">Files</h1>
				<TertiaryButton type="button">Upload</TertiaryButton>
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
			<ViewComponent />
			<DashboardDeleteBanner items={selected} type="file" cancel={cancel} success={success} />
		</DashboardLayout>
	);
};

export default FilesDashboard;
