import type React from "react";
import type { AllProps } from "./Button";
import Button from "./Button";

export const TransparentButton: React.FC<React.PropsWithChildren<AllProps>> = (props) => {
	return <Button {...props} color="transparent" />;
};
