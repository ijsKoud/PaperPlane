import { setCookies } from "cookies-next";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Form from "../../components/page/files/Form";
import { fetch } from "../../lib/fetch";
import type { LoginFileRes } from "../../lib/types";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const id = ctx.params!.id as string;
	const type = Array.isArray(ctx.query.type) ? ctx.query.type[0] : ctx.query.type ?? "password";

	const fileId = id.split(".")[0];
	try {
		const file = await fetch<LoginFileRes>(`http://${ctx.req.headers.host}/api/dashboard/files/${fileId}`);
		return {
			props: {
				file: file.data,
				type
			}
		};
	} catch (err) {
		console.log(err);
	}

	return {
		notFound: true
	};
};

interface Props {
	file: LoginFileRes;
	type: "password" | "discord";
}

const FilePage: NextPage<Props> = ({ file, type }) => {
	const router = useRouter();

	const onSubmit = async ({ password }: { password: string }) => {
		try {
			const pwdPromise = fetch<{ token: string }>(`/api/dashboard/files/${file.name}`, undefined, {
				method: "POST",
				data: { password }
			});

			void pwdPromise
				.then((res) => setCookies(file.name, res.data.token, { maxAge: 6048e5 }))
				.then(() => router.reload())
				.catch(() => void 0);
			await toast.promise(pwdPromise, {
				error: "Unable to access the file, please try again later.",
				success: `Access granted for file ${file.name}`,
				pending: `Attempting to get access to ${file.name}`
			});
		} catch (err) {}
	};
	return (
		<main className="login">
			<Head>
				<title>PaperPlane - Login</title>
			</Head>
			<Form onSubmit={onSubmit} />
		</main>
	);
};

export default FilePage;
