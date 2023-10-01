import { api } from "#trpc/server";
import { USER_AUTHENTICATION_COOKIE } from "@paperplane/utils";
import { cookies, headers } from "next/headers";

/**
 * Requests the authentication state of the user PAPERPLANE-AUTH cookie
 * @returns Returns boolean depending on authentication state of the user
 */
export const getAuthenticationState = async () => {
	const cookie = cookies();
	const host = headers().get("host")!;

	const authCookie = cookie.get(USER_AUTHENTICATION_COOKIE)?.value;
	const response = await api(host).v1.auth.state.user.query(authCookie ?? "");
	return response;
};
