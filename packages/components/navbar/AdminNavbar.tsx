"use client";

import { LogoText } from "@paperplane/logo";
import {
	User2Icon,
	SettingsIcon,
	KeyboardIcon,
	GithubIcon,
	FileQuestionIcon,
	TextIcon,
	BookMarkedIcon,
	LogOutIcon,
	MessageCircleIcon,
	SunIcon,
	MoonIcon,
	SidebarIcon,
	LayoutDashboardIcon
} from "lucide-react";
import { Avatar, AvatarFallback } from "@paperplane/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent
} from "@paperplane/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@paperplane/ui/sheet";
import React from "react";
import Link from "next/link";
import { Button } from "@paperplane/ui/button";
import { useTheme } from "next-themes";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { UseChangelog } from "../Context/ChangelogProvider";

export const AdminNavbar: React.FC = () => {
	const { setTheme } = useTheme();
	const changelog = UseChangelog();
	const router = useRouter();

	/**
	 * handles the logout button click event
	 */
	const handleLogout = () => {
		deleteCookie("PAPERPLANE-ADMIN");
		router.push("/login");
	};

	/**
	 * handles the quick search button click event
	 */
	const handleQuickSearch = () => {
		void 0;
	};

	/**
	 * handles the changelog button click event
	 */
	const handleChangelog = () => {
		changelog.setState(true);
	};

	return (
		<header className="top-0 sticky border-b dark:border-zinc-600 border-zinc-200 py-2 dark:bg-bg-dark bg-white z-10">
			<div className="flex justify-between w-full container">
				<LogoText height={24} width={24} textClassName="text-6 ml-1" className="max-sm:hidden" />
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="ghost" className="sm:hidden">
							<SidebarIcon />
						</Button>
					</SheetTrigger>
					<SheetContent side="left">
						<SheetHeader>
							<SheetTitle>
								<LogoText height={24} width={24} textClassName="text-6 ml-1" />
							</SheetTitle>
						</SheetHeader>
						<div className="flex flex-col space-y-3 ml-8">
							<SheetClose asChild>
								<Link className="text-5 font-normal" href="/admin">
									Home
								</Link>
							</SheetClose>
							<SheetClose asChild>
								<Link className="text-5 font-normal" href="/admin/users">
									Users
								</Link>
							</SheetClose>
							<SheetClose asChild>
								<Link className="text-5 font-normal" href="/admin/settings">
									Settings
								</Link>
							</SheetClose>
						</div>
					</SheetContent>
				</Sheet>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 max-sm:hidden">
						<Button asChild variant="link">
							<Link href="/admin">Home</Link>
						</Button>
						<Button asChild variant="link">
							<Link href="/admin/users">Users</Link>
						</Button>
						<Button asChild variant="link">
							<Link href="/admin/settings">Settings</Link>
						</Button>
					</div>

					<DropdownMenu dir="ltr">
						<DropdownMenuTrigger>
							<Avatar>
								<AvatarFallback>
									<User2Icon />
								</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>

						<DropdownMenuContent className="dark:bg-zinc-800 dark:border-zinc-600">
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator className="dark:bg-zinc-600" />

							<DropdownMenuItem className="dark:focus:bg-zinc-700" asChild>
								<Link href="/admin/settings">
									<SettingsIcon className="mr-2 h-4 w-4" /> Settings
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem className="dark:focus:bg-zinc-700 flex items-center justify-between w-48" onClick={handleQuickSearch}>
								<p className="flex items-center">
									<KeyboardIcon className="mr-2 h-4 w-4" />
									Quick Search
								</p>
								<p className="flex items-center dark:text-zinc-400">⌘K</p>
							</DropdownMenuItem>
							<DropdownMenuSeparator className="dark:bg-zinc-600" />

							<DropdownMenuItem className="dark:focus:bg-zinc-700" asChild>
								<Link href="/dashboard">
									<LayoutDashboardIcon className="mr-2 h-4 w-4" />
									Dashboard
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem className="dark:focus:bg-zinc-700" asChild>
								<Link href="https://github.com/ijsKoud/paperplane">
									<GithubIcon className="mr-2 h-4 w-4" />
									GitHub
								</Link>
							</DropdownMenuItem>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger className="dark:focus:bg-zinc-700 dark:data-[state=open]:bg-zinc-700">
									<FileQuestionIcon className="mr-2 h-4 w-4" />
									Support
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="dark:bg-zinc-800 dark:border-zinc-600">
									<DropdownMenuItem className="dark:focus:bg-zinc-700" onClick={handleChangelog}>
										<TextIcon className="mr-2 h-4 w-4" />
										Changelog
									</DropdownMenuItem>
									<DropdownMenuItem className="dark:focus:bg-zinc-700" asChild>
										<Link href="https://paperplane.ijskoud.dev/">
											<BookMarkedIcon className="mr-2 h-4 w-4" />
											Documentation
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem className="dark:focus:bg-zinc-700" asChild>
										<Link href="https://ijskoud.dev/discord">
											<MessageCircleIcon className="mr-2 h-4 w-4" />
											Discord
										</Link>
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSeparator className="dark:bg-zinc-600" />
							<DropdownMenuSub>
								<DropdownMenuSubTrigger className="dark:focus:bg-zinc-700 dark:data-[state=open]:bg-zinc-700">
									<SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
									<MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2" />
									Theme
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="dark:bg-zinc-800 dark:border-zinc-600">
									<DropdownMenuItem className="dark:focus:bg-zinc-700" onClick={() => setTheme("light")}>
										Light
									</DropdownMenuItem>
									<DropdownMenuItem className="dark:focus:bg-zinc-700" onClick={() => setTheme("dark")}>
										Dark
									</DropdownMenuItem>
									<DropdownMenuItem className="dark:focus:bg-zinc-700" onClick={() => setTheme("system")}>
										System
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
							<DropdownMenuItem className="dark:focus:bg-zinc-700" onClick={handleLogout}>
								<LogOutIcon className="mr-2 h-4 w-4" />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
};
