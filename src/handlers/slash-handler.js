const { REST } = require('@discordjs/rest');
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
const { Routes } = require('discord-api-types/v9');

const path = require('path');
const fs = require('fs');

module.exports = (client, discord) => {
	const commands = [];
	const clientId = client.application.id;
	const guildId = '923634621730672650';

	const readSlash = (dir) => {
		const files = fs.readdirSync(path.join(__dirname, dir));
		console.log('Started refreshing application (/) commands.');
		for (const file of files) {
			const stat = fs.lstatSync(path.join(__dirname, dir, file));
			if (stat.isDirectory()) {
				readSlash(path.join(dir, file));
			}
			else if (file.includes('~') != true && dir.includes('/~') != true) {
				const command = require(path.join(__dirname, dir, file));
				(async () => {
					try {
						if(command.guild) {
							await rest.put(
								Routes.applicationGuildCommands(clientId, guildId),
								{ body: [command.data.toJSON()] },
							);
						}
						else {
							await rest.put(
								Routes.applicationCommands(clientId),
								{ body: [command.data.toJSON()] },
							);
						}
					}
					catch (error) {
						console.error(error);
					}
				})();
				console.log(`${command.data.name}: (/)Command added`);
				if (command.listener) {
					commands.push(command);
				}
			}
		}
		console.log('Successfully reloaded application (/) commands.');
	};
	readSlash('.././slash');

	client.on('interactionCreate', async (interaction) => {
		if (!interaction.isCommand()) {return;}
		else {
			commands.forEach(async (command)=> {
				await command.listener(client, discord, interaction) ? console.log(`${interaction.user.username}> Run the command: /${command.data.name}`) : '';
			});
		}
	});
};