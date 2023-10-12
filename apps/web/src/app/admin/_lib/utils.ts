import { api } from "#trpc/server";
import { ADMIN_AUTHENTICATION_COOKIE } from "@paperplane/utils";
import { cookies, headers } from "next/headers";

/**
 * Requests the authentication state of the user PAPERPLANE-ADMIN cookie
 * @returns Returns boolean depending on authentication state of the user
 */
export const getAuthenticationState = async (): Promise<boolean> => {
	const cookie = cookies();
	const host = headers().get("host")!;

	const authCookie = cookie.get(ADMIN_AUTHENTICATION_COOKIE)?.value;
	const response = await api(host).v1.auth.state.admin.query(authCookie ?? "");
	return response;
};
