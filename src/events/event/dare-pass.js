const { passes } = require('@data/dare-pass');
const { unb_id, unb_ch } = require('@root/config');
const { unbclient } = require('@services/unb-init');

module.exports = (client, discord) => {

	client.on('messageCreate', async (message) => {
		if(message.channelId != unb_ch || message.author.id != unb_id) { return; }
		if(message.content.includes(client.user.id)) {
			const guild = await message.guild.fetch();
			const target = await guild.members.fetch({ user: message.mentions.users.first(), force: true });
			try {
				const mypass = check_pass(target);
				const currency = await check_currency(guild.id);
				const pass = get_pass(mypass, target);
				check_role(pass, target);
				const newbal = await check_balance(pass, guild.id, target);
				await give_role(pass, target);
				await remove_role(passes[mypass], target);
				const emb = new discord.MessageEmbed()
					.setColor('RANDOM')
					.setTitle('You have been issued:')
					.setDescription(`Dare Pass: ${pass.name}`)
					.addField('Your new balace:', `**Cash:** ${currency}${newbal.cash.toLocaleString()}\n**Bank:** ${currency}${newbal.bank.toLocaleString()}`);
				message.channel.send({ content: `${target}`, embeds: [emb] });
			}
			catch (err) {
				message.channel.send({ content: err, allowedMentions: { parse: [ 'users' ] } });
			}
			return;
		}

	});
};

function check_pass(user) {
	for (let i = 0; i < passes.length; i++) {
		if (user.roles.cache.has(passes[i].giverole)) {
			return i;
		}
	}
}

async function check_currency(guildID) {
	return (await unbclient.getGuild(guildID)).currencySymbol;
}

function get_pass(mypass, user) {
	if (!mypass && mypass != 0) { mypass = 0; }
	else if (mypass == passes.length - 1) { throw `${user} You already have highest Dare Pass: ${passes[mypass].name}`; }
	else { mypass += 1; }
	return passes[mypass];
}

function check_role(pass, user) {
	let roles = pass.reqrole, msg = '';
	roles.forEach((role)=> { return user.roles.cache.has(role) ? roles = null : roles;});
	if (roles != null && roles.length != 0) {
		for(let i = 0; i < roles.length; i++) {
			if (roles.length != i + 1) { msg += `<@&${roles[i]}> or `; }
			else { msg += `<@&${roles[i]}>`; }
		}
		throw `${user} You are missing ${msg} ${roles.length == 1 ? 'role' : 'roles'} for Dare Pass: ${pass.name}`;
	}
}

async function check_balance(pass, guildID, user) {
	const data = await unbclient.getUserBalance(guildID, user.id);
	if (data.total < pass.price) {throw `${user} You are missing <:chips:876023179049582622> ${pass.price - data.total} for Dare Pass: ${pass.name}`;}
	return deduct_balance(data, pass, guildID, user);
}

async function deduct_balance(data, pass, guildID, user) {
	const reminder = pass.price;
	return data.cash < reminder ?
		await unbclient.editUserBalance(guildID, user.id, { cash: -data.cash, bank: reminder - data.cash }, `${user} bought Dare Pass: ${pass}`) :
		await unbclient.editUserBalance(guildID, user.id, { cash: -reminder }, `${user} bought Dare Pass: ${pass}`);
}

async function give_role(pass, user) {
	await user.roles.add(pass.giverole, 'Bought with item');
}

async function remove_role(pass, user) {
	return !pass ? null : await user.roles.remove(pass.giverole, 'Upgraded with item');
}