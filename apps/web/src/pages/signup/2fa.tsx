import type { GetServerSideProps } from "next";
import axios from "axios";
import { Input, SelectMenu, SelectOption } from "@paperplane/forms";
import { PrimaryButton } from "@paperplane/buttons";
import { useState } from "react";

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
		// TODO: replace this with .env checker!!
		const res = await axios.get<string>(`http://${ctx.req.headers.host}/api/signup`);
		if (res.data === "2fa")
			return {
				props: {
					domains: MOCK_DOMAINS
				}
			};

		return {
			redirect: { destination: "/signup/password", permanent: true }
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
	domain: string;
}

export default function SignUp({ domain, domains }: Props) {
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
						options={MOCK_DOMAINS}
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
				<div className="w-full flex gap-2 justify-center items-center">
					<img
						src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1024px-QR_code_for_mobile_English_Wikipedia.svg.png"
						alt="2fa qr-code"
						className="w-24 h-24 bg-white rounded-xl"
					/>
					<p className="max-w-[250px]">
						Scan the QR code with chosen 2FA app and fill in the 6 digit code below. Alternatively, use the following code:{" "}
						<strong>XXXX-XXXX-XXXX</strong>
					</p>
				</div>
				<div className="w-full gap-y-2 flex flex-col">
					<h3 className="text-lg">Two Factor Authentication</h3>
					<Input type="tertiary" placeholder="6 digit code here..." />
				</div>
				<PrimaryButton type="button" className="w-full flex gap-x-3 items-center justify-center">
					Sign Up <i className="fa-solid fa-right-to-bracket" />
				</PrimaryButton>
			</div>
		</div>
	);
}
