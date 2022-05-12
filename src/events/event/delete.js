const { activities } = require('@data/activities');

module.exports = {
	type: 'messageCreate',
	name: 'delete',
	function: async function(client, discord, message) {
		if (!message.author.bot) return;
		if (message.author.id == '859157277466296320') { // Ash's bot
			const msgEmbed = new discord.MessageEmbed().setColor('RED')
				.setTitle('Shut the fk up');
			message.reply({ content: '<@636044450866528256>', embeds: [msgEmbed] }); // Shut up ash
		}
	},
};