import type { GetServerSideProps, NextPage } from "next";
import { AdminLayout, AdminSettingsForm } from "@paperplane/ui";
import axios from "axios";
import { getProtocol } from "@paperplane/utils";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const stateRes = await axios.get<{ admin: boolean; domain: boolean }>(`${getProtocol()}${context.req.headers.host}/api/auth/state`, {
		headers: { "X-PAPERPLANE-ADMIN-KEY": context.req.cookies["PAPERPLANE-ADMIN"] }
	});

	if (!stateRes.data.admin)
		return {
			redirect: {
				destination: "/login?user=admin",
				permanent: false
			}
		};

	return {
		props: {}
	};
};

const AdminSettingsPanel: NextPage = () => {
	return (
		<AdminLayout>
			<AdminSettingsForm onSubmit={console.log} />
		</AdminLayout>
	);
};

export default AdminSettingsPanel;
