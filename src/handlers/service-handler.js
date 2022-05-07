const path = require('path');
const fs = require('fs');

module.exports = (client, discord) => {
	const readService = (dir) => {
		const files = fs.readdirSync(path.join(__dirname, dir));
		for (const file of files) {
			const stat = fs.lstatSync(path.join(__dirname, dir, file));
			if (stat.isDirectory()) {
				readService(path.join(dir, file));
			}
			else if (dir !== 'image' && file !== 'load-services.js') {
				const service = require(path.join(__dirname, dir, file));
				service(client, discord);
				console.log(`Enabled ${file}`);
			}
		}
	};
	readService('.././services');
	console.log('All Services online!');
};