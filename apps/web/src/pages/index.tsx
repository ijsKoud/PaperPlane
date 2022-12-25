import { Logo } from "@paperplane/logo";
import { PrimaryButton } from "@paperplane/buttons";

export default function Web() {
	return (
		<div className="dark:bg-bg-dark grid place-items-center h-screen">
			<div className="flex flex-col gap-y-3 items-center justify-center">
				<div>
					<div className="flex gap-4">
						<Logo width={45} height={45} /> <h1 className="text-4xl">PAPERPLANE</h1>
					</div>
					<h2 className="text-base">File uploading. URL Shortening. Protected views.</h2>
				</div>
				<div className="flex gap-2">
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
