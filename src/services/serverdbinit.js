/* eslint-disable no-shadow-restricted-names */
/* eslint-disable no-unused-vars */
const ServerConfigSchema = require('@schemas/server-config-schema');
const { prefix, guild_id, announce_ch, unb_ch } = require('@root/config.json');

module.exports = async () => {
	await ServerConfigSchema.findOneAndUpdate(
		{
			guildID: guild_id,
		},
		{
			guildID: guild_id,
			$setOnInsert: {
				prefix: prefix,
				announce_ch: announce_ch,
			},
		},
		{
			upsert: true,
			setDefaultsOnInsert: true,
		},
	);
};