/* eslint-disable no-inline-comments */
const Discord = require('discord.js');
const { DiscordTogether } = require('discord-together');
const { activity_ch } = require('@root/config');
const { activities } = require('@data/activities');
const deletemsg = require('@util/deletemsg');

module.exports = {
	commands: ['activity'],
	minArgs: 0,
	description: 'Activities',
	requiredChannels: [
		'934043094989570100', // test
		'673727054688157716', // bot-command
		'676582767139749950', // off-topic
		'783440749357301780', // vip-booster-chat
	],
	requiredRoles: [
		'935920535286726666', // @King Rabbit
		'677226056201011201', // @Thug (lvl 5)
	],
	callback: async (message, args, _, prefix, client) => {
		await newActivity(message, client, args, prefix);
		deletemsg(message);
	},
};

async function newActivity(message, client, args, prefix) {
	try {
		client.discordTogether = new DiscordTogether(client);
		let channelID;
		if (args.length > 0) { channelID = args[0]; }
		channelID = await getchannel(client, message, channelID);
		const msgEmbed = new Discord.MessageEmbed()
			.setColor('RANDOM')
			.setTitle('Discord Activities selector')
			.setDescription(`Activity for <#${channelID}>`)
			.setFooter({ text: `Summoned with (${prefix}activity <Optional: ChannelID>)` });

		const row = new Discord.MessageActionRow().addComponents(
			new Discord.MessageSelectMenu()
				.setCustomId('Activity_Select')
				.setPlaceholder('Select an activity')
				.addOptions(activities),
		);
		message.channel.send({ embeds: [msgEmbed], components: [row] });
	}
	catch (err) {
		console.log(err);
		const msgEmbed = new Discord.MessageEmbed().setColor('RED');
		msgEmbed.setTitle(err);
		const msg = await message.channel.send({ embeds: [msgEmbed], ephemeral: true });
		setTimeout(() => {deletemsg(msg);}, 10000);
	}
}

async function getchannel(client, message, channelID) {
	const ServerConfigSchema = require('@schemas/server-config-schema');
	const result = await ServerConfigSchema.findOne({ guildID: message.guild.id });
	if (message.member.voice.channel) { channelID = message.member.voice.channel.id; }
	if (!client.channels.cache.get(channelID)) {
		channelID = result.activity_ch || activity_ch;
		if (!client.channels.cache.get(channelID)) { throw 'Please provide a valid voice channel'; }
	}
	if (client.channels.cache.get(channelID).guild.id != message.guild.id) { throw 'Please provide a valid voice channel'; }
	return channelID;
}

module.exports.newActivity = async function(message, client, args, prefix) {await newActivity(message, client, args, prefix);};