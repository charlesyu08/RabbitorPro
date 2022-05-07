const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const path = require('path');
const fs = require('fs');

module.exports = (client, discord) => {
	const commands = [];
	const clientId = client.application.id;
	const guildId = '923634621730672650';

	const readSlash = (dir) => {
		const files = fs.readdirSync(path.join(__dirname, dir));
		for (const file of files) {
			const stat = fs.lstatSync(path.join(__dirname, dir, file));
			if (stat.isDirectory()) {
				readSlash(path.join(dir, file));
			}
			else if (file.includes('~') != true && dir.includes('/~') != true) {
				const command = require(path.join(__dirname, dir, file));
				commands.push(command.data.toJSON());
				console.log(`${command.data.name} is added`);
			}
		}
	};
	readSlash('.././slash');

	const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

	(async () => {

		try {
			console.log('Started refreshing application (/) commands.');

			await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			);

			console.log('Successfully reloaded application (/) commands.');
		}
		catch (error) {
			console.error(error);
		}
	})();

	const readCommands = (dir) => {
		const myfunctions = [];
		const files = fs.readdirSync(path.join(__dirname, dir));
		for (const file of files) {
			const stat = fs.lstatSync(path.join(__dirname, dir, file));
			if (stat.isDirectory()) {
				readCommands(path.join(dir, file));
			}
			else if (file.includes('~') != true && dir.includes('/~') != true) {
				const command = require(path.join(__dirname, dir, file));
				myfunctions.push(command);
				console.log(`Listener ${file} added`);
			}
		}
		client.on('interactionCreate', async (interaction) => {
			if (!interaction.isCommand()) {return;}
			else {
				myfunctions.forEach(async (myfunction)=> { await myfunction.listener(client, discord, interaction);});
			}
		});
	};
	readCommands('.././slash');
};