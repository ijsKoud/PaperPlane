import type { GetServerSideProps } from "next";
import axios from "axios";
import { Input, SelectMenu, SelectOption } from "@paperplane/forms";
import { PrimaryButton } from "@paperplane/buttons";
import { useState } from "react";
import { getProtocol } from "@paperplane/utils";

// TODO: Remove MOCK_DOMAINS and fetch domains instead
const MOCK_DOMAINS = [
	{
		label: "localhost",
		value: "localhost:3000"
	},
	{
		label: "*.ijskoud.dev",
		value: "*.ijskoud.dev"
	},
	{
		label: "*.rowansmidt.xyz",
		value: "*.rowansmidt.xyz"
	},
	{
		label: "*.jobgamesjg.xyz",
		value: "*.jobgamesjg.xyz"
	}
];

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	try {
		const res = await axios.get<{ type: "2fa" | "password"; mode: "closed" | "open" | "invite " }>(
			`${getProtocol()}${ctx.req.headers.host}/api/auth/signup`,
			{
				headers: { "X-PAPERPLANE-API": process.env.INTERNAL_API_KEY }
			}
		);
		if (res.data.mode === "closed") return { notFound: true };
		if (res.data.type === "password")
			return {
				props: {
					domains: MOCK_DOMAINS,
					mode: res.data.mode
				}
			};

		return {
			redirect: { destination: "/signup/2fa", permanent: true }
		};
	} catch (err) {
		console.log(err);
		return {
			notFound: true
		};
	}
};

interface Props {
	domains: typeof MOCK_DOMAINS;
}

export default function SignUp({ domains }: Props) {
	const [selectedDomain, setSelectedDomain] = useState("");
	const isSubdomainDisabled = !selectedDomain.startsWith("*.");

	return (
		<div className="grid place-items-center h-screen bg-login bg-cover bg-center">
			<div className="bg-main p-8 rounded-xl flex flex-col gap-y-8 items-center justify-center">
				<div>
					<h1 className="text-lg font-normal">Hello, time to create an account!</h1>
					<h2 className="text-xl">Let&apos;s get you settled!</h2>
				</div>
				<div className="w-full gap-y-2 flex flex-col">
					<h3 className="text-lg">Choose a domain</h3>
					<SelectMenu
						type="tertiary"
						options={domains}
						placeholder="Select a domain"
						onChange={(opt) => setSelectedDomain((opt as SelectOption).value)}
						className="w-full"
					/>
				</div>
				<div className="w-full gap-y-2 flex flex-col">
					<h3 className="text-lg">Your custom subdomain</h3>
					<Input
						type="tertiary"
						placeholder={isSubdomainDisabled ? "Option not avaiable with this domain" : "Fill in your custom subdomain name"}
						disabled={isSubdomainDisabled}
						aria-disabled={isSubdomainDisabled}
					/>
				</div>
				<div className="w-full gap-y-2 flex flex-col">
					<h3 className="text-lg">Password</h3>
					<Input type="tertiary" placeholder="Password here..." />
				</div>
				<PrimaryButton type="button" className="w-full flex gap-x-3 items-center justify-center">
					Sign Up <i className="fa-solid fa-right-to-bracket" />
				</PrimaryButton>
			</div>
		</div>
	);
}
