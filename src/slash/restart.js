const Discord = require('discord.js');
const Heroku = require('heroku-client');
const { appName, dynoName } = require('@root/config');
const heroku = new Heroku({ token: process.env.HEROKU_TOKEN });
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('restart')
		.setDescription('Restart Bot')
		.setDefaultPermission(false),
	listener: async (client, discord, interaction) => {
		if (interaction.commandName === 'restart') {
			const msgemb = new Discord.MessageEmbed()
				.setColor('#8080ff')
				.setTitle('Bot Restarting');
			interaction.reply({ embeds: [msgemb], ephemeral: true });

			heroku.delete('/apps/' + appName + '/dynos/' + dynoName)
				.then(x => console.log(x));
		}
	},
};