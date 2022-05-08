/* eslint-disable no-shadow-restricted-names */
/* eslint-disable no-inline-comments */
/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const mongo = require('@root/mongo');
const ServerConfigSchema = require('@schemas/server-config-schema');
const { prefix: globalPrefix } = require('@root/config.json');
const { Guild } = require('discord.js');
const guildPrefixes = {}; // { 'guildId' : 'prefix' }

const validatePermissions = (permissions) => {
	const validPermissions = [
		'CREATE_INSTANT_INVITE',
		'KICK_MEMBERS',
		'BAN_MEMBERS',
		'ADMINISTRATOR',
		'MANAGE_CHANNELS',
		'MANAGE_GUILD',
		'ADD_REACTIONS',
		'VIEW_AUDIT_LOG',
		'PRIORITY_SPEAKER',
		'STREAM',
		'VIEW_CHANNEL',
		'SEND_MESSAGES',
		'SEND_TTS_MESSAGES',
		'MANAGE_MESSAGES',
		'EMBED_LINKS',
		'ATTACH_FILES',
		'READ_MESSAGE_HISTORY',
		'MENTION_EVERYONE',
		'USE_EXTERNAL_EMOJIS',
		'VIEW_GUILD_INSIGHTS',
		'CONNECT',
		'SPEAK',
		'MUTE_MEMBERS',
		'DEAFEN_MEMBERS',
		'MOVE_MEMBERS',
		'USE_VAD',
		'CHANGE_NICKNAME',
		'MANAGE_NICKNAMES',
		'MANAGE_ROLES',
		'MANAGE_WEBHOOKS',
		'MANAGE_EMOJIS',
	];

	for (const permission of permissions) {
		if (!validPermissions.includes(permission)) {
			throw new Error(`Unknown permission node "${permission}"`);
		}
	}
};


const validateChannels = (client, channels) => {
	let validateChannels = [];
	function getChannelIDs(fetch) {
		try{
			let channels = client.channels.cache.values();
			for (const channel of channels) {
				validateChannels.push(channel.id);
			}
		}
		catch(err) {
			console.log('array error');
			console.log('An error occoured while getting the channels.');
			console.log(err);
		}

		return validateChannels;
	}
	getChannelIDs();

	for (const channel of channels) {
		if (!validateChannels.includes(channel)) {
			try {
				throw new Error(`Unknown channel id "${channel}"`);
			}
			catch (e) {
				console.log(e.name, e.message);
			}
		}
	}
};

let recentlyRan = []; // guildID-userID-command

module.exports = (client, commandOptions) => {
	let {
		commands,
		expectedArgs = '',
		minArgs = 0,
		maxArgs = null,
		description = [],
		cooldown = -1,
		requiredChannels = [],
		excludedChannels = [],
		permissions = [],
		requiredRoles = [],
		excludedRoles = [],
		permissionError = 'You don\'t have permission to run this command.',
		callback,
	} = commandOptions;

	if (typeof commands === 'string') {
		commands = [commands];
	}

	console.log(`Registering command "${commands[0]}"`);

	if (permissions.length) {
		if (typeof permissions === 'string') {
			permissions = [permissions];
		}
		validatePermissions(permissions);
	}

	if (requiredChannels.length) {
		if (typeof requiredChannels === 'string') {
			requiredChannels = [requiredChannels];
		}
		validateChannels(client, requiredChannels);
	}
	if (excludedChannels.length) {
		if (typeof excludedChannels === 'string') {
			excludedChannels = [excludedChannels];
		}
		validateChannels(client, excludedChannels);
	}

	client.on('messageCreate', message => {
		const { member, content, guild, channel } = message;

		const prefix = guildPrefixes[guild.id] || globalPrefix;

		for (const alias of commands) {
			const command = `${prefix}${alias.toLowerCase()}`;

			if (
				content.toLowerCase().startsWith(`${command} `) ||
				content.toLowerCase() === command
			) {
				try {
					check_channel(excludedChannels, requiredChannels, channel); // Ensure the user runs the command within the correct channels
					check_permission(permissions, member); // Ensure the user has the required permissions
					check_roles(requiredRoles, excludedRoles, guild, member); // Ensure the user has the required roles and not have disallowed roles
				}
				catch (err) {
					message.reply({ content: err, allowedMentions: { parse: [ 'users' ] } });
					break;
				}

				let cooldownString = '${guild.id}-${member.id}-${commands[0]}';

				if (cooldown > 0 && recentlyRan.includes(cooldownString)) {
					message.reply('You cannot use that command so soon, please wait.');
					return;
				}

				const arguments = content.split(/[ ]+/);
				arguments.shift();

				if ((arguments.length < minArgs) || (maxArgs !== null && arguments.length > maxArgs)) {
					message.reply(`Incorrect syntax! Use ${prefix}${alias} ${expectedArgs}`);
					return;
				}

				if (cooldown > 0) {
					recentlyRan.push(cooldownString);

					setTimeout(() => {
						console.log('Before:', recentlyRan);

						recentlyRan = recentlyRan.filter((string) => {
							return string !== cooldownString;
						});

						console.log('After:', recentlyRan);
					}, 1000 * cooldown);
				}

				console.log(`<${message.author.username}> Run the command: ${command} ${arguments}`);
				callback(message, arguments, arguments.join(' '), prefix, client);
				return;
			}
		}
	});
};

