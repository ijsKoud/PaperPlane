import { TertiaryButton } from "@paperplane/buttons";
import { Input } from "@paperplane/forms";
import { getProtocol } from "@paperplane/utils";
import axios, { AxiosError } from "axios";
import { Form, Formik, type FormikHelpers } from "formik";
import type { GetServerSideProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { PulseLoader } from "react-spinners";
import { toast } from "react-toastify";
import { object, string } from "yup";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id: _id } = context.params!;
	const id = Array.isArray(_id) ? _id[0] : _id ?? "";
	const fileRes = await axios.get<Record<string, any> | null>(`${getProtocol()}${context.req.headers.host}/api/files/${id}`, {
		headers: { Cookie: context.req.headers.cookie }
	});

	if (typeof fileRes.data === "object")
		return {
			props: {},
			redirect: {
				destination: `/files/${id}`
			}
		};

	return {
		props: {
			id
		}
	};
};

interface Props {
	id: string;
}

const File: NextPage<Props> = ({ id }) => {
	const router = useRouter();
	const schema = object({
		password: string().required()
	});

	useEffect(() => {
		const { cancel, token } = axios.CancelToken.source();
		axios
			.get<Record<string, any> | null>(`/api/files/${id}`, { withCredentials: true, cancelToken: token })
			.then((res) => (typeof res.data === "object" ? (location.pathname = router.asPath.replace("/auth", "")) : void 0))
			.catch(() => void 0);

		return () => cancel();
	}, []);

	const onSubmit = async (values: { password: string }, helpers: FormikHelpers<{ password: string }>) => {
		const promise = async () => {
			try {
				await axios.post(`/api/files/${id}`, values);
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				helpers.resetForm({
					values,
					errors: Object.keys(values)
						.map((key) => ({ [key]: error }))
						.reduce((a, b) => ({ ...a, ...b }), {})
				});

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Decrypting the FBI database...",
				error: "Unable to decrypt the data :(",
				success: "Database decrypted, rendering data..."
			});

			location.pathname = router.asPath.replace("/auth", "");
		} catch (error) {}
	};

	return (
		<div className="w-screen h-screen grid place-items-center">
			<NextSeo defaultTitle={router.asPath.split("/")[2]} />
			<div>
				<div className="mb-8 text-center">
					<h1 className="text-3xl">Enter file password</h1>
					<p className="text-base">A password is required to view this shared file.</p>
				</div>
				<Formik initialValues={{ password: "" }} validationSchema={schema} onSubmit={onSubmit} validateOnMount>
					{(formik) => (
						<Form>
							<div className="mb-2">
								<Input
									type="tertiary"
									placeholder="Password here..."
									formType="password"
									value={formik.values.password}
									className="w-full"
									onChange={(ctx) => formik.setFieldValue("password", ctx.currentTarget.value)}
								/>
								<p className="text-red text-left text-small font-normal">
									{formik.errors.password && `* ${formik.errors.password}`}&#8203;
								</p>
							</div>
							<TertiaryButton type="button" disabled={formik.isSubmitting || !formik.isValid} onClick={formik.submitForm}>
								{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Submit</>}
							</TertiaryButton>
						</Form>
					)}
				</Formik>
			</div>
		</div>
	);
};

export default File;
