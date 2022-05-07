/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
require('module-alias/register');
require('@root/init');

const Discord = require('discord.js');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_INTEGRATIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_TYPING'] });
const mongo = require('@root/mongo');
const config = require('@root/config');
client.on('ready', async () => {
	try {
		require('@root/ready')(client, Discord, mongo, config);
	}
	catch (err) {
		console.error(err);
		try{
			const AnnounceCh = client.channels.cache.get(config.announce_ch);
			const msgemb = new Discord.MessageEmbed()
				.setColor('#ff8000')
				.setTitle('Error')
				.setDescription(err);
			AnnounceCh.send({ Embeds: [msgemb] });
		}
		catch (err) { console.error('AnnounceCh error'); }
	}

});

client.login(process.env.TOKEN).catch(console.log);

module.exports.client = client;