import { PaperPlaneApiOutputs, api } from "#trpc/server";
import { useEffect, useState } from "react";

type MFAKeyData = NonNullable<PaperPlaneApiOutputs["v1"]["auth"]["signup"]["mfa"]>;

export const UseTwoFactorKey = () => {
	const [keyData, setKeyData] = useState<MFAKeyData>({ key: "", secret: "", uri: "" });

	/**
	 * Creates a valid 2fa QR-code
	 * @param domain The domain which is currently selected
	 * @returns qr-code image url
	 */
	const getImage = (domain: string) => {
		const BASE_URL = "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=";
		const imageData = encodeURIComponent(keyData.uri.replace("DOMAIN_PLACEHOLDER", domain));

		return `${BASE_URL}${imageData}`;
	};

	/** Updates the MFA Key data */
	const updateMfa = async () => {
		const data = await api()
			.v1.auth.signup.mfa.query()
			.catch(() => null);
		if (data) setKeyData(data);

		console.debug(`[MFA]: Updated MFA data, data=${data ? "object" : "null"}`);
	};

	useEffect(() => {
		void updateMfa();

		const interval = setInterval(updateMfa, 9e5);
		return () => clearInterval(interval); // Re-generates the 2fa data every time the data has expired
	}, []);

	return {
		...keyData,
		getImage
	};
};
