const path = require('path');
const fs = require('fs');
const events = [];

module.exports = async (client, discord) => {
	const readEvents = ((dir) => {
		const files = fs.readdirSync(path.join(__dirname, dir));
		for (const file of files) {
			const stat = fs.lstatSync(path.join(__dirname, dir, file));
			if (stat.isDirectory()) { readEvents(path.join(dir, file)); }
			else if (dir !== 'image' && dir.includes('/~') != true && file !== 'load-events.js' && file.startsWith('~') != true) {
				const event = require(path.join(__dirname, dir, file));
				events.push(event);
				console.log(`Started ${file}`);
			}
		}
	})('.././events/event');
	await events.forEach(event => { if (event.run) event.run(); });
	await events.forEach(event => { client.on(event.type, event.function.bind(null, client, discord));});
	console.log('All Events Started!');
};