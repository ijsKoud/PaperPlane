import { PrimaryButton, SecondaryButton, TertiaryButton, WhiteButton } from "@paperplane/buttons";

export default function Web() {
	return (
		<div className="dark:bg-bg-dark">
			<h1>Web</h1>
			<PrimaryButton type="button">Hello World</PrimaryButton>
			<SecondaryButton type="button">Hello World</SecondaryButton>
			<TertiaryButton type="button">Hello World</TertiaryButton>
			<WhiteButton type="button">Hello World</WhiteButton>
		</div>
	);
}