module.exports.updateCache = (guildID, newPrefix) => {
	guildPrefixes[guildID] = newPrefix;
};

module.exports.loadPrefixes = async (client) => {
	for (const guild of client.guilds.cache) {
		const guildID = guild[1].id;

		const result = await ServerConfigSchema.findOne({ guildID: guildID });
		guildPrefixes[guildID] = result ? result.prefix : globalPrefix;
	}

	console.log(guildPrefixes);
};

function check_channel(excludedChannels, requiredChannels, mychannel) {
	let msg = '', channels = [];
	if (!!excludedChannels && excludedChannels.length > 0) {
		for (const excludedChannel of excludedChannels) {
			if (excludedChannel && excludedChannel === mychannel.id) { throw 'You cannot run this command in this channel'; }
		}
	}
	if (!!requiredChannels && requiredChannels.length > 0) {
		for (const requiredChannel of requiredChannels) {
			if (requiredChannel && requiredChannel === mychannel.id) { break; }
			channels.push(requiredChannel);
		}
		if (channels.length > 0) {
			for (const channel of channels) {
				msg += channel == channels[channels.length - 1] ? `<#${channel}>` : `<#${channel}>, `;
			}
			throw `You can only run this command in the following channel${channels.length > 1 ? 's' : ''}:\n${msg}`;
		}
	}
}

function check_permission(permissions, member) {
	let msg = '', perms = [];
	for (const permission of permissions) {
		if (!member.permissions.has(permission)) {
			perms.push(permission);
		}
	}
	if (perms.length > 0) {
		for (const perm of perms) { msg += perm == perms[perms.length - 1] ? `\` ${perm} \`` : `\` ${perm} \`, `; }
		throw `You are missing the following permission${perms.length > 1 ? 's' : ''}:\n${msg}.`;
	}
}

function check_roles(requiredRoles, excludedRoles, guild, member) {
	let msg = '', roles = [];
	for (const requiredRole of requiredRoles) {
		const role = guild.roles.cache.find((role) => {
			if (role.name == requiredRole) return role;
			if (role.id == requiredRole) return role;
		});
		if (role) {
			if (member.roles.cache.has(role.id)) { break; }
			roles.push(role);
		}
	}
	if (roles.length > 0) {
		for (const role of roles) { msg += role == roles[roles.length - 1] ? `${role}` : `${role} or `;}
		throw `You must have the following role${roles.length > 1 ? 's' : ''}:\n${msg}`;
	}

	for (const excludedRole of excludedRoles) {
		const role = guild.roles.cache.find((role) => {
			if (role.name == excludedRole) return role;
			if (role.id == excludedRole) return role;
		});
		if (role && member.roles.cache.has(role.id)) { throw 'You can not use this command.';}
	}
}