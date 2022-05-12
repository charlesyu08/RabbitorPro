const { activities } = require('@data/activities');

module.exports = {
	type: 'interactionCreate',
	name: 'activities',
	function: async function(client, discord, interaction) {
		if (!interaction.isSelectMenu()) return;

		if (interaction.customId === 'Activity_Select') {
			const msgEmbed = interaction.message.embeds[0];
			const channelID = msgEmbed.description.match(/\d+/);

			const invite = await client.discordTogether.createTogetherCode(channelID, interaction.values[0]).then(async _invite => {
				return _invite.code;
			});
			const row2 = new discord.MessageActionRow().addComponents(
				new discord.MessageButton()
					.setStyle(5)
					.setLabel('Join')
					.setURL(invite),
			);
			const activity = activities.find(_activity => _activity.value == interaction.values[0]);
			msgEmbed.setTitle(`${activity.label}`)
				.setDescription(`Activity Started for <#${channelID}>`);
			interaction.update({ embeds: [msgEmbed], components: [row2] });
		}
	},
};