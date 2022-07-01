import { setCookies } from "cookies-next";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Form from "../../components/page/files/Form";
import { fetch } from "../../lib/fetch";
import type { LoginFileRes } from "../../lib/types";
import prisma from "../../lib/prisma";
import moment from "moment";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const id = ctx.params!.id as string;
	const fileId = id.split(".")[0];

	try {
		const getProtocol = () => {
			const env = process.env.SECURE;
			if (env && env === "false") return "http://";

			return "https://";
		};

		const baseURL = `${getProtocol()}${ctx.req.headers.host}`;

		const file = await fetch<LoginFileRes>(`${baseURL}/api/dashboard/files/${fileId}`);
		const user = await prisma.user.findFirst();

		return {
			props: {
				file: file.data,
				baseURL,
				embed: {
					colour: user?.embedColour ?? "#000000",
					title: user?.embedTitle ?? null,
					description: user?.embedDescription ?? null
				}
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
	embed: {
		description: string | null;
		title: string | null;
		colour: string;
	};
	baseURL: string;
}

const FilePage: NextPage<Props> = ({ file, baseURL, embed }) => {
	const router = useRouter();

	const onSubmit = async ({ password }: { password: string }) => {
		try {
			const pwdPromise = fetch<{ token: string }>(`/api/dashboard/files/${file.id}`, undefined, {
				method: "POST",
				data: { password }
			});

			void pwdPromise
				.then((res) => setCookies(file.id, res.data.token, { maxAge: 6048e5 }))
				.then(() => router.reload())
				.catch(() => void 0);
			await toast.promise(pwdPromise, {
				error: "Unable to access the file, please try again later.",
				success: `Access granted for file ${file.name}`,
				pending: `Attempting to get access to ${file.name}`
			});
		} catch (err) {}
	};

	const url = `${baseURL}/files/${file.name}`;
	const title = `PaperPlane - ${file.name}`;
	const parseItem = (str: string): string =>
		str
			.replaceAll("{file_size}", file.size)
			.replaceAll("{file_name}", file.name)
			.replaceAll("{file_date}", moment(file.date).format("DD/MM/YYYY HH:mm:ss"));

	return (
		<main className="login">
			<Head>
				<title>{title}</title>
				{embed.description && <meta property="og:description" content={parseItem(embed.description)} />}
				{embed.title && <meta property="og:title" content={parseItem(embed.title)} />}
				<meta property="theme-color" content={embed.colour} />
				<meta property="og:image" content={`${url}?force=true`} />
				{/* <meta property="og:url" content={url} /> */}
				<meta property="twitter:card" content="summary_large_image" />
			</Head>
			<Form onSubmit={onSubmit} />
		</main>
	);
};

export default FilePage;
