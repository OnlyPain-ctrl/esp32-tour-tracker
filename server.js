const dotenv = require('dotenv');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const router_private = require('./routes/private');
const router_public = require('./routes/public');
const { auth } = require('express-openid-connect');

dotenv.load();

const app = express();
const api = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
api.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const config = {
    authRequired: true,
    auth0Logout: true
};

const port = process.env.PORT || 3000;
const port_api = process.env.PORTAPI || 3001;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
    config.baseURL = `http://localhost:${port}`;
}

app.use(auth(config));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
    res.locals.user = req.oidc.user;
    next();
});

app.use('/public', express.static('source/public'));

app.use('/', router_private);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handlers
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: process.env.NODE_ENV !== 'production' ? err : {}
    });
});

app.listen(port, () => {
    console.log(`FE on port ${port}`);
});

api.listen(port_api, () => {
    console.log(`BE on port ${port_api}`);
});

api.use('/', router_public);