const express = require('express');
const app = express();
const morgan = require('morgan');

const pingRoutes = require('@routes/pings');

app.use(morgan('dev'));

app.use('/pings', pingRoutes);


app.use((req, res, next) => {
	const error = new Error('Route Not Found');
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message,
		},
	});
});

module.exports = app;