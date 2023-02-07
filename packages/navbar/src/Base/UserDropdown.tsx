import type React from "react";
import { motion, Variants } from "framer-motion";
import { PrimaryButton, TransparentButton } from "@paperplane/buttons";
import { useRouter } from "next/router";
import { deleteCookie } from "cookies-next";

const variants: Variants = {
	initial: {
		opacity: 0,
		transition: {
			duration: 0.15,
			ease: [0.4, 0, 0.2, 1]
		}
	},
	animate: {
		opacity: 1,
		transition: {
			duration: 0.15,
			ease: [0.4, 0, 0.2, 1]
		}
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.15,
			ease: [0.4, 0, 0.2, 1]
		}
	}
};

interface Props {
	onClick: () => void;
	toastInfo: (str: string) => void;

	showSettings: boolean;
}

const UserDropdown: React.FC<Props> = ({ onClick, toastInfo, showSettings }) => {
	const { route, push } = useRouter();

	const logoutFunction = () => {
		const key = route.startsWith("/admin") ? "PAPERPLANE-ADMIN" : "PAPERPLANE-AUTH";

		deleteCookie(key);
		toastInfo("Redirecting you to the login page...");
		void push("/login");
	};

	return (
		<motion.div
			variants={variants}
			initial="initial"
			animate="animate"
			exit="exit"
			className="absolute right-0 translate-y-2 bg-main border border-white-200 p-2 rounded-lg"
		>
			{showSettings && (
				<>
					<TransparentButton type="link" href="/dashboard/settings" className="h-[10px]" onClick={onClick}>
						<p className="text-base font-normal text-center">Settings</p>
					</TransparentButton>
					<div className="h-[1px] w-full bg-white-200 my-2" />
				</>
			)}
			<PrimaryButton type="button" onClick={logoutFunction} className="py-1 rounded-md">
				<p className="w-full">Logout</p>
			</PrimaryButton>
		</motion.div>
	);
};

export default UserDropdown;
