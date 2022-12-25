import type React from "react";
import type { AllProps } from "./Button";
import Button from "./Button";

export const SecondaryButton: React.FC<React.PropsWithChildren<AllProps>> = (props) => {
	// @ts-ignore Types are correct but TS says otherwise for no reason
	return <Button {...props} color="secondary" />;
};
