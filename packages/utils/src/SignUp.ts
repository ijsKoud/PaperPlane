export interface SignUpGetApi {
	type: "2fa" | "password";
	mode: "closed" | "open" | "invite";
	domains: string[];
}

export interface MFAGetApi {
	key: string;
	uri: string;
	secret: string;
}
