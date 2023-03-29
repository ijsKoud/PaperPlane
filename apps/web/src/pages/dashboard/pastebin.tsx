import type { GetServerSideProps, NextPage } from "next";
import {
	CreatePastebinModal,
	DashboardDeleteBanner,
	DashboardLayout,
	FilesDashboardToolbar,
	FilesGrid,
	FilesTable,
	PastebinDashboardToolbar,
	PastebinsTable,
	UploadModal
} from "@paperplane/ui";
import { TertiaryButton } from "@paperplane/buttons";
import { useSwrWithUpdates } from "@paperplane/swr";
import { useEffect, useState } from "react";
import { BinApiRes, BinSort, getProtocol } from "@paperplane/utils";
import { toast } from "react-toastify";
import { NextSeo } from "next-seo";
import type { AxiosError } from "axios";
import axios from "axios";
import type { FormikHelpers } from "formik";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const stateRes = await axios.get<{ admin: boolean; domain: boolean }>(`${getProtocol()}${context.req.headers.host}/api/auth/state`, {
		headers: { "X-PAPERPLANE-AUTH-KEY": context.req.cookies["PAPERPLANE-AUTH"] }
	});

	if (!stateRes.data.domain)
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};

	return {
		props: {}
	};
};

interface BinCreateValues {
	name: string;
	visible: boolean;
	highlight: string;
	data: string;
}

const PastebinDashboard: NextPage = () => {
	const [data, setData] = useState<BinApiRes>({ entries: [], pages: 0 });
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<BinSort>(BinSort.DATE_NEW_OLD);

	const [selected, setSelected] = useState<string[]>([]);
	const onSelect = (binId: string) => {
		if (selected.includes(binId)) setSelected(selected.filter((str) => str !== binId));
		else setSelected([...selected, binId]);
	};

	const [createModal, setCreateModal] = useState(false);
	const openCreateModal = () => setCreateModal(true);
	const closeCreateModal = () => setCreateModal(false);

	const swr = useSwrWithUpdates<BinApiRes>(`/api/dashboard/paste-bins?page=${page}&search=${encodeURIComponent(search)}&sort=${sort}`);
	useEffect(() => {
		if (swr.data) setData(swr.data);
	}, [swr.data]);

	const cancel = () => setSelected([]);
	const success = async () => {
		const promise = async () => {
			try {
				await axios.delete("/api/dashboard/paste-bins/bulk", { data: { bins: selected } });
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Burning old papers...",
				error: "The build caught fire!! :(",
				success: "Papers burned."
			});

			setSelected([]);
			await swr.mutate();
		} catch (error) {}
	};

	const deleteBin = async (id: string) => {
		const promise = async () => {
			try {
				await axios.delete("/api/dashboard/paste-bins/bulk", { data: { bins: [id] } });
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Burning old papers...",
				error: "The build caught fire!! :(",
				success: "Papers burned."
			});

			await swr.mutate();
		} catch (error) {}
	};

	const updateBin = async (id: string, values: BinCreateValues, helpers: FormikHelpers<BinCreateValues>) => {
		const promise = async () => {
			try {
				await axios.put(`/api/dashboard/paste-bins/${id}`, values);
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
				pending: "Writing new report...",
				error: "Out of ink. :(",
				success: "Report written and sent to HQ."
			});

			await swr.mutate();
			return true;
		} catch (error) {}

		return false;
	};

	const createBin = async (values: BinCreateValues, helpers: FormikHelpers<BinCreateValues>) => {
		const promise = async () => {
			try {
				await axios.post("/api/dashboard/paste-bins/create", values, { withCredentials: true });
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
				pending: "Writing new report...",
				error: "Out of ink. :(",
				success: "Report written and sent to HQ."
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
			<CreatePastebinModal isOpen={createModal} onClick={closeCreateModal} createBin={createBin} />
			<NextSeo title="Pastebin Dashboard" />
			<div className="w-full flex justify-between items-center">
				<h1 className="text-4xl">Paste bin</h1>
				<TertiaryButton type="button" onClick={openCreateModal}>
					Create
				</TertiaryButton>
			</div>
			<PastebinDashboardToolbar
				sort={sort}
				setSort={setSort}
				pages={swr.data?.pages ?? 0}
				page={page}
				setPage={setPage}
				setSearch={setSearch}
			/>
			<PastebinsTable
				onSelect={onSelect}
				selected={selected}
				bins={data.entries}
				deleteBin={deleteBin}
				updateBin={updateBin}
				toastSuccess={toast.success}
			/>
		</DashboardLayout>
	);
};

export default PastebinDashboard;
