export interface SignUpGetApi {
	type: "2fa" | "password";
	mode: "closed" | "open" | "invite";
	domains: string[];
}
