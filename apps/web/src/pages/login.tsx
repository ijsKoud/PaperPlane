import { PrimaryButton } from "@paperplane/buttons";
import { Input, SelectMenu, SelectOption } from "@paperplane/forms";
import { getProtocol } from "@paperplane/utils";
import axios from "axios";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const domainsRes = await axios.get<{ options: SelectOption[] }>(`${getProtocol()}${context.req.headers.host}/api/auth/accounts`, {
		headers: { "X-PAPERPLANE-API": process.env.INTERNAL_API_KEY }
	});

	return {
		props: {
			domain: context.req.headers.host,
			domains: domainsRes.data.options
		}
	};
};

interface Props {
	domains: SelectOption[];
	domain: string;
}

const Login: NextPage<Props> = ({ domains, domain }) => {
	const router = useRouter();

	const getDefaultValue = (): SelectOption | undefined => {
		const dm = domains.find((d) => d.value === domain);
		return dm;
	};

	const redirectUser = (opt: SelectOption) => {
		if (opt.value === domain || opt.value === "admin") return;
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
						type="tertiary"
						options={domains}
						defaultValue={getDefaultValue()}
						onChange={(opt) => redirectUser(opt as SelectOption)}
						className="w-full"
					/>
				</div>
				<div className="w-full gap-y-2 flex flex-col">
					<h3 className="text-lg">Two Factor Authentication</h3>
					<Input type="tertiary" placeholder="6 digit code here..." />
				</div>
				<PrimaryButton type="button" className="w-full flex gap-x-3 items-center justify-center">
					Sign In <i className="fa-solid fa-right-to-bracket" />
				</PrimaryButton>
			</div>
		</div>
	);
};

export default Login;
