import type React from "react";

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
	return (
		<input
			className="bg-highlight-200 border border-highlight-600 rounded-xl px-4 py-2 outline-2 outline-transparent outline focus:outline-highlight transition-all placeholder:text-white-600"
			{...props}
		/>
	);
};
