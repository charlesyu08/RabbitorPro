const { passes } = require('@data/dare-pass');
const { unb_id, unb_log_ch, unb_action_log_ch } = require('@root/config');
const { unbclient, getCurrency, editBal } = require('@services/unb-init');
const ServerConfigSchema = require('@schemas/server-config-schema');
const bonusChip = require('@schemas/bonus-chip-schema');
let serverConfig = [];

module.exports = {
	run: async function() {
		serverConfig = await ServerConfigSchema.find();
		setInterval(async ()=> {serverConfig = await ServerConfigSchema.find();}, 15 * 60 * 1000);
	},
	type: 'messageCreate',
	name: 'bonuschips',
	function: async function(client, discord, message) {
		if(message.author.id != unb_id) { return; }
		const myConfig = await serverConfig.find((config) => config.guildID == message.guild.id);
		if(message.channelId != unb_log_ch || message.channelId != myConfig.unb_log_ch) { return; }
		if(message.content.includes(client.user.id) || message.embeds[0].includes(client.user.id)) {
			const guild = await message.guild.fetch();
			const target = await guild.members.fetch({ user: message.mentions.users.first(), force: true });
			bonus: try {
				const reason = check_type(message.embeds[0]);
				if (!reason) break bonus;
				const multiplier = check_role(guild, target);
				if(multiplier == 1) break bonus;
				const money = check_money(message.embeds[0]);
				const newbal = await give_money(money, guild.id, target);
				console.log(`${target} bonus: ${money}`);
				const channel = await client.channels.cache.get(myConfig.unb_action_log_ch || unb_action_log_ch);
				const emb = new discord.MessageEmbed()
					.setColor('#66BB6A')
					.setTitle('Balance updated')
					.setDescription(`**User:** ${target}\n**Amount:** Cash: \`${money.cash}\` | Bank: \`${money.cash}\`\n**Reason:** ${reason}`);
				channel.send({ embeds: [emb] });
			}
			catch (err) {
				message.channel.send({ content: err, allowedMentions: { parse: [ 'users' ] } });
			}
		}
	},
};

function check_type(msg) {
	if(msg.description.includes('chat money')) return msg.description.split(/\*\*Reason:\*\* /)[1];
}

function check_money(msg) {
	const money = {
		cash: Number,
		bank: Number,
	};
	msg = msg.split(/(?<=\n\*\*Amount:\*\* )(.*)(?=\n\*\*Reason:\*\*)/g)[1];
	money.cash = msg.split(/(?<=Cash: `)(.*)(?=` \| )/g)[1];
	money.bank = msg.split(/(?<=Bank: `)(.*)(?=` \| )/g)[1];
	return money;
}

async function check_role(guild, user) {
	const data = await bonusChip.findOne({ guildID: guild.id });
	if(!data) return 1;
	const myroles = [];
	data.roles.forEach((role, index, roles)=> {
		if (role.timed) {
			check_timeout(role, index, roles);
		}
		if (user.roles.cache.has(role.id) || role.id == 'everyone') myroles.push(role);
	});
	return data.multiplier * mymultiplier(myroles);
}

function mymultiplier(roles) {
	let multiplier = 1;
	roles.forEach(role=> { multiplier *= role.multiplier; });
	return multiplier;
}

async function give_money(money, multiplier, guildID, user) {
	return await unbclient.editUserBalance(guildID, user.id, { cash: money.cash * multiplier, bank: money.bank * multiplier }, 'Bonus Multiplier');
}

async function check_timeout(role, index, roles) {
	if (role.timeout > Date.now()) return;
	else roles.splice(index, 1);
}