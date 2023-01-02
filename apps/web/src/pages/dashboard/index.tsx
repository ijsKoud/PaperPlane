import { DashboardNavbar } from "@paperplane/navbar";
import type { GetServerSideProps, NextPage } from "next";

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

const Dashboard: NextPage<Props> = () => {
	return (
		<>
			<DashboardNavbar />
		</>
	);
};

export default Dashboard;
