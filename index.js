const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const config = require('./app/config');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('..')); // подгружать статитку на уровень выше текущего
app.use(cookieParser()); //  использовать req.coockies
app.use(session(config.get('session')));

app.use(require('./app/middleware/loadPage'));
app.use(require('./app/middleware/basket'));
app.use(require('./app/router'));

const startServer = () => {
	app.listen(config.get('port'), () => {
		console.log(`App started on port ${config.get('port')}`);
		console.log(`Use: localhost:${config.get('port')}`);
	});
};

startServer();
