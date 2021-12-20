/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	redirects: () => [
		{
			source: "/",
			destination: "https://github.com/DaanGamesDG/PaperPlane/",
			permanent: true
		}
	]
};
