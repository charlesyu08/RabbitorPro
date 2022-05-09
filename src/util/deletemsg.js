const Discord = require('discord.js');

module.exports = function deletemsg(msg, time) {
	setTimeout(()=>{
		msg.delete().catch(error => {
			if (error.code !== Discord.Constants.APIErrors.UNKNOWN_MESSAGE) {
				console.log('Failed to delete the message:', error);
			}
		});
	}, time || 0);
};