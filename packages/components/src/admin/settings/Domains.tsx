import { DangerButton, PrimaryButton, TransparentButton } from "@paperplane/buttons";
import { Input, SelectMenu, type SelectOption } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import { useSwrWithUpdates } from "@paperplane/swr";
import { formatDate, type SignUpDomainGetApi } from "@paperplane/utils";
import { Form, Formik } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { object, string } from "yup";
import { Table, TableEntry } from "../../index";

interface Props {
	createDomain: (...props: any) => Promise<void>;
	deleteDomain: (domains: string[]) => Promise<void>;
	toastSuccess: (str: string) => void;
}

export const AdminDomains: React.FC<Props> = ({ createDomain: _createDomain, deleteDomain, toastSuccess }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [page, setPage] = useState(0);
	const [selected, setSelected] = useState<string[]>([]);
	const [domains, setDomains] = useState<SignUpDomainGetApi>({ entries: [], pages: 0 });
	const { data: domainsGetData, mutate } = useSwrWithUpdates<SignUpDomainGetApi>(`/api/admin/domains?page=${page}`, {
		refreshInterval: isOpen ? 5e3 : 0
	});

	useEffect(() => {
		if (domainsGetData) setDomains(domainsGetData);
	}, [domainsGetData]);

	const schema = object({
		domain: string()
			.required("Domain is a required option")
			.test({
				test: (str) => {
					if (!str) return false;
					if (str.startsWith(".") || str.endsWith(".") || str.startsWith("-")) return false;

					return true;
				},
				name: "Basic Domain test",
				message: "Invalid domain provided"
			})
	});

	const copyClipboard = (str: string) => {
		navigator.clipboard.writeText(str);
		toastSuccess("Copied to clipboard!");
	};

	const onSelectClick = (domain: string) => {
		if (selected.includes(domain)) setSelected(selected.filter((inv) => inv !== domain));
		else setSelected([domain, ...selected]);
	};

	const onSingleDelete = async (invite: string) => {
		await deleteDomain([invite]);
		await mutate();
	};

	const onBulkDelete = async () => {
		await deleteDomain(selected);
		await mutate();
	};

	const createDomain = async (...props: any) => {
		await _createDomain(...props);
		await mutate();
	};

	const pageOptions: SelectOption[] = Array(domains.pages)
		.fill(null)
		.map((_, key) => ({ label: `Page ${key + 1}`, value: key.toString() }));
	const pageValue: SelectOption = { label: `Page ${page + 1}`, value: page.toString() };

	const previousPage = () => setPage(page - 1);
	const nextPage = () => setPage(page + 1);
	const onPageChange = (option: any) => {
		if (typeof option !== "object") return;
		const { value } = option as SelectOption;

		setPage(Number(value));
	};

	return (
		<>
			<Modal isOpen={isOpen} onClick={() => setIsOpen(false)}>
				<div className="w-[60vw] max-xl:w-[80vw]">
					<div className="flex items-center justify-between max-sm:flex-col">
						<h1 className="text-3xl">SignUp Domains</h1>
						<div className="flex gap-4">
							<TransparentButton type="button" onClick={previousPage} disabled={page <= 0}>
								<i className="fa-solid fa-angle-left text-lg" />
							</TransparentButton>
							<SelectMenu type="main" placeholder="page" options={pageOptions} value={pageValue} onChange={onPageChange} />
							<TransparentButton type="button" onClick={nextPage} disabled={page >= domains.pages - 1}>
								<i className="fa-solid fa-angle-right text-lg" />
							</TransparentButton>
						</div>
					</div>
					<div className="max-h-[45vh] overflow-auto w-full">
						<Table className="w-full" colgroups={[325, 300, 100]} headPosition="left" heads={["Domain", "Date", "Options"]}>
							{domains.entries.map((domain) => (
								<TableEntry key={domain.domain}>
									<td>
										<p title={domain.domain} className="max-w-[300px] overflow-hidden whitespace-nowrap text-ellipsis text-base">
											{domain.domain}
										</p>
									</td>
									<td>{formatDate(domain.date)}</td>
									<td className="flex items-center gap-2">
										<TransparentButton type="button" onClick={() => copyClipboard(domain.domain)}>
											<i className="fa-solid fa-copy text-base" />
										</TransparentButton>
										<TransparentButton type="button" onClick={() => void onSingleDelete(domain.domain)}>
											<i className="fa-solid fa-trash-can text-base" />
										</TransparentButton>
										<input
											type="checkbox"
											checked={selected.includes(domain.domain)}
											onChange={() => onSelectClick(domain.domain)}
										/>
									</td>
								</TableEntry>
							))}
						</Table>
					</div>
					<div className="mt-4 flex gap-2 justify-center flex-col">
						<Formik initialValues={{ domain: "" }} validationSchema={schema} onSubmit={createDomain}>
							{(formik) => (
								<Form className="flex items-center justify-between w-full max-lg:flex-col">
									<div className="w-3/4 max-lg:w-full">
										<Input
											className="h-[45px] w-full"
											type="primary"
											placeholder="Example: *.ijskoud.dev,cdn.ijskoud.dev"
											value={formik.values.domain}
											onChange={(ctx) => formik.setFieldValue("domain", ctx.currentTarget.value)}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.domain && `* ${formik.errors.domain}`}&#8203;
										</p>
									</div>
									<div className="w-fit max-lg:w-full">
										<PrimaryButton
											type="button"
											className="max-lg:w-full"
											disabled={formik.isSubmitting || !formik.isValid}
											onClick={formik.submitForm}
										>
											{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Create new domain</>}
										</PrimaryButton>
										<p className="text-red text-left text-small font-normal">&#8203;</p>
									</div>
								</Form>
							)}
						</Formik>

						<DangerButton type="button" onClick={onBulkDelete}>
							Delete Selected Domains
						</DangerButton>
					</div>
				</div>
			</Modal>
			<div className="max-w-[50vw] max-xl:max-w-[75vw] max-md:max-w-[100vw] w-full">
				<div className="w-full">
					<h1 className="text-xl">Available Domains</h1>
					<p className="text-base">
						To make sign ups/account creation possible, a domain (or multiple) have to be assigned to PaperPlane. You can assign a single
						domain, domain with subdomain or multiple of each.
					</p>
				</div>
				<div className="w-full mt-4">
					<PrimaryButton type="button" onClick={() => setIsOpen(true)}>
						Open available domains list
					</PrimaryButton>
				</div>
			</div>
		</>
	);
};
