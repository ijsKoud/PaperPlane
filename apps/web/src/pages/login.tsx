import { PrimaryButton } from "@paperplane/buttons";
import { Input, SelectMenu, SelectOption } from "@paperplane/forms";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";

// TODO: Remove MOCK_DOMAINS and fetch domains instead
const MOCK_DOMAINS = [
	{
		label: "localhost",
		value: "localhost:3000"
	},
	{
		label: "cdn.ijskoud.dev",
		value: "cdn.ijskoud.dev"
	},
	{
		label: "cdn.rowansmidt.xyz",
		value: "cdn.rowansmidt.xyz"
	},
	{
		label: "cdn.jobgamesjg.xyz",
		value: "cdn.jobgamesjg.xyz"
	}
];

export const getServerSideProps: GetServerSideProps = async (context) => {
	await new Promise((res) => setTimeout(res, 2e3));

	return {
		props: {
			domain: context.req.headers.host,
			domains: MOCK_DOMAINS
		}
	};
};

interface Props {
	domains: typeof MOCK_DOMAINS;
	domain: string;
}

const Login: NextPage<Props> = ({ domains, domain }) => {
	const router = useRouter();

	const getDefaultValue = (): SelectOption | undefined => {
		const dm = domains.find((d) => d.value === domain);
		return dm;
	};

	const redirectUser = (opt: SelectOption) => {
		if (opt.value === domain) return;
		void router.push(`https://${opt.value}/login`);
	};

	return (
		<div className="grid place-items-center h-screen bg-login bg-cover bg-center">
			<div className="bg-main p-8 rounded-xl flex flex-col gap-y-8 items-center justify-center">
				<div>
					<h1 className="text-lg font-normal">Welcome Back!</h1>
					<h2 className="text-xl">Sign in to your account</h2>
				</div>
				<div className="w-full gap-y-2 flex flex-col">
					<h3 className="text-lg">Domain</h3>
					<SelectMenu
						options={MOCK_DOMAINS}
						defaultValue={getDefaultValue()}
						onChange={(opt) => redirectUser(opt as SelectOption)}
						className="w-full"
					/>
				</div>
				<div className="w-full gap-y-2 flex flex-col">
					<h3 className="text-lg">Two Factor Authentication</h3>
					<Input type="tertiary" placeholder="6 digit code here..." />
				</div>
				<PrimaryButton type="button" extra="w-full flex gap-x-3 items-center justify-center">
					Sign In <i className="fa-solid fa-right-to-bracket" />
				</PrimaryButton>
			</div>
		</div>
	);
};

export default Login;
