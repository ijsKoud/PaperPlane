import { api } from "#trpc/server";

export const getAuthenticationState = async (host: string) => {
	const response = await api(host).v1.auth.state.user.query();
	return response;
};
