import { ApiFile } from "@paperplane/utils";
import React, { useState } from "react";
import GridCard from "./GridCard";
import { Button } from "@paperplane/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { Trash2Icon } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { ToastAction } from "@paperplane/ui/toast";

export interface GridViewProps {
	files: ApiFile[];
	page: number;
	pages: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const GridView: React.FC<GridViewProps> = ({ files, page, pages, setPage }) => {
	const [selected, setSelected] = useState<string[]>([]);
	const { toast } = useToast();
	const toggleSelected = (name: string) => {
		if (selected.includes(name)) setSelected(selected.filter((filename) => filename !== name));
		else setSelected([...selected, name]);
	};

	async function deleteFiles() {
		try {
			await axios.delete("/api/dashboard/files/bulk", { data: { files: selected } });
			toast({ title: "Files Deleted", description: `${selected.length} files have been deleted.` });
			setSelected([]);
		} catch (err) {
			const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
			const error = _error || "n/a";

			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong",
				description: `There was a problem with your request: ${error}`,
				action: (
					<ToastAction altText="Try again" onClick={deleteFiles}>
						Try again
					</ToastAction>
				)
			});
		}
	}

	const nextPage = () => {
		if (page + 1 >= pages) return;
		setPage(page + 1);
	};

	const previousPage = () => {
		if (page <= 0) return;
		setPage(page - 1);
	};

	return (
		<div className="w-full">
			<div className="w-full flex flex-wrap gap-4 items-center justify-center">
				{files.map((file, key) => (
					<GridCard key={key} file={file} selected={selected.includes(file.name)} toggleSelected={() => toggleSelected(file.name)} />
				))}
			</div>

			<div className="flex items-center justify-between w-full max-sm:flex-col">
				<Button className="mt-2" variant="destructive" onClick={deleteFiles} disabled={selected.length <= 0}>
					<Trash2Icon className="mr-2 w-4 h-4" /> Delete {selected.length} files
				</Button>

				<div className="flex items-center mt-2 gap-2 w-fit">
					<Button variant="outline" onClick={previousPage} disabled={page <= 0}>
						Previous
					</Button>

					<Select value={(page + 1).toString()} onValueChange={(value) => setPage(Number(value))}>
						<SelectTrigger className="min-w-[96px]">
							<SelectValue placeholder="Select a page" />
						</SelectTrigger>
						<SelectContent>
							{Array(pages)
								.fill(null)
								.map((_, page) => (
									<SelectItem key={page} value={(page + 1).toString()}>
										Page {page + 1}
									</SelectItem>
								))}
						</SelectContent>
					</Select>

					<Button variant="outline" onClick={nextPage} disabled={page + 1 >= pages}>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};
