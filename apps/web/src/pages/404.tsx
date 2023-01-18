import { LogoText } from "@paperplane/logo";
import { PrimaryButton } from "@paperplane/buttons";

export default function NotFound() {
	return (
		<div className="grid place-items-center h-screen">
			<div className="flex flex-col gap-y-3 items-center justify-center">
				<div className="flex flex-col items-center">
					<LogoText height={45} width={45} textClassName="text-4xl max-sm:text-2xl" />
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
