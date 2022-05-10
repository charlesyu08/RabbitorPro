const mongoose = require('mongoose');
let role = mongoose.Schema({});
const BonusChip = mongoose.Schema({
	// Guild ID
	guildID: {
		type: String,
		required: true,
	},

	multiplier: {
		type: Number,
		require: true,
		default: 1,
	},

	roles: {
		type: Array,
		required: true,
		role,
	},
});

role = mongoose.Schema({
	id: { type: String },
	multiplier: { type: Number },
	timed: { type: Boolean },
	timeout: { tpye: Date },
});

module.exports = mongoose.model('bonus-chip', BonusChip);