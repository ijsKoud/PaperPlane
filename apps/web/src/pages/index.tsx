import { PrimaryButton, SecondaryButton } from "@paperplane/buttons";

export default function Web() {
	return (
		<div className="dark:bg-bg-dark">
			<h1>Web</h1>
			<PrimaryButton type="button">Hello World</PrimaryButton>
			<SecondaryButton type="button">Hello World</SecondaryButton>
		</div>
	);
}
