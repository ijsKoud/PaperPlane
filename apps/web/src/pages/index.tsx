import { Logo } from "@paperplane/logo";
import { PrimaryButton } from "@paperplane/buttons";
import { Nunito } from "@next/font/google";

const nunito = Nunito({ weight: ["400", "700"], subsets: ["latin"] });

export default function Web() {
	return (
		<div className="grid place-items-center h-screen">
			<div className="flex flex-col gap-y-3 items-center justify-center">
				<div className="flex flex-col items-center">
					<div className="flex">
						<Logo width={45} height={45} />{" "}
						<h1 className="text-4xl max-sm:text-2xl font-normal" style={nunito.style}>
							<span style={nunito.style}>APER</span>
							<span className="font-bold" style={nunito.style}>
								PLANE
							</span>
						</h1>
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
