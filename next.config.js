/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	images: {
		domains: [(process.env.NEXT_PUBLIC_DOMAIN ?? "").replace("http://", "").replace("https://", "").replace(":3000", "")]
	},
	redirects: () => [
		{
			source: "/",
			destination: "https://github.com/DaanGamesDG/PaperPlane/",
			permanent: true
		}
	]
};
