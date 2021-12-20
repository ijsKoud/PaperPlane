module.exports = async function nextHandler(nextApp, server) {
	await nextApp.prepare();
	const handler = nextApp.getRequestHandler();

	server.use((req, res) => {
		handler(req, res);
	});
};
