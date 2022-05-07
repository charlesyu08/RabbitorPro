/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow-restricted-names */
const Discord = require('discord.js');
const prettyMS = require('pretty-ms');

module.exports = {
	commands: ['ping'],
	minArgs: 0,
	maxArgs: 0,
	description: 'Ping bot / server',
	permissions: ['MANAGE_GUILD'],
	permissionError: 'You don\'t have permissions to run this command',
	callback: async (message, _, __, ___, client) => {
		const msgemb = new Discord.MessageEmbed()
			.setColor('#8080ff')
			.setTitle('Ping');
		const reply = await message.channel.send({ embeds: [msgemb] });
		await reply.edit({ embeds: [msgemb.setTitle('**Ping ... Pong!!!**')] });
		reply.delete().catch(error => {
			if (error.code !== Discord.Constants.APIErrors.UNKNOWN_MESSAGE) {
				console.log('Failed to delete the message:', error);
			}
		});
		const bot_ping = reply.createdTimestamp - message.createdTimestamp;
		const API_ping = client.ws.ping;
		msgemb.setDescription(`:robot: **Bot Ping:** ${prettyMS(bot_ping, { secondsDecimalDigits: 3 })}\n\n` +
			`:signal_strength: **API Ping:** ${prettyMS(API_ping, { secondsDecimalDigits: 3 })}\n\n` +
			`:heartbeat: **Uptime:** ${prettyMS(client.uptime, { secondsDecimalDigits: 3 })}`)
			.setTimestamp();
		message.reply({ embeds: [msgemb] });
		setTimeout(() => {
			message.delete().catch(error => {
				if (error.code !== Discord.Constants.APIErrors.UNKNOWN_MESSAGE) {
					console.log('Failed to delete the message:', error);
				}
			});
		}, 1000);
	},
};