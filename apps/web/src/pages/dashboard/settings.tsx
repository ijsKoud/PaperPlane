import type { GetServerSideProps, NextPage } from "next";
import { DashboardLayout, DashboardSettingsForm } from "@paperplane/ui";
import { toast } from "react-toastify";
import { getProtocol } from "@paperplane/utils";
import axios from "axios";
import { NextSeo } from "next-seo";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const stateRes = await axios.get<{ admin: boolean; domain: boolean }>(`${getProtocol()}${context.req.headers.host}/api/auth/state`, {
		headers: { "X-PAPERPLANE-AUTH-KEY": context.req.cookies["PAPERPLANE-AUTH"] }
	});

	if (!stateRes.data.domain)
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};

	return {
		props: {}
	};
};

const DashboardSettings: NextPage = () => {
	return (
		<DashboardLayout toastInfo={(str) => toast.info(str)}>
			<NextSeo title="Settings" />
			<DashboardSettingsForm onSubmit={() => void 0} />
		</DashboardLayout>
	);
};

export default DashboardSettings;
