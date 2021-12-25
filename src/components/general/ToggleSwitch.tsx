import { FastFieldProps, Field } from "formik";
import React from "react";
import ReactSwitch from "react-switch";

interface Props {
	id: string;
	disabled?: boolean;
}

const ToggleSwitch: React.FC<Props> = ({ id, disabled = false }) => {
	return (
		<>
			<Field id={id} name={id}>
				{({ field, form }: FastFieldProps<boolean>) => (
					<ReactSwitch
						checkedIcon={false}
						uncheckedIcon={false}
						onChange={(bool) => form.setFieldValue(id, bool)}
						checked={field.value}
						onColor="#57f287"
						offColor="#808080"
						disabled={disabled}
					/>
				)}
			</Field>
		</>
	);
};

export default ToggleSwitch;
