module.exports = async () => {
	process.on('unhandledRejection', error => {
		console.error('Unhandled promise rejection:', error);
	});
	process.on('uncaughtException', err => {
		console.error(err && err.stack);
	});
};
