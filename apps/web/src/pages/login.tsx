import { PrimaryButton } from "@paperplane/buttons";
import { Input, SelectMenu, SelectOption } from "@paperplane/forms";
import { getProtocol } from "@paperplane/utils";
import axios, { AxiosError } from "axios";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { Formik, Form, FormikHelpers } from "formik";
import * as yup from "yup";
import { PulseLoader } from "react-spinners";

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

interface FormProps {
	domain: string;
	code: string;
}

interface Props {
	domains: SelectOption[];
	domain: string;
}

const Login: NextPage<Props> = ({ domains, domain }) => {
	const router = useRouter();

	const getDefaultValue = (): string | undefined => {
		const dm = domains.find((d) => d.value === domain);
		return dm?.value;
	};

	const getDomainValue = (selected: string): SelectOption | undefined => {
		const dm = domains.find((d) => d.value === selected);
		return dm;
	};

	const redirectUser = (opt: SelectOption, setValues: (field: string, value: string) => void) => {
		if (opt.value === domain || opt.value === "admin") return setValues("domain", opt.value);
		void router.push(`https://${opt.value}/login`);
	};

	const schema = yup.object({
		code: yup.string().length(6, "2FA code must be 6 characters long").required("2FA code must be provided"),
		domain: yup.string().required("A valid domain must be selected")
	});

	const onSubmit = async (values: FormProps, helpers: FormikHelpers<FormProps>) => {
		try {
			await axios.post("/api/auth/login", values);
			void router.push("/admin");
		} catch (err) {
			const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
			const error = _error || "Unknown error, please try again later.";
			helpers.resetForm({ errors: { code: error, domain: error }, values: { code: "", domain: values.domain } });
		}
	};

	return (
		<div className="grid place-items-center h-screen bg-login bg-cover bg-center">
			<Formik
				initialValues={{ domain: getDefaultValue() ?? "", code: "" }}
				validationSchema={schema}
				validateOnMount={false}
				onSubmit={onSubmit}
			>
				{(formData) => (
					<Form>
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
									value={getDomainValue(formData.values.domain ?? "")}
									onChange={(opt) => redirectUser(opt as SelectOption, formData.setFieldValue.bind(formData))}
									className="w-full"
								/>
								{formData.errors.domain && (
									<p className="text-red text-left text-small font-normal pt-2">* {formData.errors.domain}</p>
								)}
							</div>
							<div className="w-full gap-y-2 flex flex-col">
								<h3 className="text-lg">Two Factor Authentication</h3>
								<Input
									type="tertiary"
									placeholder="6 digit code here..."
									value={formData.values.code}
									onChange={(ev) => formData.setFieldValue("code", ev.currentTarget.value)}
								/>
								{formData.errors.code && <p className="text-red text-left text-small font-normal pt-2">* {formData.errors.code}</p>}
							</div>
							<PrimaryButton
								type="button"
								className="w-full flex gap-x-3 items-center justify-center"
								onClick={formData.submitForm}
								disabled={formData.isSubmitting || !formData.isValid}
							>
								{formData.isSubmitting ? (
									<PulseLoader color="#fff" />
								) : (
									<>
										Sign In <i className="fa-solid fa-right-to-bracket" />
									</>
								)}
							</PrimaryButton>
						</div>
					</Form>
				)}
			</Formik>
		</div>
	);
};

export default Login;
