import type { GetServerSideProps } from "next";
import axios from "axios";
import { getProtocol } from "@paperplane/utils";

export const getServerSideProps: GetServerSideProps = async (context) => {
	try {
		const res = await axios.get<{ type: "2fa" | "password"; mode: "closed" | "open" | "invite " }>(
			`${getProtocol()}${context.req.headers.host}/api/auth/signup`,
			{
				headers: { "X-PAPERPLANE-API": process.env.INTERNAL_API_KEY }
			}
		);

		const signupPath = res.data.type === "2fa" ? "/signup/2fa" : "/signup/password";
		if (res.data.mode === "closed") return { notFound: true };

		return {
			redirect: { destination: signupPath, permanent: true }
		};
	} catch (err) {
		console.log(err);
		return {
			notFound: true
		};
	}
};

export default function SignUp() {
	return <div></div>;
}
