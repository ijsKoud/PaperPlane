import type { NextPage } from "next";
import { useCookies } from "react-cookie";
import React, { useEffect, useState } from "react";
import { Formik, Field, Form } from "formik";
import { object, string } from "yup";
import { ThreeDots } from "@agney/react-loading";
import { useRouter } from "next/router";
import { fetch } from "../lib/fetch";
import { AxiosError } from "axios";
import { useAuth } from "../lib/hooks/useAuth";
import { ApiError } from "../lib/types";
import { alert } from "../lib/notifications";

const Login: NextPage = () => {
	const [cookies, setCookie] = useCookies(["session"]);
	const [show, setShow] = useState(false);
	const router = useRouter();
	const auth = useAuth();

	useEffect(() => {
		if (cookies.session) {
			auth.fetch();
			router.push("/dashboard");
		}
	}, [cookies]);

	const schema = object({
		username: string()
			.min(3, "Username must be 3 characters or longer")
			.max(32, "Username must not be longer than 32 characters")
			.required("This field is required"),
		password: string()
			.min(5, "Password must be 5 characters or longer")
			.required("This field is required"),
	});

	const onSubmit = async (data: { username: string; password: string }) => {
		const res = await fetch("/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
			data,
		}).catch((e) => e as AxiosError<ApiError>);

		if ("isAxiosError" in res) {
			if (!res.response) return;

			const { data } = res.response;
			alert("Something went wrong while processing your request", data.message);
			console.error(`[Login]: ${data.error}`);

			return;
		}

		setCookie("session", res.data.sessionId, {
			maxAge: 12096e5, // 2 weeks
		});
	};

	return (
		<main className="login-container">
			<div className="login">
				<h1>Login</h1>
				<Formik
					validationSchema={schema}
					onSubmit={onSubmit}
					initialValues={{ username: "", password: "" }}
					validateOnMount
					validateOnChange>
					{({ errors, submitForm, isValid, isSubmitting }) => (
						<Form className="login-form" autoComplete="off">
							<div className="login__form-item">
								<Field as="input" id="username" name="username" placeholder="username..." />
								<p className="login__form-error">{errors.username ?? <wbr />}</p>
							</div>
							<div className="login__form-item">
								<div className="login__form-password">
									<Field
										as="input"
										type={show ? "text" : "password"}
										id="password"
										name="password"
										placeholder="password..."
										style={{ width: "90%" }}
									/>
									<i
										className={show ? "fas fa-eye-slash" : "fas fa-eye"}
										onClick={() => setShow(!show)}
									/>
								</div>
								<p className="login__form-error">{errors.password ?? <wbr />}</p>
							</div>
							{isSubmitting ? (
								<ThreeDots className="login__form-load" />
							) : (
								<p
									className={isValid ? "login__form-submit" : "login__form-submit disabled"}
									onClick={submitForm}>
									Login
								</p>
							)}
						</Form>
					)}
				</Formik>
			</div>
		</main>
	);
};

export default Login;
