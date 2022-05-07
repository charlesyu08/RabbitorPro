const { Client } = require('unb-api');
const unbclient = new Client(process.env.UNBAPI_TOKEN);

module.exports = async () =>{
	return;
};

async function getGuild(GuildID) {
	return unbclient.getGuild(GuildID);
}
async function getCurrency(GuildID) {
	return (await getGuild(GuildID)).currencySymbol;
}
async function getBal(GuildID, UserID) {
	return unbclient.getUserBalance(GuildID, UserID);
}
async function editBal(GuildID, UserID, { bank, cash }, reason) {
	unbclient.editUserBalance(GuildID, UserID, { bank:bank || 0, cash:cash || 0 }, reason);
}


module.exports.unbclient = unbclient;
module.exports.getGuild = getGuild;
module.exports.getCurrency = getCurrency;
module.exports.getBal = getBal;
module.exports.editBal = editBal;