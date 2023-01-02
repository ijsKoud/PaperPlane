import type React from "react";
import type { AllProps } from "./Button";
import Button from "./Button";

export const SecondaryButton: React.FC<React.PropsWithChildren<AllProps>> = (props) => {
	return <Button {...props} color="secondary" />;
};
