const path = require('path');
const fs = require('fs');

module.exports = (client, discord) => {
	const readEvents = (dir) => {
		const files = fs.readdirSync(path.join(__dirname, dir));
		for (const file of files) {
			const stat = fs.lstatSync(path.join(__dirname, dir, file));
			if (stat.isDirectory()) {
				readEvents(path.join(dir, file));
			}
			else if (dir !== 'image' && dir.includes('/~') != true && file !== 'load-events.js' && file.startsWith('~') != true) {
				const event = require(path.join(__dirname, dir, file));
				event(client, discord);
				console.log(`Started ${file}`);
			}
		}
	};
	readEvents('.././events/event');
	console.log('All Events Started!');
};