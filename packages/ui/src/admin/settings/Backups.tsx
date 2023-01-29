import { DangerButton } from "@paperplane/buttons";
import type React from "react";

interface Props {}

export const AdminBackups: React.FC<Props> = () => {
	// const [isOpen, setIsOpen] = useState(false);
	// const [page, setPage] = useState(0);
	// const [selected, setSelected] = useState<string[]>([]);
	// const [domains, setDomains] = useState<SignUpDomainGetApi>({ entries: [], pages: 0 });
	// const { data: domainsGetData, mutate } = useSwrWithUpdates<SignUpDomainGetApi>(`/api/admin/domains?page=${page}`, {
	// 	refreshInterval: isOpen ? 5e3 : 0
	// });

	// useEffect(() => {
	// 	if (domainsGetData) setDomains(domainsGetData);
	// }, [domainsGetData]);

	// const createBackup = async () => {
	// await _createBackup();
	// await mutate();
	// };

	// const pageOptions: SelectOption[] = Array(domains.pages)
	// 	.fill(null)
	// 	.map((_, key) => ({ label: `Page ${key + 1}`, value: key.toString() }));
	// const pageValue: SelectOption = { label: `Page ${page + 1}`, value: page.toString() };

	// const previousPage = () => setPage(page - 1);
	// const nextPage = () => setPage(page + 1);
	// const onPageChange = (option: any) => {
	// 	if (typeof option !== "object") return;
	// 	const { value } = option as SelectOption;

	// 	setPage(Number(value));
	// };

	return (
		<>
			<div className="max-w-[50vw] max-xl:max-w-[75vw] max-md:max-w-[100vw] w-full">
				<div className="w-full">
					<h1 className="text-xl">Backups</h1>
					<p className="text-base">
						You can make a backup any time, we currently do not support automatic backups. You can find the backup files in the{" "}
						<strong>/backups</strong> directory on the server. To import a backup, move one to the folder or use an already created
						backup, press the import backup button and select it from the list.
					</p>
				</div>
				<div className="w-full mt-4 flex items-center gap-2">
					<DangerButton type="button">Create Backup</DangerButton>
					<DangerButton type="button">Import Backup</DangerButton>
				</div>
			</div>
		</>
	);
};
