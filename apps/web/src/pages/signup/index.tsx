import type { GetServerSideProps } from "next";
import axios from "axios";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	try {
		// TODO: replace this with .env checker!!
		const res = await axios.get<string>(`http://${ctx.req.headers.host}/api/signup`);
		const signupPath = res.data === "2fa" ? "/signup/2fa" : "/signup/password";
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
