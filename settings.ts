const getSettings = () => {
	const dashboard = process.env.NEXT_PUBLIC_DOMAIN ?? "http://localhost:3000";
	const secret = (process.env.SECRET as string) ?? "secret";

	const port = Number(process.env.PORT ?? 3001);

	// eslint-disable-next-line no-inline-comments
	const uploadLimit = Number(process.env.UPLOAD_LIMIT ?? 1073741824); // in Bytes

	const ratelimitTime = Number(process.env.RATELIMIT_TIME ?? 5e3);
	const ratelimitAmount = Number(process.env.RATELIMIT_AMOUNT ?? 25);

	return {
		dashboard,
		secret,
		uploadLimit,
		port,
		ratelimit: {
			time: ratelimitTime,
			amount: ratelimitAmount,
		},
	};
};

export default getSettings;
