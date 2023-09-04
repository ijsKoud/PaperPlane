import { getProtocol } from "@paperplane/utils";
import axios from "axios";

export const getAuthenticationState = async (host: string, cookie: string | undefined) => {
	const response = await axios.get<AuthenticationStateResponse>(`${getProtocol()}${host}/api/auth/state`, {
		headers: { "X-PAPERPLANE-AUTH-KEY": cookie }
	});

	return response.data;
};

export interface AuthenticationStateResponse {
	admin: boolean;
	domain: boolean;
}
