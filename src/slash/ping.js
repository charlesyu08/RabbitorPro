const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const prettyMS = require('pretty-ms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Get bot / server ping'),
	listener: async (client, discord, interaction) => {
		if (interaction.commandName === 'ping') {
			const msgemb = new Discord.MessageEmbed()
				.setColor('#8080ff')
				.setTitle('Ping');
			// const message = await interaction.reply({ content: '_ _' });
			const reply = await interaction.channel.send({ embeds: [msgemb] });
			await reply.edit({ embeds: [msgemb.setTitle('**Ping ... Pong!!!**')] });
			reply.delete().catch(error => {
				if (error.code !== Discord.Constants.APIErrors.UNKNOWN_MESSAGE) {
					console.log('Failed to delete the message:', error);
				}
			});
			const bot_ping = reply.createdTimestamp - interaction.createdTimestamp;
			const API_ping = client.ws.ping;
			msgemb.setDescription(`:robot: **Bot Ping:** ${prettyMS(bot_ping, { secondsDecimalDigits: 3 })}\n\n` +
				`:signal_strength: **API Ping:** ${prettyMS(API_ping, { secondsDecimalDigits: 3 })}\n\n` +
				`:heartbeat: **Uptime:** ${prettyMS(client.uptime, { secondsDecimalDigits: 3 })}`)
				.setTimestamp();
			interaction.reply({ embeds: [msgemb], ephemeral: true });
		}
	},
};