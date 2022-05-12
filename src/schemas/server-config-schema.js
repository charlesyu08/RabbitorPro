const mongoose = require('mongoose');

const ServerConfigSchema = mongoose.Schema({
	// Guild ID
	guildID: {
		type: String,
		required: true,
	},

	prefix: {
		type: String,
		required: true,
		default: 'r!',
	},

	announce_ch: {
		type: String,
		required: false,
	},

	announce_msg: {
		type: Object,
		required: false,
	},

	mute_announce_ch: {
		type: String,
		required: false,
	},

	unb_ch: {
		type: String,
		required: false,
	},

	unb_log_ch: {
		type: String,
		required: false,
	},

	unb_action_log_ch: {
		type: String,
		required: false,
	},
});

module.exports = mongoose.model('server-config', ServerConfigSchema);