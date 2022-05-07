const express = require('express');
const router = express.Router();
const { client } = require('@root/index');
const prettyMS = require('pretty-ms');

const { announce_ch } = require('@root/config');

async function bot_ping() {
	let ping = 'N/A';
	try{
		const AncCh = client.channels.cache.get(announce_ch);
		let reply = await AncCh.send({ content: 'Ping', ephemeral: true });
		reply = await reply.edit({ content: 'pong', ephemeral: true });
		ping = prettyMS(await (reply.editedTimestamp - reply.createdTimestamp), { secondsDecimalDigits: 3 }) || 'N/A';
		await reply.delete().catch(err => {console.log('Failed to delete the message:', err);});
	}
	catch (err) {console.log('Can\'t find Announcement Channel');}

	return ping;
}

async function api_ping() {
	return await prettyMS(client.ws.ping, { secondsDecimalDigits: 3 });
}

async function uptime() {
	return await prettyMS(client.uptime, { secondsDecimalDigits: 3 });
}

router.get('/', async (req, res, next) => {
	res.status(200).json({
		'Bot Ping': await bot_ping(),
		'API Ping': await api_ping(),
		'Bot Uptime': await uptime(),
	});
});

router.get('/Bot/', async (req, res, next) => {
	res.status(200).json({
		'Bot Ping': await bot_ping(),
	});
});

router.get('/API/', async (req, res, next) => {
	res.status(200).json({
		'API Ping': await api_ping(),
	});
});

router.get('/Uptime/', async (req, res, next) => {
	res.status(200).json({
		'Bot Uptime': await uptime(),
	});
});

module.exports = router;