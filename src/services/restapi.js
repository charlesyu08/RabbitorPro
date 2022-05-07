const http = require('http');
const port = process.env.Port || 3000;
const app = require('@api/app.js');
const server = http.createServer(app);

module.exports = () => {
	server.listen(port);
};