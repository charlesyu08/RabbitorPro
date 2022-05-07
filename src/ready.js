const ServerConfigSchema = require('@schemas/server-config-schema');

module.exports = async (client, Discord, mongo, config) => {

	console.log('Rabbitor Pro is getting started!');

	await mongo();

	['service-handler', 'event-handler', 'command-handler', 'slash-handler'].forEach(async (handler) => {
		await require(`@handlers/${handler}`)(client, Discord);
	});

	const AnnounceCh = client.channels.cache.get(config.announce_ch);
	if (!AnnounceCh) return console.log('[ERR] | Channel not found');

	let msg;

	try {
		msg = (await ServerConfigSchema.findOne({ guildID: config.guild_id })).announce_msg;
		console.log(msg);
		msg = await AnnounceCh.messages.fetch(msg);
		msg.delete().catch(error => {
			if (error.code !== Discord.Constants.APIErrors.UNKNOWN_MESSAGE) {
				console.log('Failed to delete the message:', error);
			}
		});
	}
	catch (err) { console.log(`Announcement message not found, ${err}`); }

	const msgemb = new Discord.MessageEmbed()
		.setColor('#80ff00')
		.setTitle('Rabbitor Pro is Ready')
		.setTimestamp();

	msg = await AnnounceCh.send({ embeds: [msgemb] });

	console.log(msg.id);

	await ServerConfigSchema.findOneAndUpdate(
		{
			guildID: config.guild_id,
		},
		{
			guildID: config.guild_id,
			$set: {
				announce_msg: msg,
			},
		},
		{
			upsert: true,
			setDefaultsOnInsert: true,
		},
	).orFail(() => console.error('Not found'));

	console.log('Rabbitor Pro is Ready!');

	client.user.setPresence({ activities: [{ name: '@ugg.com' }] });
};