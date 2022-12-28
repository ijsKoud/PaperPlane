import { Logo } from "@paperplane/logo";
import { PrimaryButton } from "@paperplane/buttons";

export default function Web() {
	return (
		<div className="grid place-items-center h-screen">
			<div className="flex flex-col gap-y-3 items-center justify-center">
				<div>
					<div className="flex gap-4">
						<Logo width={45} height={45} /> <h1 className="text-4xl max-sm:text-2xl">PAPERPLANE</h1>
					</div>
					<h2 className="text-base max-sm:text-comment max-sm:font-medium">File uploading. URL Shortening. Protected views.</h2>
				</div>
				<div className="flex gap-2 max-sm:flex-col max-sm:w-full text-center">
					<PrimaryButton type="link" href="https://github.com/ijsKoud/paperplane">
						GitHub
					</PrimaryButton>
					<PrimaryButton type="link" href="/dashboard">
						Dashboard
					</PrimaryButton>
					<PrimaryButton type="link" href="/admin">
						Admin Panel
					</PrimaryButton>
				</div>
			</div>
		</div>
	);
}
