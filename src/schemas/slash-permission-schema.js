const mongoose = require('mongoose');
let permission = mongoose.Schema({});
const SlashPermission = mongoose.Schema({
	// Guild ID
	commandID: {
		type: String,
		required: true,
	},

	guildID: {
		type: String,
		required: false,
	},

	permissions: {
		type: Array,
		required: true,
		permission,
	},
});

permission = mongoose.Schema({
	type: { type: String },
	ids: { type: String },
	permission: { type: Boolean },
});

module.exports = mongoose.model('slash-permission', SlashPermission);