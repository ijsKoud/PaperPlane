import { Logo } from "@paperplane/logo";
import { PrimaryButton } from "@paperplane/buttons";
import { Glitch } from "@paperplane/components";
import { useEffect, useState } from "react";
import { Nunito } from "@next/font/google";

const SUBTITLE = "File uploading. URL Shortening. Protected views." as const;
const SUBTITLE_ALT = "71l3 upl04d1ng. *R| Sh0rt3n1ng. Pr0t3ct36 v13w5." as const;

const TITLE_FRONT = "APER" as const;
const TITLE_FRONT_ALT = "4P3R" as const;

const TITLE_BACK = "PLANE" as const;
const TITLE_BACK_ALT = "P\\4N3" as const;

const nunito = Nunito({ weight: ["400", "700"], subsets: ["latin"], display: "swap" });

export default function NotFound() {
	const [subtitle, setSubtitle] = useState<typeof SUBTITLE_ALT | typeof SUBTITLE>(SUBTITLE);
	const [titleFront, setTitleFront] = useState<typeof TITLE_FRONT | typeof TITLE_FRONT_ALT>(TITLE_FRONT);
	const [titleBack, setTitleBack] = useState<typeof TITLE_BACK | typeof TITLE_BACK_ALT>(TITLE_BACK_ALT);

	useEffect(() => {
		const interval = setInterval(() => {
			setSubtitle((res) => (res === SUBTITLE ? SUBTITLE_ALT : SUBTITLE));
			setTitleFront((res) => (res === TITLE_FRONT ? TITLE_FRONT_ALT : TITLE_FRONT));
			setTitleBack((res) => (res === TITLE_BACK ? TITLE_BACK_ALT : TITLE_BACK));
		}, 2e3);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="grid place-items-center h-screen">
			<div className="flex flex-col gap-y-3 items-center justify-center">
				<div className="flex flex-col items-center">
					<div className="flex items-center">
						<Logo width={45} height={45} />{" "}
						<h1 className="font-normal text-4xl max-sm:text-2xl" style={nunito.style}>
							<Glitch className={`${nunito.className}`} text={titleFront} />
							<Glitch className={`${nunito.className} font-bold`} text={titleBack} />
						</h1>
					</div>
					<Glitch text={subtitle} className="text-base max-sm:text-comment max-sm:font-medium" />
				</div>
				<p className="mt-4 max-w-[512px] text-center text-base">
					That’s weird, someone led you to a broken page. Why don’t you go back while we figure out the problem?
				</p>
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
