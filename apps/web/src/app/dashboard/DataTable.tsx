"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Input } from "@paperplane/ui/input";
import { Button } from "@paperplane/ui/button";
import { ArrowBigLeftIcon, ArrowBigRightIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@paperplane/ui/table";
import { formatDate } from "@paperplane/utils";
import { PaperPlaneApiOutputs } from "#trpc/server";

type AuditLogEntry = PaperPlaneApiOutputs["v1"]["dashboard"]["audit"]["entries"][0];

interface ToolbarProps {
	pages: number;
	page: number;

	setPage: (page: number) => void;
	setSearch: (search: string) => void;
}

export const AuditlogToolbar: React.FC<ToolbarProps> = ({ page, pages, setPage, setSearch }) => {
	const pageOptions = Array(pages)
		.fill(null)
		.map((_, key) => ({ label: `Page ${key + 1}`, value: key.toString() }));

	const previousPage = () => setPage(page - 1);
	const nextPage = () => setPage(page + 1);
	const onPageChange = (value: string) => {
		setPage(Number(value));
	};

	const [_search, _setSearch] = useState("");
	const [timeout, setTimeoutFn] = useState<NodeJS.Timeout>();
	useEffect(() => {
		const newTimeout = setTimeout(() => {
			setSearch(_search);
			setTimeoutFn(undefined);
		}, 1e3);

		clearTimeout(timeout);
		setTimeoutFn(newTimeout);

		return () => clearTimeout(timeout);
	}, [_search]);

	return (
		<div className="w-full flex justify-between items-center mt-2 max-sm:flex-col gap-y-4">
			<Input placeholder="Search for a specific event" className="w-fit" onChange={(ctx) => _setSearch(ctx.currentTarget.value)} />
			<div className="flex gap-4">
				<Button variant="ghost" onClick={previousPage} disabled={page <= 0}>
					<ArrowBigLeftIcon />
				</Button>

				<Select value={page.toString()} onValueChange={onPageChange}>
					<SelectTrigger className="w-32">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{pageOptions.map((opt, key) => (
							<SelectItem key={key} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button variant="ghost" onClick={nextPage} disabled={page >= pages - 1}>
					<ArrowBigRightIcon />
				</Button>
			</div>
		</div>
	);
};

export interface AuditLogEntryProps {
	/** The auditlog log entries */
	logs: AuditLogEntry[];
}

export const AuditlogTable: React.FC<AuditLogEntryProps> = ({ logs }) => {
	return (
		<Table className="min-w-[750px]">
			<TableHeader>
				<TableRow className="hover:bg-zinc-200 dark:border-zinc-800">
					<TableHead className="w-48">Action</TableHead>
					<TableHead>Description</TableHead>
					<TableHead className="w-48">Date</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{logs.map((log, key) => (
					<TableRow key={key} className="hover:bg-zinc-200 dark:border-zinc-800">
						<TableCell className="font-medium">{log.type}</TableCell>
						<TableCell>{log.details}</TableCell>
						<TableCell>{formatDate(log.date)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
