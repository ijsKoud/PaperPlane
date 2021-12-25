import { FastFieldProps, Field } from "formik";
import React from "react";
import { CompactPicker } from "react-color";

interface Props {
	id: string;
}

const ColourPicker: React.FC<Props> = ({ id }) => {
	return (
		<Field id={id} name={id}>
			{({ field, form }: FastFieldProps<string>) => (
				<CompactPicker className="embed-colour-picker" onChange={(colour) => form.setFieldValue(id, colour.hex)} color={field.value} />
			)}
		</Field>
	);
};

export default ColourPicker;
