import React from "react";
import { toast } from "react-toastify";
import { fetch } from "../../../../lib/fetch";
import { useAuth } from "../../../../lib/hooks/useAuth";
import type { FC } from "../../../../lib/types";
import Button from "../../../general/Button";

const TokenRegen: FC = () => {
	const { user, fetch: refetch } = useAuth();

	const onSubmit = async () => {
		try {
			const embedPromise = fetch("/api/user/token", undefined, { method: "POST" });
			await toast.promise(embedPromise, {
				error: "Unable to regenerate the token, please try again later.",
				success: "Successfully regenerated the token",
				pending: "Attempting to regenerate the token"
			});

			embedPromise.then(() => setTimeout(() => refetch(), 1e3)).catch(() => void 0);
		} catch (err) {}
	};

	return user ? (
		<div style={{ marginTop: "1rem" }}>
			<Button type="button" style="danger" onClick={onSubmit}>
				Regenerate Token
			</Button>
		</div>
	) : null;
};

export default TokenRegen;
