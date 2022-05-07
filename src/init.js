if (process.env.TOKEN == null) {
	const dotenv = require('dotenv');
	dotenv.config();
}
if (process.env.TOKEN != null) {
	console.log('TOKEN acquired');
}
else {console.log('ERROR!!!\nTOKEN is missing');}