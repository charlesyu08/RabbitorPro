const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { newActivity } = require('@commands/activity');
const { ChannelType } = require('discord-api-types/v10');

module.exports = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('activity')
		.setDescription('Discord Activity')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Select a Voice Channel')
				.addChannelTypes(ChannelType.GuildVoice || ChannelType.GuildStageVoice),
		),
	listener: async (client, discord, interaction) => {
		if (interaction.commandName === 'activity') {
			const args = [interaction.options.getChannel('channel') ? interaction.options.getChannel('channel').id : ''];
			const message = await interaction.reply({ content: '_ _' });
			await newActivity(interaction, client, args, '/');
			interaction.deleteReply().catch(error => {
				if (error.code !== Discord.Constants.APIErrors.UNKNOWN_MESSAGE) {
					console.log('Failed to delete the message:', error);
				}
			});
			return true;
		}
	},
};